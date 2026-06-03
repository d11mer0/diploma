import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SyllabusDetailPage from './pages/SyllabusDetailPage';
import AdminPage from './pages/AdminPage';
import { CssBaseline, ThemeProvider, CircularProgress, Box } from '@mui/material';
import theme from './theme';
import api from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setIsAuthenticated(true);
          setUserRole(response.data.role);
        } catch (error) {
          handleLogoutApp();
        }
      }
      setAuthLoading(false);
    };

    checkAuth();

    const handleAuthError = () => {
      handleLogoutApp();
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  const handleLoginSuccess = async () => {
    try {
      const response = await api.get('/auth/me');
      setIsAuthenticated(true);
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Не вдалося отримати дані користувача після входу", error);
    }
  };

  const handleLogoutApp = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <DashboardPage onLogout={handleLogoutApp} userRole={userRole} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? <ProfilePage onLogout={handleLogoutApp} userRole={userRole} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/syllabus/:id" 
            element={
              isAuthenticated ? <SyllabusDetailPage onLogout={handleLogoutApp} userRole={userRole} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated && userRole === 'ADMIN' ? <AdminPage onLogout={handleLogoutApp} userRole={userRole} /> : <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
