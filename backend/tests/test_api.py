# tests/test_api.py
"""APIエンドポイントのテスト"""
import pytest
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_test_user(db, email="test@example.com", is_admin=False):
    """テスト用ユーザーを作成"""
    user = User(
        email=email,
        password_hash=pwd_context.hash("password123"),
        nickname="テストユーザー",
        is_admin=is_admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_auth_headers(client, email="test@example.com", password="password123"):
    """認証トークンを取得してヘッダーを返す"""
    response = client.post(
        "/token",
        data={"username": email, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestHealthEndpoint:
    def test_health_check(self, client):
        response = client.head("/health")
        assert response.status_code == 200


class TestAuthEndpoints:
    def test_login_success(self, client, db):
        create_test_user(db)
        response = client.post(
            "/token",
            data={"username": "test@example.com", "password": "password123"}
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_login_wrong_password(self, client, db):
        create_test_user(db)
        response = client.post(
            "/token",
            data={"username": "test@example.com", "password": "wrongpassword"}
        )
        assert response.status_code == 400

    def test_get_current_user(self, client, db):
        create_test_user(db)
        headers = get_auth_headers(client)
        response = client.get("/users/me", headers=headers)
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"

    def test_get_current_user_unauthorized(self, client):
        response = client.get("/users/me")
        assert response.status_code == 401


class TestEventEndpoints:
    def test_get_events_empty(self, client):
        response = client.get("/events")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_event_as_admin(self, client, db):
        create_test_user(db, is_admin=True)
        headers = get_auth_headers(client)
        response = client.post(
            "/events",
            json={"name": "テストイベント", "description": "説明文"},
            headers=headers
        )
        assert response.status_code == 200
        assert response.json()["name"] == "テストイベント"

    def test_create_event_as_user_forbidden(self, client, db):
        create_test_user(db, is_admin=False)
        headers = get_auth_headers(client)
        response = client.post(
            "/events",
            json={"name": "テストイベント", "description": "説明文"},
            headers=headers
        )
        assert response.status_code == 403

    def test_get_event_by_id(self, client, db):
        admin = create_test_user(db, is_admin=True)
        headers = get_auth_headers(client)
        # イベント作成
        create_response = client.post(
            "/events",
            json={"name": "テストイベント", "description": "説明文"},
            headers=headers
        )
        event_id = create_response.json()["id"]

        # イベント取得（認証不要）
        response = client.get(f"/events/{event_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "テストイベント"

    def test_get_event_not_found(self, client):
        response = client.get("/events/99999")
        assert response.status_code == 404

    def test_update_event_as_admin(self, client, db):
        create_test_user(db, is_admin=True)
        headers = get_auth_headers(client)
        # イベント作成
        create_response = client.post(
            "/events",
            json={"name": "元の名前", "description": "説明文"},
            headers=headers
        )
        event_id = create_response.json()["id"]

        # イベント更新
        response = client.put(
            f"/events/{event_id}",
            json={"name": "更新後の名前"},
            headers=headers
        )
        assert response.status_code == 200
        assert response.json()["name"] == "更新後の名前"

    def test_delete_event_as_admin(self, client, db):
        create_test_user(db, is_admin=True)
        headers = get_auth_headers(client)
        # イベント作成
        create_response = client.post(
            "/events",
            json={"name": "削除対象", "description": "説明文"},
            headers=headers
        )
        event_id = create_response.json()["id"]

        # イベント削除
        response = client.delete(f"/events/{event_id}", headers=headers)
        assert response.status_code == 204

        # 削除確認
        response = client.get(f"/events/{event_id}")
        assert response.status_code == 404
