# backend/crud/reservation.py
from sqlalchemy.orm import Session
from crud.base import BaseCRUD
from models import Reservation
from schemas import ReservationCreate, ReservationUpdate, ReservationResponse
from datetime import datetime, timezone


class CrudReservation(BaseCRUD[Reservation, ReservationResponse]):
    def __init__(self, db: Session):
        super().__init__(db, Reservation, ReservationResponse)

    # チケットタイプIDで読み取り
    def read_by_ticket_type_id(self, ticket_type_id: int) -> list[ReservationResponse]:
        reservations = (
            self.db.query(Reservation)
            .filter(Reservation.ticket_type_id == ticket_type_id)
            .all()
        )
        return [
            ReservationResponse.model_validate(reservation)
            for reservation in reservations
        ]

    # ユーザーIDで読み取り
    def read_by_user_id(self, user_id: int) -> list[ReservationResponse]:
        reservations = (
            self.db.query(Reservation).filter(Reservation.user_id == user_id).all()
        )
        return [
            ReservationResponse.model_validate(reservation)
            for reservation in reservations
        ]

    # ユーザーIDとチケットタイプIDで読み取り
    def read_by_user_and_ticket_type_id(
        self, user_id: int, ticket_type_id: int
    ) -> list[ReservationResponse]:
        reservations = (
            self.db.query(Reservation)
            .filter(Reservation.user_id == user_id)
            .filter(Reservation.ticket_type_id == ticket_type_id)
            .all()
        )
        return [
            ReservationResponse.model_validate(reservation)
            for reservation in reservations
        ]

    def create(
        self, ticket_type_id: int, user_id: int, data: ReservationCreate
    ) -> ReservationResponse:
        reservation = Reservation(**data.model_dump())
        reservation.ticket_type_id = ticket_type_id
        reservation.user_id = user_id
        reservation.created_at = datetime.now(timezone.utc)
        self.db.add(reservation)
        self.db.commit()
        self.db.refresh(reservation)
        return ReservationResponse.model_validate(reservation)

    def update(
        self, reservation_id: int, data: ReservationUpdate
    ) -> ReservationResponse:
        reservation = self.read_by_id(reservation_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(reservation, key, value)
        self.db.commit()
        self.db.refresh(reservation)
        return ReservationResponse.model_validate(reservation)
