# backend/crud/base.py
from typing import TypeVar, Generic, Any
from sqlalchemy.orm import Session
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel

ModelType = TypeVar("ModelType", bound=declarative_base)
ResponseSchemaType = TypeVar("ResponseSchemaType", bound=BaseModel)


class BaseCRUD(Generic[ModelType, ResponseSchemaType]):
    def __init__(self, db: Session, model: ModelType, schema: ResponseSchemaType):
        self.db = db
        self.model = model
        self.schema = schema

    # idによる読み取り
    def read_by_id(self, id: int) -> ModelType:
        obj = self.db.query(self.model).filter(self.model.id == id).first()
        return obj

    # 全てのデータを読み取り
    def read_all(self) -> list[ResponseSchemaType]:
        return [
            self.schema.model_validate(obj) for obj in self.db.query(self.model).all()
        ]

    # データの削除
    def delete(self, id: int) -> None:
        obj = self.db.query(self.model).filter(self.model.id == id).first()
        if obj is None:
            raise ValueError(f"Object with id {id} not found")
        self.db.delete(obj)
        self.db.commit()
        return None

    # データの作成（汎用）
    def create(self, data: Any, **extra_fields) -> ResponseSchemaType:
        obj = self.model(**data.model_dump(), **extra_fields)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return self.schema.model_validate(obj)

    # データの更新（汎用: Noneは上書きしない）
    def update(self, id: int, data: Any) -> ResponseSchemaType:
        obj = self.read_by_id(id)
        for key, value in data.model_dump().items():
            if value is not None:
                setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return self.schema.model_validate(obj)
