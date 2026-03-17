import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { mockUsers, mockGuru } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  guruId: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((username: string, _password: string): boolean => {
    const found = mockUsers.find(u => u.username === username);
    if (found) {
      setUser(found);
      localStorage.setItem('currentUser', JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  // Map user to guru ID
  const guruId = user?.role === 'guru'
    ? mockGuru.find(g => g.email === user.email)?.id || null
    : null;

  return (
    <AuthContext.Provider value={{ user, guruId, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
