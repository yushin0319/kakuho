# backend/crud/seat_group.py
from sqlalchemy.orm import Session
from crud.base import BaseCRUD
from models import SeatGroup
from schemas import SeatGroupCreate, SeatGroupUpdate, SeatGroupResponse


class CrudSeatGroup(BaseCRUD[SeatGroup, SeatGroupResponse]):
    def __init__(self, db: Session):
        super().__init__(db, SeatGroup, SeatGroupResponse)

    # StageIDで読み取り
    def read_by_stage_id(self, stage_id: int) -> list[SeatGroupResponse]:
        seat_groups = (
            self.db.query(SeatGroup).filter(SeatGroup.stage_id == stage_id).all()
        )
        return [
            SeatGroupResponse.model_validate(seat_group) for seat_group in seat_groups
        ]

    def create(self, stage_id: int, data: SeatGroupCreate) -> SeatGroupResponse:
        return super().create(data, stage_id=stage_id)

    def update(self, seat_group_id: int, data: SeatGroupUpdate) -> SeatGroupResponse:
        return super().update(seat_group_id, data)
