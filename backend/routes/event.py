# backend/routes/event.py
import logging
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from schemas import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventTimeResponse,
    UserResponse,
)
from crud.event import CrudEvent
from routes.auth import check_admin, get_current_user

logger = logging.getLogger(__name__)

event_router = APIRouter()


# Event関連のエンドポイント
# Event取得(管理者・ユーザー共通)
@event_router.get("/events/{event_id}", response_model=EventResponse)
def read_event(event_id: int, db: Session = Depends(get_db)) -> EventResponse:
    crud_event = CrudEvent(db)
    event = crud_event.read_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


# Eventの開始・終了時間を取得（管理者・ユーザー共通）
@event_router.get("/events/{event_id}/duration", response_model=EventTimeResponse)
def read_event_duration(
    event_id: int, db: Session = Depends(get_db)
) -> EventTimeResponse:
    crud_event = CrudEvent(db)
    if crud_event.read_by_id(event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")
    duration = crud_event.get_event_time(event_id)
    return duration


# Event一覧取得（管理者・ユーザー共通）
@event_router.get("/events", response_model=list[EventResponse])
def read_events(db: Session = Depends(get_db)) -> list[EventResponse]:
    crud_event = CrudEvent(db)
    events = crud_event.read_all()
    return events


# Event作成（管理者のみ）
@event_router.post("/events", response_model=EventResponse)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> EventResponse:
    check_admin(user)
    crud_event = CrudEvent(db)
    try:
        created_event = crud_event.create(event)
        return created_event
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating event: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Event更新（管理者のみ）
@event_router.put("/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event: EventUpdate,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> EventResponse:
    check_admin(user)
    crud_event = CrudEvent(db)
    if crud_event.read_by_id(event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")
    try:
        updated_event = crud_event.update(event_id, event)
        return updated_event
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating event {event_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Event削除（管理者のみ）
@event_router.delete("/events/{event_id}", status_code=204)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> None:
    check_admin(user)
    crud_event = CrudEvent(db)
    if crud_event.read_by_id(event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")
    try:
        crud_event.delete(event_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Event not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting event {event_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
