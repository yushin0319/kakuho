# backend/config.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
INSERT_SAMPLE_DATA = os.getenv("INSERT_SAMPLE_DATA")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
CORS_ORIGINS = os.getenv("CORS_ORIGINS").split(",")

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
