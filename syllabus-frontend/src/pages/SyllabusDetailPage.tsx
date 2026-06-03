import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Grid, Chip, Tooltip, Collapse, IconButton, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StarsIcon from '@mui/icons-material/Stars';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AppNavbar from '../components/AppNavbar';
import api from '../api';
import CollapsibleText from '../components/CollapsibleText';
import { useTheme } from '@mui/material/styles';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';

interface Competence {
  id: string;
  code: string;
  name: string;
  description: string;
  level: number;
}

interface MappingResult {
  id: string;
  finalScore: number;
  expertValidated: boolean;
  competence: Competence;
}

interface LearningOutcome {
  id: string;
  originalText: string;
  technologies: string[];
  bloomLevels: number[];
  mappingResults: MappingResult[];
}

interface Syllabus {
  id: string;
  title: string;
  threshold: number | null;
  filePath?: string | null;
}

interface SyllabusDetailPageProps {
  onLogout: () => void;
  userRole: string | null;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  const lastSpace = text.lastIndexOf(' ', maxLength);
  const cutoffIndex = lastSpace > 0 ? lastSpace : maxLength;
  return text.substring(0, cutoffIndex) + '...';
};

const ecfAreas = {
  'A': 'Plan (Планування)',
  'B': 'Build (Розробка)',
  'C': 'Run (Експлуатація)',
  'D': 'Enable (Забезпечення)',
  'E': 'Manage (Управління)'
};

const bloomLevelNames: Record<number, string> = {
  1: 'Запам\'ятовування',
  2: 'Розуміння',
  3: 'Застосування',
  4: 'Аналіз',
  5: 'Оцінювання',
  6: 'Створення'
};

const ecfLevelNames: Record<number, string> = {
  1: 'Associate (Початковий)',
  2: 'Professional (Базовий)',
  3: 'Senior Professional / Manager (Просунутий)',
  4: 'Lead Professional / Senior Manager (Керівний)',
  5: 'Principal / Director (Експертний)'
};

const getRelevanceLevel = (score: number) => {
  const percentage = Math.round(score * 100);
  if (percentage >= 80) return { label: 'Дуже висока', color: 'primary' as const, stars: 3, description: 'Відповідність > 80%. Модель дуже впевнена у результаті.' };
  if (percentage >= 65) return { label: 'Висока', color: 'secondary' as const, stars: 2, description: 'Відповідність 65-79%. Висока ймовірність правильного результату.' };
  if (percentage >= 50) return { label: 'Середня', color: 'warning' as const, stars: 1, description: 'Відповідність 50-64%. Результат може бути релевантним, але потребує уваги експерта.' };
  return { label: 'Низька', color: 'error' as const, stars: 0, description: 'Відповідність < 50%. Низька ймовірність релевантності.' };
};

const SyllabusDetailPage: React.FC<SyllabusDetailPageProps> = ({ onLogout, userRole }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`/syllabus/${id}/analysis`);
      setSyllabus(response.data.syllabus);
      setOutcomes(response.data.outcomes);
    } catch (err) {
      setError('Не вдалося завантажити результати аналізу.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await api.delete(`/syllabus/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError('Не вдалося видалити силабус.');
      console.error(err);
    }
    setOpenDeleteDialog(false);
  };

  const handleDownload = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/syllabus/${id}/download`, { responseType: 'blob' });
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'syllabus.dat';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Не вдалося завантажити файл.');
      console.error(err);
    }
  };

  const handleValidate = async (mappingId: string) => {
    try {
      await api.patch(`/mappings/${mappingId}/validate`);
      setOutcomes(prevOutcomes => 
        prevOutcomes.map(outcome => ({
          ...outcome,
          mappingResults: outcome.mappingResults.map(result => 
            result.id === mappingId ? { ...result, expertValidated: true } : result
          )
        }))
      );
    } catch (err) {
      setError('Не вдалося підтвердити компетенцію.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <AppNavbar title="Завантаження аналізу..." onLogout={onLogout} userRole={userRole} />
        <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 10 }} />
      </>
    );
  }

  const isExpert = userRole === 'EXPERT' || userRole === 'ADMIN';

  const allResults = outcomes.flatMap(outcome => outcome.mappingResults.slice(0, 5));
  const totalCompetencies = allResults.length;
  const thresholdPercentage = syllabus?.threshold ? Math.round(syllabus.threshold * 100) : 60;

  const validatedCompetenciesCount = allResults.filter(r => r.expertValidated).length;
  const validationPercentage = totalCompetencies > 0 ? Math.round((validatedCompetenciesCount / totalCompetencies) * 100) : 0;

  const areaCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  allResults.forEach(res => {
    const area = res.competence.code.charAt(0);
    if (areaCounts[area] !== undefined) {
      areaCounts[area]++;
    }
    const level = res.competence.level;
    if (levelCounts[level] !== undefined) {
      levelCounts[level]++;
    }
  });

  const radarData = Object.entries(ecfAreas).map(([areaCode, areaName]) => ({
    subject: areaCode, 
    fullMark: totalCompetencies > 0 ? totalCompetencies : 1, 
    A: areaCounts[areaCode], 
    name: areaName 
  }));

  const barChartData = [1, 2, 3, 4, 5].map(level => ({
    name: `Рівень ${level}`,
    shortName: `L${level}`,
    count: levelCounts[level],
    description: ecfLevelNames[level]
  }));

  let overallScoreValue = 0;
  if (outcomes.length > 0) {
    const sumOfMaxScores = outcomes.reduce((sum, outcome) => {
      const maxScore = outcome.mappingResults.length > 0 
        ? Math.max(...outcome.mappingResults.map(r => r.finalScore)) 
        : 0;
      return sum + maxScore;
    }, 0);
    overallScoreValue = (sumOfMaxScores / outcomes.length) * 10;
  }
  const overallScoreFormatted = overallScoreValue.toFixed(1);

  const primaryColor = theme.palette.primary.main;

  const getIndexColor = (score: number) => {
    if (score >= 7.5) return theme.palette.primary.main;
    if (score >= 5.0) return theme.palette.secondary.main;
    return theme.palette.warning.main;
  };
  const indexColor = getIndexColor(overallScoreValue);

  const validOutcomes = outcomes.filter(o => o.mappingResults.slice(0, 5).length > 0);

  const uniqueCompetencies = Array.from(
    new Map(allResults.map(r => [r.competence.code, r.competence])).values()
  );

  const getBarColor = (index: number) => {
    const colors = [
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.secondary.main,
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <AppNavbar title="Результати аналізу" onLogout={onLogout} userRole={userRole} />
      <Container sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              flexGrow: 1, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}
          >
            {syllabus?.title || 'Детальний аналіз'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button 
              variant="outlined" 
              color="info" 
              startIcon={<InfoOutlinedIcon />}
              onClick={() => setShowExplanation(!showExplanation)}
            >
              Як це працює?
            </Button>
            {syllabus?.filePath && (
              <Button variant="contained" onClick={handleDownload}>
                Завантажити оригінал
              </Button>
            )}
            <Button variant="outlined" color="error" onClick={() => setOpenDeleteDialog(true)}>
              Видалити
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        
        <Collapse in={showExplanation}>
          <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: 'rgba(25, 118, 210, 0.05)', border: '1px solid rgba(25, 118, 210, 0.2)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon />
                Як розраховується відсоток схожості?
              </Typography>
              <IconButton size="small" onClick={() => setShowExplanation(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Відсоток, який ви бачите - це не просто співпадіння ключових слів. Це <b>комплексна оцінка (Final Score)</b>, яку розраховує наша ML-модель на основі трьох факторів:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="1. Семантична схожість (Bi-Encoder + Cross-Encoder)" 
                  secondary="Нейромережа (SBERT) аналізує контекст вашого тексту та порівнює його з описом компетенції e-CF. Це найважливіший фактор." 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2. Виявлення технологій (Rule-based NLP)" 
                  secondary="Система шукає згадки конкретних IT-технологій (Python, React, SQL тощо) за допомогою spaCy. Якщо технологія знайдена і компетенція є технічною, бал збільшується." 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3. Когнітивні рівні (Таксономія Блума)" 
                  secondary="Модель знаходить дієслова дії (напр., 'розробляти', 'аналізувати') і зіставляє їх зі складністю компетенції. Чим точніше збігається рівень складності, тим вищий фінальний відсоток." 
                />
              </ListItem>
            </List>
          </Paper>
        </Collapse>

        {!loading && !error && (
          <Alert severity={totalCompetencies > 0 ? "info" : "warning"} sx={{ mb: 4 }}>
            {totalCompetencies > 0 
              ? `Нижче наведено результати, які відповідають мінімальному порогу релевантності (понад ${thresholdPercentage}%).`
              : `Не знайдено жодної компетенції, що відповідає критеріям (поріг > ${thresholdPercentage}%). Спробуйте проаналізувати документ з нижчим порогом або завантажте інший документ, оскільки поточний може бути недостатньо пов'язаний зі сферою IT.`
            }
          </Alert>
        )}

        {totalCompetencies > 0 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Курс покриває наступні IT-компетенції:
            </Typography>
            <Paper elevation={1} sx={{ p: 2, mb: 5, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {uniqueCompetencies.map(comp => (
                  <Tooltip key={comp.code} title={comp.description} arrow>
                    <Chip 
                      label={`${comp.name} (${comp.code})`} 
                      color="primary" 
                      variant="outlined" 
                      onClick={() => {}} 
                    />
                  </Tooltip>
                ))}
              </Box>
            </Paper>

            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Детальний розбір тексту
            </Typography>

            {validOutcomes.map((outcome, index) => {
              const top5Results = outcome.mappingResults.slice(0, 5);
              const validatedResult = top5Results.find(r => r.expertValidated);
              const topResult = validatedResult || top5Results[0]; 
              const otherResults = top5Results.filter(r => r.id !== topResult.id);

              if (!topResult) return null;
              
              const topRelevance = getRelevanceLevel(topResult.finalScore);
              const topAbsolutePercentage = Math.round(topResult.finalScore * 100);
              
              return (
                <Accordion key={outcome.id} defaultExpanded={index === 0} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ width: '100%' }}>
                      {truncateText(outcome.originalText.replace(/\s+/g, ' ').trim(), 80)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <CollapsibleText text={outcome.originalText} />
                      
                      {(outcome.technologies.length > 0 || outcome.bloomLevels.length > 0) && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Ознаки, знайдені моделлю:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {outcome.technologies.map(tech => (
                              <Chip 
                                key={tech} 
                                icon={<CodeIcon fontSize="small" />} 
                                label={tech} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            ))}
                            {outcome.bloomLevels.map(level => (
                              <Tooltip key={level} title={`Когнітивний рівень Блума: ${level}`}>
                                <Chip 
                                  icon={<PsychologyIcon fontSize="small" />} 
                                  label={bloomLevelNames[level] || `Рівень ${level}`} 
                                  size="small" 
                                  color="secondary" 
                                  variant="outlined" 
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkspacePremiumIcon color={topResult.expertValidated ? "success" : "warning"} fontSize="small" />
                        {topResult.expertValidated ? 'Підтверджена компетенція:' : 'Найбільш вірогідна компетенція (за оцінкою ШІ):'}
                      </Typography>
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 2,
                          border: `1px solid ${topResult.expertValidated ? theme.palette.success.main : theme.palette[topRelevance.color].main}40`, 
                          backgroundColor: `${topResult.expertValidated ? theme.palette.success.main : theme.palette[topRelevance.color].main}08`, 
                          position: 'relative'
                        }}
                      >
                        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                          {topResult.expertValidated ? (
                            <Tooltip title="Цей збіг перевірено та підтверджено експертом">
                              <Chip icon={<CheckCircleIcon />} label="Підтверджено експертом" color="success" size="small" variant="filled" />
                            </Tooltip>
                          ) : (
                            isExpert && (
                              <Button variant="outlined" size="small" onClick={() => handleValidate(topResult.id)}>
                                Підтвердити
                              </Button>
                            )
                          )}
                        </Box>
                        
                        <Typography variant="h6" sx={{ pr: 15, mb: 1, color: topResult.expertValidated ? theme.palette.success.main : theme.palette[topRelevance.color].main }}>
                          {`${topResult.competence.name} (${topResult.competence.code})`}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Рівень e-CF: {topResult.competence.level} - {ecfLevelNames[topResult.competence.level]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {topResult.competence.description}
                        </Typography>
                        
                        <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                          <Tooltip title={topRelevance.description} arrow>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'help' }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {topAbsolutePercentage}%
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                  схожість
                                </Typography>
                                <Chip 
                                  label={topRelevance.label} 
                                  color={topRelevance.color} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                            </Box>
                          </Tooltip>
                          
                          <Box sx={{ display: 'flex', color: theme.palette[topRelevance.color].main }}>
                            {[...Array(3)].map((_, i) => (
                              <StarsIcon key={i} sx={{ opacity: i < topRelevance.stars ? 1 : 0.3 }} />
                            ))}
                          </Box>
                        </Box>
                      </Paper>
                    </Box>

                    {otherResults.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Альтернативні варіанти:
                        </Typography>
                        <List disablePadding>
                          {otherResults.map(result => {
                            const relevance = getRelevanceLevel(result.finalScore);
                            const absolutePercentage = Math.round(result.finalScore * 100);

                            return (
                              <ListItem 
                                key={result.id} 
                                divider
                                sx={{ py: 1.5 }}
                                secondaryAction={
                                  result.expertValidated ? (
                                    <Tooltip title="Підтверджено експертом">
                                      <CheckCircleIcon color="success" />
                                    </Tooltip>
                                  ) : (
                                    isExpert && (
                                      <Button size="small" onClick={() => handleValidate(result.id)}>
                                        Підтвердити
                                      </Button>
                                    )
                                  )
                                }
                              >
                                <ListItemText
                                  primary={
                                    <Tooltip 
                                      title={
                                        <React.Fragment>
                                          <Typography color="inherit" variant="subtitle2">{result.competence.name}</Typography>
                                          <Typography variant="body2">{result.competence.description}</Typography>
                                        </React.Fragment>
                                      } 
                                      placement="top-start"
                                      arrow
                                    >
                                      <Typography 
                                        component="span" 
                                        sx={{ 
                                          cursor: 'help',
                                          borderBottom: '1px dotted',
                                          borderColor: 'text.secondary',
                                          display: 'inline-block',
                                          fontWeight: 500,
                                        }}
                                      >
                                        {`${result.competence.name} (${result.competence.code}) - Рівень ${result.competence.level} (${ecfLevelNames[result.competence.level].split(' ')[0]})`}
                                      </Typography>
                                    </Tooltip>
                                  }
                                  secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                                      <Tooltip title={relevance.description} arrow>
                                        <Chip 
                                          label={relevance.label} 
                                          color={relevance.color} 
                                          size="small" 
                                          variant="outlined"
                                          sx={{ height: 20, fontSize: '0.7rem', cursor: 'help' }}
                                        />
                                      </Tooltip>
                                      <Typography variant="body2" color="text.secondary">
                                        <b>{absolutePercentage}%</b>
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}

            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" gutterBottom>
                Загальна аналітика силабусу
              </Typography>
              <Grid container spacing={3}>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', mb: 2, textAlign: 'center' }}>
                      Індекс IT-релевантності
                    </Typography>
                    <Tooltip title="Середній максимальний бал покриття компетенціями по всім розділам документа. Оцінка від 0 до 10.">
                      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                        <CircularProgress 
                          variant="determinate" 
                          value={(overallScoreValue / 10) * 100} 
                          size={120}
                          thickness={5}
                          sx={{ 
                            color: indexColor,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              borderRadius: '50%',
                              border: '5px solid rgba(255,255,255,0.05)',
                            }
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="h4" component="div" sx={{ color: indexColor, fontWeight: 'bold', lineHeight: 1 }}>
                            {overallScoreFormatted}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            з 10
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                      {overallScoreValue >= 7.5 ? 'Високий рівень IT-компетенцій' : 
                       overallScoreValue >= 5.0 ? 'Середній рівень IT-компетенцій' : 
                       'Низький рівень IT-компетенцій'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', mb: 2, textAlign: 'center' }}>
                      Прогрес експертної оцінки
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={validationPercentage} 
                        size={120}
                        thickness={5}
                        color={validationPercentage === 100 ? "success" : "secondary"}
                        sx={{ 
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: '50%',
                            border: '5px solid rgba(255,255,255,0.05)',
                          }
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h5" component="div" color="text.secondary">
                          {`${validationPercentage}%`}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                      Перевірено: <b>{validatedCompetenciesCount}</b> з <b>{totalCompetencies}</b>
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', mb: 1, textAlign: 'center' }}>
                      Розподіл за рівнями (Складність)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                      Кількість компетенцій, що відповідають певному рівню e-CF (від 1 до 5).
                    </Typography>

                    <Box sx={{ width: '100%', height: 250, display: 'flex', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis
                            dataKey="shortName"
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                            tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1, boxShadow: 3 }}>
                                    <Typography variant="subtitle2" color="primary">{data.name}</Typography>
                                    <Typography variant="body2">{data.description}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                      Знайдено компетенцій: {data.count}
                                    </Typography>
                                  </Box>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {barChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* ВІДЖЕТ: Radar Chart */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', mb: 1, textAlign: 'center' }}>
                      Профіль компетенцій e-CF (Radar)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                      Діаграма показує баланс курсу між 5 основними областями стандарту e-CF.
                    </Typography>
                    
                    <Box sx={{ width: '100%', height: 350, display: 'flex', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.2)" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: theme.palette.text.primary, fontSize: 14, fontWeight: 'bold' }} 
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 'dataMax']} 
                            tick={false} 
                            axisLine={false} 
                          />
                          <Radar 
                            name="Компетенції" 
                            dataKey="A" 
                            stroke={primaryColor} 
                            fill={primaryColor} 
                            fillOpacity={0.4} 
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    {/* Легенда під графіком */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 2 }}>
                      {Object.entries(ecfAreas).map(([areaCode, areaName]) => (
                        <Box key={areaCode} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="primary">{areaCode}:</Typography>
                          <Typography variant="caption" color="text.secondary">{areaName.split(' ')[0]}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

              </Grid>
            </Box>
          </>
        )}
      </Container>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Підтвердити видалення</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити цей силабус? Цю дію неможливо буде скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Скасувати</Button>
          <Button onClick={handleDelete} color="error">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SyllabusDetailPage;
