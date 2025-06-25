'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, logoutUser } from '../../actions/login-actions';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: AuthUser) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          fullName: response.user.fullName,
          role: response.user.role
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return { user: null, isLoading: true, isAuthenticated: false };
  }

  if (!isAuthenticated) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/user-auth/login';
    }
    return { user: null, isLoading: false, isAuthenticated: false };
  }

  return { user, isLoading: false, isAuthenticated: true };
} 