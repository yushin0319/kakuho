# kakuho

イベント・ステージ・座席・チケット・予約を管理する Web アプリ。FastAPI + React の monorepo。GitHub description: 「席、確保しときました」。

## スタック

- Backend: Python 3.11–3.14 / FastAPI / SQLAlchemy 2.x（ドライバは psycopg 3 = `psycopg[binary]`）/ Alembic / pydantic-settings / **PyJWT** / **argon2-cffi + bcrypt** / slowapi / gunicorn (prod) + uvicorn (dev)
- Frontend: TypeScript 7 / React 19 / Vite 8 / MUI v9 (@mui/x-date-pickers) / **react-router v8** / React Hook Form / axios / date-fns + date-fns-tz / Biome v2 / vitest v5
- 機能ライブラリ: **react-zxing + qrcode.react**（QR スキャン・生成）。カレンダー UI は MUI + date-fns の自前実装（`src/components/Calendar.tsx`）
- DB: PostgreSQL 16（本番） / SQLite in-memory（テスト）
- 認証: JWT（HttpOnly Cookie・SameSite=Strict、PyJWT 直叩き）。パスワードは argon2id でハッシュし、既存の bcrypt ハッシュは検証のみ対応
- デプロイ: Render（BE: Web Service / FE: Static Site）

## 構成

```
backend/
  main.py            FastAPI エントリ（CORS・レート制限・ルーター登録・起動時のサンプルデータ投入）
  config.py          設定（pydantic-settings、`.env` を読む）と DB エンジン
  security.py        パスワードハッシュ（argon2id / bcrypt 検証）
  models.py          SQLAlchemy: Event / Stage / SeatGroup / TicketType / Reservation / User
  schemas.py         Pydantic
  routes/            auth / event / stage / seat_group / ticket_type / reservation / user
  crud/              リソース別 CRUD（base + リソースごと）
  sample_data.py     INSERT_SAMPLE_DATA=true のとき管理者・サンプルデータを投入
  alembic/           マイグレーション（versions/ に 2 本）
  tests/             pytest + httpx 統合テスト
frontend/app/
  src/components/    UI コンポーネント（カレンダー・QR 読み取り・予約操作など）
  src/pages/         ページ（Booking / ReservationList / CheckInList / ManageEvent / ManageUser / Login / Register / DemoLogin など）
  src/context/       AppData / AuthContext / NewItemContext / SnackContext
  src/routes/        AppRouter / PrivateRoute
  src/services/      API クライアント（`api/` にリソース別）と型定義
```

## API（主要）

- 認証: `POST /token`（ログイン、JWT を HttpOnly Cookie に発行）/ `POST /logout` / `GET /users/me`
- ユーザー: `POST /signup`（登録）/ `GET /users`（管理者）/ `GET・PUT・DELETE /users/{user_id}`
- `/events`・`/stages`・`/seat_groups`・`/ticket_types` — 一覧・詳細の GET は認証不要、作成・更新・削除は管理者のみ。作成は親リソース配下（`POST /events/{event_id}/stages`、`POST /stages/{stage_id}/seat_groups`、`POST /seat_groups/{seat_group_id}/ticket_types`）。`GET /events/{event_id}/duration` もある
- 予約: `GET /reservations`（管理者）/ `GET・PUT・DELETE /reservations/{reservation_id}` / `GET /users/{user_id}/reservations` / `GET・POST /ticket_types/{ticket_type_id}/reservations`
- `HEAD /health` — 死活確認
- レート制限: 全エンドポイントに既定 60 req/min/IP（slowapi、`TESTING=true` で無効化）

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

環境変数（`.env.example` は無い）:

- backend（`backend/.env` または環境変数）: `DATABASE_URL` と `SECRET_KEY` が必須。任意で `ALGORITHM`（既定 HS256）/ `ACCESS_TOKEN_EXPIRE_MINUTES`（既定 30）/ `CORS_ORIGINS`（カンマ区切り、既定 `http://localhost:5173`）/ `INSERT_SAMPLE_DATA` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `RESET_DB` / `COOKIE_SECURE`（本番は true で Cookie に Secure を付ける）/ `TESTING`
- frontend: `VITE_APP_API_URL`（未設定なら `http://127.0.0.1:8000/`）

## デプロイ

- Render が GitHub push を検知して自動デプロイ
- CI: `.github/workflows/ci.yml`（frontend の `tsc --noEmit` + vitest + build）+ `test.yml`（backend の pytest + frontend の vitest）
- PR レビュー: `.github/workflows/gemini-review.yml`（shared-workflows）
- Dependabot patch/minor は `dependabot-automerge.yml` で auto-merge

## 運用ルール

- Backend テストは SQLite in-memory、Frontend は vitest + @testing-library/react
- main 直 commit 禁止、PR 経由でマージ
