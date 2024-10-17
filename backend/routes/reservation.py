# backend/routes/reservation.py
from typing import List
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from datetime import datetime
from schemas import (
    ReservationCreate,
    ReservationUpdate,
    ReservationResponse,
    UserResponse,
)
from crud.reservation import CrudReservation
from routes.auth import check_admin, check_user

reservation_router = APIRouter()


# Reservation関連のエンドポイント
# Reservation取得（管理者・ユーザー共通）
@reservation_router.get(
    "/reservations/{reservation_id}", response_model=ReservationResponse
)
def read_reservation(
    reservation_id: int, db: Session = Depends(get_db)
) -> ReservationResponse:
    reservation = CrudReservation(db).read_by_id(reservation_id)
    return ReservationResponse.model_validate(reservation)


# Reservation一覧取得（管理者のみ）
@reservation_router.get("/reservations", response_model=List[ReservationResponse])
def read_reservations(
    db: Session = Depends(get_db), is_admin: bool = Depends(check_admin)
) -> List[ReservationResponse]:
    reservations = CrudReservation(db).read_all()
    return [
        ReservationResponse.model_validate(reservation) for reservation in reservations
    ]


# Userに紐づくReservation一覧取得（管理者・ユーザー共通）
# 管理者は全ての予約を取得できる
# ユーザーは自分の予約のみ取得できる


@reservation_router.get(
    "/users/{user_id}/reservations", response_model=List[ReservationResponse]
)
def read_reservations_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(check_user),
) -> List[ReservationResponse]:
    if current_user.is_admin or user_id == current_user.id:
        reservations = CrudReservation(db).read_by_user_id(user_id)
        return [
            ReservationResponse.model_validate(reservation)
            for reservation in reservations
        ]
    else:
        raise HTTPException(status_code=403, detail="Permission denied")


# TicketTypeに紐づくReservation一覧取得（管理者・ユーザー共通）
# 管理者は全てのチケットタイプの予約を取得できる
# ユーザーは自分のidが紐づくチケットタイプの予約を取得できる
@reservation_router.get(
    "/ticket_types/{ticket_type_id}/reservations",
    response_model=List[ReservationResponse],
)
def read_reservations_by_ticket_type_id(
    ticket_type_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(check_user),
) -> List[ReservationResponse]:
    if current_user.is_admin:
        reservations = CrudReservation(db).read_by_ticket_type_id(ticket_type_id)
        return [
            ReservationResponse.model_validate(reservation)
            for reservation in reservations
        ]
    else:
        reservations = CrudReservation(db).read_by_user_and_ticket_type_id(
            current_user.id, ticket_type_id
        )
        return [
            ReservationResponse.model_validate(reservation)
            for reservation in reservations
        ]


# Reservation作成（管理者・ユーザー共通）
@reservation_router.post("/reservations", response_model=ReservationResponse)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(check_user),
) -> ReservationResponse:
    reservation.user_id = current_user.id
    reservation.created_at = datetime.now()
    created_reservation = CrudReservation(db).create(reservation)
    return ReservationResponse.model_validate(created_reservation)


# Reservation更新（管理者・ユーザー共通）
# 管理者は全ての予約を更新できる
# ユーザーは自分の予約のみ更新できる
@reservation_router.put(
    "/reservations/{reservation_id}", response_model=ReservationResponse
)
def update_reservation(
    reservation_id: int,
    reservation: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(check_user),
) -> ReservationResponse:
    if current_user.is_admin:
        updated_reservation = CrudReservation(db).update(reservation_id, reservation)
        return ReservationResponse.model_validate(updated_reservation)
    else:
        reservations = CrudReservation(db).read_by_user_id(current_user.id)
        if reservation_id not in [reservation.id for reservation in reservations]:
            raise HTTPException(status_code=403, detail="Permission denied")
        updated_reservation = CrudReservation(db).update(reservation_id, reservation)
        return ReservationResponse.model_validate(updated_reservation)


# Reservation削除（管理者・ユーザー共通）
# 管理者は全ての予約を削除できる
# ユーザーは自分の予約のみ削除できる
@reservation_router.delete("/reservations/{reservation_id}")
def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(check_user),
) -> dict:
    if current_user.is_admin:
        CrudReservation(db).delete(reservation_id)
        return {"message": "Reservation deleted"}
    else:
        reservations = CrudReservation(db).read_by_user_id(current_user.id)
        if reservation_id not in [reservation.id for reservation in reservations]:
            raise HTTPException(status_code=403, detail="Permission denied")
        CrudReservation(db).delete(reservation_id)
        return {"message": "Reservation deleted"}
