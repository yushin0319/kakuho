from sqlalchemy.orm import Session
from models import Event, Stage, SeatGroup, TicketType, Reservation, User
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
            name="夜を駆ける謎の影",
            description="夜の帳に現れた、誰も知らない秘密の影。その正体とは…。",
        ),
        Event(
            name="紅蓮の月に舞う詩",
            description="紅く染まる月の下で舞う一篇の詩、それは愛か、それとも復讐か。",
        ),
        Event(
            name="虚空に響く鎮魂歌",
            description="虚空に響き渡る鎮魂の調べ。隠された真実が、今明らかに。",
        ),
    ]

    db.add_all(events)
    db.commit()

    # サンプルステージ作成
    stages = []
    base_date = datetime(2024, 11, 1)
    for i, event in enumerate(events):
        event_date = base_date + timedelta(days=30 * i)
        stages.append(
            Stage(
                event_id=event.id,
                start_time=event_date.replace(hour=10),
                end_time=event_date.replace(hour=12),
            )
        )
        event_date = event_date + timedelta(days=1)
        stages.append(
            Stage(
                event_id=event.id,
                start_time=event_date.replace(hour=14),
                end_time=event_date.replace(hour=16),
            )
        )

    db.add_all(stages)
    db.commit()

    # サンプルシートグループ作成
    seat_groups = []
    for stage in stages:
        # 一般・学生共通のシートグループ
        seat_groups.append(SeatGroup(stage_id=stage.id, capacity=150))
        # 特別なS席のシートグループ
        seat_groups.append(SeatGroup(stage_id=stage.id, capacity=50))

    db.add_all(seat_groups)
    db.commit()

    # サンプルチケットタイプ作成
    ticket_types = []
    for i in range(0, len(seat_groups), 2):
        # 一般・学生のチケットタイプ（同じシートグループ）
        ticket_types.append(
            TicketType(seat_group_id=seat_groups[i].id, type_name="一般", price=3000)
        )
        ticket_types.append(
            TicketType(seat_group_id=seat_groups[i].id, type_name="学生", price=2500)
        )
        # S席のチケットタイプ（別のシートグループ）
        ticket_types.append(
            TicketType(seat_group_id=seat_groups[i + 1].id, type_name="S席", price=5000)
        )

    db.add_all(ticket_types)
    db.commit()

    # サンプル予約作成
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
        # 追加の予約データ
        Reservation(
            ticket_type_id=ticket_types[4].id, user_id=users[0].id, num_attendees=2
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[5].id, user_id=users[1].id, num_attendees=1
        ),  # 斎藤
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
        # さらに追加の20個
        Reservation(
            ticket_type_id=ticket_types[4].id, user_id=users[0].id, num_attendees=1
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[5].id, user_id=users[1].id, num_attendees=3
        ),  # 斎藤
        Reservation(
            ticket_type_id=ticket_types[6].id, user_id=users[2].id, num_attendees=2
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[7].id, user_id=users[3].id, num_attendees=4
        ),  # 鈴木
        Reservation(
            ticket_type_id=ticket_types[8].id, user_id=users[0].id, num_attendees=2
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[9].id, user_id=users[1].id, num_attendees=1
        ),  # 斎藤
        Reservation(
            ticket_type_id=ticket_types[10].id, user_id=users[2].id, num_attendees=3
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[11].id, user_id=users[3].id, num_attendees=2
        ),  # 鈴木
        Reservation(
            ticket_type_id=ticket_types[0].id, user_id=users[0].id, num_attendees=4
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[1].id, user_id=users[1].id, num_attendees=2
        ),  # 斎藤
        Reservation(
            ticket_type_id=ticket_types[2].id, user_id=users[2].id, num_attendees=2
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[3].id, user_id=users[3].id, num_attendees=3
        ),  # 鈴木
        Reservation(
            ticket_type_id=ticket_types[4].id, user_id=users[0].id, num_attendees=1
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[5].id, user_id=users[1].id, num_attendees=3
        ),  # 斎藤
        Reservation(
            ticket_type_id=ticket_types[6].id, user_id=users[2].id, num_attendees=4
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[7].id, user_id=users[3].id, num_attendees=2
        ),  # 鈴木
        Reservation(
            ticket_type_id=ticket_types[8].id, user_id=users[0].id, num_attendees=2
        ),  # 田中
        Reservation(
            ticket_type_id=ticket_types[9].id, user_id=users[1].id, num_attendees=4
        ),  # 斎藤
        Reservation(
            ticket_type_id=ticket_types[10].id, user_id=users[2].id, num_attendees=1
        ),  # 山田
        Reservation(
            ticket_type_id=ticket_types[11].id, user_id=users[3].id, num_attendees=3
        ),  # 鈴木
    ]

    db.add_all(reservations)
    db.commit()

    print("サンプルデータが正常に挿入されました。")


# db: Session = SessionLocal() のようにセッションを作ってから呼び出してください
# initialize_sample_data(db)
