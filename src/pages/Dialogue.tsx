import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress, Avatar, IconButton, Fade, Tooltip, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Message } from '../types/chat';
import { getAIResponse } from '../services/ai';
import { useAuth } from '../contexts/AuthContext';
import { saveConversationHistory, updateConversationHistory } from '../services/historyService';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SendIcon from '@mui/icons-material/Send';

export default function Dialogue() {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || '';
  const initialMessages = location.state?.initialMessages || '';
  const isHistory = location.state?.isHistory || false;
  const conversationId = location.state?.conversationId;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  
  // 语音识别相关状态
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  // 【2025-06-29 19:53:31】PRD需求：未登录用户体验逻辑
  // 根据产品需求文档9.2.2节：
  // - 未登录用户TopicInput页只返回1句AI回复，不保存历史
  // - Dialogue页仅允许体验一轮，输入框和发送按钮在收到AI回复后禁用
  // - 再次尝试发言会提示"请登录后体验多轮对话"
  const isGuest = !isAuthenticated;
  const guestHasInteracted = useMemo(() => {
    // 判断未登录用户是否已经体验过一轮对话（收到过AI回复）
    return isGuest && messages.some(m => m.sender === 'ai');
  }, [isGuest, messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 只在用户发送消息时滚动到底部
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // 新增：监听消息变化，自动保存到历史记录
  useEffect(() => {
    const updateHistory = async () => {
      if (
        isAuthenticated &&
        messages.length > 1 &&
        user?.id &&
        currentConversationId
      ) {
        try {
          console.log('[DEBUG] updateHistory triggered:', currentConversationId, messages);
          const res = await updateConversationHistory(currentConversationId, messages);
          if (res.error) {
            console.error('[DEBUG] 更新历史失败', res.error);
          } else {
            console.log('[DEBUG] 历史更新成功', res);
          }
        } catch (e) {
          console.warn('[DEBUG] 更新历史记录异常', e);
        }
      }
    };

    if (messages.length > 1 && currentConversationId) {
      updateHistory();
    }
  }, [messages, currentConversationId, isAuthenticated, user?.id]);

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // 【2025-06-29 19:54:15】修复初始化逻辑
        console.log('[DEBUG] initializeConversation called:', { isHistory, initialMessages, topic });
        
        if (isHistory && initialMessages) {
          // 历史模式：直接展示历史消息，不请求AI
          console.log('[DEBUG] History mode, setting messages:', initialMessages);
          setMessages(initialMessages);
          setIsInitializing(false);
          return;
        }
        
        // 如果有 initialMessages（数组），直接用它初始化
        if (Array.isArray(initialMessages) && initialMessages.length > 0) {
          console.log('[DEBUG] Using initialMessages:', initialMessages);
          setMessages(initialMessages);
          setIsInitializing(false);
          return;
        }
        
        // 默认情况：清空消息列表
        console.log('[DEBUG] Setting empty messages array');
        setMessages([]);
      } catch (error) {
        console.error('Error initializing conversation:', error);
        setMessages([]);
      } finally {
        setIsInitializing(false);
      }
    };
    
    if (topic) {
      initializeConversation();
    }
  }, [topic, initialMessages, isHistory]);

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // 可以根据需要改为 'zh-CN'
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('请允许麦克风权限以使用语音输入');
        } else {
          setError('语音识别失败，请重试');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // 语音输入处理
  const handleVoiceInput = () => {
    if (!speechSupported) {
      setError('您的浏览器不支持语音识别');
      return;
    }
    
    if (isListening) {
      speechRecognition?.stop();
    } else {
      speechRecognition?.start();
    }
  };

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
    
    // 【PRD需求】未登录用户限制逻辑：
    // 根据产品需求文档9.2.2节：再次尝试发言会提示"请登录后体验多轮对话"
    if (guestHasInteracted) {
      setError('请登录后体验多轮对话');
      return;
    }

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
      // 【PRD需求】未登录用户AI回复逻辑：
      // 根据产品需求文档9.2.2节：未登录用户只能体验一轮对话
      // 收到回复后，guestHasInteracted变为true，触发输入框禁用和登录引导
      if (isGuest) {
        const aiResponse = await getAIResponse(newMessages, topic);
        const aiBubbleColor = '#E8F5E9';
        const aiMessage: Message = {
          id: newMessages.length + 1,
          sender: 'ai',
          text: aiResponse,
          bubbleColor: aiBubbleColor
        };
        setMessages([...newMessages, aiMessage]);
        setIsLoading(false);
        return;
      }

      // 已登录用户：获取AI回复
      const aiResponse = await getAIResponse(newMessages, topic);
      const aiBubbleColor = '#E8F5E9';
      const aiMessage: Message = {
        id: newMessages.length + 1,
        sender: 'ai',
        text: aiResponse,
        bubbleColor: aiBubbleColor
      };
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // 如果没有conversationId，说明是新对话，需要创建历史记录
      if (!currentConversationId && isAuthenticated && user?.id) {
        try {
          const saveRes = await saveConversationHistory({
            user_id: user.id,
            topic,
            messages: updatedMessages,
          });
          if (saveRes.data && (saveRes.data as any[]).length > 0) {
            setCurrentConversationId((saveRes.data as any[])[0].id);
          }
        } catch (e) {
          console.warn('创建历史记录失败', e);
        }
      }
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
          <>
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
            
            {/* 【PRD需求】未登录用户登录引导界面 */}
            {/* 根据产品需求文档9.2.2节：
                - 未登录用户体验一轮后，底部提示"登录可继续多轮对话"
                - 显示条件：isGuest && guestHasInteracted
                - 确保用户先体验一轮完整对话，然后被引导登录 */}
            {isGuest && guestHasInteracted && (
              <Box sx={{ 
                position: 'relative',
                mt: 2,
                height: 200,
                background: 'linear-gradient(180deg, rgba(248,252,248,0) 0%, rgba(248,252,248,0.8) 50%, rgba(248,252,248,1) 100%)',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(202,236,202,0.3)'
              }}>
                {/* 模拟更多对话内容的模糊预览 */}
                <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.3,
                  pointerEvents: 'none'
                }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start',
                      alignItems: 'flex-end',
                      gap: 1,
                      mb: 2,
                      opacity: 0.6
                    }}>
                      <Avatar 
                        src="/src/assets/images/ai_avatar.png"
                        sx={{ width: 24, height: 24, opacity: 0.5 }}
                      />
                      <Box sx={{
                        width: 200 + Math.random() * 100,
                        height: 20 + Math.random() * 30,
                        bgcolor: '#E8F5E9',
                        borderRadius: '12px 12px 12px 4px',
                        opacity: 0.4
                      }} />
                    </Box>
                  ))}
                </Box>
                
                {/* 登录引导 */}
                <Box sx={{ 
                  position: 'relative',
                  zIndex: 1,
                  textAlign: 'center',
                  p: 3
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#0d1b0d', 
                    fontWeight: 'bold',
                    mb: 1
                  }}>
                    还有更多精彩对话
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#5D895D',
                    mb: 2
                  }}>
                    登录后体验完整的多轮AI对话
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/login')}
                    sx={{ 
                      bgcolor: '#CAECCA', 
                      color: '#111811', 
                      borderRadius: 20,
                      fontWeight: 'bold',
                      px: 3,
                      py: 1,
                      '&:hover': {
                        bgcolor: '#b8e0b8'
                      }
                    }}
                  >
                    立即登录
                  </Button>
                </Box>
              </Box>
            )}
          </>
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
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        bgcolor: '#f8fcf8', 
        borderTop: '1px solid #e7f3e7',
        display: 'flex', 
        alignItems: 'flex-end',
        gap: 1
      }}>
        {/* 【2025-06-29 19:54:45】修复Tooltip警告：为禁用按钮添加span包装器 */}
        <Tooltip title={speechSupported ? (isListening ? '停止录音' : '开始语音输入') : '浏览器不支持语音识别'}>
          <span>
            <IconButton 
              onClick={handleVoiceInput}
              disabled={!speechSupported}
              sx={{ 
                bgcolor: isListening ? '#ffebee' : 'white',
                border: `1px solid ${isListening ? '#f44336' : '#e7f3e7'}`,
                borderRadius: '50%',
                width: 40,
                height: 40,
                color: isListening ? '#f44336' : '#4c9a4c',
                '&:hover': {
                  bgcolor: isListening ? '#ffcdd2' : '#f0f9f0',
                  borderColor: isListening ? '#f44336' : '#4c9a4c'
                },
                '&:disabled': {
                  bgcolor: '#f5f5f5',
                  borderColor: '#e0e0e0',
                  color: '#bdbdbd'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </span>
        </Tooltip>

        {/* 输入框容器 */}
        <Box 
          component="form" 
          onSubmit={handleSend}
          sx={{ 
            flex: 1,
            position: 'relative',
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #e7f3e7',
            '&:focus-within': {
              borderColor: '#4c9a4c',
              boxShadow: '0 0 0 2px rgba(76, 154, 76, 0.1)'
            }
          }}
        >
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
            placeholder="Type your message..."
            variant="outlined"
            multiline
            maxRows={4}
            disabled={isLoading || (isGuest && guestHasInteracted)} // 【PRD需求】未登录用户体验完一轮后禁用输入
            fullWidth
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                border: 'none',
                borderRadius: 3,
                pr: 6, // 为发送按钮留出空间
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
                '& textarea': {
                  fontSize: 16,
                  lineHeight: 1.4,
                  py: 1.5,
                  '&::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                  }
                }
              }
            }}
          />
          
          {/* 发送按钮 */}
          <IconButton 
            type="submit"
            disabled={isLoading || !input.trim() || (isGuest && guestHasInteracted)} // 【PRD需求】未登录用户体验完一轮后禁用发送
            sx={{ 
              position: 'absolute', 
              right: 8, 
              bottom: 8,
              bgcolor: input.trim() ? '#4c9a4c' : '#e7f3e7',
              color: input.trim() ? 'white' : '#9ca3af',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: input.trim() ? '#3d7a3d' : '#e7f3e7',
              },
              '&:disabled': {
                bgcolor: '#e7f3e7',
                color: '#9ca3af'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
      {/* 【PRD需求】未登录用户底部提示 */}
      {/* 根据产品需求文档9.2.2节：底部提示"登录可继续多轮对话" */}
      {isGuest && guestHasInteracted && (
        <Alert severity="info" sx={{ mt: 2 }}>
          登录可继续多轮对话，体验完整 AI 互动！
        </Alert>
      )}
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