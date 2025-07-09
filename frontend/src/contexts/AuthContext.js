import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    console.log('[AuthContext] Initializing authentication...');
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log('[AuthContext] Token found, setting authenticated state');
      setIsAuthenticated(true);
      setUser({
        username: 'dev_user',
        first_name: 'Dev'
      });
    } else {
      console.log('[AuthContext] No token found');
    }
    
    setLoading(false);
    console.log('[AuthContext] Initialization complete');
  }, []);

  const login = async (token, username, first_name) => {
    console.log('[AuthContext] Login called with token:', token);
    localStorage.setItem('token', token);
    setUser({ username, first_name });
    setIsAuthenticated(true);
    setLoading(false);
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    if (token) {
      try {
        await api.post('/logout/', {}, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
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

 