# backend/ticket_type.py
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from schemas import TicketTypeCreate, TicketTypeUpdate, TicketTypeResponse, UserResponse
from crud.ticket_type import CrudTicketType
from crud.stage import CrudStage
from routes.auth import check_admin, get_current_user

ticket_type_router = APIRouter()


# TicketType関連のエンドポイント
# TicketType取得（管理者・ユーザー共通）
@ticket_type_router.get(
    "/ticket_types/{ticket_type_id}", response_model=TicketTypeResponse
)
def read_ticket_type(
    ticket_type_id: int, db: Session = Depends(get_db)
) -> TicketTypeResponse:
    ticket_type_crud = CrudTicketType(db)
    ticket_type = ticket_type_crud.read_by_id(ticket_type_id)
    if ticket_type is None:
        raise HTTPException(status_code=404, detail="TicketType not found")
    return ticket_type


# Stageに紐づくTicketType一覧取得（管理者・ユーザー共通）
@ticket_type_router.get(
    "/stages/{stage_id}/ticket_types", response_model=list[TicketTypeResponse]
)
def read_ticket_types_by_stage_id(
    stage_id: int, db: Session = Depends(get_db)
) -> list[TicketTypeResponse]:
    stage_crud = CrudStage(db)
    if stage_crud.read_by_id(stage_id) is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    ticket_type_crud = CrudTicketType(db)
    ticket_types = ticket_type_crud.read_by_stage_id(stage_id)
    return ticket_types


# TicketType作成（管理者のみ）
@ticket_type_router.post(
    "/stages/{stage_id}/ticket_types", response_model=TicketTypeResponse
)
def create_ticket_type(
    stage_id: int,
    ticket_type: TicketTypeCreate,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> TicketTypeResponse:
    check_admin(user)
    ticket_type_crud = CrudTicketType(db)
    created_ticket_type = ticket_type_crud.create(stage_id, ticket_type)
    return created_ticket_type


# TicketType更新（管理者のみ）
@ticket_type_router.put(
    "/ticket_types/{ticket_type_id}", response_model=TicketTypeResponse
)
def update_ticket_type(
    ticket_type_id: int,
    ticket_type: TicketTypeUpdate,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> TicketTypeResponse:
    check_admin(user)
    ticket_type_crud = CrudTicketType(db)
    if ticket_type_crud.read_by_id(ticket_type_id) is None:
        raise HTTPException(status_code=404, detail="TicketType not found")
    updated_ticket_type = ticket_type_crud.update(ticket_type_id, ticket_type)
    return updated_ticket_type


# TicketType削除（管理者のみ）
@ticket_type_router.delete("/ticket_types/{ticket_type_id}", status_code=204)
def delete_ticket_type(
    ticket_type_id: int,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> None:
    check_admin(user)
    ticket_type_crud = CrudTicketType(db)
    if ticket_type_crud.read_by_id(ticket_type_id) is None:
        raise HTTPException(status_code=404, detail="TicketType not found")
    ticket_type_crud.delete(ticket_type_id)
