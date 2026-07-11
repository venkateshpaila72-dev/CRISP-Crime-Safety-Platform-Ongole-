import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { login as loginRequest } from "../api/authApi";
import { TOKEN_STORAGE_KEY } from "../api/client";

const AuthContext = createContext(null);

// The backend JWT payload is just { sub: email, exp: ... } (see
// app/auth/dependencies.py). Decoding it client-side is just for display —
// the backend is what actually verifies/trusts the token.
function decodeEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.sub || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [adminEmail, setAdminEmail] = useState(() => {
    const existing = localStorage.getItem(TOKEN_STORAGE_KEY);
    return existing ? decodeEmailFromToken(existing) : null;
  });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Nothing async actually needs to happen — the token (if any) is
    // already read synchronously above — but this flag lets ProtectedRoute
    // avoid a flash-redirect-to-login before we've checked localStorage.
    setInitializing(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setAdminEmail(null);
    };

    window.addEventListener("ongole-admin-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("ongole-admin-unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    setToken(data.access_token);
    setAdminEmail(decodeEmailFromToken(data.access_token));
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setAdminEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      adminEmail,
      isAuthenticated: Boolean(token),
      initializing,
      login,
      logout,
    }),
    [token, adminEmail, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}