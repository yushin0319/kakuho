# backend/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from config import engine, get_db
from models import Base
import schemas
import crud

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


# ルーティング
@app.post("/events")
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    return crud.Event(db).create(event)


@app.get("/events/{event_id}")
def read_event(event_id: int, db: Session = Depends(get_db)):
    return crud.Event(db).read(event_id)


@app.get("/events")
def read_events(db: Session = Depends(get_db)):
    return crud.Event(db).read_all()


@app.put("/events/{event_id}")
def update_event(
    event_id: int, event: schemas.EventUpdate, db: Session = Depends(get_db)
):
    return crud.Event(db).update(event_id, event)


@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    return crud.Event(db).delete(event_id)
