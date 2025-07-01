import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fcf8' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h2" sx={{ color: '#4c9a4c', fontWeight: 'bold', mb: 2 }}>404</Typography>
        <Typography variant="h5" sx={{ color: '#0d1b0d', fontWeight: 'bold', mb: 2 }}>Page Not Found</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>Sorry, the page you visited does not exist.</Typography>
        <Button variant="contained" sx={{ bgcolor: '#CAECCA', color: '#111811', borderRadius: 28, px: 4, py: 1.5, fontWeight: 'bold' }} onClick={() => navigate('/')}>Back to Home</Button>
      </Box>
    </Container>
  );
}

export default NotFound; 