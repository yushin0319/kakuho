# tests/test_crud_ticket_type.py
"""TicketType の CRUD テスト"""
import pytest
from datetime import datetime

from models import Event, Stage, SeatGroup, TicketType
from crud.seat_group import CrudSeatGroup
from crud.ticket_type import CrudTicketType
from schemas import (
    SeatGroupCreate,
    TicketTypeCreate,
    TicketTypeUpdate,
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
