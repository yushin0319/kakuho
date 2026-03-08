# tests/test_crud_ticket_reservation.py
"""Reservation の CRUD テスト"""
import pytest
from datetime import datetime

from models import Event, Stage, SeatGroup, TicketType
from crud.ticket_type import CrudTicketType
from crud.reservation import CrudReservation
from crud.user import CrudUser
from schemas import (
    TicketTypeCreate,
    ReservationCreate,
    ReservationUpdate,
    UserCreate,
)


# ── ローカルフィクスチャ ──────────────────


@pytest.fixture
def sample_event(db):
    """テスト用イベントを作成"""
    event = Event(name="テストイベント", description="説明文")
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@pytest.fixture
def sample_stage(db, sample_event):
    """テスト用ステージを作成"""
    stage = Stage(
        event_id=sample_event.id,
        start_time=datetime(2025, 6, 1, 10, 0),
        end_time=datetime(2025, 6, 1, 12, 0),
    )
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage


@pytest.fixture
def sample_seat_group(db, sample_stage):
    """テスト用シートグループを作成"""
    sg = SeatGroup(stage_id=sample_stage.id, capacity=100)
    db.add(sg)
    db.commit()
    db.refresh(sg)
    return sg


@pytest.fixture
def sample_ticket_type(db, sample_seat_group):
    """テスト用チケットタイプを作成"""
    tt = TicketType(
        seat_group_id=sample_seat_group.id,
        type_name="一般",
        price=3000.0,
    )
    db.add(tt)
    db.commit()
    db.refresh(tt)
    return tt


@pytest.fixture
def sample_user(db):
    """テスト用ユーザーを作成"""
    crud = CrudUser(db)
    user = crud.create(
        UserCreate(email="testuser@example.com", password="password123", nickname="テスター")
    )
    return user


# ── Reservation CRUD テスト ──────────────────────────────────────


class TestCrudReservation:
    def test_create_reservation(self, db, sample_ticket_type, sample_user):
        crud = CrudReservation(db)
        data = ReservationCreate(num_attendees=2)
        res = crud.create(sample_ticket_type.id, sample_user.id, data)

        assert res.id is not None
        assert res.ticket_type_id == sample_ticket_type.id
        assert res.user_id == sample_user.id
        assert res.num_attendees == 2
        assert res.is_paid is False
        assert res.created_at is not None

    def test_read_reservation_by_id(self, db, sample_ticket_type, sample_user):
        crud = CrudReservation(db)
        created = crud.create(
            sample_ticket_type.id,
            sample_user.id,
            ReservationCreate(num_attendees=1),
        )

        fetched = crud.read_by_id(created.id)
        assert fetched is not None
        assert fetched.id == created.id

    def test_read_reservation_by_id_not_found(self, db):
        crud = CrudReservation(db)
        assert crud.read_by_id(9999) is None

    def test_read_all_reservations(self, db, sample_ticket_type, sample_user):
        crud = CrudReservation(db)
        crud.create(
            sample_ticket_type.id,
            sample_user.id,
            ReservationCreate(num_attendees=1),
        )
        crud.create(
            sample_ticket_type.id,
            sample_user.id,
            ReservationCreate(num_attendees=3),
        )

        reservations = crud.read_all()
        assert len(reservations) == 2

    def test_read_reservations_by_ticket_type_id(self, db, sample_seat_group, sample_user):
        crud_tt = CrudTicketType(db)
        tt1 = crud_tt.create(
            sample_seat_group.id,
            TicketTypeCreate(type_name="一般", price=3000.0),
        )
        tt2 = crud_tt.create(
            sample_seat_group.id,
            TicketTypeCreate(type_name="学生", price=1500.0),
        )

        crud_res = CrudReservation(db)
        crud_res.create(tt1.id, sample_user.id, ReservationCreate(num_attendees=2))
        crud_res.create(tt1.id, sample_user.id, ReservationCreate(num_attendees=1))
        crud_res.create(tt2.id, sample_user.id, ReservationCreate(num_attendees=4))

        result = crud_res.read_by_ticket_type_id(tt1.id)
        assert len(result) == 2
        for r in result:
            assert r.ticket_type_id == tt1.id

    def test_read_reservations_by_user_id(self, db, sample_ticket_type, sample_user):
        # 別ユーザーを作成
        crud_user = CrudUser(db)
        other_user = crud_user.create(
            UserCreate(email="other@example.com", password="password123")
        )

        crud_res = CrudReservation(db)
        crud_res.create(
            sample_ticket_type.id,
            sample_user.id,
            ReservationCreate(num_attendees=2),
        )
        crud_res.create(
            sample_ticket_type.id,
            other_user.id,
            ReservationCreate(num_attendees=1),
        )

        result = crud_res.read_by_user_id(sample_user.id)
        assert len(result) == 1
        assert result[0].user_id == sample_user.id

    def test_read_reservations_by_user_and_ticket_type_id(
        self, db, sample_seat_group, sample_user
    ):
        crud_tt = CrudTicketType(db)
        tt1 = crud_tt.create(
            sample_seat_group.id,
            TicketTypeCreate(type_name="一般", price=3000.0),
        )
        tt2 = crud_tt.create(
            sample_seat_group.id,
            TicketTypeCreate(type_name="学生", price=1500.0),
        )

        crud_user = CrudUser(db)
        other_user = crud_user.create(
            UserCreate(email="other@example.com", password="password123")
        )

        crud_res = CrudReservation(db)
        crud_res.create(tt1.id, sample_user.id, ReservationCreate(num_attendees=2))
        crud_res.create(tt1.id, other_user.id, ReservationCreate(num_attendees=1))
        crud_res.create(tt2.id, sample_user.id, ReservationCreate(num_attendees=3))

        result = crud_res.read_by_user_and_ticket_type_id(sample_user.id, tt1.id)
        assert len(result) == 1
        assert result[0].user_id == sample_user.id
        assert result[0].ticket_type_id == tt1.id

    def test_update_reservation_num_attendees(self, db, sample_ticket_type, sample_user):
        crud = CrudReservation(db)
        created = crud.create(
            sample_ticket_type.id,
            sample_user.id,
            ReservationCreate(num_attendees=2),
        )

        updated = crud.update(
            created.id,
            ReservationUpdate(num_attendees=5),
        )
        assert updated.num_attendees == 5
        assert updated.is_paid is False

    def test_update_reservation_is_paid(self, db, sample_ticket_type, sample_user):
        crud = CrudReservation(db)
        created = crud.create(
            sample_ticket_type.id,
            sample_user.id,
            ReservationCreate(num_attendees=1),
        )

        updated = crud.update(
            created.id,
            ReservationUpdate(is_paid=True),
        )
        assert updated.is_paid is True
        assert updated.num_attendees == 1

    def test_delete_reservation(self, db, sample_ticket_type, sample_user):
        crud = CrudReservation(db)
        created = crud.create(
            sample_ticket_type.id,
            sample_user.id,
            ReservationCreate(num_attendees=1),
        )

        crud.delete(created.id)
        assert crud.read_by_id(created.id) is None

    def test_read_reservations_by_ticket_type_id_empty(self, db, sample_ticket_type):
        crud = CrudReservation(db)
        result = crud.read_by_ticket_type_id(sample_ticket_type.id)
        assert result == []

    def test_read_reservations_by_user_id_empty(self, db, sample_user):
        crud = CrudReservation(db)
        result = crud.read_by_user_id(sample_user.id)
        assert result == []
