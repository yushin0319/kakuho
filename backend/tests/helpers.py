# tests/helpers.py
"""テスト共通ヘルパー関数"""
from passlib.context import CryptContext
from models import User

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(
    db, email="auth@example.com", password="password123", is_admin=False, nickname="テストユーザー"
):
    """テスト用ユーザーを作成（共通ヘルパー）"""
    user = User(
        email=email,
        password_hash=_pwd_context.hash(password),
        nickname=nickname,
        is_admin=is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
