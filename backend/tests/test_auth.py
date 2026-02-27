# tests/test_auth.py
"""認証フローの詳細テスト"""
import pytest
from tests.helpers import create_user


def login(client, email="auth@example.com", password="password123"):
    """ログインしてレスポンスを返す（Cookie が自動的にクライアントにセットされる）"""
    return client.post("/token", data={"username": email, "password": password})


def get_headers(client, email="auth@example.com", password="password123"):
    """ログインして Cookie をセット（Cookie 認証のため Authorization ヘッダー不要）"""
    login(client, email, password)
    return {}


class TestLoginFlow:
    """ログインフローのテスト"""

    def test_login_sets_cookie(self, client, db):
        create_user(db)
        resp = login(client)
        assert resp.status_code == 200
        assert resp.json()["message"] == "Login successful"
        # HttpOnly Cookie がセットされていることを確認
        assert "access_token" in client.cookies

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
        assert resp.status_code == 422

    def test_login_error_message_unified(self, client, db):
        """M-KK-06: ユーザー列挙防止 — 失敗理由が統一されていることを確認"""
        create_user(db)
        resp_no_user = login(client, email="nonexistent@example.com")
        resp_wrong_pw = login(client, password="wrongpassword")
        assert resp_no_user.json()["detail"] == resp_wrong_pw.json()["detail"]
        assert resp_no_user.json()["detail"] == "Invalid credentials"


class TestTokenValidation:
    """トークン検証のテスト"""

    def test_valid_cookie_returns_user(self, client, db):
        create_user(db)
        login(client)  # Cookie がセットされる
        resp = client.get("/users/me")
        assert resp.status_code == 200
        assert resp.json()["email"] == "auth@example.com"

    def test_invalid_token_rejected(self, client, db):
        client.cookies.set("access_token", "Bearer invalidtoken123")
        resp = client.get("/users/me")
        assert resp.status_code == 401

    def test_missing_token_rejected(self, client, db):
        resp = client.get("/users/me")
        assert resp.status_code == 401

    def test_malformed_cookie_rejected(self, client, db):
        client.cookies.set("access_token", "NotBearer sometoken")
        resp = client.get("/users/me")
        assert resp.status_code == 401

    def test_token_contains_user_info(self, client, db):
        user = create_user(db, is_admin=True)
        login(client)  # Cookie がセットされる
        resp = client.get("/users/me")
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "auth@example.com"
        assert data["is_admin"] is True
        assert data["id"] == user.id


class TestLogout:
    """ログアウトのテスト"""

    def test_logout_clears_session(self, client, db):
        create_user(db)
        login(client)
        resp = client.post("/logout")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Logged out"
        # Cookie 削除後は /users/me が 401 を返す
        resp = client.get("/users/me")
        assert resp.status_code == 401


class TestAdminCheck:
    """管理者権限チェックのテスト"""

    def test_admin_can_create_event(self, client, db):
        create_user(db, is_admin=True)
        get_headers(client)  # login してCookieをセット
        resp = client.post(
            "/events",
            json={"name": "管理者イベント", "description": "説明"},
        )
        assert resp.status_code == 200

    def test_non_admin_cannot_create_event(self, client, db):
        create_user(db, is_admin=False)
        get_headers(client)
        resp = client.post(
            "/events",
            json={"name": "一般イベント", "description": "説明"},
        )
        assert resp.status_code == 403

    def test_admin_can_list_users(self, client, db):
        create_user(db, is_admin=True)
        get_headers(client)
        resp = client.get("/users")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_non_admin_cannot_list_users(self, client, db):
        create_user(db, is_admin=False)
        get_headers(client)
        resp = client.get("/users")
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
        assert resp.json()["message"] == "Login successful"

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
