from fastapi import HTTPException
from sqlalchemy.orm import Session
from base import BaseCRUD
from model import Stage
from schema import StageCreate, StageUpdate, StageResponse


class CrudStage(BaseCRUD[Stage, StageResponse]):
    def __init__(self, db: Session):
        super().__init__(db, Stage, StageResponse)

    # イベントIDで読み取り
    def read_by_event_id(self, event_id: int) -> list[StageResponse]:
        stages = self.db.query(Stage).filter(Stage.event_id == event_id).all()
        return [StageResponse.from_attributes(stage) for stage in stages]

    def create(self, data: StageCreate) -> StageResponse:
        stage = Stage(**data.model_dump())
        self.db.add(stage)
        self.db.commit()
        self.db.refresh(stage)
        return StageResponse.from_attributes(stage)

    def update(self, stage_id: int, data: StageUpdate) -> StageResponse:
        stage = self.read_by_id(stage_id)
        if stage is None:
            raise HTTPException(status_code=404, detail="Stage not found")
        for key, value in data.model_dump().items():
            if value is not None:
                setattr(stage, key, value)
        self.db.commit()
        self.db.refresh(stage)
        return StageResponse.from_attributes(stage)
