import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[AuthContext] useEffect: token in localStorage:', token);
    if (token) {
      api.post('/users/verify-token/', { token })
        .then((response) => {
          console.log('[AuthContext] Token verified, user:', response.data);
          setIsAuthenticated(true);
          setUser({
            username: response.data.user,
            first_name: response.data.first_name
          });
        })
        .catch((error) => {
          console.error('[AuthContext] Token verification failed:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
          console.log('[AuthContext] Loading set to false (verify-token finally)');
        });
    } else {
      setLoading(false);
      console.log('[AuthContext] Loading set to false (no token)');
    }
  }, []);

  const login = async (token, username, first_name) => {
    console.log('[AuthContext] Login called with token:', token);
    localStorage.setItem('token', token);
    console.log('[AuthContext] Token stored in localStorage:', localStorage.getItem('token'));
    setUser({ username, first_name });
    setIsAuthenticated(true);
    setLoading(false);
    console.log('[AuthContext] Login: setIsAuthenticated(true), setLoading(false)');
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

 