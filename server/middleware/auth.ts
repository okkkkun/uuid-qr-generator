import { google } from 'googleapis';

export default defineEventHandler(async (event) => {
  // 認証エンドポイントはスキップ
  if (event.path?.startsWith('/api/auth/')) {
    return;
  }

  // ドライブアップロードAPIの場合のみ認証チェック
  if (event.path?.startsWith('/api/drive/')) {
    const accessToken = getCookie(event, 'google_access_token');
    const refreshToken = getCookie(event, 'google_refresh_token');

    if (!accessToken && !refreshToken) {
      throw createError({
        statusCode: 401,
        message: '認証が必要です'
      });
    }

    // トークンの有効性チェックとリフレッシュは各APIエンドポイントで行う
    // ここでは認証の存在のみをチェック
  }
});

