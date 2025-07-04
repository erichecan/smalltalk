import { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, Button, CircularProgress, Pagination, Alert, Checkbox, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { usePageContext } from '../contexts/PageContext';
import { getConversationHistory, deleteConversationHistory, deleteMultipleConversations, toggleBookmarkConversation } from '../services/historyService';
import type { Message } from '../types/chat';

interface ConversationHistory {
  id: string;
  topic: string;
  messages: Message[];
  created_at: string;
  bookmarked?: boolean; // 添加收藏字段 - 2025-01-30 15:45:30
}

function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('chat');
  const { setPageState } = usePageContext();
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  // 删除功能状态
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // 加载历史数据
  const loadHistory = useCallback(async (page: number) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError, count } = await getConversationHistory(user.id, page, pageSize);
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setHistory(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / pageSize));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('history.loadingError'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, pageSize]);

  // 页面加载时获取历史
  useEffect(() => {
    loadHistory(currentPage);
  }, [user, currentPage, loadHistory]);

  // 初始化页面状态 - 2025-01-30 08:47:00
  useEffect(() => {
    setPageState({
      page: '/history'
      // 移除subPage，避免干扰正常导航
    });
  }, [setPageState]);

  // 处理分页变化
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // 点击历史项，直接跳转到对话页并传递历史数据
  const handleHistoryClick = (conversation: ConversationHistory) => {
    navigate('/dialogue', {
      state: {
        topic: conversation.topic,
        initialMessages: conversation.messages,
        isHistory: true, // 标记这是历史数据，不需要重新请求AI
        conversationId: conversation.id // 添加conversationId，确保能正确更新历史记录
      }
    });
  };

  // 获取最后一条消息作为预览
  const getLastMessage = (messages: Message[]): string => {
    if (messages.length === 0) return t('history.noMessages');
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
      return t('history.timeJustNow');
    } else if (diffInHours < 24) {
      return t('history.timeHoursAgo', { hours: Math.floor(diffInHours) });
    } else {
      return date.toLocaleDateString();
    }
  };

  // 处理选择变化
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectedItems.length === history.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(history.map(item => item.id));
    }
  };

  // 处理单条删除
  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedItems.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  // 执行删除
  const executeDelete = async () => {
    setDeleteLoading(true);
    try {
      if (itemToDelete) {
        // 单条删除
        await deleteConversationHistory(itemToDelete);
        setHistory(prev => prev.filter(item => item.id !== itemToDelete));
      } else if (selectedItems.length > 0) {
        // 批量删除
        await deleteMultipleConversations(selectedItems);
        setHistory(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Delete conversation error:', error);
      setError(t('history.deleteFailed'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // 处理收藏/取消收藏 - 2025-01-30 15:47:00
  const handleToggleBookmark = async (id: string, currentBookmarked: boolean) => {
    try {
      const newBookmarked = !currentBookmarked;
      await toggleBookmarkConversation(id, newBookmarked);
      
      // 更新本地状态
      setHistory(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, bookmarked: newBookmarked }
            : item
        )
      );
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      setError(t('history.bookmarkFailed'));
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
        justifyContent: 'space-between', 
        borderBottom: '1px solid #e7f3e7' 
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <HistoryIcon sx={{ color: '#4c9a4c', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
            {t('history.title')}
          </Typography>
        </Stack>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectedItems.length > 0 && (
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleBatchDelete}
              sx={{ borderRadius: 20, fontWeight: 'bold' }}
            >
              {t('history.deleteSelected')} ({selectedItems.length})
            </Button>
          )}
          <Button variant="contained" sx={{ bgcolor: '#4c9a4c', color: '#fff', borderRadius: 20, fontWeight: 'bold', boxShadow: 1 }} onClick={() => navigate('/topic')}>
            {t('history.newConversation')}
          </Button>
        </Box>
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
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3, 
            border: '1px solid #e7f3e7',
            boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)'
          }}>
            <Typography variant="h6" sx={{ color: '#4c9a4c', mb: 2 }}>{t('history.noHistory')}</Typography>
            <Typography variant="body2" sx={{ color: '#4c9a4c', mb: 3 }}>{t('history.noHistoryDescription')}</Typography>
            <Button variant="contained" onClick={() => navigate('/topic')} sx={{ bgcolor: '#4c9a4c', color: '#fff', borderRadius: 20 }}>
              {t('history.startConversation')}
            </Button>
          </Paper>
        ) : (
          <>
            <Paper sx={{ 
              p: 2, 
              borderRadius: 3, 
              border: '1px solid #e7f3e7',
              boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
              mb: 2 
            }}>
              {/* 全选栏 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 1 }}>
                <Checkbox
                  checked={selectedItems.length === history.length && history.length > 0}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < history.length}
                  onChange={handleSelectAll}
                  sx={{ color: '#4c9a4c', '&.Mui-checked': { color: '#4c9a4c' } }}
                />
                <Typography variant="body2" sx={{ color: '#4c9a4c', ml: 1 }}>
                  {selectedItems.length > 0 ? t('history.selectedCount', { count: selectedItems.length }) : t('history.selectAll')}
                </Typography>
              </Box>
              
              <List>
                {history.map((conversation) => (
                  <ListItem 
                    key={conversation.id} 
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: selectedItems.includes(conversation.id) ? '#f0f8f0' : 'transparent',
                      '&:hover': {
                        bgcolor: selectedItems.includes(conversation.id) ? '#e8f5e8' : '#f0f8f0',
                        transition: 'background-color 0.2s'
                      }
                    }}
                  >
                    <Checkbox
                      checked={selectedItems.includes(conversation.id)}
                      onChange={() => handleSelectItem(conversation.id)}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ color: '#4c9a4c', '&.Mui-checked': { color: '#4c9a4c' } }}
                    />
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d' }}>
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
                          <Typography variant="body2" sx={{ color: '#4c9a4c', mb: 0.5 }}>
                            {getLastMessage(conversation.messages)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#4c9a4c' }}>
                            {formatTime(conversation.created_at)} • {t('history.messagesCount', { count: conversation.messages.length })}
                          </Typography>
                        </Box>
                      }
                      onClick={() => handleHistoryClick(conversation)}
                    />
                    {/* 收藏按钮 - 2025-01-30 15:47:30 */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(conversation.id, conversation.bookmarked || false);
                      }}
                      sx={{ 
                        color: conversation.bookmarked ? '#FFD700' : '#DDD',
                        '&:hover': { 
                          color: conversation.bookmarked ? '#FFC107' : '#FFD700',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {conversation.bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(conversation.id);
                      }}
                      sx={{ 
                        color: '#ff6b6b',
                        '&:hover': { 
                          bgcolor: '#ffe6e6',
                          color: '#ff5252'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
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
                      color: '#4c9a4c',
                      '&.Mui-selected': {
                        bgcolor: '#e7f3e7',
                        color: '#0d1b0d',
                        '&:hover': {
                          bgcolor: '#12e712'
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

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
          {t('history.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {itemToDelete 
              ? t('history.deleteSingleConfirm')
              : t('history.deleteMultipleConfirm', { count: selectedItems.length })
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setItemToDelete(null);
            }}
            sx={{ color: '#4c9a4c' }}
          >
            {t('buttons.cancel')}
          </Button>
          <Button 
            onClick={executeDelete}
            disabled={deleteLoading}
            color="error"
            variant="contained"
            sx={{ borderRadius: 20 }}
          >
            {deleteLoading ? t('history.deleting') : t('buttons.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default History; 