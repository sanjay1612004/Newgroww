import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Decode JWT payload (without verification — that's server-side)
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('groww_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('groww_token'));

  const loginUser = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('groww_user', JSON.stringify(userData));
    localStorage.setItem('groww_token', jwtToken);
  };

  // Call this after backend login which returns { accessToken, refreshToken }
  const loginWithTokens = (accessToken, refreshToken, extraUserData = {}) => {
    const decoded = decodeJwt(accessToken);
    const userData = {
      id: decoded?.id,
      role: decoded?.role,
      ...extraUserData,
    };
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('groww_user', JSON.stringify(userData));
    localStorage.setItem('groww_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('groww_refresh_token', refreshToken);
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('groww_user');
    localStorage.removeItem('groww_token');
    localStorage.removeItem('groww_refresh_token');
  };

  const isLoggedIn = !!token;
  const isAdmin = user?.email === 'admin@gmail.com';

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, isAdmin, loginUser, loginWithTokens, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
