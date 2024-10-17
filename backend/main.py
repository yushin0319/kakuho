# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from config import engine, SessionLocal
from models import Base, Event  # Eventを使ってデータがあるか確認
from routes.auth import auth_router
from routes.event import event_router
from routes.ticket_type import ticket_type_router
from routes.reservation import reservation_router
from routes.user import user_router
from sample_data import initialize_sample_data

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


# サンプルデータの挿入
def insert_sample_data():
    db: Session = SessionLocal()
    try:
        # Eventテーブルにデータがあるか確認。1つもなければサンプルデータを挿入
        if db.query(Event).count() == 0:
            initialize_sample_data(db)
            print("サンプルデータを挿入しました。")
        else:
            print("既にデータが存在しています。サンプルデータの挿入はスキップします。")
    finally:
        db.close()


# アプリケーション起動時にサンプルデータを挿入
@app.on_event("startup")
def startup_event():
    insert_sample_data()
