import Cookies from 'js-cookie';

export const getToken = () => {
  return Cookies.get('access_token');
};

export const getRefreshToken = () => {
  return Cookies.get('refresh_token');
};

export const setTokens = (accessToken, refreshToken) => {
  Cookies.set('access_token', accessToken, { expires: 1/24 }); // 1 hour
  Cookies.set('refresh_token', refreshToken, { expires: 7 }); // 7 days
};

export const clearTokens = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.user_id,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      scopes: payload.scopes || []
    };
  } catch {
    return null;
  }
};

export const hasScope = (scope) => {
  const user = getUserFromToken();
  return user?.scopes?.includes(scope) || false;
};

export const hasPermission = (permission) => {
  const user = getUserFromToken();
  return user?.permissions?.includes(permission) || false;
};

export const hasRole = (role) => {
  const user = getUserFromToken();
  return user?.roles?.includes(role) || false;
};