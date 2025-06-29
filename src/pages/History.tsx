import { useState, useEffect } from 'react';
import { Container, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, Button, CircularProgress, Pagination, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConversationHistory } from '../services/historyService';
import type { Message } from '../types/chat';

interface ConversationHistory {
  id: string;
  topic: string;
  messages: Message[];
  created_at: string;
}

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // 加载历史数据
  const loadHistory = async (page: number) => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError, count } = await getConversationHistory(user.uid, page, pageSize);
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setHistory(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / pageSize));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取历史
  useEffect(() => {
    loadHistory(currentPage);
  }, [user, currentPage]);

  // 处理分页变化
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // 点击历史项，直接跳转到对话页并传递历史数据
  const handleHistoryClick = (conversation: ConversationHistory) => {
    navigate('/dialogue', {
      state: {
        topic: conversation.topic,
        initialMessages: conversation.messages,
        isHistory: true // 标记这是历史数据，不需要重新请求AI
      }
    });
  };

  // 获取最后一条消息作为预览
  const getLastMessage = (messages: Message[]): string => {
    if (messages.length === 0) return 'No messages';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.text.length > 50 
      ? lastMessage.text.substring(0, 50) + '...' 
      : lastMessage.text;
  };

  // 格式化时间
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0 }}>
      {/* 顶部标题栏 */}
      <Box sx={{ bgcolor: '#CAECCA', py: 2, px: 3, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, boxShadow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>Conversation History</Typography>
        <Button variant="contained" sx={{ bgcolor: '#0ecd6a', color: '#fff', borderRadius: 20, ml: 2, fontWeight: 'bold', boxShadow: 1 }} onClick={() => navigate('/topic')}>
          发起新对话
        </Button>
      </Box>

      {/* 历史对话列表 */}
      <Box sx={{ px: 2, py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#4c9a4c' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : history.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ color: '#5D895D', mb: 2 }}>No conversation history yet</Typography>
            <Typography variant="body2" sx={{ color: '#708C70', mb: 3 }}>Start your first conversation to see it here</Typography>
            <Button variant="contained" onClick={() => navigate('/topic')} sx={{ bgcolor: '#CAECCA', color: '#111811', borderRadius: 20 }}>
              Start Conversation
            </Button>
          </Paper>
        ) : (
          <>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, mb: 2 }}>
              <List>
                {history.map((conversation) => (
                  <ListItem 
                    key={conversation.id} 
                    onClick={() => handleHistoryClick(conversation)}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: '#f0f8f0',
                        transition: 'background-color 0.2s'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#CAECCA', color: '#0d1b0d' }}>
                        {conversation.topic[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>
                          {conversation.topic}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#5D895D', mb: 0.5 }}>
                            {getLastMessage(conversation.messages)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#708C70' }}>
                            {formatTime(conversation.created_at)} • {conversation.messages.length} messages
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* 分页 */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#5D895D',
                      '&.Mui-selected': {
                        bgcolor: '#CAECCA',
                        color: '#0d1b0d',
                        '&:hover': {
                          bgcolor: '#b8e0b8'
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
} 