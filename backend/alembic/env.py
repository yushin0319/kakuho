import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

from dotenv import load_dotenv

# モデルのMetaDataをインポート
from models import Base  # models.py内でBaseを定義している前提

# このスクリプトが使用する Alembic Config オブジェクトを取得
config = context.config

# ロギング設定
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 接続先は alembic.ini ではなく DATABASE_URL から取る。
# alembic.ini は public リポジトリに含まれるため認証情報を書けない。
# backend/.env があれば読み込む（config.py の Settings と同じ .env）。
load_dotenv()
_database_url = os.getenv("DATABASE_URL")
if not _database_url:
    raise RuntimeError(
        "DATABASE_URL が設定されていません。backend/.env に記述するか "
        "環境変数として渡してください（例: DATABASE_URL=postgresql://.../kakuho）。"
    )
config.set_main_option("sqlalchemy.url", _database_url)

# ターゲットとなるMetaData
target_metadata = Base.metadata


def run_migrations_offline():
    """オフラインモードでマイグレーションを実行"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """オンラインモードでマイグレーションを実行"""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
