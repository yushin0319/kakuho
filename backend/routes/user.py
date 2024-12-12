# backend/routes/user.py
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from schemas import (
    UserResponse,
    UserUpdate,
    UserCreate,
    SeatGroupResponse,
    SeatGroupUpdate,
)
from crud.user import CrudUser
from crud.reservation import CrudReservation
from crud.ticket_type import CrudTicketType
from crud.seat_group import CrudSeatGroup
from routes.auth import check_admin, get_current_user

user_router = APIRouter()


# SeatGroupのcapacityを更新する
def update_capacity(seat_group: SeatGroupResponse, delta: int, db: Session) -> None:
    seat_group_crud = CrudSeatGroup(db)
    seat_group_crud.update(
        seat_group.id, SeatGroupUpdate(capacity=seat_group.capacity + delta)
    )


# User関連のエンドポイント
# User登録
@user_router.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    user_crud = CrudUser(db)
    if user_crud.read_by_email(user.email) is not None:
        raise HTTPException(status_code=400, detail="Email already registered")
    created_user = user_crud.create(user)
    return created_user


# User取得（管理者・ユーザー共通）
@user_router.get("/users/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    user_crud = CrudUser(db)
    if current_user.is_admin or user_id == current_user.id:
        user = user_crud.read_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    else:
        raise HTTPException(status_code=403, detail="Permission denied")


# User一覧取得（管理者のみ）
@user_router.get("/users", response_model=list[UserResponse])
def read_users(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
) -> list[UserResponse]:
    check_admin(current_user)
    user_crud = CrudUser(db)
    users = user_crud.read_all()
    return users


# User更新（管理者・ユーザー共通）
# 管理者は全てのユーザーを更新できる
# ユーザーは自分の情報のみ更新できる
@user_router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    user_crud = CrudUser(db)
    if current_user.is_admin or user_id == current_user.id:
        update_user = user_crud.read_by_id(user_id)
        if update_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        updated_user = user_crud.update(user_id, user)
        return updated_user
    else:
        raise HTTPException(status_code=403, detail="Permission denied")


# User削除（管理者・ユーザー共通）
# 管理者は全てのユーザーを削除できる
# ユーザーは自分の情報のみ削除できる
@user_router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
) -> None:
    user_crud = CrudUser(db)
    reservation_crud = CrudReservation(db)
    ticket_type_crud = CrudTicketType(db)
    seat_group_crud = CrudSeatGroup(db)

    # 削除対象のユーザーを取得
    delete_user = user_crud.read_by_id(user_id)
    if delete_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # 管理者が一般ユーザーを削除する場合のみ許可
    if delete_user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete an admin user")

    # 削除を実行
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        reservations = reservation_crud.read_by_user_id(user_id)
        for reservation in reservations:
            ticket_type = ticket_type_crud.read_by_id(reservation.ticket_type_id)
            seat_group = seat_group_crud.read_by_id(ticket_type.seat_group_id)
            update_capacity(seat_group, reservation.num_attendees, db)
            reservation_crud.delete(reservation.id)
        user_crud.delete(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
