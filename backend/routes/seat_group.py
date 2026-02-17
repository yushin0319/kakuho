# backend/routes/seat_group.py
import logging
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from schemas import SeatGroupCreate, SeatGroupUpdate, SeatGroupResponse, UserResponse
from crud.seat_group import CrudSeatGroup
from crud.stage import CrudStage
from routes.auth import check_admin, get_current_user

logger = logging.getLogger(__name__)

seat_group_router = APIRouter()


# SeatGroup関連のエンドポイント
# SeatGroup取得（管理者・ユーザー共通）
@seat_group_router.get("/seat_groups/{seat_group_id}", response_model=SeatGroupResponse)
def read_seat_group(
    seat_group_id: int, db: Session = Depends(get_db)
) -> SeatGroupResponse:
    seat_group_crud = CrudSeatGroup(db)
    seat_group = seat_group_crud.read_by_id(seat_group_id)
    if seat_group is None:
        raise HTTPException(status_code=404, detail="SeatGroup not found")
    return seat_group


# SeatGroup一覧取得（管理者・ユーザー共通）
@seat_group_router.get("/seat_groups", response_model=list[SeatGroupResponse])
def read_seat_groups(db: Session = Depends(get_db)) -> list[SeatGroupResponse]:
    seat_group_crud = CrudSeatGroup(db)
    seat_groups = seat_group_crud.read_all()
    return seat_groups


# Stageに紐づくSeatGroup一覧取得（管理者・ユーザー共通）
@seat_group_router.get(
    "/stages/{stage_id}/seat_groups", response_model=list[SeatGroupResponse]
)
def read_seat_groups_by_stage_id(
    stage_id: int, db: Session = Depends(get_db)
) -> list[SeatGroupResponse]:
    stage_crud = CrudStage(db)
    if stage_crud.read_by_id(stage_id) is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    seat_group_crud = CrudSeatGroup(db)
    seat_groups = seat_group_crud.read_by_stage_id(stage_id)
    return seat_groups


# SeatGroup作成（管理者のみ）
@seat_group_router.post(
    "/stages/{stage_id}/seat_groups", response_model=SeatGroupResponse
)
def create_seat_group(
    stage_id: int,
    seat_group: SeatGroupCreate,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> SeatGroupResponse:
    check_admin(user)
    stage_crud = CrudStage(db)
    seat_group_crud = CrudSeatGroup(db)
    if stage_crud.read_by_id(stage_id) is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    try:
        created_seat_group = seat_group_crud.create(stage_id, seat_group)
        return created_seat_group
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating seat_group for stage {stage_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# SeatGroup更新（管理者のみ）
@seat_group_router.put("/seat_groups/{seat_group_id}", response_model=SeatGroupResponse)
def update_seat_group(
    seat_group_id: int,
    seat_group: SeatGroupUpdate,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> SeatGroupResponse:
    check_admin(user)
    seat_group_crud = CrudSeatGroup(db)
    if seat_group_crud.read_by_id(seat_group_id) is None:
        raise HTTPException(status_code=404, detail="SeatGroup not found")
    try:
        updated_seat_group = seat_group_crud.update(seat_group_id, seat_group)
        return updated_seat_group
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating seat_group {seat_group_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# SeatGroup削除（管理者のみ）
@seat_group_router.delete("/seat_groups/{seat_group_id}", status_code=204)
def delete_seat_group(
    seat_group_id: int,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> None:
    check_admin(user)
    seat_group_crud = CrudSeatGroup(db)
    if seat_group_crud.read_by_id(seat_group_id) is None:
        raise HTTPException(status_code=404, detail="SeatGroup not found")
    try:
        seat_group_crud.delete(seat_group_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="SeatGroup not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting seat_group {seat_group_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
