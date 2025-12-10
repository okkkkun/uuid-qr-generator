import { google } from 'googleapis';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

async function getAuthenticatedClient(event: any) {
  const config = useRuntimeConfig();
  const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = config.googleRedirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  let accessToken = getCookie(event, 'google_access_token');
  const refreshToken = getCookie(event, 'google_refresh_token');

  if (!accessToken && !refreshToken) {
    throw createError({
      statusCode: 401,
      message: '認証が必要です'
    });
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  // トークンの有効性をチェック（必要に応じてリフレッシュ）
  try {
    await oauth2Client.getAccessToken();
  } catch (error) {
    // リフレッシュトークンで更新を試みる
    if (refreshToken) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        accessToken = credentials.access_token!;
        
        // 新しいトークンをCookieに保存
        const expiresAt = credentials.expiry_date 
          ? new Date(credentials.expiry_date) 
          : new Date(Date.now() + 3600 * 1000);

        setCookie(event, 'google_access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: expiresAt,
          maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000)
        });

        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken
        });
      } catch (refreshError) {
        throw createError({
          statusCode: 401,
          message: 'トークンのリフレッシュに失敗しました。再認証が必要です。'
        });
      }
    } else {
      throw createError({
        statusCode: 401,
        message: '認証が必要です'
      });
    }
  }

  return oauth2Client;
}

async function generateQRCodePDF(uuids: string[]): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      for (let i = 0; i < uuids.length; i++) {
        const uuid = uuids[i];
        
        // QRコードを生成
        const qrCodeDataUrl = await QRCode.toDataURL(uuid, {
          width: 300,
          margin: 1
        });

        // Data URLから画像データを抽出
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // PDFに画像を追加
        if (i > 0) {
          doc.addPage();
        }

        // 中央に配置
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const imageSize = 300;
        const x = (pageWidth - imageSize) / 2;
        const y = (pageHeight - imageSize) / 2 - 50;

        doc.image(imageBuffer, x, y, { width: imageSize, height: imageSize });

        // UUIDテキストを追加
        doc.fontSize(12);
        doc.text(uuid, pageWidth / 2, y + imageSize + 20, {
          align: 'center'
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method not allowed'
    });
  }

  const body = await readBody(event);
  const { uuids } = body;

  if (!Array.isArray(uuids) || uuids.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'UUIDの配列が必要です'
    });
  }

  if (uuids.length > 10) {
    throw createError({
      statusCode: 400,
      message: 'UUIDは最大10件までです'
    });
  }

  // UUIDの形式を検証
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  for (const uuid of uuids) {
    if (typeof uuid !== 'string' || !uuidRegex.test(uuid)) {
      throw createError({
        statusCode: 400,
        message: `無効なUUID形式です: ${uuid}`
      });
    }
  }

  try {
    // 認証されたクライアントを取得
    const authClient = await getAuthenticatedClient(event);
    const drive = google.drive({ version: 'v3', auth: authClient });

    // PDFを生成
    const pdfBuffer = await generateQRCodePDF(uuids);

    // Googleドライブにアップロード
    const config = useRuntimeConfig();
    const folderId = config.googleDriveFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    const fileMetadata = {
      name: `uuid-qr-codes-${Date.now()}.pdf`,
      parents: folderId ? [folderId] : undefined
    };

    const media = {
      mimeType: 'application/pdf',
      body: pdfBuffer
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink'
    });

    return {
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `アップロードエラー: ${error.message}`
    });
  }
});

