# tests/test_crud_extended.py
"""Stage, SeatGroup, TicketType, Reservation の CRUD テスト"""
import pytest
from datetime import datetime

from models import Event, Stage, SeatGroup, TicketType, User
from crud.stage import CrudStage
from crud.seat_group import CrudSeatGroup
from crud.ticket_type import CrudTicketType
from crud.reservation import CrudReservation
from crud.user import CrudUser
from schemas import (
    StageCreate,
    StageUpdate,
    SeatGroupCreate,
    SeatGroupUpdate,
    TicketTypeCreate,
    TicketTypeUpdate,
    ReservationCreate,
    ReservationUpdate,
    UserCreate,
)


# ── ローカルフィクスチャ（conftest.py との衝突回避） ──────────────────


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


# ── Stage CRUD テスト ────────────────────────────────────────────


class TestCrudStage:
    def test_create_stage(self, db, sample_event):
        crud = CrudStage(db)
        data = StageCreate(
            start_time=datetime(2025, 7, 1, 10, 0),
            end_time=datetime(2025, 7, 1, 12, 0),
        )
        stage = crud.create(sample_event.id, data)

        assert stage.id is not None
        assert stage.event_id == sample_event.id
        assert stage.start_time == datetime(2025, 7, 1, 10, 0)
        assert stage.end_time == datetime(2025, 7, 1, 12, 0)

    def test_read_stage_by_id(self, db, sample_stage):
        crud = CrudStage(db)
        fetched = crud.read_by_id(sample_stage.id)

        assert fetched is not None
        assert fetched.id == sample_stage.id
        assert fetched.event_id == sample_stage.event_id

    def test_read_stage_by_id_not_found(self, db):
        crud = CrudStage(db)
        assert crud.read_by_id(9999) is None

    def test_read_all_stages(self, db, sample_event):
        crud = CrudStage(db)
        crud.create(
            sample_event.id,
            StageCreate(
                start_time=datetime(2025, 7, 1, 10, 0),
                end_time=datetime(2025, 7, 1, 12, 0),
            ),
        )
        crud.create(
            sample_event.id,
            StageCreate(
                start_time=datetime(2025, 7, 2, 10, 0),
                end_time=datetime(2025, 7, 2, 12, 0),
            ),
        )

        stages = crud.read_all()
        assert len(stages) == 2

    def test_read_stages_by_event_id(self, db, sample_event):
        crud = CrudStage(db)
        crud.create(
            sample_event.id,
            StageCreate(
                start_time=datetime(2025, 7, 1, 10, 0),
                end_time=datetime(2025, 7, 1, 12, 0),
            ),
        )
        # 別イベントのステージ
        other_event = Event(name="別イベント", description="他")
        db.add(other_event)
        db.commit()
        db.refresh(other_event)
        crud.create(
            other_event.id,
            StageCreate(
                start_time=datetime(2025, 8, 1, 10, 0),
                end_time=datetime(2025, 8, 1, 12, 0),
            ),
        )

        stages = crud.read_by_event_id(sample_event.id)
        assert len(stages) == 1
        assert stages[0].event_id == sample_event.id

    def test_update_stage(self, db, sample_stage):
        crud = CrudStage(db)
        updated = crud.update(
            sample_stage.id,
            StageUpdate(end_time=datetime(2025, 6, 1, 14, 0)),
        )

        assert updated.end_time == datetime(2025, 6, 1, 14, 0)
        assert updated.start_time == sample_stage.start_time

    def test_delete_stage(self, db, sample_stage):
        crud = CrudStage(db)
        crud.delete(sample_stage.id)

        assert crud.read_by_id(sample_stage.id) is None


# ── SeatGroup CRUD テスト ────────────────────────────────────────


class TestCrudSeatGroup:
    def test_create_seat_group(self, db, sample_stage):
        crud = CrudSeatGroup(db)
        data = SeatGroupCreate(capacity=200)
        sg = crud.create(sample_stage.id, data)

        assert sg.id is not None
        assert sg.stage_id == sample_stage.id
        assert sg.capacity == 200

    def test_read_seat_group_by_id(self, db, sample_seat_group):
        crud = CrudSeatGroup(db)
        fetched = crud.read_by_id(sample_seat_group.id)

        assert fetched is not None
        assert fetched.capacity == 100

    def test_read_seat_group_by_id_not_found(self, db):
        crud = CrudSeatGroup(db)
        assert crud.read_by_id(9999) is None

    def test_read_all_seat_groups(self, db, sample_stage):
        crud = CrudSeatGroup(db)
        crud.create(sample_stage.id, SeatGroupCreate(capacity=50))
        crud.create(sample_stage.id, SeatGroupCreate(capacity=80))

        seat_groups = crud.read_all()
        assert len(seat_groups) == 2

    def test_read_seat_groups_by_stage_id(self, db, sample_event):
        crud_stage = CrudStage(db)
        stage1 = crud_stage.create(
            sample_event.id,
            StageCreate(
                start_time=datetime(2025, 7, 1, 10, 0),
                end_time=datetime(2025, 7, 1, 12, 0),
            ),
        )
        stage2 = crud_stage.create(
            sample_event.id,
            StageCreate(
                start_time=datetime(2025, 7, 2, 10, 0),
                end_time=datetime(2025, 7, 2, 12, 0),
            ),
        )

        crud_sg = CrudSeatGroup(db)
        crud_sg.create(stage1.id, SeatGroupCreate(capacity=100))
        crud_sg.create(stage1.id, SeatGroupCreate(capacity=50))
        crud_sg.create(stage2.id, SeatGroupCreate(capacity=200))

        result = crud_sg.read_by_stage_id(stage1.id)
        assert len(result) == 2
        for sg in result:
            assert sg.stage_id == stage1.id

    def test_update_seat_group(self, db, sample_seat_group):
        crud = CrudSeatGroup(db)
        updated = crud.update(sample_seat_group.id, SeatGroupUpdate(capacity=300))

        assert updated.capacity == 300

    def test_delete_seat_group(self, db, sample_seat_group):
        crud = CrudSeatGroup(db)
        crud.delete(sample_seat_group.id)

        assert crud.read_by_id(sample_seat_group.id) is None


# ── TicketType CRUD テスト ───────────────────────────────────────


class TestCrudTicketType:
    def test_create_ticket_type(self, db, sample_seat_group):
        crud = CrudTicketType(db)
        data = TicketTypeCreate(type_name="VIP", price=10000.0)
        tt = crud.create(sample_seat_group.id, data)

        assert tt.id is not None
        assert tt.seat_group_id == sample_seat_group.id
        assert tt.type_name == "VIP"
        assert tt.price == 10000.0

    def test_read_ticket_type_by_id(self, db, sample_ticket_type):
        crud = CrudTicketType(db)
        fetched = crud.read_by_id(sample_ticket_type.id)

        assert fetched is not None
        assert fetched.type_name == "一般"
        assert fetched.price == 3000.0

    def test_read_ticket_type_by_id_not_found(self, db):
        crud = CrudTicketType(db)
        assert crud.read_by_id(9999) is None

    def test_read_all_ticket_types(self, db, sample_seat_group):
        crud = CrudTicketType(db)
        crud.create(sample_seat_group.id, TicketTypeCreate(type_name="一般", price=3000.0))
        crud.create(sample_seat_group.id, TicketTypeCreate(type_name="学生", price=1500.0))

        ticket_types = crud.read_all()
        assert len(ticket_types) == 2

    def test_read_ticket_types_by_seat_group_id(self, db, sample_stage):
        crud_sg = CrudSeatGroup(db)
        sg1 = crud_sg.create(sample_stage.id, SeatGroupCreate(capacity=100))
        sg2 = crud_sg.create(sample_stage.id, SeatGroupCreate(capacity=50))

        crud_tt = CrudTicketType(db)
        crud_tt.create(sg1.id, TicketTypeCreate(type_name="一般", price=3000.0))
        crud_tt.create(sg1.id, TicketTypeCreate(type_name="学生", price=1500.0))
        crud_tt.create(sg2.id, TicketTypeCreate(type_name="一般", price=5000.0))

        result = crud_tt.read_by_seat_group_id(sg1.id)
        assert len(result) == 2
        for tt in result:
            assert tt.seat_group_id == sg1.id

    def test_update_ticket_type(self, db, sample_ticket_type):
        crud = CrudTicketType(db)
        updated = crud.update(
            sample_ticket_type.id,
            TicketTypeUpdate(price=5000.0),
        )

        assert updated.price == 5000.0
        assert updated.type_name == "一般"

    def test_update_ticket_type_name(self, db, sample_ticket_type):
        crud = CrudTicketType(db)
        updated = crud.update(
            sample_ticket_type.id,
            TicketTypeUpdate(type_name="学割"),
        )

        assert updated.type_name == "学割"
        assert updated.price == 3000.0

    def test_delete_ticket_type(self, db, sample_ticket_type):
        crud = CrudTicketType(db)
        crud.delete(sample_ticket_type.id)

        assert crud.read_by_id(sample_ticket_type.id) is None


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
