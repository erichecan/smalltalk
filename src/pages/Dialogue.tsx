import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Message } from '../types/chat';
import { getAIResponse } from '../services/ai';

export default function Dialogue() {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || '';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: `Hi! I'm excited to talk about ${topic} with you. What would you like to discuss?` }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!topic) {
    return <Alert severity="warning">No topic provided. Please go back and enter a topic.</Alert>;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await getAIResponse([...messages, userMessage], topic);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'ai',
          text: aiResponse
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fcf8', p: 0 }}>
      {/* 顶部话题栏 */}
      <Box sx={{ bgcolor: '#CAECCA', py: 2, px: 3, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>{topic}</Typography>
      </Box>
      {/* 消息列表 */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 3 }}>
        <Stack spacing={2}>
          {messages.map((msg) => (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <Paper sx={{
                px: 2, py: 1, maxWidth: 320,
                bgcolor: msg.sender === 'user' ? '#CAECCA' : '#fff',
                color: '#0d1b0d',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                boxShadow: 1,
              }}>
                <Typography variant="body1">{msg.text}</Typography>
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Paper sx={{
                px: 2, py: 1,
                bgcolor: '#fff',
                color: '#0d1b0d',
                borderRadius: '18px 18px 18px 4px',
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CircularProgress size={16} sx={{ color: '#4c9a4c' }} />
                <Typography variant="body2" sx={{ color: '#5D895D' }}>AI is typing...</Typography>
              </Paper>
            </Box>
          )}
        </Stack>
      </Box>
      {/* 错误提示 */}
      {error && (
        <Box sx={{ px: 2, py: 1 }}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Box>
      )}
      {/* 底部输入栏 */}
      <Box component="form" onSubmit={handleSend} sx={{ px: 2, py: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f8fcf8', display: 'flex', alignItems: 'center' }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          variant="outlined"
          size="small"
          disabled={isLoading}
          sx={{ flex: 1, mr: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={isLoading || !input.trim()}
          sx={{ 
            bgcolor: '#CAECCA', 
            color: '#111811', 
            borderRadius: 28, 
            fontWeight: 'bold', 
            px: 3,
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
} 