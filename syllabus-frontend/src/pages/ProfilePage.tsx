import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert, Chip, Paper } from '@mui/material';
import api from '../api';
import AppNavbar from '../components/AppNavbar';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ProfilePageProps {
  onLogout: () => void;
  userRole: string | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, userRole }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        setNewEmail(response.data.email);
      } catch (err) {
        setError('Не вдалося завантажити інформацію профілю.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const response = await api.patch('/auth/me', { email: newEmail });
      setUser(response.data);
      setSuccessMessage('Email успішно оновлено!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка оновлення профілю.');
    }
  };

  if (loading) {
    return (
      <>
        <AppNavbar title="Профіль користувача" onLogout={onLogout} userRole={userRole} />
        <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 10 }} />
      </>
    );
  }

  const getRoleChipColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'EXPERT':
        return 'warning';
      case 'USER':
      default:
        return 'info';
    }
  };

  return (
    <>
      <AppNavbar title="Профіль користувача" onLogout={onLogout} userRole={userRole} />
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Профіль користувача
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        {user && (
          <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 3 }}>
            <Paper elevation={3} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1">
                Ваша роль:
              </Typography>
              <Chip 
                label={user.role} 
                color={getRoleChipColor(user.role)} 
              />
            </Paper>

            <TextField
              label="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              type="email"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <Button type="submit" variant="contained" sx={{ mt: 2, width: 'auto' }}>
              Зберегти зміни
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
};

export default ProfilePage;
