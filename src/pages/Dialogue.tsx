import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress, Avatar, IconButton, Fade, Tooltip, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Message } from '../types/chat';
import { getAIResponse } from '../services/ai';
import { useAuth } from '../contexts/AuthContext';
import { saveConversationHistory, updateConversationHistory } from '../services/historyService';
import { vocabularyService } from '../services/learningService';

function Dialogue() {
  const { t } = useTranslation('chat');
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || '';
  const initialMessages = location.state?.initialMessages || '';
  const isHistory = location.state?.isHistory || false;
  const conversationId = location.state?.conversationId;
  const isGuestMode = location.state?.isGuest || false; // 2025-01-30: 添加游客模式标记支持
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  // 2025-01-30 16:45:32: 重构选词功能 - 改为双击添加，移除选择相关状态
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [wordAddSuccess, setWordAddSuccess] = useState<string | null>(null);
  const [highlightedWord, setHighlightedWord] = useState<{word: string, element: HTMLElement} | null>(null);
  const [showUsageTip, setShowUsageTip] = useState(true);

  // 2025-01-30 16:46:15: 实现双击事件处理和单词边界检测
  const extractWordAtPosition = (text: string, position: number): { word: string; start: number; end: number } | null => {
    // 定义单词字符（字母、数字、连字符、撇号）
    const wordRegex = /[a-zA-Z0-9'-]/;
    
    // 如果点击位置不是单词字符，返回null
    if (!wordRegex.test(text[position])) {
      return null;
    }
    
    // 向前查找单词开始位置
    let start = position;
    while (start > 0 && wordRegex.test(text[start - 1])) {
      start--;
    }
    
    // 向后查找单词结束位置
    let end = position;
    while (end < text.length - 1 && wordRegex.test(text[end + 1])) {
      end++;
    }
    
    const word = text.substring(start, end + 1);
    
    // 验证是否为有效英文单词（至少包含一个字母，长度大于1）
    if (word.length > 1 && /[a-zA-Z]/.test(word)) {
      return { word, start, end };
    }
    
    return null;
  };

  // 2025-01-30 16:47:30: 处理双击事件
  const handleDoubleClick = async (event: React.MouseEvent, messageText: string) => {
    console.log('handleDoubleClick called, isAuthenticated:', isAuthenticated);
    
    // 只有登录用户才能使用选词功能
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping word selection');
      return;
    }

    // 防止正在添加词汇时重复操作
    if (isAddingWord) {
      return;
    }

    const target = event.target as HTMLElement;
    let clickPosition = -1;
    let wordInfo: { word: string; start: number; end: number } | null = null;

    // 2025-01-30 16:50:45: 优先使用浏览器选择API获取双击的单词
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      // 验证是否为有效英文单词
      if (/^[a-zA-Z0-9'-]+$/.test(selectedText) && selectedText.length > 1 && /[a-zA-Z]/.test(selectedText)) {
        console.log('Valid word from selection:', selectedText);
        await addWordToVocabulary(selectedText, target);
        // 清除选择
        selection.removeAllRanges();
        return;
      }
    }

    // 2025-01-30 16:51:15: Fallback方案 - 使用caretRangeFromPoint
    try {
      const range = document.caretRangeFromPoint ? 
        document.caretRangeFromPoint(event.clientX, event.clientY) :
        (document as any).caretPositionFromPoint?.(event.clientX, event.clientY);
      
      if (range) {
        const textNode = range.startContainer || range.offsetNode;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          clickPosition = range.startOffset || range.offset || 0;
          wordInfo = extractWordAtPosition(messageText, clickPosition);
        }
      }
    } catch (error) {
      console.log('caretRangeFromPoint not supported or failed:', error);
    }

    // 2025-01-30 16:52:00: 最后的fallback - 简单的词汇匹配
    if (!wordInfo) {
      console.log('Using fallback word extraction');
      // 使用正则表达式找到所有单词，并根据鼠标位置估算最近的单词
      const words = messageText.match(/[a-zA-Z0-9'-]+/g);
      if (words && words.length > 0) {
        // 简单选择第一个有效单词作为fallback
        const firstValidWord = words.find(word => word.length > 1 && /[a-zA-Z]/.test(word));
        if (firstValidWord) {
          console.log('Using first valid word as fallback:', firstValidWord);
          await addWordToVocabulary(firstValidWord, target);
          return;
        }
      }
    }
    
    if (wordInfo) {
      console.log('Valid word found:', wordInfo.word);
      await addWordToVocabulary(wordInfo.word, target);
    } else {
      console.log('No valid word found at click position');
    }
  };

  // 2025-01-30 16:48:45: 添加词汇到词汇表的核心逻辑
  const addWordToVocabulary = async (word: string, element: HTMLElement) => {
    if (!user) return;
    
    setIsAddingWord(true);
    
    // 添加高亮效果
    setHighlightedWord({ word, element });
    
    try {
      console.log('Starting to add word:', word, 'for user:', user.id);
      const result = await vocabularyService.addVocabularyWithAI(user.id, word);
      console.log('Word operation result:', result);
      
      // 根据是否是已存在的单词显示不同的成功消息
      const isUpdate = result.lastReviewed && new Date(result.lastReviewed).getTime() > Date.now() - 10000; // 10秒内更新的
      setWordAddSuccess(isUpdate ? `已更新: ${word}` : `已添加: ${word}`);
      
      // 3秒后清除成功消息和高亮
      setTimeout(() => {
        setWordAddSuccess(null);
        setHighlightedWord(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error adding word to vocabulary:', error);
      setWordAddSuccess(null);
      setHighlightedWord(null);
    } finally {
      setIsAddingWord(false);
    }
  };

  // 调试：打印conversationId的传递情况
  useEffect(() => {
    console.log('[DEBUG] Dialogue页面初始化参数:', {
      topic,
      conversationId,
      isHistory,
      initialMessagesLength: Array.isArray(initialMessages) ? initialMessages.length : 'not array',
      currentConversationId
    });
  }, [topic, conversationId, isHistory, initialMessages, currentConversationId]);

  // 新增：未登录用户只返回一轮AI
  const isGuest = !isAuthenticated;
  // 新增：未登录用户是否已体验过一轮
  const guestHasInteracted = useMemo(() => {
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

  // Parse AI response into multiple messages
  // Currently not used but keeping for future implementation
  // const parseAIResponse = (text: string): string[] => {
  //   const conversations = text.match(/\[CONV\d+\]([\s\S]*?)(?=\[CONV\d+\]|$)/g) || [];
  //   return conversations.map(conv => conv.replace(/\[CONV\d+\]/, '').trim());
  // };

  // 保存历史到 Supabase功能已通过其他方式实现

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
        if (isHistory && initialMessages) {
          // 历史模式：直接展示历史消息，不请求AI
          setMessages(initialMessages);
          setIsInitializing(false);
          return;
        }
        // 新增：如果有 initialMessages（数组），直接用它初始化
        if (Array.isArray(initialMessages) && initialMessages.length > 0) {
          setMessages(initialMessages);
          setIsInitializing(false);
          return;
        }
        // 兼容老逻辑
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySnackbar, setCopySnackbar] = useState(false);

  // 检查话题是否存在，如果没有则跳转
  useEffect(() => {
    if (!topic) {
      navigate('/topic');
    }
  }, [topic, navigate]);

  if (!topic) {
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
      // 未登录用户只返回一轮
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

      // 只有在真正没有conversationId的情况下才创建新的历史记录
      // 从TopicInput或History页面跳转来的都应该有conversationId
      if (!currentConversationId && isAuthenticated && user?.id) {
        try {
          console.log('[DEBUG] 创建新的历史记录，因为没有conversationId');
          const saveRes = await saveConversationHistory({
            user_id: user.id,
            topic,
            messages: updatedMessages,
          });
          if (saveRes.data && (saveRes.data as Array<{id: string}>).length > 0) {
            const newConversationId = (saveRes.data as Array<{id: string}>)[0].id;
            setCurrentConversationId(newConversationId);
            console.log('[DEBUG] 新历史记录创建成功，ID:', newConversationId);
          }
        } catch (error) {
          console.warn('创建历史记录失败', error);
        }
      } else if (currentConversationId) {
        console.log('[DEBUG] 使用现有conversationId:', currentConversationId, '更新历史记录');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: 'ai',
        text: error instanceof Error ? error.message : 'Failed to get AI response. Please try again.',
        bubbleColor: '#FFEBEE'
      };
      setMessages([...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fcf8', p: 0, width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
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
                    px: 2, py: 1, maxWidth: 'min(320px, calc(100vw - 100px))', wordBreak: 'break-word',
                    bgcolor: msg.sender === 'user' ? '#CAECCA' : (msg.bubbleColor || '#fff'),
                    color: '#0d1b0d',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    boxShadow: 1,
                    position: 'relative',
                    '&:hover .copy-button': {
                      opacity: 1,
                    }
                  }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-line',
                        userSelect: msg.sender === 'ai' && isAuthenticated ? 'text' : 'auto',
                        cursor: msg.sender === 'ai' && isAuthenticated ? 'pointer' : 'default',
                        // 2025-01-30 16:49:20: 双击提示样式 - 简化实现
                        '&:hover': msg.sender === 'ai' && isAuthenticated ? {
                          bgcolor: 'rgba(202, 236, 202, 0.1)',
                          borderRadius: 1,
                          transition: 'background-color 0.2s ease'
                        } : {}
                      }}
                      onDoubleClick={msg.sender === 'ai' && isAuthenticated ? (e) => handleDoubleClick(e, msg.text) : undefined}
                    >
                      {msg.text}
                    </Typography>
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
            
            {/* 未登录用户的模糊遮罩效果 */}
            {isGuest && (
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

              {/* 添加成功提示 */}
        {wordAddSuccess && (
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1001,
              bgcolor: '#4caf50',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography variant="body2">
              {wordAddSuccess}
            </Typography>
          </Box>
        )}

      {/* 使用提示 - 仅在登录状态下首次显示 */}
      {isAuthenticated && showUsageTip && messages.some(m => m.sender === 'ai') && (
        <Box sx={{ px: 2, py: 1 }}>
          <Alert 
            severity="info" 
            onClose={() => setShowUsageTip(false)}
            sx={{ 
              bgcolor: '#e8f5e9', 
              color: '#2e7d32',
              fontSize: '0.85rem',
              '& .MuiAlert-icon': { color: '#4caf50' }
            }}
          >
            💡 双击AI回复中的英文单词可快速添加到词汇表
          </Alert>
        </Box>
      )}

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
            disabled={isLoading || (isGuest && guestHasInteracted)}
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
          disabled={isLoading || !input.trim() || (isGuest && guestHasInteracted)}
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

export default Dialogue;