# backend/crud/ticket_type.py
from sqlalchemy.orm import Session
from crud.base import BaseCRUD
from models import TicketType
from schemas import TicketTypeCreate, TicketTypeUpdate, TicketTypeResponse


class CrudTicketType(BaseCRUD[TicketType, TicketTypeResponse]):
    def __init__(self, db: Session):
        super().__init__(db, TicketType, TicketTypeResponse)

    # SeatGroupIDで読み取り
    def read_by_seat_group_id(self, seat_group_id: int) -> list[TicketTypeResponse]:
        ticket_types = (
            self.db.query(TicketType)
            .filter(TicketType.seat_group_id == seat_group_id)
            .all()
        )
        return [
            TicketTypeResponse.model_validate(ticket_type)
            for ticket_type in ticket_types
        ]

    def create(self, seat_group_id: int, data: TicketTypeCreate) -> TicketTypeResponse:
        ticket_type = TicketType(**data.model_dump(), seat_group_id=seat_group_id)
        self.db.add(ticket_type)
        self.db.commit()
        self.db.refresh(ticket_type)
        return TicketTypeResponse.model_validate(ticket_type)

    def update(self, ticket_type_id: int, data: TicketTypeUpdate) -> TicketTypeResponse:
        ticket_type = self.read_by_id(ticket_type_id)
        for key, value in data.model_dump().items():
            if value is not None:
                setattr(ticket_type, key, value)
        self.db.commit()
        self.db.refresh(ticket_type)
        return TicketTypeResponse.model_validate(ticket_type)
