import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  userId: 'user_id',
  role: 'role',
  isVerified: 'is_verified',
} as const;

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  role: string | null;
  isVerified: boolean;
  isLoading: boolean;
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  userId: number;
  role: string;
  isVerified: boolean;
}

interface AuthContextValue extends AuthState {
  saveTokens: (data: TokenPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    userId: null,
    role: null,
    isVerified: false,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [token, refresh, userId, role, verified] = await Promise.all([
          AsyncStorage.getItem(KEYS.accessToken),
          AsyncStorage.getItem(KEYS.refreshToken),
          AsyncStorage.getItem(KEYS.userId),
          AsyncStorage.getItem(KEYS.role),
          AsyncStorage.getItem(KEYS.isVerified),
        ]);
        setState({
          accessToken: token,
          refreshToken: refresh,
          userId: userId ? parseInt(userId, 10) : null,
          role,
          isVerified: verified === 'true',
          isLoading: false,
        });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const saveTokens = async (data: TokenPayload) => {
    await Promise.all([
      AsyncStorage.setItem(KEYS.accessToken, data.accessToken),
      AsyncStorage.setItem(KEYS.refreshToken, data.refreshToken),
      AsyncStorage.setItem(KEYS.userId, String(data.userId)),
      AsyncStorage.setItem(KEYS.role, data.role),
      AsyncStorage.setItem(KEYS.isVerified, String(data.isVerified)),
    ]);
    setState({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.userId,
      role: data.role,
      isVerified: data.isVerified,
      isLoading: false,
    });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
    setState({
      accessToken: null,
      refreshToken: null,
      userId: null,
      role: null,
      isVerified: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, saveTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
