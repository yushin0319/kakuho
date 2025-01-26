# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from config import (
    SessionLocal,
    INSERT_SAMPLE_DATA,
    CORS_ORIGINS,
)
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


# ライフスパン
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("アプリケーションを起動します。")
    db: Session = SessionLocal()
    try:
        if INSERT_SAMPLE_DATA.lower() == "true":
            initialize_sample_data(db)
    except Exception as e:
        print(e)
    finally:
        db.close()

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
