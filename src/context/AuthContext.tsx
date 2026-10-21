import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchDemoUser: (role: UserRole, emailOverride?: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  energy_analyst: { email: 'analyst@demo.local', pass: 'demo123' },
  data_manager: { email: 'datamanager@demo.local', pass: 'demo123' },
  planner_admin: { email: 'planneradmin@demo.local', pass: 'demo123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ue_token') || ''}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.warn('Session check could not reach backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Sign in failed' }));
      throw new Error(err.error || 'Invalid credentials');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('ue_token', data.token);
    }
    setUser(data.user);
    return data.user;
  };

  const switchDemoUser = async (role: UserRole, emailOverride?: string): Promise<User> => {
    const emailToUse = emailOverride || DEMO_CREDENTIALS[role].email;
    return await login(emailToUse, 'demo123');
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('ue_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
