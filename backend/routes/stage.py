# backend/routes/stage.py
import logging
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from schemas import StageCreate, StageUpdate, StageResponse
from crud.stage import CrudStage
from crud.event import CrudEvent
from routes.auth import check_admin

logger = logging.getLogger(__name__)

stage_router = APIRouter()


# Stage関連のエンドポイント
# Stage取得（管理者・ユーザー共通）
@stage_router.get("/stages/{stage_id}", response_model=StageResponse)
def read_stage(stage_id: int, db: Session = Depends(get_db)) -> StageResponse:
    stage_crud = CrudStage(db)
    stage = stage_crud.read_by_id(stage_id)
    if stage is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    return stage


# Stage一覧取得（管理者・ユーザー共通）
@stage_router.get("/stages", response_model=list[StageResponse])
def read_stages(db: Session = Depends(get_db)) -> list[StageResponse]:
    stage_crud = CrudStage(db)
    stages = stage_crud.read_all()
    return stages


# Eventに紐づくStage一覧取得（管理者・ユーザー共通）
@stage_router.get("/events/{event_id}/stages", response_model=list[StageResponse])
def read_stages_by_event_id(
    event_id: int, db: Session = Depends(get_db)
) -> list[StageResponse]:
    event_crud = CrudEvent(db)
    if event_crud.read_by_id(event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")
    stage_crud = CrudStage(db)
    stages = stage_crud.read_by_event_id(event_id)
    return stages


# Stage作成（管理者のみ）
@stage_router.post("/events/{event_id}/stages", response_model=StageResponse)
def create_stage(
    event_id: int,
    stage: StageCreate,
    db: Session = Depends(get_db),
    _: None = Depends(check_admin),
) -> StageResponse:
    event_crud = CrudEvent(db)
    stage_crud = CrudStage(db)
    if event_crud.read_by_id(event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")
    existing_stage = stage_crud.read_by_event_id(event_id)
    for s in existing_stage:
        if s.start_time == stage.start_time:
            raise HTTPException(status_code=400, detail="Start time already exists")
    try:
        created_stage = stage_crud.create(event_id, stage)
        return created_stage
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating stage for event {event_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Stage更新（管理者のみ）
@stage_router.put("/stages/{stage_id}", response_model=StageResponse)
def update_stage(
    stage_id: int,
    stage: StageUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(check_admin),
) -> StageResponse:
    stage_crud = CrudStage(db)
    if stage_crud.read_by_id(stage_id) is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    try:
        updated_stage = stage_crud.update(stage_id, stage)
        return updated_stage
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating stage {stage_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Stage削除（管理者のみ）
@stage_router.delete("/stages/{stage_id}", status_code=204)
def delete_stage(
    stage_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(check_admin),
) -> None:
    stage_crud = CrudStage(db)
    stage = stage_crud.read_by_id(stage_id)
    if stage is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    try:
        stage_crud.delete(stage_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Stage not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting stage {stage_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
