import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '@/types';
import api from '@/lib/axios';
import { isUnauthorizedError } from '@/lib/api-errors';

interface AuthContextType {
  user: User | null;
  guruId: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearMustChangePassword: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/me');
          setUser(response.data.user);
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        } catch (error) {
          if (!isUnauthorizedError(error)) {
            console.error("Session expired or invalid token", error);
          }
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/login', { username, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        console.error('Logout failed:', error);
      }
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
  }, []);

  const clearMustChangePassword = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, mustChangePassword: false };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Map user to guru ID
  const guruId = user?.role === 'guru' ? (user as any).guruId || null : null;

  return (
    <AuthContext.Provider value={{ user, guruId, login, logout, clearMustChangePassword, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
