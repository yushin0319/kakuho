from pydantic import BaseModel, ConfigDict
from datetime import datetime


# イベントのスキーマ
class EventBase(BaseModel):
    name: str
    description: str


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    name: str | None = None
    description: str | None = None


class EventResponse(EventBase):
    id: int

    model_config = ConfigDict({"from_attributes": True})


# ステージのスキーマ
class StageBase(BaseModel):
    event_id: int
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

    model_config = ConfigDict({"from_attributes": True})


# チケットタイプのスキーマ
class TicketTypeBase(BaseModel):
    stage_id: int
    type_name: str
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

    model_config = ConfigDict({"from_attributes": True})


# 予約のスキーマ
class ReservationBase(BaseModel):
    ticket_type_id: int
    user_id: int
    num_attendees: int


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(ReservationBase):
    ticket_type_id: int | None = None
    num_attendees: int | None = None


class ReservationResponse(ReservationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict({"from_attributes": True})


# ユーザーのスキーマ
class UserBase(BaseModel):
    email: str
    nickname: str | None = None


class UserCreate(UserBase):
    password: str  # パスワードはハッシュ化して保存するため、ハッシュ化前のパスワードを受け取る
    is_admin: bool = False


class UserUpdate(UserBase):
    email: str | None = None
    password: str | None = (
        None  # パスワードはハッシュ化して保存するため、ハッシュ化前のパスワードを受け取る
    )
    nickname: str | None = None


class UserResponse(UserBase):
    id: int
    is_admin: bool

    model_config = ConfigDict({"from_attributes": True})
