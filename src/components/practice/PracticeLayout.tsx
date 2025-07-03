import { Container, Box, Typography, Stack } from '@mui/material';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import { useTranslation } from 'react-i18next';

import PracticeExercises from './PracticeExercises';

export default function PracticeLayout() {
  const { t } = useTranslation('auth');

  return (
    <Container sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fcf8', 
      p: 0, 
      fontFamily: 'Spline Sans, Noto Sans, sans-serif', 
      width: '100%', 
      maxWidth: '100vw', 
      overflowX: 'hidden' 
    }}>
      {/* 顶部栏 */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        bgcolor: 'rgba(248,252,248,0.95)', 
        backdropFilter: 'blur(8px)', 
        px: 2, 
        py: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderBottom: '1px solid #e7f3e7' 
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FitnessCenter sx={{ color: '#4c9a4c', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
            {t('practice.title', 'Practice')}
          </Typography>
        </Stack>
      </Box>

      {/* 练习内容 */}
      <Box sx={{ pb: 3 }}>
        <PracticeExercises />
      </Box>
    </Container>
  );
}