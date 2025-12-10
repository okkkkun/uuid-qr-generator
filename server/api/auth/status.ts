export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'google_access_token');
  const refreshToken = getCookie(event, 'google_refresh_token');

  return {
    isAuthenticated: !!(accessToken || refreshToken)
  };
});

