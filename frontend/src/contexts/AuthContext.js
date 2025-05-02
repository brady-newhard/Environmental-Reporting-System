import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      api.post('/verify-token/')
        .then((response) => {
          setIsAuthenticated(true);
          setUser({
            username: response.data.user,
            first_name: response.data.first_name
          });
        })
        .catch(() => {
          // If token is invalid, clear it
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  const login = async (token, username, first_name) => {
    localStorage.setItem('token', token);
    setUser({ username, first_name });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    
    // Clear local state first
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);

    // Then try to logout from backend
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

    // Force a hard navigation to ensure clean state
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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

 