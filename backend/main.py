# backend/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

# デモ用のイベントデータ
events = [
    {"id": 1, "name": "演劇A", "date": "2024-10-01"},
    {"id": 2, "name": "演劇B", "date": "2024-11-15"},
]

# デモ用の予約データ
reservations = [
    {"id": 1, "event_id": 1, "name": "山田太郎", "count": 2},
    {"id": 2, "event_id": 2, "name": "佐藤花子", "count": 1},
]


# 予約のリクエスト用モデル
class Reservation(BaseModel):
    event_id: int
    name: str
    count: int


# イベントの一覧取得
@app.get("/events/")
def get_events():
    return events


# 新規予約の作成
@app.post("/reservations/")
def create_reservation(reservation: Reservation):
    new_id = len(reservations) + 1
    new_reservation = {
        "id": new_id,
        "event_id": reservation.event_id,
        "name": reservation.name,
        "count": reservation.count,
    }
    reservations.append(new_reservation)
    return {"status": "success", "reservation": new_reservation}


# イベントに対する予約の一覧取得
@app.get("/reservations/{event_id}")
def get_reservations(event_id: int):
    event_reservations = [r for r in reservations if r["event_id"] == event_id]
    return event_reservations
