# UUID QRコード生成アプリ

UUIDを自動生成または手動入力し、そのQRコードをGoogleドライブにPDFとして保存するWebアプリケーションです。

## 機能

- UUIDの自動生成または手動入力（最大10件）
- QRコードのプレビュー表示
- GoogleドライブへのPDFアップロード
- Google OAuth認証（初回のみ、以降はCookieでトークン管理）

## セットアップ

### 1. 依存関係のインストール

```bash
yarn install
```

### 2. Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Drive APIを有効化
3. OAuth 2.0認証情報を作成
4. 承認済みのリダイレクトURIに以下を追加：
   - `http://localhost:3000/api/auth/callback` (開発環境)
   - 本番環境のURL (本番環境の場合)

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下を設定してください：

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id_here
```

**GoogleドライブフォルダIDの取得方法：**
1. Googleドライブでフォルダを開く
2. URLから `folders/` の後の文字列がフォルダIDです
   - 例: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j` → フォルダIDは `1a2b3c4d5e6f7g8h9i0j`

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
