# backend/crud/reservation.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from crud.base import BaseCRUD
from models import Reservation
from schemas import ReservationCreate, ReservationUpdate, ReservationResponse


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
            ReservationResponse.from_attributes(reservation)
            for reservation in reservations
        ]

    # ユーザーIDで読み取り
    def read_by_user_id(self, user_id: int) -> list[ReservationResponse]:
        reservations = (
            self.db.query(Reservation).filter(Reservation.user_id == user_id).all()
        )
        return [
            ReservationResponse.from_attributes(reservation)
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
            ReservationResponse.from_attributes(reservation)
            for reservation in reservations
        ]

    def create(self, data: ReservationCreate) -> ReservationResponse:
        reservation = Reservation(**data.model_dump())
        self.db.add(reservation)
        self.db.commit()
        self.db.refresh(reservation)
        return ReservationResponse.from_attributes(reservation)

    def update(
        self, reservation_id: int, data: ReservationUpdate
    ) -> ReservationResponse:
        reservation = self.read_by_id(reservation_id)
        if reservation is None:
            raise HTTPException(status_code=404, detail="Reservation not found")
        for key, value in data.model_dump().items():
            if value is not None:
                setattr(reservation, key, value)
        self.db.commit()
        self.db.refresh(reservation)
        return ReservationResponse.from_attributes(reservation)
