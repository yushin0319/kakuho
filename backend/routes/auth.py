# backend/routes/auth.py
from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import PyJWTError as JWTError
from pydantic import BaseModel

from crud.user import CrudUser
from config import get_db, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from schemas import UserResponse


class TokenData(BaseModel):
    user_id: str | None = None


# アクセストークンを作成する関数
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# APIルーターの設定
auth_router = APIRouter()


# トークン発行エンドポイント（HttpOnly Cookie にセット）
@auth_router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> JSONResponse:
    crud_user = CrudUser(db)
    try:
        user = crud_user.authenticate_user(form_data.username, form_data.password)
    except HTTPException:
        # M-KK-06: ユーザー列挙防止 — 失敗理由を統一
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )
    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="strict",
        secure=False,  # 開発環境。本番では True
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return response


# 現在のユーザーを取得する関数（Cookie からトークンを読む）
def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> UserResponse:
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = access_token.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    crud_user = CrudUser(db)
    # TODO: JWTのサーバー側無効化（ブラックリスト/Redis等）は未実装。
    # 現在はトークン有効期限（ACCESS_TOKEN_EXPIRE_MINUTES）のみで管理。
    # セキュリティ要件が高まった場合に実装を検討する。
    try:
        user_id_int = int(token_data.user_id)
    except (ValueError, TypeError):
        raise credentials_exception
    user = crud_user.read_by_id(user_id_int)
    if user is None:
        raise credentials_exception
    return UserResponse.model_validate(user)


# 現在のユーザー情報を取得するエンドポイント
@auth_router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


# ログアウトエンドポイント（Cookie を削除）
@auth_router.post("/logout")
def logout() -> JSONResponse:
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    return response


# 管理者チェックを行う関数
def check_admin(
    current_user: UserResponse = Depends(get_current_user),
) -> None:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")
