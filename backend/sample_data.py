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
        "一ノ瀬遥",
        "月島灯",
        "白鳥蒼",
        "葉山楓",
        "橘蓮",
        "秋山結衣",
        "夏目颯",
        "冬木詩音",
        "深山光",
        "早川凜",
        "神代翼",
        "風間律",
        "黒川優",
        "桐生樹",
        "天城真央",
        "柳瀬翠",
        "新海陽",
        "高槻悠",
        "雪村響",
        "西園寺悠真",
        "高天カオル",
        "白石リコ",
        "星野ノア",
        "音羽すず",
        "天城レン",
        "小鳥遊そら",
        "水城エリカ",
        "東雲ミナ",
        "若葉シオン",
        "草薙ケイ",
        "紫藤レイ",
        "雪村カエデ",
        "南条ヒロ",
        "椿まどか",
        "もりもりたろう",
        "ShadowMaster",
        "ねこのしっぽ",
        "ひつじのなみ",
        "月夜の花",
        "流れ星の彼方",
        "キリトリミドリ",
        "しろい風船",
        "リュウの心",
        "夕焼け雲",
        "空飛ぶペンギン",
        "シークレットウルフ",
        "",
        "",
        "",
        "",
    ]

    # メールのプレフィックス部分（ユニークにする）
    email_prefixes = [f"user{i:03d}" for i in range(100)]

    # ドメインリスト
    domains = ["example.com", "test.com", "mail.com"]

    # ユーザー生成
    users = [
        User(
            email=f"{email_prefixes[i % len(email_prefixes)]}@{random.choice(domains)}",
            nickname=names[i % len(names)],
            password_hash=hashed_password_user,
            is_admin=False,
        )
        for i in range(100)
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
            name="日曜日に洗濯を",
            description="コインランドリーでの出会いと別れ。機械の音が響く中、見知らぬ人々が織りなす本当にささやかな話。",
        ),
        Event(
            name="明日、透明人間になる",
            description=(
                "透明になっていく自分を受け入れた青年が、かつての恋人に「何か」を伝える旅に出る。限られた時間の中で、彼が最後に選ぶ言葉とは何か。"
            ),
        ),
        Event(
            name="バイバイ、階段の踊り場で",
            description="階段の踊り場で交わされた一方的な別れの言葉。その理由を理解できずにいたが、自分自身の中に眠る本当の感情に気付いていく。",
        ),
    ]

    db.add_all(events)
    db.commit()

    # サンプルステージ作成
    stages = []
    base_date = datetime(2024, 12, 10)
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
        seat_groups.append(SeatGroup(stage_id=stage.id, capacity=10))

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
    reservations = []
    reservation_count = 50  # 目標予約数

    for _ in range(reservation_count):
        ticket_type = random.choice(ticket_types)
        user = random.choice(users)
        num_attendees = random.randint(1, 5)
        reservations.append(
            Reservation(
                ticket_type_id=ticket_type.id,
                user_id=user.id,
                num_attendees=num_attendees,
            )
        )

    db.add_all(reservations)
    db.commit()

    print("サンプルデータが正常に挿入されました。")
