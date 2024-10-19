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

    users = [
        User(
            email="tanaka@example.com",
            nickname="田中",
            password_hash=hashed_password_user,
            is_admin=False,
        ),
        User(
            email="saito@example.com",
            nickname="斎藤",
            password_hash=hashed_password_user,
            is_admin=False,
        ),
        User(
            email="yamada@example.com",
            nickname="山田",
            password_hash=hashed_password_user,
            is_admin=False,
        ),
        User(
            email="suzuki@example.com",
            nickname="鈴木",
            password_hash=hashed_password_user,
            is_admin=False,
        ),
    ]

    admin = User(
        email="admin@example.com",
        nickname="管理者",
        password_hash=hashed_password_admin,
        is_admin=True,
    )

    db.add(admin)
    db.add_all(users)
    db.commit()

    # サンプルイベント作成
    events = [
        Event(
            name="冬の空に手を伸ばして",
            description="冷たい風に逆らい、夢に向かって走る若者たちの物語。",
        ),
        Event(
            name="星降る夜に約束を",
            description="星がきらめく夜、運命の出会いが待っている。",
        ),
        Event(
            name="桜散る道のその先に",
            description="別れと出会い、そして未来を信じる人々の感動の物語。",
        ),
    ]

    db.add_all(events)
    db.commit()

    # サンプルステージ作成（イベントごとのステージに start_time と end_time を追加）
    stages = []
    base_date = datetime(2024, 11, 1)  # 11月から開始
    for i, event in enumerate(events):
        event_date = base_date + timedelta(days=30 * i)  # 1ヶ月ごとに公演があるイメージ
        stages.append(
            Stage(
                event_id=event.id,
                start_time=event_date.replace(hour=10),
                end_time=event_date.replace(hour=12),
                capacity=100,
            )
        )
        event_date = event_date + timedelta(days=1)
        stages.append(
            Stage(
                event_id=event.id,
                start_time=event_date.replace(hour=14),
                end_time=event_date.replace(hour=16),
                capacity=150,
            )
        )

    db.add_all(stages)
    db.commit()

    db.add_all(stages)
    db.commit()

    # サンプルチケットタイプ作成（ステージごとに共通、イベントごとに価格変更）
    ticket_types = []

    # 秋の演劇祭り
    ticket_types.append(
        TicketType(stage_id=stages[0].id, type_name="一般", price=2000, available=100)
    )
    ticket_types.append(
        TicketType(stage_id=stages[0].id, type_name="学生", price=1500, available=50)
    )
    ticket_types.append(
        TicketType(stage_id=stages[1].id, type_name="一般", price=2000, available=100)
    )
    ticket_types.append(
        TicketType(stage_id=stages[1].id, type_name="学生", price=1500, available=50)
    )

    # 冬の演劇スペシャル
    ticket_types.append(
        TicketType(stage_id=stages[2].id, type_name="一般", price=2500, available=100)
    )
    ticket_types.append(
        TicketType(stage_id=stages[2].id, type_name="学生", price=2000, available=50)
    )
    ticket_types.append(
        TicketType(stage_id=stages[3].id, type_name="一般", price=2500, available=100)
    )
    ticket_types.append(
        TicketType(stage_id=stages[3].id, type_name="学生", price=2000, available=50)
    )

    # 新年公演
    ticket_types.append(
        TicketType(stage_id=stages[4].id, type_name="一般", price=3000, available=100)
    )
    ticket_types.append(
        TicketType(stage_id=stages[4].id, type_name="学生", price=2500, available=50)
    )
    ticket_types.append(
        TicketType(stage_id=stages[5].id, type_name="一般", price=3000, available=100)
    )
    ticket_types.append(
        TicketType(stage_id=stages[5].id, type_name="学生", price=2500, available=50)
    )

    db.add_all(ticket_types)
    db.commit()

    # サンプル予約作成（元の6個に加えて10個追加）
    reservations = [
        Reservation(
            ticket_type_id=ticket_types[0].id, user_id=users[0].id, num_attendees=2
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[1].id, user_id=users[1].id, num_attendees=1
        ),  # 斎藤
        Reservation(
            ticket_type_id=ticket_types[2].id, user_id=users[2].id, num_attendees=3
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[3].id, user_id=users[3].id, num_attendees=1
        ),  # 鈴木
        Reservation(
            ticket_type_id=ticket_types[4].id, user_id=users[0].id, num_attendees=2
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[5].id, user_id=users[1].id, num_attendees=1
        ),  # 斎藤
        # 追加の予約
        Reservation(
            ticket_type_id=ticket_types[6].id, user_id=users[2].id, num_attendees=1
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[7].id, user_id=users[3].id, num_attendees=2
        ),  # 鈴木
        Reservation(
            ticket_type_id=ticket_types[8].id, user_id=users[0].id, num_attendees=3
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[9].id, user_id=users[1].id, num_attendees=1
        ),  # 斎藤
        Reservation(
            ticket_type_id=ticket_types[10].id, user_id=users[2].id, num_attendees=2
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[11].id, user_id=users[3].id, num_attendees=1
        ),  # 鈴木
        Reservation(
            ticket_type_id=ticket_types[0].id, user_id=users[0].id, num_attendees=1
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[1].id, user_id=users[1].id, num_attendees=2
        ),  # 斎藤
        Reservation(
            ticket_type_id=ticket_types[2].id, user_id=users[2].id, num_attendees=1
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[3].id, user_id=users[3].id, num_attendees=2
        ),  # 鈴木
    ]

    db.add_all(reservations)
    db.commit()

    print("サンプルデータが正常に挿入されました。")


# 以下のようにしてサンプルデータを挿入
# db: Session = SessionLocal() のようにセッションを作ってから呼び出してください
# initialize_sample_data(db)
