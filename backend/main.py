# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import engine
from models import Base
from routes.auth import auth_router
from routes.event import event_router
from routes.ticket_type import ticket_type_router
from routes.reservation import reservation_router
from routes.user import user_router

app = FastAPI()

# データベース初期化
Base.metadata.create_all(bind=engine)

# CORS設定
origins = [
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの追加
app.include_router(auth_router)
app.include_router(event_router)
app.include_router(ticket_type_router)
app.include_router(reservation_router)
app.include_router(user_router)
