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
      // For now, set a basic user object since /users/me/ endpoint doesn't exist
      setUser({
        username: 'User',
        email: 'user@example.com'
      });
      setLoading(false);
    } else {
      console.log('[AuthContext] No token found');
      setLoading(false);
    }
    
    console.log('[AuthContext] Initialization complete');
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await api.get('/users/me/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

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
    
    // Try to call logout API if token exists, but don't fail if it doesn't work
    if (token) {
      try {
        await api.post('/logout/', {}, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
      } catch (error) {
        // Log the error but don't throw - logout still works locally
        console.log('Logout API call failed (this is normal if endpoint doesn\'t exist):', error.message);
      }
    }
    // Don't use window.location.href - let the Navigation component handle navigation
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

 