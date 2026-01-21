# tests/test_crud.py
"""CRUDレイヤーのテスト"""
import pytest
from datetime import datetime

from models import Event, Stage, SeatGroup, TicketType, User
from crud.event import CrudEvent
from crud.user import CrudUser
from schemas import EventCreate, EventUpdate, UserCreate


class TestCrudEvent:
    def test_create_event(self, db):
        crud = CrudEvent(db)
        event_data = EventCreate(name="テストイベント", description="説明文")
        event = crud.create(event_data)

        assert event.id is not None
        assert event.name == "テストイベント"
        assert event.description == "説明文"

    def test_read_event_by_id(self, db):
        crud = CrudEvent(db)
        event_data = EventCreate(name="テストイベント", description="説明文")
        created = crud.create(event_data)

        fetched = crud.read_by_id(created.id)
        assert fetched.name == "テストイベント"

    def test_read_all_events(self, db):
        crud = CrudEvent(db)
        crud.create(EventCreate(name="イベント1", description="説明1"))
        crud.create(EventCreate(name="イベント2", description="説明2"))

        events = crud.read_all()
        assert len(events) == 2

    def test_update_event(self, db):
        crud = CrudEvent(db)
        event = crud.create(EventCreate(name="元の名前", description="説明"))

        updated = crud.update(event.id, EventUpdate(name="更新後の名前"))
        assert updated.name == "更新後の名前"
        assert updated.description == "説明"

    def test_delete_event(self, db):
        crud = CrudEvent(db)
        event = crud.create(EventCreate(name="削除対象", description="説明"))

        crud.delete(event.id)
        assert crud.read_by_id(event.id) is None

    def test_get_event_time_no_stages(self, db):
        crud = CrudEvent(db)
        event = crud.create(EventCreate(name="イベント", description="説明"))

        time_response = crud.get_event_time(event.id)
        # ステージがない場合、現在時刻が返る（dictとして返される）
        assert time_response["start_time"] is not None
        assert time_response["end_time"] is not None

    def test_get_event_time_with_stages(self, db):
        crud = CrudEvent(db)
        event_data = EventCreate(name="イベント", description="説明")
        event = crud.create(event_data)

        # ステージを直接追加
        stage1 = Stage(
            event_id=event.id,
            start_time=datetime(2025, 1, 1, 10, 0),
            end_time=datetime(2025, 1, 1, 12, 0)
        )
        stage2 = Stage(
            event_id=event.id,
            start_time=datetime(2025, 1, 1, 14, 0),
            end_time=datetime(2025, 1, 1, 16, 0)
        )
        db.add_all([stage1, stage2])
        db.commit()

        time_response = crud.get_event_time(event.id)
        assert time_response.start_time == datetime(2025, 1, 1, 10, 0)
        assert time_response.end_time == datetime(2025, 1, 1, 16, 0)


class TestCrudUser:
    def test_create_user(self, db):
        crud = CrudUser(db)
        user_data = UserCreate(
            email="test@example.com",
            password="password123",
            nickname="テストユーザー"
        )
        user = crud.create(user_data)

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.nickname == "テストユーザー"
        assert user.is_admin is False

    def test_read_by_email(self, db):
        crud = CrudUser(db)
        crud.create(UserCreate(
            email="test@example.com",
            password="password123"
        ))

        user = crud.read_by_email("test@example.com")
        assert user is not None
        assert user.email == "test@example.com"

    def test_authenticate_user_success(self, db):
        crud = CrudUser(db)
        crud.create(UserCreate(
            email="test@example.com",
            password="password123"
        ))

        user = crud.authenticate_user("test@example.com", "password123")
        assert user.email == "test@example.com"

    def test_authenticate_user_wrong_password(self, db):
        crud = CrudUser(db)
        crud.create(UserCreate(
            email="test@example.com",
            password="password123"
        ))

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            crud.authenticate_user("test@example.com", "wrongpassword")
        assert exc_info.value.status_code == 400

    def test_authenticate_user_not_found(self, db):
        crud = CrudUser(db)

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            crud.authenticate_user("notfound@example.com", "password")
        assert exc_info.value.status_code == 400
