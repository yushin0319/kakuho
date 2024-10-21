from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime


# イベントのスキーマ
class EventBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, min_length=1, max_length=500)


class EventResponse(EventBase):
    id: int

    model_config = ConfigDict({"from_attributes": True})


class EventTimeResponse(BaseModel):
    start_time: datetime
    end_time: datetime


# ステージのスキーマ
class StageBase(BaseModel):
    start_time: datetime
    end_time: datetime
    capacity: int


class StageCreate(StageBase):
    pass


class StageUpdate(StageBase):
    start_time: datetime | None = None
    end_time: datetime | None = None
    capacity: int | None = None


class StageResponse(StageBase):
    id: int
    event_id: int

    model_config = ConfigDict({"from_attributes": True})


# チケットタイプのスキーマ
class TicketTypeBase(BaseModel):
    type_name: str = Field(..., min_length=1, max_length=50)
    price: float
    available: int


class TicketTypeCreate(TicketTypeBase):
    pass


class TicketTypeUpdate(TicketTypeBase):
    type_name: str | None = None
    price: float | None = None
    available: int | None = None


class TicketTypeResponse(TicketTypeBase):
    id: int
    stage_id: int

    model_config = ConfigDict({"from_attributes": True})


# 予約のスキーマ
class ReservationBase(BaseModel):
    num_attendees: int


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(ReservationBase):
    num_attendees: int | None = None


class ReservationResponse(ReservationBase):
    id: int
    created_at: datetime
    user_id: int
    ticket_type_id: int

    model_config = ConfigDict({"from_attributes": True})


# ユーザーのスキーマ
class UserBase(BaseModel):
    email: EmailStr
    nickname: str | None = Field(None, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=50)


class UserUpdate(UserBase):
    email: EmailStr | None = None
    password: str | None = Field(None, min_length=6, max_length=50)
    nickname: str | None = None


class UserResponse(UserBase):
    id: int
    is_admin: bool

    model_config = ConfigDict({"from_attributes": True})
