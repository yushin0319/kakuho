# kakuho backend

FastAPI アプリ（Python 3.11–3.14、uv 管理）。構成・API・デプロイはルートの [README](../README.md) を参照。

## コマンド

```bash
uv sync --group dev
uv run uvicorn main:app --reload    # :8000
uv run pytest tests/ -v             # SQLite in-memory で実行
```

マイグレーションは Alembic（`alembic.ini` / `alembic/`）。
