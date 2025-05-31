import 'antd/dist/reset.css';
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { syncDrafts } from './utils/draftUtils';

// ... rest of imports ...

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Sync drafts on app load
      syncDrafts('environmental');
      // Sync drafts when coming back online
      const handleOnline = () => syncDrafts('environmental');
      window.addEventListener('online', handleOnline);
      return () => {
        window.removeEventListener('online', handleOnline);
      };
    }
  }, [loading, isAuthenticated]);

  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/success-signup" element={<SuccessSignUp />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />
      {/* ... rest of routes ... */}
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Navigation />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 