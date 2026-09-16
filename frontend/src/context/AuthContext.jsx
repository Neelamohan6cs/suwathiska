import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, registerCustomer as registerApi } from "../api/authApi";
import { registerUnauthorizedHandler } from "../api/axios";

const AuthContext = createContext(null);

const TOKEN_KEY = "dairyfeed_token";
const USER_KEY = "dairyfeed_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setInitializing(false);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    });
  }, []);

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await registerApi(payload);
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  };

  const updateStoredUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      initializing,
      role: user?.role || null,
      login,
      register,
      logout,
      updateStoredUser,
    }),
    [user, token, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
