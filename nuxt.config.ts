const { NODE_ENV } = process.env;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    cookieSecure: process.env.COOKIE_SECURE === "true",
    public: {
      // 公開可能な設定があればここに追加
    },
  },
  vite: {
    server: {
      allowedHosts: ["local.my-home.com"],
    },
  },
});
