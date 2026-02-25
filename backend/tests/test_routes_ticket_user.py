# tests/test_routes_ticket_user.py
"""チケットタイプ・ユーザーエンドポイントのテスト"""
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


def make_ticket_type(db, seat_group_id, type_name="一般", price=1000.0):
    """チケットタイプを作成"""
    tt = TicketType(
        seat_group_id=seat_group_id, type_name=type_name, price=price
    )
    db.add(tt)
    db.commit()
    db.refresh(tt)
    return tt


def setup_full_chain(db):
    """Event -> Stage -> SeatGroup -> TicketType のフルチェーンを作成"""
    event = make_event(db)
    stage = make_stage(db, event.id)
    sg = make_seat_group(db, stage.id, capacity=10)
    tt = make_ticket_type(db, sg.id)
    return event, stage, sg, tt


class TestTicketTypeEndpoints:
    """チケットタイプエンドポイントのテスト"""

    def test_create_ticket_type(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id)
        headers = auth_headers(client)
        resp = client.post(
            f"/seat_groups/{sg.id}/ticket_types",
            json={"type_name": "VIP", "price": 5000.0},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["type_name"] == "VIP"
        assert resp.json()["price"] == 5000.0

    def test_create_ticket_type_non_admin(self, client, db):
        make_user(db, is_admin=False)
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id)
        headers = auth_headers(client)
        resp = client.post(
            f"/seat_groups/{sg.id}/ticket_types",
            json={"type_name": "VIP", "price": 5000.0},
            headers=headers,
        )
        assert resp.status_code == 403

    def test_create_ticket_type_duplicate_name(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id)
        make_ticket_type(db, sg.id, type_name="一般")
        headers = auth_headers(client)
        resp = client.post(
            f"/seat_groups/{sg.id}/ticket_types",
            json={"type_name": "一般", "price": 2000.0},
            headers=headers,
        )
        assert resp.status_code == 400

    def test_get_ticket_types_by_seat_group(self, client, db):
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id)
        make_ticket_type(db, sg.id, type_name="一般", price=1000.0)
        make_ticket_type(db, sg.id, type_name="VIP", price=5000.0)
        resp = client.get(f"/seat_groups/{sg.id}/ticket_types")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_get_ticket_type_by_id(self, client, db):
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id)
        tt = make_ticket_type(db, sg.id)
        resp = client.get(f"/ticket_types/{tt.id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == tt.id

    def test_get_ticket_type_not_found(self, client, db):
        resp = client.get("/ticket_types/9999")
        assert resp.status_code == 404

    def test_update_ticket_type(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id)
        tt = make_ticket_type(db, sg.id)
        headers = auth_headers(client)
        resp = client.put(
            f"/ticket_types/{tt.id}",
            json={"price": 2500.0},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["price"] == 2500.0

    def test_delete_ticket_type(self, client, db):
        make_user(db, is_admin=True)
        event = make_event(db)
        stage = make_stage(db, event.id)
        sg = make_seat_group(db, stage.id)
        tt = make_ticket_type(db, sg.id)
        headers = auth_headers(client)
        resp = client.delete(f"/ticket_types/{tt.id}", headers=headers)
        assert resp.status_code == 204


class TestUserEndpoints:
    """ユーザーエンドポイントのテスト"""

    def test_get_own_user_info(self, client, db):
        user = make_user(db, email="self@test.com", is_admin=False)
        headers = auth_headers(client, email="self@test.com")
        resp = client.get(f"/users/{user.id}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["email"] == "self@test.com"

    def test_get_other_user_forbidden(self, client, db):
        user1 = make_user(db, email="usr1@test.com", is_admin=False)
        user2 = make_user(db, email="usr2@test.com", is_admin=False)
        headers = auth_headers(client, email="usr2@test.com")
        resp = client.get(f"/users/{user1.id}", headers=headers)
        assert resp.status_code == 403

    def test_admin_can_get_any_user(self, client, db):
        user = make_user(db, email="target@test.com", is_admin=False)
        admin = make_user(db, email="adm@test.com", is_admin=True)
        headers = auth_headers(client, email="adm@test.com")
        resp = client.get(f"/users/{user.id}", headers=headers)
        assert resp.status_code == 200

    def test_get_user_not_found(self, client, db):
        admin = make_user(db, is_admin=True)
        headers = auth_headers(client)
        resp = client.get("/users/9999", headers=headers)
        assert resp.status_code == 404

    def test_update_own_user(self, client, db):
        user = make_user(db, email="updu@test.com", is_admin=False)
        headers = auth_headers(client, email="updu@test.com")
        resp = client.put(
            f"/users/{user.id}",
            json={"nickname": "更新済み"},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["nickname"] == "更新済み"

    def test_update_other_user_forbidden(self, client, db):
        user1 = make_user(db, email="upd1@test.com", is_admin=False)
        user2 = make_user(db, email="upd2@test.com", is_admin=False)
        headers = auth_headers(client, email="upd2@test.com")
        resp = client.put(
            f"/users/{user1.id}",
            json={"nickname": "不正更新"},
            headers=headers,
        )
        assert resp.status_code == 403

    def test_admin_delete_user(self, client, db):
        admin = make_user(db, email="deladm@test.com", is_admin=True)
        user = make_user(db, email="deltgt@test.com", is_admin=False)
        headers = auth_headers(client, email="deladm@test.com")
        resp = client.delete(f"/users/{user.id}", headers=headers)
        assert resp.status_code == 204

    def test_cannot_delete_admin_user(self, client, db):
        admin1 = make_user(db, email="adm1@test.com", is_admin=True)
        admin2 = make_user(db, email="adm2@test.com", is_admin=True)
        headers = auth_headers(client, email="adm1@test.com")
        resp = client.delete(f"/users/{admin2.id}", headers=headers)
        assert resp.status_code == 400

    def test_non_admin_cannot_delete_user(self, client, db):
        user1 = make_user(db, email="na1@test.com", is_admin=False)
        user2 = make_user(db, email="na2@test.com", is_admin=False)
        headers = auth_headers(client, email="na1@test.com")
        resp = client.delete(f"/users/{user2.id}", headers=headers)
        assert resp.status_code == 403

    def test_delete_user_restores_capacity(self, client, db):
        admin = make_user(db, email="dcadm@test.com", is_admin=True)
        user = make_user(db, email="dcusr@test.com", is_admin=False)
        _, _, sg, tt = setup_full_chain(db)
        # userが予約
        user_headers = auth_headers(client, email="dcusr@test.com")
        client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 3, "user_id": user.id},
            headers=user_headers,
        )
        # 残席7
        sg_resp = client.get(f"/seat_groups/{sg.id}")
        assert sg_resp.json()["capacity"] == 7
        # adminがuser削除
        admin_headers = auth_headers(client, email="dcadm@test.com")
        resp = client.delete(f"/users/{user.id}", headers=admin_headers)
        assert resp.status_code == 204
        # 残席10に復帰
        sg_resp = client.get(f"/seat_groups/{sg.id}")
        assert sg_resp.json()["capacity"] == 10
