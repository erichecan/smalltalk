import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAIResponse } from '../services/ai';
import { useAuth } from '../contexts/AuthContext';
import { saveConversationHistory } from '../services/historyService';
import TopNav from '../components/TopNav';

export default function TopicInput() {
  const { t } = useTranslation('chat');
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
      setError(t('topicInput.errors.topicRequired'));
      return;
    }
    if (/^\d+$/.test(trimmed)) {
      setError(t('topicInput.errors.topicRequired'));
      return;
    }
    if (/^[\p{P}\p{S}\s]+$/u.test(trimmed)) {
      setError(t('topicInput.errors.topicRequired'));
      return;
    }
    setLoading(true);
    try {
      // 调用 AI 获取初始对话
      const initialMessages = await getAIResponse([], trimmed);
      // 拆分AI回复为5条
      const parseAIResponse = (text: string): string[] => {
        const conversations = text.match(/\[CONV\d+\]([\s\S]*?)(?=\[CONV\d+\]|$)/g) || [];
        return conversations.map(conv => conv.replace(/\[CONV\d+\]/, '').trim());
      };
      const aiMessages = parseAIResponse(initialMessages).map((text, idx) => ({
        id: idx + 2,
        sender: 'ai',
        text,
        bubbleColor: '#E8F5E9'
      }));
      if (!user || !user.id) {
        // 2025-01-30: 修复未登录用户体验 - 根据PRD要求，未登录用户只返回1句AI回复，不保存历史
        let singleReply = '';
        if (aiMessages.length > 0) {
          // 如果解析成功，取第一条
          singleReply = aiMessages[0].text;
        } else {
          // 如果解析失败，从原始回复中提取第一段有意义的内容
          const lines = initialMessages.split('\n').filter(line => 
            line.trim() && 
            !line.includes('[CONV') && 
            !line.startsWith('Q:') && 
            !line.startsWith('A:')
          );
          singleReply = lines[0] || initialMessages.substring(0, 200) + '...';
        }
        
        const singleAIMessage = {
          id: 2,
          sender: 'ai' as const,
          text: singleReply,
          bubbleColor: '#E8F5E9'
        };
        
        navigate('/dialogue', {
          state: {
            topic: trimmed,
            initialMessages: [
              { id: 1, sender: 'user' as const, text: trimmed },
              singleAIMessage
            ],
            conversationId: undefined,
            isGuest: true // 标记为游客模式
          }
        });
        setLoading(false);
        return;
      }
      // 已登录：保存历史，包含用户输入和AI回复
      const saveRes = await saveConversationHistory({
        user_id: user.id,
        topic: trimmed,
        messages: [
          { id: 1, sender: 'user', text: trimmed },
          ...aiMessages
        ]
      });
      if (saveRes.error) {
        setError(t('topicInput.errors.generateFailed'));
        setLoading(false);
        return;
      }
      // 修复：正确获取conversationId
      const conversationId = saveRes.data ? (saveRes.data as Array<{id: string}>)[0]?.id : undefined;
      console.log('[DEBUG] TopicInput创建历史记录成功:', {
        saveRes: saveRes.data,
        conversationId,
        messagesCount: aiMessages.length + 1
      });
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
    } catch (error) {
      console.error('Topic input error:', error);
      setError(t('topicInput.errors.generateFailed'));
      setLoading(false);
    }
  };

  return (
    <>
      <TopNav />
      <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fcf8', p: 2, py: 4, height: '100%' }}>
        <Box sx={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0d1b0d', mb: 3 }}>{t('topicInput.title')}</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label={t('topicInput.placeholder')}
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
                  {t('topicInput.submitting')}
                </>
              ) : (
                t('topicInput.submitButton')
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