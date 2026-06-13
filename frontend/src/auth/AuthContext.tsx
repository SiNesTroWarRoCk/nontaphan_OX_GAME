import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type GoogleJwtPayload = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  exp?: number;
};

type AuthContextValue = {
  token: string | null;
  user: GoogleJwtPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credential: string) => void;
  logout: () => void;
  getToken: () => Promise<string>;
};

const STORAGE_KEY = 'ox_google_id_token';
const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwt(token: string): GoogleJwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded) as GoogleJwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: GoogleJwtPayload | null) {
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  const user = useMemo(() => decodeJwt(token ?? ''), [token]);
  const isAuthenticated = Boolean(token && user && !isExpired(user));

  function login(credential: string) {
    localStorage.setItem(STORAGE_KEY, credential);
    setToken(credential);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }

  async function getToken() {
    if (!token || !user || isExpired(user)) {
      logout();
      throw new Error('Login required');
    }
    return token;
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading: false, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
