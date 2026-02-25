# kakuho - イベント予約管理システム

## 概要

イベントの予約管理を行う Web アプリケーション。管理者がイベント・ステージ・座席・チケットを管理し、ユーザーが予約を行う。

## 技術スタック

- **Backend**: Python 3.11+ / FastAPI / SQLAlchemy 2.x / Alembic
- **Frontend**: TypeScript / React 18 / Vite 5 / MUI v6
- **DB**: PostgreSQL 16（本番）/ SQLite in-memory（テスト）
- **認証**: JWT（Cookie ベース）
- **デプロイ**: Render（BE: Web Service, FE: Static Site）

## ディレクトリ構成

```
kakuho/
├── backend/
│   ├── main.py          # FastAPI エントリポイント
│   ├── models.py        # SQLAlchemy モデル
│   ├── schemas.py       # Pydantic スキーマ
│   ├── config.py        # pydantic-settings
│   ├── crud/            # CRUD 操作（リソース別）
│   ├── routes/          # API エンドポイント
│   ├── alembic/         # DB マイグレーション
│   └── tests/           # pytest テスト
└── frontend/app/
    ├── src/
    │   ├── components/  # UI コンポーネント
    │   ├── pages/       # ページ
    │   ├── context/     # AuthContext, SnackContext
    │   ├── services/    # API クライアント
    │   └── test/        # テストセットアップ
    └── package.json
```

## コマンド

```bash
# Backend
cd backend
poetry install
poetry run python -m pytest tests/ -v          # テスト実行
poetry run uvicorn main:app --reload           # 開発サーバー

# Frontend
cd frontend/app
npm install
npm run dev                                     # 開発サーバー
npx vitest run                                  # テスト実行
```

## データモデル

```
Event (1) → (N) Stage (1) → (N) SeatGroup (1) → (N) TicketType (1) → (N) Reservation (N) → (1) User
```

## テスト方針

- Backend: pytest + httpx（統合テスト、SQLite in-memory）
- Frontend: Vitest + @testing-library/react
- 環境変数 `TESTING=true` でレート制限を自動無効化
- テストファイルは 300 行以下を目安に分割

## CI/CD

- `test.yml`: backend(pytest) + frontend(vitest)
- `gemini-review.yml`: PR 自動レビュー
- push 時 Render 自動デプロイ
