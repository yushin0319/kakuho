from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Float,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone


Base = declarative_base()


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    # リレーション: イベントには複数のステージが紐付く
    stages = relationship("Stage", back_populates="event")


class Stage(Base):
    __tablename__ = "stages"

    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    # 同イベント内でのstart_timeは一意である
    __table_args__ = (UniqueConstraint("event_id", "start_time"),)

    # リレーション: ステージはイベントに紐付いている
    event = relationship("Event", back_populates="stages")
    # リレーション: ステージには複数のシートグループがある
    seat_groups = relationship("SeatGroup", back_populates="stage")


class SeatGroup(Base):
    __tablename__ = "seat_groups"

    id = Column(Integer, primary_key=True)
    stage_id = Column(Integer, ForeignKey("stages.id"), nullable=False)
    capacity = Column(Integer, nullable=False)

    # リレーション: シートグループはステージに紐付いている
    stage = relationship("Stage", back_populates="seat_groups")
    # リレーション: シートグループには複数のチケットタイプがある
    ticket_types = relationship("TicketType", back_populates="seat_group")


class TicketType(Base):
    __tablename__ = "ticket_types"

    id = Column(Integer, primary_key=True)
    seat_group_id = Column(Integer, ForeignKey("seat_groups.id"), nullable=False)
    type_name = Column(String, nullable=False, default="一般")
    price = Column(Float, nullable=False)

    # 同SeatGroup内でのtype_nameは一意である
    __table_args__ = (UniqueConstraint("seat_group_id", "type_name"),)

    # リレーション: チケットタイプはステージに紐付いている
    seat_group = relationship("SeatGroup", back_populates="ticket_types")
    # リレーション: チケットタイプには複数の予約がある
    reservations = relationship("Reservation", back_populates="ticket_type")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True)
    ticket_type_id = Column(Integer, ForeignKey("ticket_types.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    num_attendees = Column(Integer, nullable=False)
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    # リレーション: 予約はチケットタイプに紐付いている
    ticket_type = relationship("TicketType", back_populates="reservations")
    # リレーション: 予約はユーザーに紐付いている
    user = relationship("User", back_populates="reservations")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    nickname = Column(String)
    is_admin = Column(Boolean, default=False)

    # リレーション: ユーザーは複数の予約を持つ
    reservations = relationship("Reservation", back_populates="user")
