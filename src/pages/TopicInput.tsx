import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAIResponse } from '../services/ai';
import { useAuth } from '../contexts/AuthContext';
import { saveConversationHistory } from '../services/historyService';
import TopNav from '../components/TopNav';

export default function TopicInput() {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  console.log('TopicInput user:', user, 'isAuthenticated:', isAuthenticated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = topic.trim();
    // 校验：长度≥5，不能全是空白，不能全是数字，不能全是标点/特殊符号
    if (!trimmed || trimmed.length < 5) {
      setError('Topic must be at least 5 characters.');
      return;
    }
    if (/^\d+$/.test(trimmed)) {
      setError('Topic cannot be only numbers.');
      return;
    }
    if (/^[\p{P}\p{S}\s]+$/u.test(trimmed)) {
      setError('Topic cannot be only special characters or punctuation.');
      return;
    }
    setLoading(true);
    try {
      // 【2025-06-29 19:56:00】调用AI获取初始对话并解析
      const initialMessages = await getAIResponse([], trimmed);
      console.log('[DEBUG] Raw AI response:', initialMessages);
      
      // 拆分AI回复为5条
      const parseAIResponse = (text: string): string[] => {
        const conversations = text.match(/\[CONV\d+\]([\s\S]*?)(?=\[CONV\d+\]|$)/g) || [];
        return conversations.map(conv => conv.replace(/\[CONV\d+\]/, '').trim());
      };
      
      const parsedConversations = parseAIResponse(initialMessages);
      console.log('[DEBUG] Parsed conversations:', parsedConversations);
      
      const aiMessages = parsedConversations.map((text, idx) => ({
        id: idx + 2,
        sender: 'ai',
        text,
        bubbleColor: '#E8F5E9'
      }));
      console.log('[DEBUG] AI messages:', aiMessages);
      if (!user || !user.id) {
        // 【2025-06-29 19:55:30】修复未登录用户逻辑：
        // 未登录用户只体验一轮对话，传递用户输入和第一条AI回复
        const firstAIMessage = parsedConversations[0];
        navigate('/dialogue', {
          state: {
            topic: trimmed,
            initialMessages: [
              { id: 1, sender: 'user', text: trimmed },
              { id: 2, sender: 'ai', text: firstAIMessage, bubbleColor: '#E8F5E9' }
            ],
            conversationId: undefined
          }
        });
        setLoading(false);
        return;
      }
      // 【2025-06-29 19:55:45】已登录用户逻辑：保存完整的5轮对话历史
      const saveRes = await saveConversationHistory({
        user_id: user.id,
        topic: trimmed,
        messages: [
          { id: 1, sender: 'user', text: trimmed },
          ...aiMessages
        ]
      });
      if (saveRes.error) {
        setError('Failed to save conversation.');
        setLoading(false);
        return;
      }
      // 修复：正确获取conversationId
      const conversationId = saveRes.data ? (saveRes.data as any[])[0]?.id : undefined;
      navigate('/dialogue', { 
        state: { 
          topic: trimmed,
          initialMessages: [
            { id: 1, sender: 'user', text: trimmed },
            ...aiMessages
          ],
          conversationId
        } 
      });
    } catch (err) {
      setError('Failed to generate conversation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <TopNav />
      <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fcf8', p: 2, py: 4, height: '100%' }}>
        <Box sx={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0d1b0d', mb: 3 }}>What do you want to talk about?</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Enter a topic (e.g. travel, food, hobbies)"
              variant="outlined"
              fullWidth
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                // 输入合规时清除 error
                const trimmed = e.target.value.trim();
                if (
                  error &&
                  trimmed.length >= 5 &&
                  !/^\d+$/.test(trimmed) &&
                  !/^[\p{P}\p{S}\s]+$/u.test(trimmed)
                ) {
                  setError(null);
                }
              }}
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
    </>
  );
} 