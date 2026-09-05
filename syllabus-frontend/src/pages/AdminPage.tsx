import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Box, CircularProgress, LinearProgress, 
  Alert, Paper, Grid, Card, CardContent, Divider, Chip 
} from '@mui/material';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
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

const MIN_SAMPLES_FOR_TRAINING = 3;

// Форматування секунд у зручний вигляд "1 хв 45 с" або "45 с"
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs} с`;
  }
  return `${mins} хв ${secs < 10 ? '0' : ''}${secs} с`;
};

const AdminPage: React.FC<AdminPageProps> = ({ onLogout, userRole }) => {
  const [loading, setLoading] = useState(false);
  const [trainingSeconds, setTrainingSeconds] = useState(0);
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

  // Єдиний конвеєр донавчання
  const runTrainingPipeline = async (needSeedFirst = false) => {
    setLoading(true);
    setMessage('');
    setIsError(false);
    const startTime = Date.now();
    try {
      if (needSeedFirst) {
        await api.post('/mappings/demo-seed-validations');
      }
      const response = await api.post('/mappings/export-training-data');
      const duration = Math.round((Date.now() - startTime) / 1000);
      setMessage(`Процес донавчання успішно завершено за ${formatTime(duration)}! Оброблено зразків: ${response.data.samplesCount}. Модель оновлено.`);
      setIsError(false);
      await fetchStats();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Помилка виконання донавчання.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlySeed = async () => {
    try {
      const response = await api.post('/mappings/demo-seed-validations');
      setMessage(response.data.message || 'Зразки успішно підготовлено для демонстрації!');
      setIsError(false);
      await fetchStats();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Помилка підготовки зразків для демо.');
      setIsError(true);
    }
  };

  const hasEnoughSamples = stats ? stats.totalValidatedSamples >= MIN_SAMPLES_FOR_TRAINING : false;

  return (
    <>
      <AppNavbar title="Панель адміністратора" onLogout={onLogout} userRole={userRole} />
      <Container sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Керування ML-моделлю (Active Learning)
        </Typography>
        
        {statsLoading ? (
          <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />
        ) : (
          <Grid container spacing={4}>
            
            {/* ВІДЖЕТ 1: Статистика даних */}
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon color="primary" sx={{ fontSize: 56, mb: 1.5 }} />
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalValidatedSamples || 0}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Нових зразків для навчання
                  </Typography>
                  <Chip 
                    label={hasEnoughSamples ? "Готово до запуску" : `Потрібно ще ${MIN_SAMPLES_FOR_TRAINING - (stats?.totalValidatedSamples || 0)} зразків`} 
                    color={hasEnoughSamples ? "success" : "default"} 
                    size="small" 
                    sx={{ mt: 1, mb: 2 }} 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '85%' }}>
                    Це кількість нових результатів мапінгу, які експерти підтвердили після останнього оновлення моделі.
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
              <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 4, px: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <UpdateIcon color="secondary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Стан моделі</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Останнє успішне оновлення:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {stats?.lastTrainedAt 
                        ? new Date(stats.lastTrainedAt).toLocaleString('uk-UA') 
                        : 'Ще не проводилось'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Поточна активна версія:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', bgcolor: 'action.hover', p: 1.2, borderRadius: 1, mt: 0.5, fontWeight: 'bold' }}>
                      {stats?.currentModelPath || 'models/fine_tuned_multilingual_v_balanced'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    <Typography variant="caption" color="text.secondary">
                      Мультимовний Bi-Encoder готовий до семантичного пошуку
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* ГОЛОВНА ПАНЕЛЬ УПРАВЛІННЯ ТА ЖИВИЙ ПРОГРЕС */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Оновлення нейромережі (Active Learning)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
                  Процес оновлення виконує контрастивне донавчання багатомовної моделі на підтверджених експертом зразках із застосуванням негативного майнінгу та буфера збереження знань.
                </Typography>

                {/* СТАН 1: ПРОЦЕС ДИСКРЕТНОГО НАВЧАННЯ (АКТИВНИЙ ЖИВИЙ КОНСОЛЬ-ТРЕКЕР) */}
                {loading ? (
                  <Box sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'left', mt: 2 }}>
                    
                    {/* Заголовок трекера та живий таймер */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CircularProgress size={26} color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Триває оптимізація нейромережі на сервері...
                        </Typography>
                      </Box>
                      <Chip 
                        icon={<HourglassTopIcon />}
                        label={`Час виконання: ${formatTime(trainingSeconds)}`} 
                        color="primary" 
                        variant="filled" 
                        size="medium"
                        sx={{ fontWeight: 'bold', fontSize: '0.95rem', py: 2, px: 0.5 }} 
                      />
                    </Box>

                    {/* Безперервний плавний анімований прогрес-бар */}
                    <Box sx={{ my: 2.5 }}>
                      <LinearProgress 
                        sx={{ 
                          height: 10, 
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundImage: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
                          }
                        }} 
                      />
                    </Box>

                    {/* Інформаційне повідомлення про очікуваний час */}
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        Обчислення градієнтів та зворотне поширення помилки (Backpropagation) для 12-шарового трансформера на процесорі (CPU) зазвичай триває <b>близько 2–4 хвилин</b>. 
                        Секундомір вище підтверджує, що браузер і сервер активно працюють і процес не завис. Будь ласка, зачекайте.
                      </Typography>
                    </Alert>

                    {/* 3 блоки конвеєра, які пояснюють фонові операції */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Paper 
                          variant="outlined"
                          sx={{ 
                            p: 2, 
                            height: '100%',
                            borderRadius: 2,
                            border: '1px solid rgba(25, 118, 210, 0.4)',
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                            1. Hard Negative Mining
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                            Формування симетричних навчальних трійок (Anchor, Positive, Negative) для підсилення розрізнення схожих компетенцій.
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Paper 
                          variant="outlined"
                          sx={{ 
                            p: 2, 
                            height: '100%',
                            borderRadius: 2,
                            border: '1px solid rgba(25, 118, 210, 0.4)',
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                            2. TripletLoss Backpropagation
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                            Ітеративний градієнтний спуск на CPU та підмішування 20 опорних еталонів Rehearsal проти катастрофічного забування.
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Paper 
                          variant="outlined"
                          sx={{ 
                            p: 2, 
                            height: '100%',
                            borderRadius: 2,
                            border: '1px solid rgba(25, 118, 210, 0.4)',
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                            3. Фіналізація та індексація
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                            Експорт нового версійного чекпоінту та повний перерахунок 113 рівнів векторного простору стандарту e-CF.
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                  </Box>
                ) : (
                  /* СТАН 2: ОЧІКУВАННЯ ЗАПУСКУ (ЄДИНА ГОЛОВНА КНОПКА ДІЇ) */
                  <Box sx={{ maxWidth: '650px', mx: 'auto', mt: 2 }}>
                    
                    {hasEnoughSamples ? (
                      /* Якщо вже є зразки */
                      <Box>
                        <Alert severity="success" sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
                          Зібрано <b>{stats?.totalValidatedSamples} нових валідованих зразків</b>. Система готова до оновлення моделі!
                        </Alert>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<ModelTrainingIcon />}
                          onClick={() => runTrainingPipeline(false)}
                          sx={{ 
                            px: 5, 
                            py: 1.8, 
                            fontSize: '1.05rem', 
                            borderRadius: 3, 
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)'
                          }}
                        >
                          Запустити оновлення моделі ({stats?.totalValidatedSamples} зразків)
                        </Button>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="text"
                            size="small"
                            onClick={handleOnlySeed}
                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                          >
                            + Додати ще тестові зразки для розширення вибірки
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      /* Якщо зразків 0 або менше 3 - ОДИН КЛІК ДЛЯ ДЕМО ТА ОНОВЛЕННЯ */
                      <Box>
                        <Alert severity="info" sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
                          В системі наразі <b>{stats?.totalValidatedSamples || 0} нових зразків</b> (попередні вже інтегровано в модель). Для демонстрації натисніть кнопку нижче: система автоматично підготує валідовані приклади та виконає оновлення моделі.
                        </Alert>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<AutoAwesomeIcon />}
                          onClick={() => runTrainingPipeline(true)}
                          sx={{ 
                            px: 4, 
                            py: 1.8, 
                            fontSize: '1.05rem', 
                            borderRadius: 3, 
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)'
                          }}
                        >
                          Підготувати дані та запустити оновлення моделі
                        </Button>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="text"
                            size="small"
                            onClick={handleOnlySeed}
                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                          >
                            або тільки підготувати дані без запуску
                          </Button>
                        </Box>
                      </Box>
                    )}

                  </Box>
                )}

                {/* ПОВІДОМЛЕННЯ ПРО РЕЗУЛЬТАТ */}
                {message && !loading && (
                  <Alert 
                    severity={isError ? 'error' : 'success'} 
                    sx={{ mt: 4, maxWidth: '650px', mx: 'auto', borderRadius: 2, textAlign: 'left' }}
                  >
                    {message}
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* ВІДЖЕТ 3: Архітектура Active Learning */}
            <Grid item xs={12}>
              <Card elevation={3} sx={{ mt: 1, textAlign: 'left', borderRadius: 2 }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <PsychologyIcon color="primary" sx={{ fontSize: 30 }} />
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
                          Швидке 3-епохове доналаштування Bi-Encoder на базі багатомовного MiniLM-L12 з batch_size=8. Зберігається унікальний версійний чекпоінт у реєстрі моделей.
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
