from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from pydantic import BaseModel

from crud.user import CrudUser
from config import get_db
from schemas import UserResponse

# JWT設定
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Pydanticモデル
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: str | None = None


# アクセストークンを作成する関数
def create_access_token(
    data: dict, expires_delta: timedelta | None = timedelta(minutes=10)
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# APIルーターの設定
auth_router = APIRouter()


# トークン発行エンドポイント
@auth_router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> dict:
    crud_user = CrudUser(db)
    user = crud_user.authenticate_user(form_data.username, form_data.password)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},  # ユーザーIDを使う
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


# 現在のユーザーを取得する関数
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    crud_user = CrudUser(db)
    user = crud_user.read_by_id(token_data.user_id)  # user_idで検索
    if user is None:
        raise credentials_exception
    return UserResponse.model_validate(user)


# 現在のユーザー情報を取得するエンドポイント
@auth_router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


# 管理者チェックを行う関数
def check_admin(
    current_user: UserResponse = Depends(get_current_user),
) -> None:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")
