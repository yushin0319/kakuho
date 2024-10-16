from typing import List
from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from config import get_db
from schemas import StageCreate, StageUpdate, StageResponse
from crud.stage import CrudStage
from routes.auth import check_admin

stage_router = APIRouter()


# Stage関連のエンドポイント
# Stage取得（管理者・ユーザー共通）
@stage_router.get("/stages/{stage_id}", response_model=StageResponse)
def read_stage(stage_id: int, db: Session = Depends(get_db)) -> StageResponse:
    stage = CrudStage(db).read_by_id(stage_id)
    return StageResponse.from_attributes(stage)


# Eventに紐づくStage一覧取得（管理者・ユーザー共通）
@stage_router.get("/events/{event_id}/stages", response_model=List[StageResponse])
def read_stages_by_event_id(
    event_id: int, db: Session = Depends(get_db)
) -> List[StageResponse]:
    stages = CrudStage(db).read_by_event_id(event_id)
    return [StageResponse.from_attributes(stage) for stage in stages]


# Stage作成（管理者のみ）
@stage_router.post("/events/{event_id}/stages", response_model=StageResponse)
def create_stage(
    event_id: int,
    stage: StageCreate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(check_admin),
) -> StageResponse:
    created_stage = CrudStage(db).create(event_id, stage)
    return StageResponse.from_attributes(created_stage)


# Stage更新（管理者のみ）
@stage_router.put("/stages/{stage_id}", response_model=StageResponse)
def update_stage(
    stage_id: int,
    stage: StageUpdate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(check_admin),
) -> StageResponse:
    updated_stage = CrudStage(db).update(stage_id, stage)
    return StageResponse.from_attributes(updated_stage)


# Stage削除（管理者のみ）
@stage_router.delete("/stages/{stage_id}")
def delete_stage(
    stage_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(check_admin)
) -> dict:
    CrudStage(db).delete(stage_id)
    return {"message": "Stage deleted"}
