import React from 'react';
import Auth from '../components/Auth';
import { Box, Typography } from '@mui/material';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        // ВИДАЛЕНО: bgcolor: '#f0f2f5', // Тепер фон буде братися з теми
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Ласкаво просимо!
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Будь ласка, увійдіть або зареєструйтеся.
      </Typography>
      <Auth onLoginSuccess={onLoginSuccess} />
    </Box>
  );
};

export default LoginPage;
