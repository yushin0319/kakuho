# tests/helpers.py
"""テスト共通ヘルパー関数"""
from models import User
from security import hash_password


def create_user(
    db, email="auth@example.com", password="password123", is_admin=False, nickname="テストユーザー"
):
    """テスト用ユーザーを作成（共通ヘルパー）"""
    user = User(
        email=email,
        password_hash=hash_password(password),
        nickname=nickname,
        is_admin=is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
