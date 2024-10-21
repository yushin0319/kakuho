# backend/routes/reservation.py
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from schemas import (
    ReservationCreate,
    ReservationUpdate,
    ReservationResponse,
    TicketTypeUpdate,
    TicketTypeResponse,
    UserResponse,
)
from crud.reservation import CrudReservation
from crud.user import CrudUser
from crud.ticket_type import CrudTicketType
from routes.auth import check_admin, get_current_user

reservation_router = APIRouter()


# attendeesの変化量と紐づいたTicketTypeのavailableと照らし合わせる
# deltaがavailableより多い場合はエラーを返す
def check_available(ticket_type: TicketTypeResponse, delta: int) -> None:
    if ticket_type.available + delta < 0:
        raise HTTPException(
            status_code=400,
            detail="チケットの在庫が不足しています。"
            + str(ticket_type.available)
            + "枚まで購入可能です",
        )


# TicketTypeのavailableを変更する
def update_available(ticket_type: TicketTypeResponse, delta: int, db: Session) -> None:
    ticket_type_crud = CrudTicketType(db)
    ticket_type.available += delta
    ticket_type_crud.update(
        ticket_type.id, TicketTypeUpdate(available=ticket_type.available)
    )


# Reservation関連のエンドポイント
# Reservation取得（管理者・ユーザー共通）
@reservation_router.get(
    "/reservations/{reservation_id}", response_model=ReservationResponse
)
def read_reservation(
    reservation_id: int, db: Session = Depends(get_db)
) -> ReservationResponse:
    reservation_crud = CrudReservation(db)
    reservation = reservation_crud.read_by_id(reservation_id)
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


# Reservation一覧取得（管理者のみ）
@reservation_router.get("/reservations", response_model=list[ReservationResponse])
def read_reservations(
    db: Session = Depends(get_db), user: UserResponse = Depends(get_current_user)
) -> list[ReservationResponse]:
    check_admin(user)
    reservation_crud = CrudReservation(db)
    reservations = reservation_crud.read_all()
    return reservations


# Userに紐づくReservation一覧取得（管理者・ユーザー共通）
# 管理者は全ての予約を取得できる
# ユーザーは自分の予約のみ取得できる
@reservation_router.get(
    "/users/{user_id}/reservations", response_model=list[ReservationResponse]
)
def read_reservations_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> list[ReservationResponse]:
    user_crud = CrudUser(db)
    if user_crud.read_by_id(user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")
    reservation_crud = CrudReservation(db)
    if user.is_admin or user_id == user.id:
        reservations = reservation_crud.read_by_user_id(user_id)
        return reservations
    else:
        raise HTTPException(status_code=403, detail="Permission denied")


# TicketTypeに紐づくReservation一覧取得（管理者・ユーザー共通）
# 管理者は全てのチケットタイプの予約を取得できる
# ユーザーは自分のidが紐づくチケットタイプの予約を取得できる
@reservation_router.get(
    "/ticket_types/{ticket_type_id}/reservations",
    response_model=list[ReservationResponse],
)
def read_reservations_by_ticket_type_id(
    ticket_type_id: int,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> list[ReservationResponse]:
    ticket_type_crud = CrudTicketType(db)
    if ticket_type_crud.read_by_id(ticket_type_id) is None:
        raise HTTPException(status_code=404, detail="TicketType not found")
    reservation_crud = CrudReservation(db)
    if user.is_admin:
        reservations = reservation_crud.read_by_ticket_type_id(ticket_type_id)
        return reservations
    else:
        reservations = reservation_crud.read_by_user_and_ticket_type_id(
            user.id, ticket_type_id
        )
        return reservations


# Reservation作成（管理者・ユーザー共通）
@reservation_router.post(
    "/ticket_types/{ticket_type_id}/reservations", response_model=ReservationResponse
)
def create_reservation(
    ticket_type_id: int,
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> ReservationResponse:
    ticket_type_crud = CrudTicketType(db)
    reservation_crud = CrudReservation(db)
    ticket_type = ticket_type_crud.read_by_id(ticket_type_id)
    if ticket_type is None:
        raise HTTPException(status_code=404, detail="TicketType not found")
    try:
        check_available(ticket_type, -reservation.num_attendees)
        update_available(ticket_type, -reservation.num_attendees, db)
        created_reservation = reservation_crud.create(
            ticket_type_id, reservation, user.id
        )
        return created_reservation
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Reservation更新（管理者・ユーザー共通）
# 管理者は全ての予約を更新できる
# ユーザーは自分の予約のみ更新できる
@reservation_router.put(
    "/reservations/{reservation_id}", response_model=ReservationResponse
)
def update_reservation(
    reservation_id: int,
    data: ReservationUpdate,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> ReservationResponse:
    ticket_type_crud = CrudTicketType(db)
    reservation_crud = CrudReservation(db)
    reservation = reservation_crud.read_by_id(reservation_id)
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if not user.is_admin and reservation.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    try:
        ticket_type = ticket_type_crud.read_by_id(reservation.ticket_type_id)
        check_available(ticket_type, data.num_attendees - reservation.num_attendees)
        update_available(
            ticket_type, data.num_attendees - reservation.num_attendees, db
        )
        updated_reservation = reservation_crud.update(reservation_id, data)
        return updated_reservation
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Reservation削除（管理者・ユーザー共通）
# 管理者は全ての予約を削除できる
# ユーザーは自分の予約のみ削除できる
@reservation_router.delete("/reservations/{reservation_id}", status_code=204)
def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    user: UserResponse = Depends(get_current_user),
) -> None:
    ticket_type_crud = CrudTicketType(db)
    reservation_crud = CrudReservation(db)
    reservation = reservation_crud.read_by_id(reservation_id)
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if not user.is_admin and reservation.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    try:
        ticket_type = ticket_type_crud.read_by_id(reservation.ticket_type_id)
        update_available(ticket_type, reservation.num_attendees, db)
        reservation_crud.delete(reservation_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
