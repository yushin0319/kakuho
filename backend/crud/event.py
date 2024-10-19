# backend/crud/event.py
from sqlalchemy.orm import Session
from crud.base import BaseCRUD
from models import Event, Stage
from schemas import EventCreate, EventUpdate, EventResponse, EventTimeResponse
from datetime import datetime


class CrudEvent(BaseCRUD[Event, EventResponse]):
    def __init__(self, db: Session):
        super().__init__(db, Event, EventResponse)

    def create(self, data: EventCreate) -> EventResponse:
        event = Event(**data.model_dump())
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return EventResponse.model_validate(event)

    def update(self, event_id: int, data: EventUpdate) -> EventResponse:
        event = self.read_by_id(event_id)
        for key, value in data.model_dump().items():
            if value is not None:
                setattr(event, key, value)
        self.db.commit()
        self.db.refresh(event)
        return EventResponse.model_validate(event)

    # イベント全体の開始・終了時間を取得するメソッド
    def get_event_time(self, event_id: int) -> EventTimeResponse:
        stages = self.db.query(Stage).filter(Stage.event_id == event_id).all()
        if len(stages) == 0:
            now = datetime.now()
            return {"start_time": now, "end_time": now}
        start_time = min([stage.start_time for stage in stages])
        end_time = max([stage.end_time for stage in stages])
        return EventTimeResponse(start_time=start_time, end_time=end_time)
