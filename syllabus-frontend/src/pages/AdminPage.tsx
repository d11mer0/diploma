import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Alert, Paper, Grid, Card, CardContent, Divider } from '@mui/material';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import AppNavbar from '../components/AppNavbar';
import api from '../api';

interface AdminPageProps {
  onLogout: () => void;
  userRole: string | null;
}

interface TrainingStats {
  totalValidatedSamples: number;
  totalHistoricallyValidated: number; // ДОДАНО
  lastTrainedAt: string | null;
  currentModelPath: string | null;
}

const MIN_SAMPLES_FOR_TRAINING = 20;

const AdminPage: React.FC<AdminPageProps> = ({ onLogout, userRole }) => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [stats, setStats] = useState<TrainingStats | null>(null);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/mappings/training-stats');
      setStats(response.data);
    } catch (err) {
      console.error('Не вдалося завантажити статистику', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTrainModel = async () => {
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const response = await api.post('/mappings/export-training-data');
      setMessage(`Процес донавчання успішно завершено! Оброблено зразків: ${response.data.samplesCount}. Модель оновлено.`);
      setIsError(false);
      await fetchStats();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Помилка запуску донавчання.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const isTrainingAllowed = stats ? stats.totalValidatedSamples >= MIN_SAMPLES_FOR_TRAINING : false;

  return (
    <>
      <AppNavbar title="Панель адміністратора" onLogout={onLogout} userRole={userRole} />
      <Container sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Керування ML-моделлю (Active Learning)
        </Typography>
        
        {statsLoading ? (
          <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />
        ) : (
          <Grid container spacing={4}>
            
            {/* ВІДЖЕТ 1: Статистика даних */}
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 5 }}>
                  <CheckCircleIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalValidatedSamples || 0}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Нових зразків для навчання
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: '80%' }}>
                    Це кількість нових результатів мапінгу, які експерти позначили як правильні після останнього оновлення моделі.
                  </Typography>
                  <Divider sx={{ width: '80%', my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Всього валідовано за весь час: <b>{stats?.totalHistoricallyValidated || 0}</b>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* ВІДЖЕТ 2: Статус моделі */}
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <UpdateIcon color="secondary" />
                    <Typography variant="h6">Статус моделі</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Останнє успішне донавчання:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {stats?.lastTrainedAt 
                        ? new Date(stats.lastTrainedAt).toLocaleString('uk-UA') 
                        : 'Ще не проводилось'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Поточна версія моделі:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', bgcolor: 'rgba(255,255,255,0.05)', p: 1, borderRadius: 1, mt: 0.5 }}>
                      {stats?.currentModelPath || 'Невідомо'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* ПАНЕЛЬ КЕРУВАННЯ */}
            <Grid item xs={12} >
              <Paper elevation={3} sx={{ p: 4, mt: 2, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  Запуск донавчання (Fine-tuning)
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, maxWidth: '800px', mx: 'auto', color: 'text.secondary' }}>
                  Процес донавчання запустить оптимізацію нейромережі (Bi-Encoder) на основі зібраних експертних оцінок. 
                  Для запобігання перенавчанню, запуск можливий лише при наявності мінімум <b>{MIN_SAMPLES_FOR_TRAINING}</b> нових зразків.
                </Typography>

                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<ModelTrainingIcon />}
                    onClick={handleTrainModel}
                    disabled={loading || !isTrainingAllowed}
                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                  >
                    {loading ? 'Триває донавчання...' : 'Запустити оновлення моделі'}
                  </Button>
                  
                  {loading && (
                    <CircularProgress
                      size={30}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-15px',
                        marginLeft: '-15px',
                      }}
                    />
                  )}
                </Box>

                {!isTrainingAllowed && !loading && (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    Недостатньо нових даних для донавчання. Потрібно ще {MIN_SAMPLES_FOR_TRAINING - (stats?.totalValidatedSamples || 0)} зразків.
                  </Typography>
                )}

                {message && (
                  <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 4, maxWidth: '600px', mx: 'auto' }}>
                    {message}
                  </Alert>
                )}
              </Paper>
            </Grid>

          </Grid>
        )}
      </Container>
    </>
  );
};

export default AdminPage;
