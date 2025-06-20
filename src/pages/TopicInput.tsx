import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAIResponse } from '../services/ai';

export default function TopicInput() {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setLoading(true);
    try {
      // 调用 AI 获取初始对话
      const initialMessages = await getAIResponse([], topic);
      // 跳转到 /dialogue，并传递话题和初始消息
      navigate('/dialogue', { 
        state: { 
          topic,
          initialMessages 
        } 
      });
    } catch (err) {
      setError('Failed to generate conversation. Please try again.');
      setLoading(false);
    }
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
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading}
            sx={{ 
              bgcolor: '#CAECCA', 
              color: '#111811', 
              borderRadius: 28, 
              py: 1.5, 
              fontWeight: 'bold', 
              mb: 2,
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#666'
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Generating Conversation...
              </>
            ) : (
              'Start Conversation'
            )}
          </Button>
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