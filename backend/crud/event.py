# backend/crud/event.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from crud.base import BaseCRUD
from models import Event, Stage
from schemas import EventCreate, EventUpdate, EventResponse


class CrudEvent(BaseCRUD[Event, EventResponse]):
    def __init__(self, db: Session):
        super().__init__(db, Event, EventResponse)

    def create(self, data: EventCreate) -> EventResponse:
        event = Event(**data.model_dump())
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return EventResponse.from_attributes(event)

    def update(self, event_id: int, data: EventUpdate) -> EventResponse:
        event = self.read_by_id(event_id)
        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")
        for key, value in data.model_dump().items():
            if value is not None:
                setattr(event, key, value)
        self.db.commit()
        self.db.refresh(event)
        return EventResponse.from_attributes(event)

    # イベント全体の開始・終了時間を取得するメソッド
    def get_event_time(self, event_id: int) -> dict:
        event = self.read_by_id(event_id)
        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")
        stages = self.db.query(Stage).filter(Stage.event_id == event_id).all()
        start_time = min([stage.start_time for stage in stages])
        end_time = max([stage.end_time for stage in stages])
        return {"start_time": start_time, "end_time": end_time}
