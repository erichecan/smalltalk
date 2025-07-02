import { Container, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import PracticeExercises from './PracticeExercises';

export default function PracticeLayout() {
  const { t } = useTranslation('practice');

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0, width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Header - 简化版本，去除标签页 - 2025-01-30 21:23:00 */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'rgba(248, 252, 248, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(231, 243, 231, 0.5)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#0d1b0d', 
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {t('title')}
          </Typography>
        </Box>
      </Box>

      {/* 直接显示练习内容 - 2025-01-30 21:23:00 */}
      <Box sx={{ pb: 10 }}>
        <PracticeExercises />
      </Box>
    </Container>
  );
}