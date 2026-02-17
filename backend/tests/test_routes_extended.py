# tests/test_routes_extended.py
"""ルートエンドポイントの拡張テスト（reservation, stage, seat_group, ticket_type, user）"""
import pytest
from datetime import datetime
from models import User, Event, Stage, SeatGroup, TicketType, Reservation
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
    """ログインして Cookie をセット（Cookie 認証のため Authorization ヘッダー不要）"""
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


# --- Reservation テスト ---


class TestReservationEndpoints:
    """予約エンドポイントのテスト"""

    def test_create_reservation(self, client, db):
        admin = make_user(db)
        _, _, sg, tt = setup_full_chain(db)
        headers = auth_headers(client)
        resp = client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 3, "user_id": admin.id},
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["num_attendees"] == 3
        assert data["user_id"] == admin.id
        assert data["ticket_type_id"] == tt.id

    def test_create_reservation_reduces_capacity(self, client, db):
        admin = make_user(db)
        _, _, sg, tt = setup_full_chain(db)
        headers = auth_headers(client)
        client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 4, "user_id": admin.id},
            headers=headers,
        )
        # 残席確認: 10 - 4 = 6
        resp = client.get(f"/seat_groups/{sg.id}")
        assert resp.status_code == 200
        assert resp.json()["capacity"] == 6

    def test_create_reservation_exceeds_capacity(self, client, db):
        admin = make_user(db)
        _, _, sg, tt = setup_full_chain(db)
        headers = auth_headers(client)
        resp = client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 11, "user_id": admin.id},
            headers=headers,
        )
        assert resp.status_code == 400

    def test_create_reservation_ticket_type_not_found(self, client, db):
        admin = make_user(db)
        headers = auth_headers(client)
        resp = client.post(
            "/ticket_types/9999/reservations",
            json={"num_attendees": 1, "user_id": admin.id},
            headers=headers,
        )
        assert resp.status_code == 404

    def test_get_reservation_by_owner(self, client, db):
        user = make_user(db, email="owner@test.com", is_admin=False)
        _, _, sg, tt = setup_full_chain(db)
        headers = auth_headers(client, email="owner@test.com")
        # 予約作成
        create_resp = client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 2, "user_id": user.id},
            headers=headers,
        )
        res_id = create_resp.json()["id"]
        # 自分の予約を取得
        resp = client.get(f"/reservations/{res_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == res_id

    def test_get_reservation_by_other_user_forbidden(self, client, db):
        owner = make_user(db, email="owner2@test.com", is_admin=False)
        other = make_user(db, email="other@test.com", is_admin=False)
        _, _, sg, tt = setup_full_chain(db)
        # ownerがログインして予約作成
        auth_headers(client, email="owner2@test.com")
        create_resp = client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 1, "user_id": owner.id},
        )
        res_id = create_resp.json()["id"]
        # otherがログインして取得しようとする
        auth_headers(client, email="other@test.com")
        resp = client.get(f"/reservations/{res_id}")
        assert resp.status_code == 403

    def test_get_reservation_by_admin(self, client, db):
        user = make_user(db, email="resuser@test.com", is_admin=False)
        admin = make_user(db, email="resadmin@test.com", is_admin=True)
        _, _, sg, tt = setup_full_chain(db)
        user_headers = auth_headers(client, email="resuser@test.com")
        admin_headers = auth_headers(client, email="resadmin@test.com")
        # userが予約
        create_resp = client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 1, "user_id": user.id},
            headers=user_headers,
        )
        res_id = create_resp.json()["id"]
        # adminが取得
        resp = client.get(f"/reservations/{res_id}", headers=admin_headers)
        assert resp.status_code == 200

    def test_list_reservations_admin_only(self, client, db):
        admin = make_user(db, is_admin=True)
        headers = auth_headers(client)
        resp = client.get("/reservations", headers=headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_reservations_non_admin_forbidden(self, client, db):
        user = make_user(db, email="nonadmin@test.com", is_admin=False)
        headers = auth_headers(client, email="nonadmin@test.com")
        resp = client.get("/reservations", headers=headers)
        assert resp.status_code == 403

    def test_update_reservation_changes_capacity(self, client, db):
        user = make_user(db, email="upd@test.com", is_admin=False)
        _, _, sg, tt = setup_full_chain(db)
        headers = auth_headers(client, email="upd@test.com")
        # 3名で予約 → 残席7
        create_resp = client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 3, "user_id": user.id},
            headers=headers,
        )
        res_id = create_resp.json()["id"]
        # 1名に変更 → 残席9
        resp = client.put(
            f"/reservations/{res_id}",
            json={"num_attendees": 1, "user_id": user.id},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["num_attendees"] == 1
        sg_resp = client.get(f"/seat_groups/{sg.id}")
        assert sg_resp.json()["capacity"] == 9

    def test_delete_reservation_restores_capacity(self, client, db):
        user = make_user(db, email="del@test.com", is_admin=False)
        _, _, sg, tt = setup_full_chain(db)
        headers = auth_headers(client, email="del@test.com")
        # 5名で予約 → 残席5
        create_resp = client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 5, "user_id": user.id},
            headers=headers,
        )
        res_id = create_resp.json()["id"]
        # 予約削除 → 残席10に復帰
        resp = client.delete(f"/reservations/{res_id}", headers=headers)
        assert resp.status_code == 204
        sg_resp = client.get(f"/seat_groups/{sg.id}")
        assert sg_resp.json()["capacity"] == 10

    def test_get_reservations_by_user_id(self, client, db):
        user = make_user(db, email="byuser@test.com", is_admin=False)
        _, _, sg, tt = setup_full_chain(db)
        headers = auth_headers(client, email="byuser@test.com")
        client.post(
            f"/ticket_types/{tt.id}/reservations",
            json={"num_attendees": 1, "user_id": user.id},
            headers=headers,
        )
        resp = client.get(f"/users/{user.id}/reservations", headers=headers)
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_get_reservations_by_user_id_other_forbidden(self, client, db):
        user1 = make_user(db, email="u1@test.com", is_admin=False)
        user2 = make_user(db, email="u2@test.com", is_admin=False)
        headers2 = auth_headers(client, email="u2@test.com")
        resp = client.get(f"/users/{user1.id}/reservations", headers=headers2)
        assert resp.status_code == 403

    def test_reservation_not_found(self, client, db):
        user = make_user(db, email="nf@test.com", is_admin=False)
        headers = auth_headers(client, email="nf@test.com")
        resp = client.get("/reservations/9999", headers=headers)
        assert resp.status_code == 404


# --- Stage テスト ---


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


# --- SeatGroup テスト ---


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


# --- TicketType テスト ---


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


# --- User テスト ---


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
