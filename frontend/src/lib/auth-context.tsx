/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bariwala_token');
    if (saved) {
      setLoading(true);
      authApi.profile(saved)
        .then((u) => {
          setToken(saved);
          setUser(u);
        })
        .catch(() => { localStorage.removeItem('bariwala_token'); })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('bariwala_token', res.accessToken);
  }, []);

  const register = useCallback(async (data: Record<string, unknown>) => {
    const res = await authApi.register(data);
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('bariwala_token', res.accessToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bariwala_token');
  }, []);

  // Memoize context value — only changes when user/token/loading actually change
  const value = useMemo<AuthContextType>(
    () => ({ user, token, login, register, logout, loading }),
    [user, token, login, register, logout, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
