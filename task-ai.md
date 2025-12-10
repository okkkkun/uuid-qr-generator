# UUID QRコード生成アプリ 実装計画

## 概要
UUIDを自動生成または手動入力し、そのQRコードをGoogleドライブにPDFとして保存するWebアプリケーションを実装します。

## 実装内容

### 1. 必要なパッケージのインストール

以下のパッケージを追加します：
- `uuid`: UUID生成用
- `qrcode`: QRコード生成用
- `pdfkit`: PDF生成用（または `jspdf`）
- `googleapis`: GoogleドライブAPI用
- `@nuxtjs/google-oauth` または手動実装でOAuth認証

### 2. ディレクトリ構造

```
server/
  api/
    auth/
      google.ts          # Google認証エンドポイント
      callback.ts        # OAuthコールバック処理
    drive/
      upload.ts          # GoogleドライブへのPDFアップロード
  middleware/
    auth.ts              # 認証チェックミドルウェア
app/
  app.vue                # メインUI（1ページ）
```

### 3. 機能実装詳細

#### 3.1 Google認証機能（server/api/auth/google.ts）
- 初回画面描画時にGoogle OAuth認証を開始
- 認証URLを生成してクライアントに返す
- 認証成功後、アクセストークンとリフレッシュトークンを取得
- トークンをCookieに保存（適切な期限設定）

#### 3.2 OAuthコールバック処理（server/api/auth/callback.ts）
- Googleからの認証コードを受け取る
- トークンを交換してCookieに保存
- クライアントをリダイレクト

#### 3.3 認証ミドルウェア（server/middleware/auth.ts）
- リクエストごとにCookieからトークンを取得
- トークンの有効性をチェック
- 期限切れの場合はリフレッシュトークンで更新

#### 3.4 Googleドライブアップロード（server/api/drive/upload.ts）
- UUIDの配列を受け取る
- 各UUIDのQRコードを生成
- QRコードをPDFに変換
- GoogleドライブAPIを使用して特定のフォルダにアップロード

#### 3.5 フロントエンドUI（app/app.vue）
- UUID生成モード選択（自動/手動）
- UUID入力フィールド（最大10件）
- 自動生成ボタン
- QRコードプレビュー（オプション）
- Googleドライブに保存ボタン
- 認証状態の表示

### 4. 環境変数設定

`.env` ファイルに以下を設定：
- `GOOGLE_CLIENT_ID`: Google OAuth クライアントID
- `GOOGLE_CLIENT_SECRET`: Google OAuth クライアントシークレット
- `GOOGLE_REDIRECT_URI`: OAuthリダイレクトURI
- `GOOGLE_DRIVE_FOLDER_ID`: アップロード先のフォルダID

### 5. 実装手順

1. 必要なパッケージをインストール
2. `.env` ファイルのテンプレートを作成
3. Google認証APIエンドポイントを実装
4. OAuthコールバック処理を実装
5. 認証ミドルウェアを実装
6. GoogleドライブアップロードAPIを実装
7. フロントエンドUIを実装
8. Nuxt設定を更新（必要に応じて）

### 6. 技術的な考慮事項

- Cookieのセキュア設定（httpOnly, secure, sameSite）
- トークンのリフレッシュ処理
- エラーハンドリング
- ローディング状態の管理
- QRコードのサイズと品質設定
- PDFのレイアウト（1つのUUIDにつき1ページ）

## 承認待ち

この計画で実装を進めてよろしいでしょうか？承認いただけましたら実装を開始します。

