import React, { useState } from 'react';
import { Modal, Box, Typography, Button, CircularProgress, Alert, Tabs, Tab, TextField, Slider, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import api from '../api';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ThresholdInfo = () => (
  <Box>
    <Typography variant="subtitle2">Рекомендації по вибору порогу:</Typography>
    <Typography variant="body2" component="div">
      <ul>
        <li><b>75-90%</b>: Дуже висока схожість.</li>
        <li><b>60-75%</b>: Висока схожість. <b>(Рекомендований поріг)</b></li>
        <li><b>50-60%</b>: Середня схожість, потребує уваги експерта.</li>
      </ul>
      <Typography variant="caption">Значення за замовчуванням (60%) є оптимальним балансом між точністю та повнотою результатів.</Typography>
    </Typography>
  </Box>
);

const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [threshold, setThreshold] = useState(60); // ОНОВЛЕНО: Значення за замовчуванням

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setError('');
    setFile(null);
    setText('');
  };

  const handleUpload = async () => {
    setLoading(true);
    setError('');

    try {
      const thresholdValue = threshold / 100;

      if (tabIndex === 0) {
        if (!file) {
          setError('Будь ласка, виберіть файл.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('threshold', thresholdValue.toString());
        await api.post('/syllabus/analyze/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        if (!text.trim()) {
          setError('Будь ласка, введіть текст.');
          setLoading(false);
          return;
        }
        await api.post('/syllabus/analyze/text', { text, threshold: thresholdValue });
      }
      onUploadSuccess();
    } catch (err) {
      setError('Помилка аналізу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Додати новий силабус
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Завантажити файл" />
            <Tab label="Вставити текст" />
          </Tabs>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {tabIndex === 0 && (
          <Box>
            <Button variant="contained" component="label" disabled={loading}>
              Вибрати файл
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {file && <Typography sx={{ ml: 2, display: 'inline' }}>{file.name}</Typography>}
          </Box>
        )}

        {tabIndex === 1 && (
          <TextField
            label="Вставте текст силабусу сюди"
            multiline
            rows={10}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
        )}

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography gutterBottom>
              Поріг схожості: {threshold}%
            </Typography>
            <Tooltip title={<ThresholdInfo />}>
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Slider
            value={threshold}
            onChange={(e, newValue) => setThreshold(newValue as number)}
            aria-labelledby="threshold-slider"
            valueLabelDisplay="auto"
            step={5}
            marks
            min={50}
            max={90}
            disabled={loading}
          />
        </Box>

        <Box sx={{ mt: 3, position: 'relative' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading || (tabIndex === 0 && !file) || (tabIndex === 1 && !text.trim())}
            fullWidth
          >
            Проаналізувати
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default UploadModal;
