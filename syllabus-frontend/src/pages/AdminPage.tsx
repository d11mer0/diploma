import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Alert, Paper, Grid, Card, CardContent, Divider } from '@mui/material';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AppNavbar from '../components/AppNavbar';
import api from '../api';

interface AdminPageProps {
  onLogout: () => void;
  userRole: string | null;
}

interface TrainingStats {
  totalValidatedSamples: number;
  totalHistoricallyValidated: number;
  lastTrainedAt: string | null;
  currentModelPath: string | null;
}

// Адаптовано для демонстрації: 3 зразки (промисловий поріг: 20+)
const MIN_SAMPLES_FOR_TRAINING = 3;

const AdminPage: React.FC<AdminPageProps> = ({ onLogout, userRole }) => {
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
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

  const handleSeedDemoData = async () => {
    setSeedLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const response = await api.post('/mappings/demo-seed-validations');
      setMessage(response.data.message || 'Зразки успішно підготовлено для демонстрації!');
      setIsError(false);
      await fetchStats();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Помилка підготовки зразків для демо.');
      setIsError(true);
    } finally {
      setSeedLoading(false);
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
                  Запуск донавчання (Active Learning Fine-tuning)
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, maxWidth: '800px', mx: 'auto', color: 'text.secondary' }}>
                  Процес донавчання запускає оптимізацію нейромережі (Bi-Encoder) методом контрастивного навчання (TripletLoss) на основі валідованих експертами збігів. 
                  Для наочної демонстрації поріг встановлено на мінімум <b>{MIN_SAMPLES_FOR_TRAINING}</b> нових зразків (рекомендований промисловий поріг: 20+ для запобігання перенавчанню).
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={handleSeedDemoData}
                    disabled={loading || seedLoading}
                    sx={{ px: 3, py: 1.5, borderRadius: 2 }}
                  >
                    {seedLoading ? 'Підготовка даних...' : 'Підготувати дані для демо (3 зразки)'}
                  </Button>

                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<ModelTrainingIcon />}
                      onClick={handleTrainModel}
                      disabled={loading || !isTrainingAllowed || seedLoading}
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
                </Box>

                {!isTrainingAllowed && !loading && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
                    Для запуску потрібно ще <b>{MIN_SAMPLES_FOR_TRAINING - (stats?.totalValidatedSamples || 0)}</b> валідованих зразків. 
                    Ви можете валідувати їх вручну на сторінці силабусу або скористатися кнопкою швидкої підготовки для демо вище.
                  </Typography>
                )}

                {message && (
                  <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 4, maxWidth: '650px', mx: 'auto' }}>
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
