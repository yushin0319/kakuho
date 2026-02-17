# Kakuho - Reservation System

> **本アプリはポートフォリオ用デモアプリケーションです。**
> 管理者機能も体験できるよう、DemoLogin からワンクリックで管理者アカウントにログインできます。

Kakuho は、イベントの予約・管理を行うシステムです。イベント主催者が簡単に予約を管理し、QR コードを用いた受付を行うことができます。また、一般ユーザーも直感的に利用できる設計になっており、シンプルな UI でスムーズに予約が可能です。

## 🚀 機能

- **予約一覧（チェックイン）**
  - 予約一覧の表示（未来のイベント・過去のイベント）
  - 予約の変更・キャンセル
  - QR コードを用いた受付
  - QR コードを用いない手動受付
- **ユーザー管理**
  - 管理者によるユーザー管理
  - （メール送信機能がない為、単に一覧機能となっています）
- **イベント管理**
  - イベントの作成・編集・削除
  - 残席の調整
  - ステージ時間の設定
  - チケット種別の管理
  - イベントの複製
- **一般ユーザー向け機能**
  - カレンダー型 UI を用いたイベント予約
  - チケット型の UI で現在・過去の予約を表示
- **未実装（将来的に検討）**
  - ユーザー一覧からのメール一斉送信
  - 予約受付時の QR 決済
  - 上記 2 点は無料では実現が難しそうだったため、ポートフォリオでは未実装

## 🛠️ 技術スタック

### **バックエンド**

- FastAPI (Python)
- PostgreSQL (データベース)
- Alembic (マイグレーション管理)

### **フロントエンド**

- React (Vite)
- TypeScript
- MUI (Material-UI)
- ZXing (QR コード読み取り)

## 🏗️ セットアップ

### **1. 環境変数の設定**

#### **バックエンドの `.env` 設定**

```env
DATABASE_URL=データベースのURL
SECRET_KEY=シークレットキー
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
INSERT_SAMPLE_DATA=true
ADMIN_EMAIL=管理者用Eメール
ADMIN_PASSWORD=管理者用パスワード
CORS_ORIGINS=クロスオリジン許可用のURL（ローカル・監視ツール・本番環境など）
RESET_DB=true # データベースをリセットする場合はtrueにする
```

#### **フロントエンドの `.env` 設定**

```env
VITE_APP_API_URL=ローカル・本番環境のバックエンドURL
```

### **2. バックエンドのセットアップ**

```sh
cd backend
poetry install  # 依存関係のインストール
alembic upgrade head  # データベースのマイグレーション適用
uvicorn main:app --reload  # 開発サーバー起動
```

### **3. マイグレーション（スキーマ変更時）**

```sh
cd backend
# 新しいマイグレーションを作成（モデル変更後に実行）
alembic revision --autogenerate -m "変更内容の説明"
# マイグレーションを適用
alembic upgrade head
```

- 既存マイグレーション（`0f4670d615b9_fix_migration.py`）は初期スキーマ作成用
- モデルを変更した場合は必ず新しいマイグレーションを作成すること

### **3. フロントエンドのセットアップ**

```sh
cd frontend/app
npm install  # 依存関係のインストール
npm run dev  # 開発サーバー起動
```

## 🚢 デプロイ (Render を使用)

1. **バックエンド**

   - Render で PostgreSQL のデータベースを作成
   - `DATABASE_URL` を `.env` に設定
   - FastAPI アプリを Render にデプロイ
   - build command に pip install poetry && poetry install --only=main --no-root を指定
   - start command に poetry run alembic upgrade head && poetry run gunicorn -w 1 -k uvicorn.workers.UvicornWorker --timeout 120 main:app を指定

2. **フロントエンド**
   - Render の static site で作成
   - root directory に frontend/app 　を指定
   - build command に npm install && npm run build 　を指定

## 📂 ディレクトリ構成

```
kakuho/
├── backend/
│   ├── main.py          # FastAPI メインエントリ
│   ├── models.py        # データベースモデル
│   ├── crud/            # CRUD 操作
│   ├── routes/          # API ルーティング
│   ├── schemas.py       # Pydantic スキーマ
│   ├── config.py        # 設定ファイル
│   ├── alembic/         # DBマイグレーション
│   ├── sample_data.py   # 初期データ投入
│   └── .env             # 環境変数
├── frontend/
│   ├── app/
│   │   ├── src/
│   │   │   ├── components/  # UI コンポーネント
│   │   │   ├── context/     # グローバルステート
│   │   │   ├── pages/       # 画面コンポーネント
│   │   │   ├── routes/      # ルーティング
│   │   │   └── services/    # API 呼び出し
│   │   ├── public/          # 静的ファイル
│   │   ├── package.json     # 依存関係
│   │   ├── tsconfig.json    # TypeScript 設定
│   │   ├── vite.config.ts   # Vite 設定
│   │   └── .env             # 環境変数
```

## 📝 ライセンス

MIT License
