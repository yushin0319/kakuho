# kakuho frontend

React アプリ（TypeScript 7 / React 19 / Vite 8 / MUI v9）。リポ全体の構成・API・デプロイはルートの [README](../../README.md) を参照。

- パッケージマネージャ: npm（`package-lock.json`）
- Lint は ESLint ではなく Biome（設定はリポルートの `biome.json`）

## コマンド

```bash
npm install
npm run dev          # Vite 開発サーバー（:5173）
npm run build        # tsc -b && vite build
npm run test:run     # vitest run（単発）。npm run test は watch モード
npm run coverage     # vitest run --coverage
npm run lint         # biome check .
```
