from fastapi import HTTPException
from sqlalchemy.orm import Session
from base import BaseCRUD
from model import Event
from schema import EventCreate, EventUpdate, EventResponse


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
