# backend/sample_data.py
from sqlalchemy.orm import Session
from models import Event, Stage, SeatGroup, TicketType, Reservation, User
from passlib.context import CryptContext
from datetime import datetime
import random

# パスワードのハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def initialize_sample_data(db: Session):
    # サンプルユーザー作成
    hashed_password_user = pwd_context.hash("userpassword")

    names_with_emails = [
        {"name": "星野俊介", "email": "shadow_sunset@gmail.com"},
        {"name": "吉田祥", "email": "violet_whale@gmail.com"},
        {"name": "山﨑ともみ", "email": "apple_cherry@yahoo.com"},
        {"name": "早川誠", "email": "night_zeal@hotmail.com"},
        {"name": "三野翔平", "email": "island_wisdom@hotmail.com"},
        {"name": "ピーコックグリーン千葉", "email": "eagle_parrot@outlook.com"},
        {"name": "シニカル高堰", "email": "night_zebra@gmail.com"},
        {"name": "山田太郎", "email": "parrot_unity@gmail.com"},
        {"name": "米澤大基", "email": "banana_zebra@hotmail.com"},
        {"name": "黒坂由基", "email": "wisdom_grape@gmail.com"},
        {"name": "福田七瀬", "email": "forest_tiger@hotmail.com"},
        {"name": "岡本直人", "email": "garden_cherry@outlook.com"},
        {"name": "村松貢史", "email": "island_hero@yahoo.com"},
        {"name": "ウィズダム高田", "email": "hero_cherry@gmail.com"},
        {"name": "エクルベージュ", "email": "victory_light@outlook.com"},
        {"name": "名取康介", "email": "treasure_honey@yahoo.com"},
        {"name": "湯沢智行", "email": "yacht_wisdom@gmail.com"},
        {"name": "松岡瑠菜", "email": "forest_zeal@outlook.com"},
        {"name": "篠原康之", "email": "cherry_parrot@yahoo.com"},
        {"name": "森本楓和", "email": "wisdom_river@hotmail.com"},
        {"name": "高垣秀人", "email": "parrot_lemon@outlook.com"},
        {"name": "友近まりあ", "email": "hero_shadow@yahoo.com"},
        {"name": "本村美海", "email": "mountain_tiger@hotmail.com"},
        {"name": "若生勇介", "email": "forest_rainbow@outlook.com"},
        {"name": "森本彩也香", "email": "oasis_kite@hotmail.com"},
        {"name": "山下燿大", "email": "queen_nature@yahoo.com"},
        {"name": "中島佳一", "email": "zeal_light@yahoo.com"},
        {"name": "河田裕史", "email": "eagle_shadow@outlook.com"},
        {"name": "バスタード松村", "email": "island_yacht@hotmail.com"},
        {"name": "中江経人", "email": "rainbow_grape@outlook.com"},
        {"name": "アンドロギュノス中嶋", "email": "knight_parrot@gmail.com"},
        {"name": "スーバーノヴァ前川", "email": "sunset_garden@yahoo.com"},
        {"name": "アクセラレイト守殿", "email": "lemon_oasis@outlook.com"},
        {"name": "丸山英一", "email": "victory_zeal@gmail.com"},
        {"name": "山本博子", "email": "night_moon@yahoo.com"},
        {"name": "宮川千香子", "email": "apple_sunset@outlook.com"},
        {"name": "若林あんり", "email": "violet_banana@hotmail.com"},
        {"name": "大塚和津実", "email": "flower_zebra@hotmail.com"},
        {"name": "星乃亜美", "email": "treasure_tiger@outlook.com"},
        {"name": "遠藤寛介", "email": "grape_river@gmail.com"},
        {"name": "榎本健三郎", "email": "eagle_pearl@outlook.com"},
        {"name": "後藤果恩", "email": "pearl_ocean@outlook.com"},
        {"name": "武田恵三", "email": "xylophone_rainbow@outlook.com"},
        {"name": "小野慶行", "email": "jungle_queen@yahoo.com"},
        {"name": "ラピッドストリーム左貝", "email": "whale_eagle@outlook.com"},
        {"name": "山口エリコ", "email": "dragon_moon@yahoo.com"},
        {"name": "田中悦智子", "email": "wisdom_knight@yahoo.com"},
        {"name": "平岩幸敏", "email": "rainbow_kite@gmail.com"},
        {"name": "平野諭", "email": "jungle_light@outlook.com"},
        {"name": "星野雅", "email": "wisdom_island@hotmail.com"},
        {"name": "", "email": "mountain_apple@outlook.com"},
        {"name": "", "email": "parrot_umbrella@hotmail.com"},
        {"name": "", "email": "sunset_cherry@gmail.com"},
        {"name": "", "email": "banana_sunset@outlook.com"},
        {"name": "", "email": "violet_ocean@outlook.com"},
        {"name": "", "email": "light_victory@outlook.com"},
        {"name": "", "email": "hero_queen@outlook.com"},
        {"name": "", "email": "forest_oasis@gmail.com"},
        {"name": "", "email": "kite_parrot@yahoo.com"},
        {"name": "", "email": "parrot_zeal@gmail.com"},
    ]

    if not db.query(User).filter(User.email == "sample@example.com").first():
        sample_user = User(
            email="sample@example.com",
            nickname="能登 ながと",
            password_hash=hashed_password_user,
            is_admin=False,
        )
        db.add(sample_user)

    for data in names_with_emails:
        if not db.query(User).filter(User.email == data["email"]).first():
            user = User(
                email=data["email"],
                nickname=data["name"],
                password_hash=hashed_password_user,
                is_admin=False,
            )
            db.add(user)
    db.commit()

    # サンプルイベント作成
    event_data = [
        Event(
            name="君に触れなくてよかった",
            description=(
                "大好きな人に近づくたび、なぜか失敗続きの主人公。触れない選択をした結果、"
                "関係が少しずつ変化していく。笑いと涙が交錯する、不器用だけど心温まるストーリー。"
            ),
        ),
        Event(
            name="永遠みたいな舞台",
            description=(
                "舞台の幕が開くたび、役者たちが織りなす「永遠」に見える瞬間。"
                "ところが、舞台裏はハプニングの嵐!? ドタバタ劇場が進む中、"
                "最後にほろりと心を打つ舞台の魔法が待っている。"
            ),
        ),
        Event(
            name="明け方の道",
            description=(
                "いつもの朝が訪れるはずだった小さな街。ニュースから流れる「緊急事態宣言」の言葉に、"
                "静かな恐怖が広がる。突然の徴兵令、近づく戦争の影。夜明けの道を歩く主人公たちは、"
                "それぞれの選択を迫られる中で何を守ろうとするのか。"
            ),
        ),
    ]

    for data in event_data:
        if not db.query(Event).filter(Event.name == data["name"]).first():
            event = Event(name=data["name"], description=data["description"])
            db.add(event)

    db.commit()

    # サンプルステージ作成
    events = db.query(Event).all()
    stages = []
    for event in events:
        if event.name == "君に触れなくてよかった":
            if not db.query(Stage).filter(Stage.event_id == event.id).first():
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2024, 11, 9, 1),
                        end_time=datetime(2024, 11, 9, 3),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2024, 11, 9, 5),
                        end_time=datetime(2024, 11, 9, 7),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2024, 11, 10, 4),
                        end_time=datetime(2024, 11, 10, 6),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2024, 11, 10, 8),
                        end_time=datetime(2024, 11, 10, 10),
                    )
                )
        elif event.name == "永遠みたいな舞台":
            if not db.query(Stage).filter(Stage.event_id == event.id).first():
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2025, 2, 17, 10),
                        end_time=datetime(2025, 2, 17, 12),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2025, 2, 18, 4),
                        end_time=datetime(2025, 2, 18, 6),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2025, 2, 18, 8),
                        end_time=datetime(2025, 2, 18, 10),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2025, 2, 19, 3),
                        end_time=datetime(2025, 2, 19, 5),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2025, 2, 19, 7),
                        end_time=datetime(2025, 2, 19, 9),
                    )
                )
        elif event.name == "明け方の道":
            if not db.query(Stage).filter(Stage.event_id == event.id).first():
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2025, 4, 23, 1),
                        end_time=datetime(2025, 4, 23, 3),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2025, 4, 23, 5),
                        end_time=datetime(2025, 4, 23, 7),
                    )
                )
                stages.append(
                    Stage(
                        event_id=event.id,
                        start_time=datetime(2025, 4, 23, 9),
                        end_time=datetime(2025, 4, 23, 11),
                    )
                )

    db.add_all(stages)
    db.commit()

    # サンプルシートグループ作成
    stages = db.query(Stage).all()
    seat_groups = []
    for stage in stages:
        if not db.query(SeatGroup).filter(SeatGroup.stage_id == stage.id).first():
            if (
                stage.start_time.date() == datetime(2024, 11, 9).date()
                or stage.start_time.date() == datetime(2024, 11, 10).date()
            ):
                seat_groups.append(SeatGroup(stage_id=stage.id, capacity=120))  # 一般席
                seat_groups.append(SeatGroup(stage_id=stage.id, capacity=5))  # S席
            elif (
                stage.start_time.date() == datetime(2025, 2, 17).date()
                or stage.start_time.date() == datetime(2025, 2, 18).date()
                or stage.start_time.date() == datetime(2025, 2, 19).date()
            ):
                seat_groups.append(SeatGroup(stage_id=stage.id, capacity=100))  # 一般席
                seat_groups.append(SeatGroup(stage_id=stage.id, capacity=5))  # S席
            elif stage.start_time.date() == datetime(2025, 4, 23).date():
                seat_groups.append(SeatGroup(stage_id=stage.id, capacity=200))  # 一般席
                seat_groups.append(SeatGroup(stage_id=stage.id, capacity=10))  # S席

    db.add_all(seat_groups)
    db.commit()

    # サンプルチケットタイプ作成
    seat_groups = db.query(SeatGroup).all()
    ticket_types = []
    for seat_group in seat_groups:
        if (
            not db.query(TicketType)
            .filter(TicketType.seat_group_id == seat_group.id)
            .first()
        ):
            if seat_group.capacity == 120 or seat_group.capacity == 100:
                ticket_types.append(
                    TicketType(
                        seat_group_id=seat_group.id, type_name="一般", price=3000
                    )
                )
                ticket_types.append(
                    TicketType(
                        seat_group_id=seat_group.id, type_name="学生", price=2200
                    )
                )
            elif seat_group.capacity == 200:
                ticket_types.append(
                    TicketType(
                        seat_group_id=seat_group.id, type_name="一般", price=2800
                    )
                )
                ticket_types.append(
                    TicketType(
                        seat_group_id=seat_group.id, type_name="学生", price=2000
                    )
                )
                ticket_types.append(
                    TicketType(
                        seat_group_id=seat_group.id, type_name="当日", price=3000
                    )
                )
            elif seat_group.capacity <= 10:
                ticket_types.append(
                    TicketType(seat_group_id=seat_group.id, type_name="S席", price=4000)
                )

    db.add_all(ticket_types)
    db.commit()

    # サンプル予約作成
    # シートグループの残席を管理
    seat_group_capacity = {sg.id: sg.capacity for sg in seat_groups}

    # 予約データを作成
    reservations = []
    if not db.query(Reservation).first():
        users = db.query(User).all()
        for _ in range(100):
            try:
                # 使用可能なチケットタイプを検索
                ticket_type = None
                for tt in random.sample(
                    ticket_types, len(ticket_types)
                ):  # ランダムな順番でチケットタイプを探索
                    if seat_group_capacity[tt.seat_group_id] > 0:
                        ticket_type = tt
                        break

                # 使用可能なチケットタイプがない場合はスキップ
                if not ticket_type:
                    print("残席があるチケットタイプが見つかりませんでした。")
                    continue

                # シートグループの残席を取得
                seat_group_id = ticket_type.seat_group_id
                available_seats = seat_group_capacity[seat_group_id]

                # 残席以内で予約人数を決定
                num_attendees = random.randint(1, min(5, available_seats))
                user = random.choice(users)

                # 予約を作成
                reservations.append(
                    Reservation(
                        ticket_type_id=ticket_type.id,
                        user_id=user.id,
                        num_attendees=num_attendees,
                    )
                )

                # 残席を減らす
                seat_group_capacity[seat_group_id] -= num_attendees

                # SeatGroupモデルを更新
                seat_group = (
                    db.query(SeatGroup).filter(SeatGroup.id == seat_group_id).first()
                )
                if seat_group:
                    seat_group.capacity -= num_attendees
                    db.commit()  # データベースに保存
            except Exception as e:
                print(f"予約の作成中にエラーが発生しました: {e}")

        # データベースに予約を保存
        db.add_all(reservations)
        db.commit()

    print("サンプルデータが正常に挿入されました。")
