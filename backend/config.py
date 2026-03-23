# backend/config.py
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    INSERT_SAMPLE_DATA: bool = False
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin"
    CORS_ORIGINS: str = "http://localhost:5173"
    RESET_DB: bool = False

    model_config = {"env_file": ".env"}


settings = Settings()

# 既存コードとの互換性エイリアス
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
INSERT_SAMPLE_DATA = settings.INSERT_SAMPLE_DATA
ADMIN_EMAIL = settings.ADMIN_EMAIL
ADMIN_PASSWORD = settings.ADMIN_PASSWORD
CORS_ORIGINS = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
RESET_DB = settings.RESET_DB

# エンジン作成
engine = create_engine(settings.DATABASE_URL)

# セッションファクトリを定義
SessionLocal = sessionmaker(bind=engine)


# 新しいセッションを取得する関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
