from sqlalchemy.orm import Session
from models import Event, Stage, TicketType, Reservation, User
from passlib.context import CryptContext
from datetime import datetime, timedelta

# パスワードのハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def initialize_sample_data(db: Session):
    # サンプルユーザー作成
    hashed_password_user = pwd_context.hash("userpassword")
    hashed_password_admin = pwd_context.hash("adminpassword")

    user = User(
        email="user@example.com",
        nickname="一般ユーザー",
        password_hash=hashed_password_user,
        is_admin=False,
    )

    admin = User(
        email="admin@example.com",
        nickname="管理者",
        password_hash=hashed_password_admin,
        is_admin=True,
    )

    db.add(user)
    db.add(admin)
    db.commit()

    # サンプルイベント作成
    event = Event(
        name="演劇フェスティバル2024",
        description="劇団による年に一度の演劇フェスティバルです。",
    )
    db.add(event)
    db.commit()

    # サンプルステージ作成
    stage1 = Stage(
        event_id=event.id,
        start_time=datetime.now() + timedelta(days=1),
        end_time=datetime.now() + timedelta(days=1, hours=2),
        capacity=100,
    )

    stage2 = Stage(
        event_id=event.id,
        start_time=datetime.now() + timedelta(days=2),
        end_time=datetime.now() + timedelta(days=2, hours=2),
        capacity=150,
    )

    db.add(stage1)
    db.add(stage2)
    db.commit()

    # サンプルチケットタイプ作成
    ticket1 = TicketType(
        stage_id=stage1.id, type_name="一般席", price=5000, available=100
    )
    ticket2 = TicketType(
        stage_id=stage2.id, type_name="VIP席", price=10000, available=50
    )

    db.add(ticket1)
    db.add(ticket2)
    db.commit()

    # サンプル予約作成
    reservation1 = Reservation(
        ticket_type_id=ticket1.id, user_id=user.id, num_attendees=2
    )
    reservation2 = Reservation(
        ticket_type_id=ticket2.id, user_id=user.id, num_attendees=1
    )

    db.add(reservation1)
    db.add(reservation2)
    db.commit()

    print("サンプルデータが正常に挿入されました。")


# 以下のようにしてサンプルデータを挿入
# db: Session = SessionLocal() のようにセッションを作ってから呼び出してください
# initialize_sample_data(db)
