# kakuho

イベント・ステージ・座席・チケット・予約を管理する Web アプリ。FastAPI + React の monorepo。GitHub description: 「席、確保しときました」。

## スタック

- Backend: Python 3.11+ / FastAPI / SQLAlchemy 2.x / Alembic / Pydantic / passlib / slowapi
- Frontend: TypeScript / React 19 / Vite 8 / MUI v9 / React Hook Form / vitest
- DB: PostgreSQL 16（本番） / SQLite in-memory（テスト）
- 認証: JWT（HttpOnly Cookie）
- デプロイ: Render（BE: Web Service / FE: Static Site）

## 構成

```
backend/
  main.py            FastAPI エントリ
  models.py          SQLAlchemy: Event / Stage / SeatGroup / TicketType / Reservation / User
  schemas.py         Pydantic
  routes/            auth / event / stage / seat_group / ticket_type / reservation / user
  crud/              リソース別 CRUD
  alembic/           マイグレーション
  tests/             pytest + httpx 統合テスト
frontend/app/
  src/components/    UI コンポーネント
  src/pages/         ページレイアウト
  src/context/       AuthContext / SnackContext
  src/services/      API クライアント
```

## API（主要）

- `POST /token` — ログイン（JWT を Cookie に発行）
- `POST /register` — ユーザー登録
- `/events`, `/stages`, `/seat_groups`, `/ticket_types` — 管理者向け CRUD
- `/reservations` — 予約作成・取得・削除
- レート制限 60 req/min（テスト時は `TESTING=true` で無効化）

## 開発

```bash
# Backend (uv)
cd backend
uv sync --group dev
uv run uvicorn main:app --reload    # :8000
uv run pytest tests/ -v

# Frontend (npm)
cd frontend/app
npm install
npm run dev                          # :5173
npm run test:run
npm run build
```

## デプロイ

- Render が GitHub push を検知して自動デプロイ
- CI: `.github/workflows/test.yml`（pytest + vitest）
- PR レビュー: `.github/workflows/gemini-review.yml`（shared-workflows）

## 運用ルール

- Backend テストは SQLite in-memory、Frontend は vitest + @testing-library/react
- main 直 commit 禁止、PR 経由でマージ
