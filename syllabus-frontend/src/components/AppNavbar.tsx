import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface AppNavbarProps {
  title: string;
  onLogout: () => void;
  userRole?: string | null; // Робимо роль опціональною
}

const AppNavbar: React.FC<AppNavbarProps> = ({ title, onLogout, userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToAdmin = () => {
    navigate('/admin');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }} 
          onClick={handleGoToDashboard}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {userRole === 'ADMIN' && (
            <Button color="inherit" onClick={handleGoToAdmin}>Адмін</Button>
          )}
          <Button color="inherit" onClick={handleGoToProfile}>Профіль</Button>
          <Button color="inherit" onClick={handleLogout}>Вийти</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppNavbar;
