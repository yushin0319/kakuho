# backend/crud/stage.py
from sqlalchemy.orm import Session
from crud.base import BaseCRUD
from models import Stage
from schemas import StageCreate, StageUpdate, StageResponse


class CrudStage(BaseCRUD[Stage, StageResponse]):
    def __init__(self, db: Session):
        super().__init__(db, Stage, StageResponse)

    # イベントIDで読み取り
    def read_by_event_id(self, event_id: int) -> list[StageResponse]:
        stages = self.db.query(Stage).filter(Stage.event_id == event_id).all()
        return [StageResponse.model_validate(stage) for stage in stages]

    def create(self, event_id: int, data: StageCreate) -> StageResponse:
        return super().create(data, event_id=event_id)

    def update(self, stage_id: int, data: StageUpdate) -> StageResponse:
        return super().update(stage_id, data)
