import { Container, Box } from '@mui/material';

import PracticeExercises from './PracticeExercises';

export default function PracticeLayout() {
  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0, width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* 直接显示练习内容 - 2025-01-30 21:23:00 */}
      <Box sx={{ pb: 10 }}>
        <PracticeExercises />
      </Box>
    </Container>
  );
}