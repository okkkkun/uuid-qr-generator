# UUID QR コード生成アプリ

UUID を自動生成または手動入力し、その QR コードを Google ドライブに PDF として保存する Web アプリケーションです。

## 機能

- UUID の自動生成または手動入力（最大 10 件）
- QR コードのプレビュー表示
- Google ドライブへの PDF アップロード
- Google OAuth 認証（初回のみ、以降は Cookie でトークン管理）

## セットアップ

### 1. 依存関係のインストール

```bash
yarn install
```

### 2. Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Drive API を有効化
3. OAuth 2.0 認証情報を作成
4. 承認済みのリダイレクト URI に以下を追加：
   - `http://localhost:3000/api/auth/callback` (開発環境)
   - 本番環境の URL (本番環境の場合)

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下を設定してください：

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id_here

# Cookie設定（カスタムドメインを使用する場合）
COOKIE_DOMAIN=my-home.com
COOKIE_SECURE=true  # HTTPSを使用する場合はtrue、HTTPの場合はfalse
```

**Cookie 設定について：**

- `COOKIE_DOMAIN`: Cookie を設定するドメインを指定します（例: `my-home.com`）
  - 先頭にドット（`.`）を付けると、サブドメイン全体で Cookie が有効になります（例: `.my-home.com`）
  - 開発環境（localhost）では設定不要です
- `COOKIE_SECURE`: HTTPS を使用する場合は`true`、HTTP の場合は`false`を設定します
  - `true`の場合、HTTPS 接続でのみ Cookie が送信されます

**Google ドライブフォルダ ID の取得方法：**

1. Google ドライブでフォルダを開く
2. URL から `folders/` の後の文字列がフォルダ ID です
   - 例: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j` → フォルダ ID は `1a2b3c4d5e6f7g8h9i0j`

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
