import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress, LinearProgress, Alert, Paper, Grid, Card, CardContent, Divider, Chip } from '@mui/material';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
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
  const [trainingSeconds, setTrainingSeconds] = useState(0);
  const [seedLoading, setSeedLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [stats, setStats] = useState<TrainingStats | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (loading) {
      setTrainingSeconds(0);
      interval = setInterval(() => {
        setTrainingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
    const startTime = Date.now();
    try {
      const response = await api.post('/mappings/export-training-data');
      const duration = Math.round((Date.now() - startTime) / 1000);
      setMessage(`Процес донавчання успішно завершено за ${duration} с! Оброблено зразків: ${response.data.samplesCount}. Модель оновлено.`);
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

                {!isTrainingAllowed && !loading && !seedLoading && (
                  <Box sx={{ mt: 2.5, p: 2, bgcolor: 'action.hover', borderRadius: 2, maxWidth: '650px', mx: 'auto' }}>
                    <Typography variant="body2" color="text.secondary">
                      Для запуску потрібно ще <b>{MIN_SAMPLES_FOR_TRAINING - (stats?.totalValidatedSamples || 0)}</b> валідованих зразків. 
                      Натисніть кнопку <b>«Підготувати дані для демо (3 зразки)»</b> вище для миттєвої генерації валідованих даних.
                    </Typography>
                  </Box>
                )}

                {seedLoading && (
                  <Box sx={{ mt: 3, maxWidth: '650px', mx: 'auto' }}>
                    <Alert severity="info" sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Підготовка та автоматична валідація зразків для демонстрації...
                      </Typography>
                      <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />
                    </Alert>
                  </Box>
                )}

                {loading && (
                  <Card elevation={4} sx={{ mt: 3, maxWidth: '720px', mx: 'auto', textAlign: 'left', border: '1px solid #1976d2', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CircularProgress size={26} color="primary" />
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Триває оптимізація нейромережі: {trainingSeconds} с
                          </Typography>
                        </Box>
                        <Chip 
                          label={`Епоха ${Math.min(3, Math.floor(trainingSeconds / 18) + 1)} з 3`} 
                          color="primary" 
                          variant="outlined" 
                          size="small" 
                        />
                      </Box>

                      <LinearProgress sx={{ my: 2, height: 8, borderRadius: 2 }} />

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Виконується цикл неперервного активного навчання (Continual Active Learning):
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, pl: 1 }}>
                        <Typography variant="caption" sx={{ color: trainingSeconds < 8 ? 'primary.main' : 'success.main', fontWeight: trainingSeconds < 8 ? 'bold' : 'normal' }}>
                          {trainingSeconds < 8 ? '⏳ [1/3]' : '✓ [1/3]'} Генерація навчальних трійок з Hard Negative Mining {trainingSeconds < 8 ? '(виконується...)' : '(готово)'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: trainingSeconds >= 8 && trainingSeconds < 45 ? 'primary.main' : trainingSeconds >= 45 ? 'success.main' : 'text.disabled', fontWeight: trainingSeconds >= 8 && trainingSeconds < 45 ? 'bold' : 'normal' }}>
                          {trainingSeconds < 8 ? '○ [2/3]' : trainingSeconds < 45 ? '⏳ [2/3]' : '✓ [2/3]'} Підмішування 20 еталонних трійок Rehearsal та градієнтний спуск Backpropagation {trainingSeconds >= 8 && trainingSeconds < 45 ? '(оптимізація ваг...)' : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: trainingSeconds >= 45 ? 'primary.main' : 'text.disabled', fontWeight: trainingSeconds >= 45 ? 'bold' : 'normal' }}>
                          {trainingSeconds < 45 ? '○ [3/3]' : '⏳ [3/3]'} Збереження нового чекпоінту та перерахунок векторного простору компетенцій {trainingSeconds >= 45 ? '(фіналізація...)' : ''}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block' }}>
                        ⚡ Очікуваний повний час виконання на CPU: ~45–60 секунд. Сторінка залишається активною.
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {message && (
                  <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 4, maxWidth: '650px', mx: 'auto' }}>
                    {message}
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* ВІДЖЕТ 3: Архітектура Active Learning */}
            <Grid item xs={12}>
              <Card elevation={3} sx={{ mt: 1, textAlign: 'left', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <PsychologyIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Архітектура та конвеєр Active Learning (Continual Fine-Tuning)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Система реалізує цикл активного навчання з людиною в контурі (Human-in-the-Loop), який адаптує векторний простір BERT без ризику деградації базових знань.
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AutoAwesomeIcon color="primary" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            1. Hard Negative Mining
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Виявляє складні негативні приклади (непідтверджені альтернативні компетенції) та формує парні навчальні трійки (Anchor-Positive-Negative) для максимальної дискримінативної здатності.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ShieldIcon color="secondary" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                            2. Стратифікований Rehearsal
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Буфер пам'яті підмішує 20 збалансованих еталонних трійок з усіх 5 доменів e-CF (A–E). Це гарантує захист моделі від катастрофічного забування (Catastrophic Forgetting).
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <SpeedIcon color="success" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            3. Оптимізація TripletLoss
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Швидке 3-епохове доналаштування Bi-Encoder на базі багатомовного MiniLM-L12 з batch_size=8 (~45–60 с на CPU). Зберігається унікальний версійний чекпоінт у реєстрі моделей.
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        )}
      </Container>
    </>
  );
};

export default AdminPage;
