# backend/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
import logging
import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger(__name__)

# パスワードのハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# レート制限設定（デフォルト: 60リクエスト/分 / テスト時は無効）
_rate_limit_enabled = os.getenv("TESTING", "false").lower() != "true"
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60/minute"],
    enabled=_rate_limit_enabled,
)


# ライフスパン
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("アプリケーションを起動します。")
    db: Session = SessionLocal()
    try:
        if INSERT_SAMPLE_DATA:
            initialize_sample_data(db)
    except Exception as e:
        logger.error(f"起動時エラー: {e}")
    finally:
        db.close()

    yield
    logger.info("アプリケーションを終了します。")


app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    lambda request, exc: JSONResponse(
        status_code=429,
        content={"detail": "リクエストが多すぎます。しばらく待ってから再試行してください。"},
    ),
)

# データベース初期化(sqliteの場合)
# Base.metadata.create_all(bind=engine)

# CORS設定
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
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
