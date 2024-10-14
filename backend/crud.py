from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import schemas


class Event:

    def __init__(self, db: Session):
        self.db = db

    # Create（作成）
    def create(self, data: schemas.EventCreate):
        new_event = models.Event(**data.model_dump())
        self.db.add(new_event)
        self.db.commit()
        self.db.refresh(new_event)
        return new_event

    # Read（読み取り）
    def read(self, id: int):
        event = self.db.query(models.Event).filter(models.Event.id == id).first()
        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")
        return event

    def read_all(self):
        return self.db.query(models.Event).all()

    # Update（更新）
    def update(self, id: int, data: schemas.EventUpdate):
        event = self.db.query(models.Event).filter(models.Event.id == id).first()
        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")
        for key, value in data.model_dump().items():
            setattr(event, key, value)
        self.db.commit()
        self.db.refresh(event)
        return event

    # Delete（削除）
    def delete(self, id: int):
        event = self.db.query(models.Event).filter(models.Event.id == id).first()
        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")
        self.db.delete(event)
        self.db.commit()
        return event
