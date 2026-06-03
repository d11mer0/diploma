import React, { useState } from 'react';
import { Typography, Button, Box } from '@mui/material';

interface CollapsibleTextProps {
  text: string;
  shortLimit?: number;
  longLimit?: number;
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({ text, shortLimit = 150, longLimit = 2000 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= shortLimit) {
    return (
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </Typography>
    );
  }

  const displayedText = isExpanded 
    ? (text.length > longLimit ? `${text.substring(0, longLimit)}...` : text)
    : `${text.substring(0, shortLimit)}...`;

  return (
    <Box>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {displayedText}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}> {/* ОНОВЛЕНО: Контейнер для вирівнювання */}
        <Button size="small" onClick={() => setIsExpanded(!isExpanded)} sx={{ mt: 1 }}>
          {isExpanded ? 'Сховати' : 'Показати більше'}
        </Button>
      </Box>
    </Box>
  );
};

export default CollapsibleText;
