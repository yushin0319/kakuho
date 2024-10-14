from pydantic import BaseModel
from datetime import datetime


class Event(BaseModel):
    id: int
    name: str
    description: str
    start_date: datetime
    end_date: datetime

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    name: str
    description: str
    start_date: datetime
    end_date: datetime


class EventUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
