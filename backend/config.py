from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./test.db"

# エンジン作成
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# セッションファクトリを定義
SessionLocal = sessionmaker(bind=engine)


# 新しいセッションを取得する関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
