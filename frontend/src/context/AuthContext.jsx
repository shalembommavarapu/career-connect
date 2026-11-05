import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on reload
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cc_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('cc_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('cc_token', res.token);
      localStorage.setItem('cc_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('cc_token', res.token);
      localStorage.setItem('cc_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
  };

  const updateUserState = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('cc_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    role: user?.role,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
