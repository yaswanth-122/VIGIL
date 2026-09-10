import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vigil_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const fetchCurrentUser = async () => {
    const storedToken = localStorage.getItem('vigil_auth_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getUserProfile();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user profile:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (usernameOrEmail, password) => {
    const res = await api.login({ usernameOrEmail, password });
    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('vigil_auth_token', res.token);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vigil_auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
