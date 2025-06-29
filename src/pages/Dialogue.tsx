import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress, Avatar, IconButton, Fade, Tooltip, Snackbar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Message } from '../types/chat';
import { getAIResponse } from '../services/ai';
import { useAuth } from '../contexts/AuthContext';
import { saveConversationHistory } from '../services/historyService';

export default function Dialogue() {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || '';
  const initialMessages = location.state?.initialMessages || '';
  const isHistory = location.state?.isHistory || false;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 只在用户发送消息时滚动到底部
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Parse AI response into multiple messages
  const parseAIResponse = (text: string): string[] => {
    const conversations = text.match(/\[CONV\d+\]([\s\S]*?)(?=\[CONV\d+\]|$)/g) || [];
    return conversations.map(conv => conv.replace(/\[CONV\d+\]/, '').trim());
  };

  // 保存历史到 Supabase
  const saveHistoryToCloud = useCallback(async (currentMessages: Message[]) => {
    if (user && user.uid && topic && currentMessages.length > 0) {
      try {
        await saveConversationHistory({
          user_id: user.uid,
          topic,
          messages: currentMessages,
        });
      } catch (e) {
        // 可选：console.warn('保存历史失败', e);
      }
    }
  }, [user, topic]);

  // 初始化对话后保存历史
  useEffect(() => {
    if (!isInitializing && messages.length > 0) {
      saveHistoryToCloud(messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing]);

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        if (isHistory && initialMessages) {
          // 历史模式：直接展示历史消息，不请求AI
          setMessages(initialMessages);
          setIsInitializing(false);
          return;
        }

        setMessages([{
          id: 1,
          sender: 'user',
          text: `Topic: ${topic}`
        }]);
        if (initialMessages) {
          const conversations = parseAIResponse(initialMessages);
          const aiBubbleColor = '#E8F5E9';
          const aiMessages: Message[] = conversations.map((text, index) => {
            const formattedText = text.replace(/([^.!?]+[.!?])(\s+)([^.!?]+[.!?])/g, '$1\n\n$3');
            return {
              id: index + 2,
              sender: 'ai',
              text: formattedText,
              bubbleColor: aiBubbleColor
            };
          });
          setMessages([{
            id: 1,
            sender: 'user',
            text: `Topic: ${topic}`
          }, ...aiMessages]);
        } else {
          const response = await getAIResponse([], topic);
          const conversations = parseAIResponse(response);
          const aiBubbleColor = '#E8F5E9';
          const aiMessages: Message[] = conversations.map((text, index) => {
            const formattedText = text.replace(/([^.!?]+[.!?])(\s+)([^.!?]+[.!?])/g, '$1\n\n$3');
            return {
              id: index + 2,
              sender: 'ai',
              text: formattedText,
              bubbleColor: aiBubbleColor
            };
          });
          setMessages([{
            id: 1,
            sender: 'user',
            text: `Topic: ${topic}`
          }, ...aiMessages]);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        setMessages([{
          id: 1,
          sender: 'ai',
          text: 'I apologize, but I encountered an error while generating the initial conversation. Please try again.'
        }]);
      } finally {
        setIsInitializing(false);
      }
    };
    if (topic) {
      initializeConversation();
    }
  }, [topic, initialMessages, isHistory]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySnackbar, setCopySnackbar] = useState(false);

  if (!topic) {
    // 如果没有话题，自动跳转到 /topic
    useEffect(() => {
      navigate('/topic');
    }, [navigate]);
    return null;
  }

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySnackbar(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: input.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await getAIResponse(newMessages, topic);
      const conversations = parseAIResponse(aiResponse);
      const aiBubbleColor = '#E8F5E9';
      let updatedMessages = [...newMessages];
      conversations.forEach((text) => {
        const formattedText = text.replace(/([^.!?]+[.!?])(\s+)([^.!?]+[.!?])/g, '$1\n\n$3');
        const aiMessage: Message = {
          id: updatedMessages.length + 1,
          sender: 'ai',
          text: formattedText,
          bubbleColor: aiBubbleColor
        };
        updatedMessages.push(aiMessage);
      });
      setMessages(updatedMessages);
      saveHistoryToCloud(updatedMessages);
    } catch (err) {
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: 'ai',
        text: err instanceof Error ? err.message : 'Failed to get AI response. Please try again.',
        bubbleColor: '#FFEBEE'
      };
      setMessages([...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fcf8', p: 0 }}>
      {/* 顶部话题栏 - 微信风格 */}
      <Box sx={{ 
        bgcolor: '#CAECCA', 
        py: 1.5, 
        px: 2, 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%'
      }}>
        {/* 左上角 History 按钮 */}
        <IconButton 
          onClick={() => navigate('/history')} 
          sx={{ 
            position: 'absolute', 
            left: 8, 
            color: '#0d1b0d' 
          }}
        >
          <HistoryIcon />
        </IconButton>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#0d1b0d', 
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: '70%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {topic}
          {isHistory && (
            <Typography 
              component="span" 
              variant="caption" 
              sx={{ 
                display: 'block', 
                color: '#5D895D', 
                fontSize: '0.7rem',
                fontWeight: 'normal'
              }}
            >
              (History)
            </Typography>
          )}
        </Typography>
      </Box>
      {/* 消息列表 */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 3, position: 'relative' }}>
        {isInitializing ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%'
          }}>
            <CircularProgress sx={{ color: '#4c9a4c' }} />
          </Box>
        ) : (
          <Stack spacing={2}>
          {messages.map((msg) => (
            <Fade key={msg.id} in={true} timeout={400}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: 1
              }}>
                {msg.sender === 'ai' && (
                  <Avatar 
                    src="/src/assets/images/ai_avatar.png"
                    sx={{ 
                      width: 32, 
                      height: 32
                    }}
                  />
                )}
                <Paper sx={{
                  px: 2, py: 1, maxWidth: 320,
                  bgcolor: msg.sender === 'user' ? '#CAECCA' : (msg.bubbleColor || '#fff'),
                  color: '#0d1b0d',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: 1,
                  position: 'relative',
                  '&:hover .copy-button': {
                    opacity: 1,
                  }
                }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{msg.text}</Typography>
                  <Tooltip title="复制">
                    <IconButton
                      className="copy-button"
                      size="small"
                      onClick={() => handleCopyMessage(msg.text)}
                      sx={{
                        position: 'absolute',
                        right: 4,
                        top: 4,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        color: '#666',
                        '&:hover': {
                          color: '#333',
                        }
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
                {msg.sender === 'user' && (
                  <Avatar 
                    src="/src/assets/images/user_avatar.png"
                    sx={{ 
                      width: 32, 
                      height: 32
                    }}
                  />
                )}
              </Box>
            </Fade>
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
        )}
        <div ref={messagesEndRef} />
      </Box>
      {/* 错误提示 */}
      {error && (
        <Box sx={{ px: 2, py: 1 }}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Box>
      )}
      {/* 底部输入栏 */}
      <Box component="form" onSubmit={handleSend} sx={{ px: 2, py: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f8fcf8', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', flex: 1, mr: 2 }}>
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSend(e);
                }
              }
            }}
            placeholder="按Enter发送消息，Shift+Enter换行..."
            variant="outlined"
            size="small"
            multiline
            maxRows={4}
            disabled={isLoading}
            fullWidth
            sx={{ 
              borderRadius: 2, 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2,
                pr: input ? 5 : 2 // 当有输入内容时，为清除按钮留出空间
              }
            }}
          />
          {input && (
            <IconButton 
              size="small" 
              onClick={() => setInput('')}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'text.secondary'
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
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
      <Snackbar
        open={copySnackbar}
        autoHideDuration={2000}
        onClose={() => setCopySnackbar(false)}
        message="消息已复制"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Container>
  );
}