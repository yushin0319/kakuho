# kakuho backend

FastAPI アプリ（Python 3.11–3.14、uv 管理）。構成・API・デプロイはルートの [README](../README.md) を参照。

## コマンド

```bash
uv sync --group dev
uv run uvicorn main:app --reload    # :8000。DATABASE_URL と SECRET_KEY が必須（.env か環境変数）
uv run pytest tests/ -v             # SQLite in-memory で実行（必要な環境変数は tests/conftest.py が既定値を入れる）
```

マイグレーションは Alembic（`alembic.ini` / `alembic/`）。接続先は `alembic.ini` の `sqlalchemy.url`（本番の Render PostgreSQL）で、`DATABASE_URL` は読まない（`alembic/env.py`）。`alembic upgrade` などを手元で打つと本番に効くので注意。
