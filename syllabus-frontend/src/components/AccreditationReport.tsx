import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

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

interface AccreditationReportProps {
  id?: string;
  syllabus: Syllabus | null;
  outcomes: LearningOutcome[];
  overallScoreFormatted: string;
  overallScoreValue: number;
  validationPercentage: number;
  validatedCompetenciesCount: number;
  totalCompetencies: number;
  uniqueCompetenciesCount: number;
  radarData: Array<{ subject: string; fullMark: number; A: number; name: string }>;
  barChartData: Array<{ name: string; shortName: string; count: number; description: string }>;
  thresholdPercentage: number;
}

const ecfAreas: Record<string, string> = {
  'A': 'Plan (Планування)',
  'B': 'Build (Розробка)',
  'C': 'Run (Експлуатація)',
  'D': 'Enable (Забезпечення)',
  'E': 'Manage (Управління)'
};

const ecfLevelNames: Record<number, string> = {
  1: 'Associate (Початковий)',
  2: 'Professional (Базовий)',
  3: 'Senior Professional / Manager (Просунутий)',
  4: 'Lead Professional / Senior Manager (Керівний)',
  5: 'Principal / Director (Експертний)'
};

const bloomLevelNames: Record<number, string> = {
  1: 'Запам\'ятовування',
  2: 'Розуміння',
  3: 'Застосування',
  4: 'Аналіз',
  5: 'Оцінювання',
  6: 'Створення'
};

const barColors = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed'];

const AccreditationReport: React.FC<AccreditationReportProps> = ({
  id = 'accreditation-report',
  syllabus,
  outcomes,
  overallScoreFormatted,
  overallScoreValue,
  validationPercentage,
  validatedCompetenciesCount,
  totalCompetencies,
  uniqueCompetenciesCount,
  radarData,
  barChartData,
  thresholdPercentage
}) => {
  const currentDate = new Date().toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const getRelevanceLabel = (score: number) => {
    if (score >= 7.5) return 'Високий рівень відповідності IT-галузі';
    if (score >= 5.0) return 'Середній рівень відповідності IT-галузі';
    return 'Базовий рівень відповідності IT-галузі';
  };

  const getValidationStatusText = (percentage: number) => {
    if (percentage === 0) return 'Не валідовано';
    if (percentage === 100) return 'Повністю провалідовано експертом';
    return 'Частково провалідовано';
  };

  return (
    <Box
      id={id}
      sx={{
        width: '880px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        p: 4,
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Заголовок звіту-висновку */}
      <Box sx={{ textAlign: 'center', pb: 2, mb: 3, borderBottom: '2px solid #1e3a8a' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          ЕКСПЕРТНИЙ ВИСНОВОК
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#1e40af', fontWeight: 600 }}>
          щодо відповідності освітнього компонента (силабусу) стандарту e-CF
        </Typography>
      </Box>

      {/* 2. Метадані силабусу (Паспорт) */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1, textTransform: 'uppercase', fontSize: '11px' }}>
          Паспорт аналізованого освітнього компонента
        </Typography>
        <Table size="small" sx={{ '& td': { py: 0.6, px: 1, fontSize: '12px', borderBottom: '1px solid #e2e8f0', color: '#1e293b' } }}>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: '220px', color: '#334155' }}>Назва навчальної дисципліни:</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{syllabus?.title || 'Не вказано'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Дата комп'ютерного аналізу:</TableCell>
              <TableCell sx={{ color: '#0f172a' }}>{currentDate}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Методологія аналізу:</TableCell>
              <TableCell sx={{ color: '#334155' }}>
                Нейромережеве семантичне моделювання (SBERT Bi-Encoder + Max-Passage Retrieval + Cross-Encoder re-ranking) та Rule-based NLP аналіз технологічного стеку й таксономії Блума
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#334155', borderBottom: 'none' }}>Встановлений поріг релевантності:</TableCell>
              <TableCell sx={{ color: '#0f172a', borderBottom: 'none' }}>{thresholdPercentage}% (відсікання нерелевантних результатів)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* 3. Ключові інтегральні показники з гармонійними кольоровими акцентами */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase', fontSize: '10px' }}>
            Індекс IT-релевантності
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e3a8a', lineHeight: 1.1 }}>
            {overallScoreFormatted} <Typography component="span" variant="body2" sx={{ color: '#64748b' }}>/ 10</Typography>
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600, display: 'block', mt: 0.5 }}>
            {getRelevanceLabel(overallScoreValue)}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase', fontSize: '10px' }}>
            Покриття стандарту e-CF
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#14532d', lineHeight: 1.1 }}>
            {uniqueCompetenciesCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, display: 'block', mt: 0.5 }}>
            унікальних компетентностей (всього {totalCompetencies})
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#6b21a8', fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase', fontSize: '10px' }}>
            Експертна валідація
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#581c87', lineHeight: 1.2, my: 0.5 }}>
            {getValidationStatusText(validationPercentage)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#7e22ce', fontWeight: 600, display: 'block' }}>
            {validatedCompetenciesCount} з {totalCompetencies} результатів перевірено
          </Typography>
        </Paper>
      </Box>

      {/* 4. Графічна аналітика: Радарна діаграма та Розподіл рівнів */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, textTransform: 'uppercase', fontSize: '11px' }}>
          Графічний профіль компетентностей e-CF
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Радарна діаграма з фіксованими розмірами */}
          <Box sx={{ width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>
              Баланс за 5 областями стандарту e-CF
            </Typography>
            <RadarChart width={380} height={240} cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} tick={false} axisLine={false} />
              <Radar name="Компетенції" dataKey="A" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.45} />
            </RadarChart>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 0.5 }}>
              {Object.entries(ecfAreas).map(([code, name]) => (
                <Typography key={code} variant="caption" sx={{ fontSize: '9px', color: '#475569' }}>
                  <b style={{ color: '#1d4ed8' }}>{code}:</b> {name.split(' ')[0]}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Гістограма рівнів */}
          <Box sx={{ width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.5 }}>
              Розподіл за рівнями кваліфікації (e-CF Levels 1–5)
            </Typography>
            <BarChart width={380} height={240} data={barChartData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="shortName" tick={{ fill: '#334155', fontSize: 11, fontWeight: 'bold' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '9px', color: '#64748b' }}>
                L1: Початковий | L2: Базовий | L3: Просунутий | L4: Керівний | L5: Експертний
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 5. Деталізований перелік відповідності компетентностей */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, textTransform: 'uppercase', fontSize: '11px' }}>
          Детальний реєстр зіставлення результатів навчання з рамкою e-CF
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff' }}>
          <Table size="small" sx={{ 
            backgroundColor: '#ffffff', 
            '& th': { backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 700, fontSize: '11px', py: 1.2, borderBottom: '2px solid #cbd5e1' }, 
            '& td': { backgroundColor: '#ffffff', color: '#1e293b', fontSize: '11px', py: 1.2, borderBottom: '1px solid #e2e8f0' } 
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '35px', textAlign: 'center', fontWeight: 700 }}>№</TableCell>
                <TableCell sx={{ width: '260px', fontWeight: 700 }}>Результат навчання (зміст силабусу)</TableCell>
                <TableCell sx={{ width: '240px', fontWeight: 700 }}>Компетентність e-CF (Код, назва)</TableCell>
                <TableCell sx={{ width: '65px', textAlign: 'center', fontWeight: 700 }}>Рівень</TableCell>
                <TableCell sx={{ width: '70px', textAlign: 'center', fontWeight: 700 }}>Схожість</TableCell>
                <TableCell sx={{ width: '180px', fontWeight: 700 }}>Виявлені ознаки (Стек / Блум)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outcomes.map((outcome, idx) => {
                const top5 = outcome.mappingResults.slice(0, 5);
                const validated = top5.find(r => r.expertValidated);
                const top = validated || top5[0];

                if (!top) return null;

                const percentage = Math.round(top.finalScore * 100);

                return (
                  <TableRow key={outcome.id || idx} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                      {idx + 1}
                    </TableCell>
                    <TableCell sx={{ color: '#0f172a', lineHeight: 1.35 }}>
                      {outcome.originalText.length > 140 
                        ? `${outcome.originalText.substring(0, 137)}...` 
                        : outcome.originalText}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '11.5px', fontWeight: 700, color: '#1d4ed8' }}>
                        {top.competence.code} - {top.competence.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '9.5px', color: '#64748b', display: 'block', lineHeight: 1.25, mt: 0.3 }}>
                        {top.competence.description.length > 95 
                          ? `${top.competence.description.substring(0, 92)}...` 
                          : top.competence.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                      Рівень {top.competence.level}
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '8.5px', color: '#64748b', fontWeight: 500 }}>
                        {ecfLevelNames[top.competence.level]?.split(' ')[0]}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: percentage >= 70 ? '#15803d' : '#b45309', fontSize: '12px' }}>
                        {percentage}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {outcome.technologies.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                          {outcome.technologies.slice(0, 4).map(tech => (
                            <Chip
                              key={tech}
                              label={tech}
                              size="small"
                              sx={{ height: 18, fontSize: '9.5px', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 600 }}
                            />
                          ))}
                        </Box>
                      )}
                      {outcome.bloomLevels.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {outcome.bloomLevels.map(lvl => (
                            <Chip
                              key={lvl}
                              label={bloomLevelNames[lvl] || `L${lvl}`}
                              size="small"
                              sx={{ height: 18, fontSize: '9.5px', backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', fontWeight: 600 }}
                            />
                          ))}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AccreditationReport;
