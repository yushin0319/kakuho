# tests/test_schemas.py
"""Pydanticスキーマのバリデーションテスト"""
import pytest
from pydantic import ValidationError
from schemas import (
    EventCreate,
    EventUpdate,
    UserCreate,
    StageCreate,
    TicketTypeCreate,
    ReservationCreate,
)
from datetime import datetime


class TestEventSchema:
    def test_event_create_valid(self):
        event = EventCreate(name="テストイベント", description="イベントの説明")
        assert event.name == "テストイベント"
        assert event.description == "イベントの説明"

    def test_event_create_name_too_short(self):
        with pytest.raises(ValidationError):
            EventCreate(name="", description="説明")

    def test_event_create_name_too_long(self):
        with pytest.raises(ValidationError):
            EventCreate(name="a" * 101, description="説明")

    def test_event_update_partial(self):
        event = EventUpdate(name="更新名")
        assert event.name == "更新名"
        assert event.description is None


class TestUserSchema:
    def test_user_create_valid(self):
        user = UserCreate(
            email="test@example.com",
            password="password123",
            nickname="テストユーザー"
        )
        assert user.email == "test@example.com"
        assert user.password == "password123"

    def test_user_create_invalid_email(self):
        with pytest.raises(ValidationError):
            UserCreate(email="invalid", password="password123")

    def test_user_create_password_too_short(self):
        with pytest.raises(ValidationError):
            UserCreate(email="test@example.com", password="12345")


class TestStageSchema:
    def test_stage_create_valid(self):
        stage = StageCreate(
            start_time=datetime(2025, 1, 1, 10, 0),
            end_time=datetime(2025, 1, 1, 12, 0)
        )
        assert stage.start_time.hour == 10
        assert stage.end_time.hour == 12


class TestTicketTypeSchema:
    def test_ticket_type_create_valid(self):
        ticket = TicketTypeCreate(type_name="一般", price=1000.0)
        assert ticket.type_name == "一般"
        assert ticket.price == 1000.0

    def test_ticket_type_name_too_short(self):
        with pytest.raises(ValidationError):
            TicketTypeCreate(type_name="", price=1000.0)


class TestReservationSchema:
    def test_reservation_create_valid(self):
        reservation = ReservationCreate(num_attendees=2, user_id=1)
        assert reservation.num_attendees == 2
        assert reservation.user_id == 1
