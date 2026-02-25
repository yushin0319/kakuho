# tests/test_routes_stage_seatgroup.py
"""ステージ・シートグループエンドポイントのテスト"""
import pytest
from datetime import datetime
from models import User, Event, Stage, SeatGroup, TicketType
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- ヘルパー関数 ---


def make_user(db, email="admin@test.com", is_admin=True, password="password123"):
    """ユーザーを作成"""
    user = User(
        email=email,
        password_hash=pwd_context.hash(password),
        nickname="テスト",
        is_admin=is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def auth_headers(client, email="admin@test.com", password="password123"):
    """ログインして Cookie をセット"""
    client.post("/token", data={"username": email, "password": password})
    return {}


def make_event(db, name="テストイベント"):
    """イベントを作成"""
    event = Event(name=name, description="説明")
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def make_stage(db, event_id, start_hour=10, end_hour=12):
    """ステージを作成"""
    stage = Stage(
        event_id=event_id,
        start_time=datetime(2025, 6, 1, start_hour, 0),
        end_time=datetime(2025, 6, 1, end_hour, 0),
    )
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage


def make_seat_group(db, stage_id, capacity=10):
    """シートグループを作成"""
    sg = SeatGroup(stage_id=stage_id, capacity=capacity)
    db.add(sg)
    db.commit()
    db.refresh(sg)
    return sg


class TestStageEndpoints:
    """ステージエンドポイントのテスト"""

    def test_create_stage_as_admin(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        headers = auth_headers(client)
        resp = client.post(
            f"/events/{event.id}/stages",
            json={
                "start_time": "2025-06-01T10:00:00",
                "end_time": "2025-06-01T12:00:00",
            },
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["event_id"] == event.id

    def test_create_stage_non_admin_forbidden(self, client, db):
        make_user(db, is_admin=False)
        event = make_event(db)
        headers = auth_headers(client)
        resp = client.post(
            f"/events/{event.id}/stages",
            json={
                "start_time": "2025-06-01T10:00:00",
                "end_time": "2025-06-01T12:00:00",
            },
            headers=headers,
        )
        assert resp.status_code == 403

    def test_create_stage_event_not_found(self, client, db):
        make_user(db, is_admin=True)
        headers = auth_headers(client)
        resp = client.post(
            "/events/9999/stages",
            json={
                "start_time": "2025-06-01T10:00:00",
                "end_time": "2025-06-01T12:00:00",
            },
            headers=headers,
        )
        assert resp.status_code == 404

    def test_create_stage_duplicate_start_time(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        headers = auth_headers(client)
        stage_data = {
            "start_time": "2025-06-01T10:00:00",
            "end_time": "2025-06-01T12:00:00",
        }
        client.post(f"/events/{event.id}/stages", json=stage_data, headers=headers)
        resp = client.post(
            f"/events/{event.id}/stages", json=stage_data, headers=headers
        )
        assert resp.status_code == 400

    def test_get_stage_by_id(self, client, db):
        event = make_event(db)
        stage = make_stage(db, event.id)
        resp = client.get(f"/stages/{stage.id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == stage.id

    def test_get_stage_not_found(self, client, db):
        resp = client.get("/stages/9999")
        assert resp.status_code == 404

    def test_get_stages_by_event_id(self, client, db):
        event = make_event(db)
        make_stage(db, event.id, start_hour=10, end_hour=12)
        make_stage(db, event.id, start_hour=14, end_hour=16)
        resp = client.get(f"/events/{event.id}/stages")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_get_stages_by_event_not_found(self, client, db):
        resp = client.get("/events/9999/stages")
        assert resp.status_code == 404

    def test_update_stage(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        headers = auth_headers(client)
        resp = client.put(
            f"/stages/{stage.id}",
            json={"start_time": "2025-07-01T09:00:00"},
            headers=headers,
        )
        assert resp.status_code == 200

    def test_delete_stage(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        headers = auth_headers(client)
        resp = client.delete(f"/stages/{stage.id}", headers=headers)
        assert resp.status_code == 204
        resp = client.get(f"/stages/{stage.id}")
        assert resp.status_code == 404


class TestSeatGroupEndpoints:
    """シートグループエンドポイントのテスト"""

    def test_create_seat_group(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        headers = auth_headers(client)
        resp = client.post(
            f"/stages/{stage.id}/seat_groups",
            json={"capacity": 50},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["capacity"] == 50
        assert resp.json()["stage_id"] == stage.id

    def test_create_seat_group_non_admin(self, client, db):
        make_user(db, is_admin=False)
        event = make_event(db)
        stage = make_stage(db, event.id)
        headers = auth_headers(client)
        resp = client.post(
            f"/stages/{stage.id}/seat_groups",
            json={"capacity": 50},
            headers=headers,
        )
        assert resp.status_code == 403

    def test_get_seat_groups_by_stage(self, client, db):
        event = make_event(db)
        stage = make_stage(db, event.id)
        make_seat_group(db, stage.id, capacity=10)
        make_seat_group(db, stage.id, capacity=20)
        resp = client.get(f"/stages/{stage.id}/seat_groups")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_get_seat_groups_stage_not_found(self, client, db):
        resp = client.get("/stages/9999/seat_groups")
        assert resp.status_code == 404

    def test_update_seat_group(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id, capacity=10)
        headers = auth_headers(client)
        resp = client.put(
            f"/seat_groups/{sg.id}",
            json={"capacity": 30},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["capacity"] == 30

    def test_delete_seat_group(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id)
        headers = auth_headers(client)
        resp = client.delete(f"/seat_groups/{sg.id}", headers=headers)
        assert resp.status_code == 204
