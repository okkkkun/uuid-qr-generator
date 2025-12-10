import { google } from "googleapis";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    throw createError({
      statusCode: 400,
      message: "認証コードがありません",
    });
  }

  const config = useRuntimeConfig();
  const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret =
    config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    config.googleRedirectUri ||
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/callback";

  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 500,
      message: "Google OAuth設定が不足しています",
    });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  try {
    // 認証コードをトークンに交換
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw createError({
        statusCode: 500,
        message: "トークンの取得に失敗しました",
      });
    }

    // Cookieにトークンを保存
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // デフォルトで1時間

    // Cookie設定を準備
    const cookieSecure =
      config.cookieSecure !== undefined
        ? config.cookieSecure
        : process.env.COOKIE_SECURE === "true" ||
          process.env.NODE_ENV === "production";

    const cookieOptions: any = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: "lax",
      domain: "my-home.com",
    };

    setCookie(event, "google_access_token", tokens.access_token, {
      ...cookieOptions,
      expires: expiresAt,
      maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    });

    setCookie(event, "google_refresh_token", tokens.refresh_token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日間
      maxAge: 30 * 24 * 60 * 60,
    });

    // クライアントをリダイレクト（認証成功パラメータ付き）
    return sendRedirect(event, "/?auth=success");
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `認証エラー: ${error.message}`,
    });
  }
});
