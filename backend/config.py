# backend/config.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")

# エンジン作成
engine = create_engine(DATABASE_URL)

# セッションファクトリを定義
SessionLocal = sessionmaker(bind=engine)


# 新しいセッションを取得する関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
