# tests/test_auth.py
"""認証フローの詳細テスト"""
import pytest
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(db, email="auth@example.com", password="password123", is_admin=False):
    """テスト用ユーザーを作成"""
    user = User(
        email=email,
        password_hash=pwd_context.hash(password),
        nickname="認証テストユーザー",
        is_admin=is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(client, email="auth@example.com", password="password123"):
    """ログインしてレスポンスを返す"""
    return client.post("/token", data={"username": email, "password": password})


def get_headers(client, email="auth@example.com", password="password123"):
    """認証ヘッダーを取得"""
    resp = login(client, email, password)
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestLoginFlow:
    """ログインフローのテスト"""

    def test_login_returns_bearer_token(self, client, db):
        create_user(db)
        resp = login(client)
        assert resp.status_code == 200
        data = resp.json()
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0

    def test_login_wrong_email(self, client, db):
        create_user(db)
        resp = login(client, email="wrong@example.com")
        assert resp.status_code == 400

    def test_login_wrong_password(self, client, db):
        create_user(db)
        resp = login(client, password="wrongpassword")
        assert resp.status_code == 400

    def test_login_empty_credentials(self, client, db):
        resp = client.post("/token", data={"username": "", "password": ""})
        assert resp.status_code == 400


class TestTokenValidation:
    """トークン検証のテスト"""

    def test_valid_token_returns_user(self, client, db):
        create_user(db)
        headers = get_headers(client)
        resp = client.get("/users/me", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["email"] == "auth@example.com"

    def test_invalid_token_rejected(self, client, db):
        headers = {"Authorization": "Bearer invalidtoken123"}
        resp = client.get("/users/me", headers=headers)
        assert resp.status_code == 401

    def test_missing_token_rejected(self, client, db):
        resp = client.get("/users/me")
        assert resp.status_code == 401

    def test_malformed_auth_header(self, client, db):
        headers = {"Authorization": "NotBearer sometoken"}
        resp = client.get("/users/me", headers=headers)
        assert resp.status_code == 401

    def test_token_contains_user_info(self, client, db):
        user = create_user(db, is_admin=True)
        headers = get_headers(client)
        resp = client.get("/users/me", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "auth@example.com"
        assert data["is_admin"] is True
        assert data["id"] == user.id


class TestAdminCheck:
    """管理者権限チェックのテスト"""

    def test_admin_can_create_event(self, client, db):
        create_user(db, is_admin=True)
        headers = get_headers(client)
        resp = client.post(
            "/events",
            json={"name": "管理者イベント", "description": "説明"},
            headers=headers,
        )
        assert resp.status_code == 200

    def test_non_admin_cannot_create_event(self, client, db):
        create_user(db, is_admin=False)
        headers = get_headers(client)
        resp = client.post(
            "/events",
            json={"name": "一般イベント", "description": "説明"},
            headers=headers,
        )
        assert resp.status_code == 403

    def test_admin_can_list_users(self, client, db):
        create_user(db, is_admin=True)
        headers = get_headers(client)
        resp = client.get("/users", headers=headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_non_admin_cannot_list_users(self, client, db):
        create_user(db, is_admin=False)
        headers = get_headers(client)
        resp = client.get("/users", headers=headers)
        assert resp.status_code == 403


class TestSignup:
    """ユーザー登録のテスト"""

    def test_signup_success(self, client, db):
        resp = client.post(
            "/signup",
            json={
                "email": "new@example.com",
                "password": "newpassword123",
                "nickname": "新規ユーザー",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "new@example.com"
        assert data["nickname"] == "新規ユーザー"
        assert data["is_admin"] is False
        assert "password" not in data
        assert "password_hash" not in data

    def test_signup_duplicate_email(self, client, db):
        create_user(db, email="dup@example.com")
        resp = client.post(
            "/signup",
            json={"email": "dup@example.com", "password": "password123"},
        )
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"]

    def test_signup_then_login(self, client, db):
        client.post(
            "/signup",
            json={"email": "flow@example.com", "password": "flowpass123"},
        )
        resp = login(client, email="flow@example.com", password="flowpass123")
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_signup_invalid_email(self, client, db):
        resp = client.post(
            "/signup",
            json={"email": "notanemail", "password": "password123"},
        )
        assert resp.status_code == 422

    def test_signup_short_password(self, client, db):
        resp = client.post(
            "/signup",
            json={"email": "short@example.com", "password": "12345"},
        )
        assert resp.status_code == 422
