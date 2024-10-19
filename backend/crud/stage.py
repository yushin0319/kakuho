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
        stage = Stage(**data.model_dump(), event_id=event_id)
        self.db.add(stage)
        self.db.commit()
        self.db.refresh(stage)
        return StageResponse.model_validate(stage)

    def update(self, stage_id: int, data: StageUpdate) -> StageResponse:
        stage = self.read_by_id(stage_id)
        for key, value in data.model_dump().items():
            if value is not None:
                setattr(stage, key, value)
        self.db.commit()
        self.db.refresh(stage)
        return StageResponse.model_validate(stage)
