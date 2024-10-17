# backend/routes/user.py
from typing import List
from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from schemas import UserResponse, UserUpdate, UserCreate
from crud.user import CrudUser
from routes.auth import check_admin, check_user

user_router = APIRouter()


# User関連のエンドポイント
# User登録
@user_router.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    # メールアドレスが重複していないかチェック
    if CrudUser(db).read_by_email(user.email) is not None:
        raise HTTPException(status_code=400, detail="Email already registered")
    created_user = CrudUser(db).create(user)
    return UserResponse.model_validate(created_user)


# User取得（管理者・ユーザー共通）
@user_router.get("/users/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(check_user),
) -> UserResponse:
    if current_user.is_admin or user_id == current_user.id:
        user = CrudUser(db).read_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse.model_validate(user)
    else:
        raise HTTPException(status_code=403, detail="Permission denied")


# User一覧取得（管理者のみ）
@user_router.get("/users", response_model=List[UserResponse])
def read_users(
    db: Session = Depends(get_db), is_admin: bool = Depends(check_admin)
) -> List[UserResponse]:
    users = CrudUser(db).read_all()
    return [UserResponse.model_validate(user) for user in users]


# User更新（管理者・ユーザー共通）
# 管理者は全てのユーザーを更新できる
# ユーザーは自分の情報のみ更新できる
@user_router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(check_user),
) -> UserResponse:
    if current_user.is_admin or user_id == current_user.id:
        updated_user = CrudUser(db).update(user_id, user)
        return UserResponse.model_validate(updated_user)
    else:
        raise HTTPException(status_code=403, detail="Permission denied")


# User削除（管理者・ユーザー共通）
# 管理者は全てのユーザーを削除できる
# ユーザーは自分の情報のみ削除できる
@user_router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(check_user),
) -> dict:
    if current_user.is_admin or user_id == current_user.id:
        if current_user.is_admin and user_id == current_user.id:
            raise HTTPException(status_code=403, detail="Cannot delete yourself")
        CrudUser(db).delete(user_id)
        return {"message": "User deleted"}
    else:
        raise HTTPException(status_code=403, detail="Permission denied")
