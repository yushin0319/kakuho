# tests/test_crud_stage_seatgroup.py
"""Stage, SeatGroup の CRUD テスト"""
import pytest
from datetime import datetime

from models import Event, Stage, SeatGroup
from crud.stage import CrudStage
from crud.seat_group import CrudSeatGroup
from schemas import (
    StageCreate,
    StageUpdate,
    SeatGroupCreate,
    SeatGroupUpdate,
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
