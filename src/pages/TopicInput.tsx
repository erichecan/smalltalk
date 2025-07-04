import { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Snackbar, CircularProgress, Paper, Stack } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageContext } from '../contexts/PageContext';
import { getAIResponse } from '../services/ai';
import { useAuth } from '../contexts/AuthContext';
import { saveConversationHistory } from '../services/historyService';

function TopicInput() {
  const { t } = useTranslation('chat');
  const { setPageState } = usePageContext();
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // 初始化页面状态 - 2025-01-30 08:49:30
  useEffect(() => {
    setPageState({
      page: '/topic'
    });
  }, [setPageState]);

  // 调试日志 - 只在开发环境输出 - 2024-12-19 16:00:00
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('TopicInput user:', user, 'isAuthenticated:', isAuthenticated);
    }
  }, [user, isAuthenticated]);

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
        sender: 'ai' as const,
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
          { id: 1, sender: 'user' as const, text: trimmed },
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
            { id: 1, sender: 'user' as const, text: trimmed },
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
          <ChatIcon sx={{ color: '#4c9a4c', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
            {t('topicInput.title')}
          </Typography>
        </Stack>
      </Box>

      {/* 主要内容区域 */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        px: 2, 
        py: 4 
      }}>
        <Paper sx={{ 
          p: 4, 
          borderRadius: 3, 
          border: '1px solid #e7f3e7', 
          boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
          width: '100%',
          maxWidth: 480
        }}>
          <Stack spacing={3} alignItems="center">
            {/* 图标和描述 */}
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'rgba(76, 154, 76, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <ChatIcon sx={{ fontSize: 40, color: '#4c9a4c' }} />
              </Box>
              <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                {t('topicInput.description', 'Enter a topic you want to practice speaking about')}
              </Typography>
            </Box>

            {/* 表单 */}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#e7f3e7',
                    },
                    '&:hover fieldset': {
                      borderColor: '#4c9a4c',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#12e712',
                    },
                  }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading}
                sx={{ 
                  bgcolor: '#4c9a4c', 
                  color: 'white', 
                  borderRadius: 2, 
                  py: 1.5, 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#12e712'
                  },
                  '&:disabled': {
                    bgcolor: '#e0e0e0',
                    color: '#666'
                  }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    {t('topicInput.submitting')}
                  </>
                ) : (
                  t('topicInput.submitButton')
                )}
              </Button>
            </form>
          </Stack>
        </Paper>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Snackbar>
      )}
    </Container>
  );
}

export default TopicInput; 