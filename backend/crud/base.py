from typing import TypeVar, Generic
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
from fastapi import HTTPException
from pydantic import BaseModel

ModelType = TypeVar("ModelType", bound=declarative_base)
ResponseSchemaType = TypeVar("ResponseSchemaType", bound=BaseModel)


class BaseCRUD(Generic[ModelType, ResponseSchemaType]):
    def __init__(self, db: Session, model: ModelType, schema: ResponseSchemaType):
        self.db = db
        self.model = model
        self.schema = schema

    # idによる読み取り
    def read_by_id(self, id: int) -> ResponseSchemaType:
        obj = self.db.query(self.model).filter(self.model.id == id).first()
        if obj is None:
            raise HTTPException(status_code=404, detail="Item not found")
        return self.schema.from_attributes(obj)

    # 全てのデータを読み取り
    def read_all(self) -> list[ResponseSchemaType]:
        return [
            self.schema.from_attributes(obj) for obj in self.db.query(self.model).all()
        ]

    # データの削除
    def delete(self, id: int) -> dict:
        obj = self.db.query(self.model).filter(self.model.id == id).first()
        if obj is None:
            raise HTTPException(status_code=404, detail="Item not found")
        self.db.delete(obj)
        self.db.commit()
        return {"message": "Item deleted successfully"}
