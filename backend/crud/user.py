# backend/crud/user.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from crud.base import BaseCRUD
from models import User
from schemas import UserCreate, UserUpdate, UserResponse
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"], deprecated="auto"
)  # パスワードハッシュ化


class CrudUser(BaseCRUD[User, UserResponse]):
    def __init__(self, db: Session):
        super().__init__(db, User, UserResponse)

    # メールアドレスで読み取り
    def read_by_email(self, email: str) -> User:
        user = self.db.query(User).filter(User.email == email).first()
        return user

    # パスワードの検証を行う関数
    def authenticate_user(self, email: str, password: str) -> UserResponse:
        user = self.read_by_email(email)
        if user is None:
            raise HTTPException(status_code=400, detail="User not found")
        if not pwd_context.verify(password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect password")
        return UserResponse.model_validate(user)

    def create(self, data: UserCreate) -> UserResponse:
        hashed_password = pwd_context.hash(data.password)
        user_data = data.model_dump()
        user_data["password_hash"] = hashed_password
        del user_data["password"]
        user = User(**user_data, is_admin=False)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return UserResponse.model_validate(user)

    def update(self, user_id: int, data: UserUpdate) -> UserResponse:
        user = self.read_by_id(user_id)
        update_data = data.model_dump()
        if update_data.get("password") is not None:
            update_data["password_hash"] = pwd_context.hash(update_data["password"])
            del update_data["password"]
        for key, value in update_data.items():
            if value is not None:
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return UserResponse.model_validate(user)
