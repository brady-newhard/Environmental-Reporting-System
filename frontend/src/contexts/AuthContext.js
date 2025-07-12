import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);
  const tokenValidationInterval = useRef(null);

  // Periodic token validation to prevent expiration issues
  const startTokenValidation = () => {
    // Clear any existing interval
    if (tokenValidationInterval.current) {
      clearInterval(tokenValidationInterval.current);
    }
    
    // Validate token every 5 minutes
    tokenValidationInterval.current = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isAuthenticated) {
        console.log('[AuthContext] Periodic token validation...');
        validateTokenSilently(token);
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  const stopTokenValidation = () => {
    if (tokenValidationInterval.current) {
      clearInterval(tokenValidationInterval.current);
      tokenValidationInterval.current = null;
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      stopTokenValidation();
    };
  }, []);

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
      startTokenValidation();
      return;
    }

    // Check for valid token and user data
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      console.log('[AuthContext] Token and user data found, restoring session...');
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        startTokenValidation();
        
        // Validate token in background without blocking the UI
        validateTokenSilently(token);
      } catch (error) {
        console.error('[AuthContext] Error parsing saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else if (token) {
      console.log('[AuthContext] Token found, validating...');
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
      // Save user data for persistence
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('[AuthContext] Token validation failed:', error);
      
      // Only logout if it's a clear authentication error, not a network issue
      if (error.response && error.response.status === 401) {
        console.log('[AuthContext] Token is invalid, logging out user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        console.log('[AuthContext] Token validation failed due to network issue, keeping user logged in');
        // For network errors, keep the user logged in but don't set authenticated state
        // This allows the app to continue working if the network comes back
      }
    } finally {
      setLoading(false);
    }
  };

  const validateTokenSilently = async (token) => {
    try {
      const response = await api.get('/users/me/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      console.log('[AuthContext] Silent token validation successful');
      // Update user data if it changed
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('[AuthContext] Silent token validation failed:', error);
      
      // Only logout if it's a clear authentication error, not a network issue
      if (error.response && error.response.status === 401) {
        console.log('[AuthContext] Token is invalid, logging out user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        console.log('[AuthContext] Token validation failed due to network issue, keeping user logged in');
        // Don't logout for network errors - keep the user logged in
      }
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
    const userData = { username, first_name };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setLoading(false);
    startTokenValidation();
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Also remove dev auto-sign-in setting
    localStorage.removeItem('devAutoSignIn');
    setIsAuthenticated(false);
    setUser(null);
    stopTokenValidation();
    
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
      startTokenValidation();
    } else {
      console.log('[AuthContext] Development auto-sign-in disabled');
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      stopTokenValidation();
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

 