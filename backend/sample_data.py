from sqlalchemy.orm import Session
from models import Event, Stage, SeatGroup, TicketType, Reservation, User
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

# パスワードのハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def initialize_sample_data(db: Session):
    # サンプルユーザー作成
    hashed_password_user = pwd_context.hash("userpassword")
    hashed_password_admin = pwd_context.hash("adminpassword")

    names = [
        "田中浩",
        "斎藤優子",
        "山田太郎",
        "鈴木恵子",
        "吉田太郎",
        "佐藤健",
        "高橋和美",
        "伊藤真一",
        "渡辺沙織",
        "中村花子",
        "藤田剛",
        "小林美紀",
        "加藤光",
        "村上俊介",
        "長谷川由美",
        "柴田陽子",
        "石田真理",
        "原田悟",
        "松田春香",
        "林翔太",
        "かなこ",
        "CoolGuy太夫",
        "じゅんこ",
        "John",
        "Sally",
        "青い鳥",
        "ピンクの花",
        "空見者",
        "たける",
        "りんりん",
        "ドリーマー",
        "なつこ",
        "桜子",
        "まい",
        "かおり",
        "なかのしまありさ",
        "はると",
        "さとし",
        "けんた",
        "山猫",
        "ひかり",
        "ひろし",
        "りっしんべん",
        "大将",
        "刀",
        "着物",
        "静香",
        "",
        "",
        "",
    ]

    # メールのプレフィックス部分（ユニークにする）
    email_prefixes = [f"user{i:02d}" for i in range(50)]

    # ドメインリスト
    domains = ["example.com", "test.com", "mail.com"]

    # ユーザー生成
    users = [
        User(
            email=f"{email_prefixes[i]}@{random.choice(domains)}",
            nickname=names[i],
            password_hash=hashed_password_user,
            is_admin=False,
        )
        for i in range(50)
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
            name="さよならの約束",
            description="別れの夜、二人の間に交わされた約束。時を超えて再び巡り合う奇跡の物語。",
        ),
        Event(
            name="深海",
            description="暗い海の底で待ち受ける謎と恐怖。真実を知るために深淵へと降りる勇気が試される。",
        ),
        Event(
            name="君は消えゆく光と追憶の終わらない旅路へ",
            description="時が止まった世界で、少女はかすかな光を追いかける。光の先に待つのは希望か絶望か。",
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
            ticket_type_id=random.choice(ticket_types).id,
            user_id=random.choice(users).id,
            num_attendees=random.randint(1, 5),
        )
        for _ in range(0)
    ]

    db.add_all(reservations)
    db.commit()

    print("サンプルデータが正常に挿入されました。")


# db: Session = SessionLocal() のようにセッションを作ってから呼び出してください
# initialize_sample_data(db)
