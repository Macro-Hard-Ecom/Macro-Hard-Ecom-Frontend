import { createContext, useContext, useState, type ReactNode } from 'react';
import { userService, type AuthUser } from './api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore user from localStorage on mount
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    console.log('Attempting login with:', { email, password });
    const res = await userService.login(email, password);
    console.log('Login response:', res.data);
    const { id, token: newToken, name, email: userEmail, role } = res.data;
    const authUser: AuthUser = { id, email: userEmail, name, role };
    setUser(authUser);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(authUser));
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await userService.register(name, email, password);
    const { id, token: newToken, name: userName, email: userEmail, role: userRole } = res.data;
    const authUser: AuthUser = { id, email: userEmail, name: userName, role: userRole };
    setUser(authUser);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(authUser)); 
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
