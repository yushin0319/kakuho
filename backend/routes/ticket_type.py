# backend/ticket_type.py
from typing import List
from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from config import get_db
from schemas import TicketTypeCreate, TicketTypeUpdate, TicketTypeResponse
from crud.ticket_type import CrudTicketType
from routes.auth import check_admin

ticket_type_router = APIRouter()


# TicketType関連のエンドポイント
# TicketType取得（管理者・ユーザー共通）
@ticket_type_router.get(
    "/ticket_types/{ticket_type_id}", response_model=TicketTypeResponse
)
def read_ticket_type(
    ticket_type_id: int, db: Session = Depends(get_db)
) -> TicketTypeResponse:
    ticket_type = CrudTicketType(db).read_by_id(ticket_type_id)
    return TicketTypeResponse.from_attributes(ticket_type)


# Stageに紐づくTicketType一覧取得（管理者・ユーザー共通）
@ticket_type_router.get(
    "/stages/{stage_id}/ticket_types", response_model=List[TicketTypeResponse]
)
def read_ticket_types_by_stage_id(
    stage_id: int, db: Session = Depends(get_db)
) -> List[TicketTypeResponse]:
    ticket_types = CrudTicketType(db).read_by_stage_id(stage_id)
    return [
        TicketTypeResponse.from_attributes(ticket_type) for ticket_type in ticket_types
    ]


# TicketType作成（管理者のみ）
@ticket_type_router.post(
    "/stages/{stage_id}/ticket_types", response_model=TicketTypeResponse
)
def create_ticket_type(
    stage_id: int,
    ticket_type: TicketTypeCreate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(check_admin),
) -> TicketTypeResponse:
    created_ticket_type = CrudTicketType(db).create(stage_id, ticket_type)
    return TicketTypeResponse.from_attributes(created_ticket_type)


# TicketType更新（管理者のみ）
@ticket_type_router.put(
    "/ticket_types/{ticket_type_id}", response_model=TicketTypeResponse
)
def update_ticket_type(
    ticket_type_id: int,
    ticket_type: TicketTypeUpdate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(check_admin),
) -> TicketTypeResponse:
    updated_ticket_type = CrudTicketType(db).update(ticket_type_id, ticket_type)
    return TicketTypeResponse.from_attributes(updated_ticket_type)


# TicketType削除（管理者のみ）
@ticket_type_router.delete("/ticket_types/{ticket_type_id}")
def delete_ticket_type(
    ticket_type_id: int,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(check_admin),
) -> dict:
    CrudTicketType(db).delete(ticket_type_id)
    return {"message": "TicketType deleted"}
