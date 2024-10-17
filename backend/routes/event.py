from typing import List, Dict
from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from config import get_db
from schemas import EventCreate, EventUpdate, EventResponse
from crud.event import CrudEvent
from routes.auth import check_admin

event_router = APIRouter()


# Event関連のエンドポイント
# Event取得(管理者・ユーザー共通)
@event_router.get("/events/{event_id}", response_model=EventResponse)
def read_event(event_id: int, db: Session = Depends(get_db)) -> EventResponse:
    event = CrudEvent(db).read_by_id(event_id)
    return EventResponse.from_attributes(event)


# Eventの開始・終了時間を取得（管理者・ユーザー共通）
@event_router.get("/events/{event_id}/duration", response_model=Dict[str, str])
def read_event_duration(event_id: int, db: Session = Depends(get_db)) -> Dict[str, str]:
    duration = CrudEvent(db).get_event_time(event_id)
    return duration


# Event一覧取得（管理者・ユーザー共通）
@event_router.get("/events", response_model=List[EventResponse])
def read_events(db: Session = Depends(get_db)) -> List[EventResponse]:
    events = CrudEvent(db).read_all()
    return [EventResponse.from_attributes(event) for event in events]


# Event作成（管理者のみ）
@event_router.post("/events", response_model=EventResponse)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(check_admin),
) -> EventResponse:
    created_event = CrudEvent(db).create(event)
    return EventResponse.from_attributes(created_event)


# Event更新（管理者のみ）
@event_router.put("/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event: EventUpdate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(check_admin),
) -> EventResponse:
    updated_event = CrudEvent(db).update(event_id, event)
    return EventResponse.from_attributes(updated_event)


# Event削除（管理者のみ）
@event_router.delete("/events/{event_id}")
def delete_event(
    event_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(check_admin)
) -> dict:
    CrudEvent(db).delete(event_id)
    return {"message": "Event deleted"}
