import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress, Avatar, IconButton, Fade, Tooltip, Snackbar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Message } from '../types/chat';
import { getAIResponse } from '../services/ai';

export default function Dialogue() {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || '';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Parse AI response into multiple messages
  const parseAIResponse = (text: string): string[] => {
    const conversations = text.match(/\[CONV\d+\]([\s\S]*?)(?=\[CONV\d+\]|$)/g) || [];
    return conversations.map(conv => conv.replace(/\[CONV\d+\]/, '').trim());
  };

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // 立即显示用户输入的主题作为第一条消息
        setMessages([{
          id: 1,
          sender: 'user',
          text: `Topic: ${topic}`
        }]);
        
        // 获取AI对主题的响应
        const response = await getAIResponse(topic, '');
        const conversations = parseAIResponse(response);
        
        // 使用固定的浅绿色背景
        const aiBubbleColor = '#E8F5E9';
        
        const initialMessages = conversations.map((text, index) => {
          // 在句和问句之间添加换行
          const formattedText = text.replace(/([^.!?]+[.!?])(\s+)([^.!?]+[.!?])/g, '$1\n\n$3');
          
          return {
            id: index + 2, // 从2开始，因为第一条是用户消息
            sender: 'ai',
            text: formattedText,
            bubbleColor: aiBubbleColor
          };
        });
        
        setMessages(prev => [...prev, ...initialMessages]);
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
  }, [topic]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySnackbar, setCopySnackbar] = useState(false);

  if (!topic) {
    navigate('/topic-input');
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

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await getAIResponse([...messages, userMessage], topic);
      const conversations = parseAIResponse(aiResponse);
      
      // 使用固定的浅绿色背景
      const aiBubbleColor = '#E8F5E9';
      
      let newMessages = [...messages, userMessage];
      conversations.forEach((text) => {
        // 在句和问句之间添加换行
        const formattedText = text.replace(/([^.!?]+[.!?])(\s+)([^.!?]+[.!?])/g, '$1\n\n$3');
        
        const aiMessage: Message = {
          id: newMessages.length + 1,
          sender: 'ai',
          text: formattedText,
          bubbleColor: aiBubbleColor
        };
        newMessages.push(aiMessage);
      });
      
      setMessages(newMessages);
    } catch (err) {
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: 'ai',
        text: err instanceof Error ? err.message : 'Failed to get AI response. Please try again.',
        bubbleColor: '#FFEBEE' // 错误消息使用红色背景
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fcf8', p: 0 }}>
      {/* 顶部话题栏 */}
      <Box sx={{ 
        bgcolor: '#CAECCA', 
        py: 2, 
        px: 3, 
        borderBottomLeftRadius: 16, 
        borderBottomRightRadius: 16, 
        boxShadow: 1,
        display: 'flex',
        alignItems: 'center'
      }}>
        <IconButton 
          onClick={() => navigate('/topic-input')} 
          sx={{ mr: 1, color: '#0d1b0d' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>{topic}</Typography>
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