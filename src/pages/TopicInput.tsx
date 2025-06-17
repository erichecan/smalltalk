import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function TopicInput() {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    // 跳转到 /dialogue，并传递话题参数
    navigate('/dialogue', { state: { topic } });
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fcf8', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0d1b0d', mb: 3 }}>What do you want to talk about?</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Enter a topic (e.g. travel, food, hobbies)"
            variant="outlined"
            fullWidth
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#CAECCA', color: '#111811', borderRadius: 28, py: 1.5, fontWeight: 'bold', mb: 2 }}>Start Conversation</Button>
        </form>
      </Box>
      {error && (
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Snackbar>
      )}
    </Container>
  );
} 