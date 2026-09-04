import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthState {
  accessToken: string | null;
  role: string | null;
  userId: number | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  saveTokens: (payload: {
    accessToken: string;
    refreshToken: string;
    role: string;
    userId: number;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    role: null,
    userId: null,
    isLoading: true,
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    const userId = localStorage.getItem('user_id');
    setState({
      accessToken,
      role,
      userId: userId ? parseInt(userId, 10) : null,
      isLoading: false,
    });
  }, []);

  const saveTokens = (payload: {
    accessToken: string;
    refreshToken: string;
    role: string;
    userId: number;
  }) => {
    localStorage.setItem('access_token', payload.accessToken);
    localStorage.setItem('refresh_token', payload.refreshToken);
    localStorage.setItem('user_role', payload.role);
    localStorage.setItem('user_id', String(payload.userId));
    setState({
      accessToken: payload.accessToken,
      role: payload.role,
      userId: payload.userId,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    setState({ accessToken: null, role: null, userId: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, saveTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
