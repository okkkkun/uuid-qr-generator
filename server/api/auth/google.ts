import { google } from 'googleapis';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = config.googleRedirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 500,
      message: 'Google OAuth設定が不足しています'
    });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  // 認証URLを生成
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent' // リフレッシュトークンを確実に取得するため
  });

  return {
    authUrl
  };
});

