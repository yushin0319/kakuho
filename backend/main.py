# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from config import (
    SessionLocal,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    INSERT_SAMPLE_DATA,
    CORS_ORIGINS,
    RESET_DB,
)
from models import Event, User, TicketType, SeatGroup, Stage, Reservation
from routes.auth import auth_router
from routes.event import event_router
from routes.stage import stage_router
from routes.seat_group import seat_group_router
from routes.ticket_type import ticket_type_router
from routes.reservation import reservation_router
from routes.user import user_router
from sample_data import initialize_sample_data
from passlib.context import CryptContext
from contextlib import asynccontextmanager

# パスワードのハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# データベース初期化
def reset_db(db: Session):
    try:
        db.query(Reservation).all()
        db.query(TicketType).delete()
        db.query(SeatGroup).delete()
        db.query(Stage).delete()
        db.query(Event).delete()
        db.query(User).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        raise e


# ライフスパン
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("アプリケーションを起動します。")
    db: Session = SessionLocal()
    try:
        if RESET_DB.lower() == "true":
            reset_db(db)
            print("データベースを初期化しました。")

        # 管理者ユーザーの確認と作成
        admin_email = ADMIN_EMAIL
        admin_password = ADMIN_PASSWORD
        hashed_password_admin = pwd_context.hash(admin_password)

        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                nickname="管理者",
                password_hash=hashed_password_admin,
                is_admin=True,
            )
            db.add(admin)
            db.commit()
            print("管理者ユーザーを作成しました。")
        else:
            print("管理者ユーザーは既に存在しています。")

        # サンプルデータの挿入
        if INSERT_SAMPLE_DATA.lower() == "true" and db.query(Event).count() == 0:
            initialize_sample_data(db)
            print("サンプルデータを挿入しました。")
        else:
            print(
                "既にデータが存在しているため、サンプルデータの挿入をスキップしました。"
            )
    finally:
        db.close()
        print("セッションを閉じました。")

    yield
    print("アプリケーションを終了します。")


app = FastAPI(lifespan=lifespan)

# データベース初期化(sqliteの場合)
# Base.metadata.create_all(bind=engine)

# CORS設定

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの追加
app.include_router(auth_router)
app.include_router(event_router)
app.include_router(stage_router)
app.include_router(seat_group_router)
app.include_router(ticket_type_router)
app.include_router(reservation_router)
app.include_router(user_router)


@app.head("/health")
async def health():
    return
