from fastapi import HTTPException
from sqlalchemy.orm import Session
from base import BaseCRUD
from model import TicketType
from schema import TicketTypeCreate, TicketTypeUpdate, TicketTypeResponse


class CrudTicketType(BaseCRUD[TicketType, TicketTypeResponse]):
    def __init__(self, db: Session):
        super().__init__(db, TicketType, TicketTypeResponse)

    # イベントIDで読み取り
    def read_by_event_id(self, event_id: int) -> list[TicketTypeResponse]:
        ticket_types = (
            self.db.query(TicketType).filter(TicketType.event_id == event_id).all()
        )
        return [
            TicketTypeResponse.from_attributes(ticket_type)
            for ticket_type in ticket_types
        ]

    def create(self, data: TicketTypeCreate) -> TicketTypeResponse:
        ticket_type = TicketType(**data.model_dump())
        self.db.add(ticket_type)
        self.db.commit()
        self.db.refresh(ticket_type)
        return TicketTypeResponse.from_attributes(ticket_type)

    def update(self, ticket_type_id: int, data: TicketTypeUpdate) -> TicketTypeResponse:
        ticket_type = self.read_by_id(ticket_type_id)
        if ticket_type is None:
            raise HTTPException(status_code=404, detail="TicketType not found")
        for key, value in data.model_dump().items():
            if value is not None:
                setattr(ticket_type, key, value)
        self.db.commit()
        self.db.refresh(ticket_type)
        return TicketTypeResponse.from_attributes(ticket_type)
