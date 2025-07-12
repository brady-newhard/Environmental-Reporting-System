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
    
    // Check if we're in development mode and should auto-sign-in
    const isDevelopment = process.env.NODE_ENV === 'development';
    const shouldAutoSignIn = isDevelopment && localStorage.getItem('devAutoSignIn') === 'true';
    
    if (shouldAutoSignIn) {
      console.log('[AuthContext] Development auto-sign-in enabled');
      setIsAuthenticated(true);
      setUser({
        username: 'brady-newhard',
        email: 'brady@example.com',
        first_name: 'Brady'
      });
      setLoading(false);
      return;
    }

    // In production or when auto-sign-in is disabled, check for valid token
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log('[AuthContext] Token found, validating...');
      // Validate the token by trying to fetch user data
      validateToken(token);
    } else {
      console.log('[AuthContext] No token found');
      setLoading(false);
    }
    
    console.log('[AuthContext] Initialization complete');
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await api.get('/users/me/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      console.log('[AuthContext] Token validated, user data:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('[AuthContext] Token validation failed:', error);
      // Token is invalid, remove it and require re-authentication
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

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
    // Also remove dev auto-sign-in setting
    localStorage.removeItem('devAutoSignIn');
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

  // Development helper function to enable/disable auto-sign-in
  const toggleDevAutoSignIn = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment) {
      console.warn('Auto-sign-in is only available in development mode');
      return;
    }

    const currentSetting = localStorage.getItem('devAutoSignIn') === 'true';
    const newSetting = !currentSetting;
    localStorage.setItem('devAutoSignIn', newSetting.toString());
    
    if (newSetting) {
      console.log('[AuthContext] Development auto-sign-in enabled');
      setIsAuthenticated(true);
      setUser({
        username: 'brady-newhard',
        email: 'brady@example.com',
        first_name: 'Brady'
      });
    } else {
      console.log('[AuthContext] Development auto-sign-in disabled');
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      loading,
      toggleDevAutoSignIn 
    }}>
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

 