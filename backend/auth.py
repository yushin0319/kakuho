from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from pydantic import BaseModel

from crud.user import CrudUser
from config import get_db
from schema import UserResponse

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
    username: str | None = None


# アクセストークンを作成する関数
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = (
        datetime.now(timezone.utc) + expires_delta
        if expires_delta
        else datetime.now(timezone.utc) + timedelta(minutes=15)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# APIルーターの設定
router = APIRouter()


# トークン発行エンドポイント
@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    crud_user = CrudUser(db)
    user = crud_user.authenticate_user(form_data.username, form_data.password)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# 現在のユーザーを取得する依存関係
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(username=email)
    except JWTError:
        raise credentials_exception
    crud_user = CrudUser(db)
    user = crud_user.read_by_email(token_data.username)
    if user is None:
        raise credentials_exception
    return user


# 現在のユーザー情報を取得するエンドポイント
@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
