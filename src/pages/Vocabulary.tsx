import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePageContext } from '../contexts/PageContext';
import { useLanguage } from '../hooks/useLanguage';
import type { 
  VocabularyItem, 
  LearningTab, 
  TopicItem,
  ExtendedTopicItem,
  BookmarkItem
} from '../types/learning';
import {
  vocabularyService,
  searchService,
  topicsService,
  bookmarksService
} from '../services/learningService';
import { getBookmarkedConversations } from '../services/historyService';
import {
  Container, 
  Box, 
  Typography, 
  TextField, 
  Paper, 
  Tab, 
  Tabs, 
  Button, 
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Grid,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  VolumeUp as VolumeUpIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  History as HistoryIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import MobileContainer from '../components/MobileContainer';

function Vocabulary() {
  const { t } = useTranslation('learning');
  const { changeLanguage, currentLanguage, supportedLanguages } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pageState, setPageState } = usePageContext();

  
  // 状态管理
  const [activeTab, setActiveTab] = useState<LearningTab>('vocabulary');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 数据状态
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  // 搜索结果状态优化 - 2025-01-30 18:30:30
  const [searchResults, setSearchResults] = useState<{ vocabulary: VocabularyItem[], topics: ExtendedTopicItem[], conversations: any[] }>({ vocabulary: [], topics: [], conversations: [] });
  // 收藏对话相关状态 - 2025-01-30 15:50:00
  const [bookmarkedConversations, setBookmarkedConversations] = useState<any[]>([]);
  
  // 添加单词状态
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [addWordError, setAddWordError] = useState<string | null>(null);
  

  
  // 选词菜单状态
  const [showWordMenu, setShowWordMenu] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [wordMenuPosition, setWordMenuPosition] = useState({ x: 0, y: 0 });



  // 全局alert状态
  const [alert, setAlert] = useState({ type: 'info', message: '' });
  const [showAlert, setShowAlert] = useState(false);

  // 初始化数据
  useEffect(() => {
    loadUserData();
  }, [isAuthenticated, user]);

  // 初始化页面状态
  useEffect(() => {
    setPageState({
      page: '/vocabulary'
    });
  }, [setPageState]);

  // 搜索防抖优化 - 2025-01-30 18:29:00
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // 实时搜索功能 - 优化版 - 2025-01-30 18:28:30
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        await handleSearch();
      }
    }, 300); // 300ms 防抖

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  // 页面卸载时清空搜索状态
  useEffect(() => {
    return () => {
      // 页面卸载时清空搜索
      setSearchQuery('');
      setSearchResults({ vocabulary: [], topics: [], conversations: [] });
    };
  }, []);

  // 搜索函数优化 - 2025-01-30 18:29:30
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults({ vocabulary: [], topics: [], conversations: [] });
      return;
    }

    try {
      setLoading(true);
      const results = await searchService.search(searchQuery, user?.id || 'guest');
      
      // 对于词汇搜索，只搜索单词名称，不搜索定义和例句
      const searchTerm = searchQuery.toLowerCase();
      const filteredVocab = results.vocabulary.filter((item: VocabularyItem) => {
        return item.word.toLowerCase().includes(searchTerm);
      });

      setSearchResults({
        vocabulary: filteredVocab,
        topics: results.topics || [],
        conversations: results.conversations || []
      });
    } catch (error) {
      console.error('Search error:', error);
      setError(t('search.error', 'Search failed'));
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!isAuthenticated || !user) {
      setVocabulary([]);
      setBookmarks([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading vocabulary for user:', user.id);
      
      const [vocabResult, bookmarksResult, conversationsResult] = await Promise.all([
        vocabularyService.getUserVocabulary(user.id),
        bookmarksService.getUserBookmarks(user.id),
        getBookmarkedConversations(user.id)
      ]);

      console.log('Loaded vocabulary:', vocabResult);
      console.log('Loaded bookmarks:', bookmarksResult);
      console.log('Loaded conversations:', conversationsResult);

      if (vocabResult) {
        setVocabulary(vocabResult);
      }
      
      if (bookmarksResult) {
        setBookmarks(bookmarksResult);
      }
      
      if (conversationsResult.data) {
        setBookmarkedConversations(conversationsResult.data);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(t('vocabulary.loadError', 'Failed to load vocabulary'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim() || !user) return;

    try {
      setIsAddingWord(true);
      setAddWordError(null);
      
      console.log('Adding word:', newWord, 'for user:', user.id);
      const result = await vocabularyService.addVocabularyWithAI(user.id, newWord.trim());
      console.log('Add word result:', result);
      
      setNewWord('');
      setShowAddDialog(false);
      await loadUserData(); // 重新加载数据
      
      setSuccess(t('vocabulary.addSuccess', `Successfully added "${newWord.trim()}"`));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding word:', err);
      const errorMessage = err instanceof Error ? err.message : t('vocabulary.addError', 'Failed to add word');
      setAddWordError(errorMessage);
    } finally {
      setIsAddingWord(false);
    }
  };

  const handleMarkAsLearned = async (id: string) => {
    if (!user) return;

    try {
      await vocabularyService.markAsLearned(id);
      await loadUserData(); // 重新加载数据
      setSuccess(t('vocabulary.markLearnedSuccess', 'Marked as learned!'));
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error marking as learned:', err);
      setError(t('vocabulary.markLearnedError', 'Failed to mark as learned'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleBookmark = async (id: string, type: 'vocabulary' | 'topic' = 'vocabulary') => {
    if (!user) return;

    try {
      await bookmarksService.toggleBookmark(user.id, id, type);
      await loadUserData(); // 重新加载数据
      setSuccess(t('vocabulary.bookmarkToggled', 'Bookmark updated!'));
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError(t('vocabulary.bookmarkError', 'Failed to update bookmark'));
      setTimeout(() => setError(null), 3000);
    }
  };

  // 切换收藏状态
  const toggleBookmark = useCallback(async (item: VocabularyItem, type: 'vocabulary') => {
    const newBookmarked = !item.bookmarked;
    
    try {
      await vocabularyService.updateVocabulary(item.id, { bookmarked: newBookmarked });
      setVocabulary(prev => prev.map(v => 
        v.id === item.id ? { ...v, bookmarked: newBookmarked } : v
      ));
      
      // 更新收藏列表
      if (user) {
        const bookmarksResult = await bookmarksService.getUserBookmarks(user.id);
        if (bookmarksResult) {
          setBookmarks(bookmarksResult);
        }
      }
      
      setSuccess(newBookmarked ? t('vocabulary.bookmarkAdded', 'Added to bookmarks') : t('vocabulary.bookmarkRemoved', 'Removed from bookmarks'));
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError(t('errors.bookmarkFailed', 'Failed to update bookmark'));
      setTimeout(() => setError(null), 3000);
    }
  }, [user]);

  // 掌握单词 - 点击掌握后删除单词 - 2025-01-30
  const toggleMastery = useCallback(async (vocabularyItem: VocabularyItem) => {
    // 如果已经掌握，取消掌握（恢复单词）
    if (vocabularyItem.masteryLevel === 2) {
      try {
        await vocabularyService.updateVocabulary(vocabularyItem.id, { 
          masteryLevel: 0,
          lastReviewed: new Date().toISOString()
        });
        
        setVocabulary(prev => prev.map(v => 
          v.id === vocabularyItem.id ? { ...v, masteryLevel: 0 } : v
        ));
        
        setAlert({ type: 'info', message: t('vocabulary.masteryRemoved') });
        setShowAlert(true);
        return;
      } catch (err) {
        console.error('Error removing mastery:', err);
        setAlert({ type: 'error', message: t('errors.masteryFailed') });
        setShowAlert(true);
        return;
      }
    }

    // 标记为掌握并从列表中移除
    try {
      await vocabularyService.updateVocabulary(vocabularyItem.id, { 
        masteryLevel: 2,
        lastReviewed: new Date().toISOString()
      });
      
      // 从词汇列表中移除
      setVocabulary(prev => prev.filter(v => v.id !== vocabularyItem.id));
      
      // 同时从收藏列表中移除（即使有收藏状态，掌握了也要删除）
      setBookmarks(prev => prev.filter(b => 
        !(b.type === 'vocabulary' && b.content.id === vocabularyItem.id)
      ));
      
      setAlert({ type: 'success', message: t('vocabulary.wordMastered') });
      setShowAlert(true);
    } catch (err) {
      console.error('Error marking as mastered:', err);
      setAlert({ type: 'error', message: t('errors.masteryFailed') });
      setShowAlert(true);
    }
  }, [user]);

  // 播放发音 - 优化版本
  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      // 停止当前正在播放的声音
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // 较慢的语速，方便学习
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // 错误处理
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setError(t('vocabulary.pronunciationError', 'Pronunciation playback failed'));
        setTimeout(() => setError(null), 2000);
      };
      
      // 确保有可用的声音
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en-') && voice.name.toLowerCase().includes('english')
      ) || voices.find(voice => voice.lang.startsWith('en-'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      setError(t('vocabulary.speechNotSupported', 'Speech synthesis not supported in this browser'));
      setTimeout(() => setError(null), 2000);
    }
  };

  // 2025-01-30 17:15:00: 处理双击添加词汇功能（替代原文本选择）
  const handleDoubleClick = async (event: React.MouseEvent, text: string) => {
    console.log('Double click triggered on vocabulary page');
    
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping word selection');
      return;
    }

    // 防止正在添加词汇时重复操作
    if (isAddingWord) {
      return;
    }

    // 提取选中的词汇
    const selection = window.getSelection();
    let wordToAdd = '';
    
    if (selection && selection.toString().trim()) {
      wordToAdd = selection.toString().trim();
    } else {
      // 如果没有选中文本，尝试从文本中提取英文单词
      const words = text.match(/[a-zA-Z]+/g);
      if (words && words.length > 0) {
        wordToAdd = words[0]; // 取第一个英文单词
      }
    }

    if (wordToAdd && wordToAdd.length > 1) {
      try {
        setIsAddingWord(true);
        await vocabularyService.addVocabularyWithAI(user!.id, wordToAdd);
        await loadUserData(); // 重新加载数据
        setSuccess(t('vocabulary.wordAdded', { word: wordToAdd }));
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error adding word:', err);
        setError(t('vocabulary.addError'));
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsAddingWord(false);
      }
    }
  };

  const handleDeleteVocabulary = async (id: string) => {
    if (!user) return;

    try {
      await vocabularyService.deleteVocabulary(id);
      await loadUserData(); // 重新加载数据
      setSuccess(t('vocabulary.deleteSuccess', 'Word deleted successfully!'));
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error deleting vocabulary:', err);
      setError(t('vocabulary.deleteError', 'Failed to delete word'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!user) return;

    try {
      await bookmarksService.deleteBookmark(id);
      await loadUserData(); // 重新加载数据
      setSuccess(t('bookmarks.deleteSuccess', 'Bookmark removed!'));
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError(t('bookmarks.deleteError', 'Failed to remove bookmark'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const renderVocabularyCard = (item: VocabularyItem) => (
    <Card key={item.id} sx={{ 
      borderRadius: 4,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(202, 236, 202, 0.2)',
      overflow: 'hidden',
      position: 'relative',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        '& .word-actions': {
          transform: 'translateY(0)',
          opacity: 1
        }
      },
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <IconButton 
            onClick={() => playPronunciation(item.word)}
            sx={{ 
              bgcolor: '#E7F3E7', 
              color: '#0D1C0D',
              width: 50,
              height: 50,
              '&:hover': { 
                bgcolor: '#CFE8CF',
                transform: 'scale(1.1)',
                boxShadow: '0 4px 15px rgba(202, 236, 202, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <VolumeUpIcon />
          </IconButton>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#0D1C0D',
                fontWeight: 'bold',
                mb: 0.5,
                wordBreak: 'break-word'
              }}
            >
              {item.word}
            </Typography>
            {/* 音标紧贴在单词下面 */}
            {item.pronunciation && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#1565C0',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: '0.9rem'
                }}
              >
                /{item.pronunciation}/
              </Typography>
            )}
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 0.5, 
                lineHeight: 1.6,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(227, 242, 253, 0.3)' }
              }}
              onDoubleClick={(e) => handleDoubleClick(e, item.definition)}
              title={t('vocabulary.doubleClickTip')}
            >
              {item.definition}
            </Typography>
            {item.chinese_translation && (
              <Typography 
                variant="body2" 
                color="#4B5563" 
                sx={{ 
                  mb: 1, 
                  lineHeight: 1.5,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(227, 242, 253, 0.3)' }
                }}
                onDoubleClick={(e) => handleDoubleClick(e, item.chinese_translation || '')}
                title={t('vocabulary.doubleClickTip')}
              >
                {item.chinese_translation}
              </Typography>
            )}
            
            {/* 词性标签移到这里 - 在中文翻译下面，例句上面 */}
            {item.part_of_speech && (
              <Box sx={{ mb: 1 }}>
                <Chip 
                  label={item.part_of_speech} 
                  size="small" 
                  sx={{ 
                    mr: 1, 
                    mb: 1, 
                    bgcolor: '#F3E5F5',
                    color: '#7B1FA2',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#E1BEE7' }
                  }} 
                />
              </Box>
            )}
          </Box>
        </Box>
        
        {/* 例句区域 - 与同义词反义词同层级 */}
        {item.example && (
          <Box sx={{ mb: 2 }}>
            <Paper sx={{ 
              p: 2, 
              bgcolor: 'rgba(202, 236, 202, 0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(202, 236, 202, 0.2)'
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#2E7D32',
                  fontWeight: 600,
                  display: 'block',
                  mb: 1
                }}
              >
                {t('vocabulary.examples', 'Examples:')}
              </Typography>
              
              {/* 支持多个例句，用分号或换行分割 */}
              {(() => {
                console.log('Original example:', item.example);
                const examples = item.example
                  .split(/[;\n]|(?=\d+\.)/) 
                  .map(ex => ex.replace(/^\d+\.\s*/, '').trim()) 
                  .filter(ex => ex.length > 0)
                  .slice(0, 2);
                console.log('Parsed examples:', examples);
                
                return examples.map((example, index) => (
                  <Typography 
                    key={index}
                    variant="body2" 
                    sx={{ 
                      fontStyle: 'italic', 
                      color: '#2E7D32',
                      cursor: 'pointer',
                      mb: index < examples.length - 1 ? 1 : 0,
                      '&::before': { content: `"${index + 1}. "` },
                      '&:hover': { bgcolor: 'rgba(227, 242, 253, 0.3)' },
                      padding: '4px 6px',
                      borderRadius: '4px'
                    }}
                    onDoubleClick={(e) => handleDoubleClick(e, example)}
                    title={t('vocabulary.doubleClickTip')}
                  >
                    {example}
                  </Typography>
                ));
              })()}
            </Paper>
          </Box>
        )}
        
        {/* 同义词和反义词 */}
        {((item.synonyms && item.synonyms.length > 0) || (item.antonyms && item.antonyms.length > 0)) && (
          <Box sx={{ mb: 2 }}>
            {item.synonyms && item.synonyms.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Synonyms:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {item.synonyms.slice(0, 3).map((synonym, index) => (
                    <Chip 
                      key={index} 
                      label={synonym} 
                      size="small"
                      sx={{ 
                        bgcolor: '#E8F5E8', 
                        color: '#2E7D32',
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: '#C8E6C9' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            {item.antonyms && item.antonyms.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Antonyms:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {item.antonyms.slice(0, 2).map((antonym, index) => (
                    <Chip 
                      key={index} 
                      label={antonym} 
                      size="small"
                      sx={{ 
                        bgcolor: '#FFEBEE', 
                        color: '#C62828',
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: '#FFCDD2' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
      
      {/* Modern Card Actions */}
      <Box 
        className="word-actions"
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3, 
          pb: 3,
          pt: 0,
          transform: 'translateY(10px)',
          opacity: 0,
          transition: 'all 0.3s ease'
        }}
      >
        <Box>
          {item.difficulty_level && (
            <Chip 
              label={`Level ${item.difficulty_level}/5`} 
              size="small"
              sx={{
                bgcolor: item.difficulty_level === 'beginner' ? '#E8F5E8' : item.difficulty_level === 'intermediate' ? '#FFF3E0' : '#FFEBEE',
                color: item.difficulty_level === 'beginner' ? '#2E7D32' : item.difficulty_level === 'intermediate' ? '#F57C00' : '#C62828',
                fontWeight: 600,
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => toggleBookmark(item, 'vocabulary')}
            sx={{
              color: item.bookmarked ? '#FFD700' : '#DDD',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                color: item.bookmarked ? '#FFC107' : '#FFD700',
                bgcolor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {item.bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          <IconButton
            onClick={() => toggleMastery(item)}
            sx={{
              color: '#DDD',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                color: '#4CAF50',
                bgcolor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
            title={t('vocabulary.markAsMasteredTooltip')}
          >
            <CheckCircleOutlineIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );

  if (!isAuthenticated) {
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
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#4c9a4c' }}>
            {t('auth.loginRequired', 'Please login to access vocabulary')}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{ 
              bgcolor: '#4c9a4c',
              color: 'white',
              '&:hover': { bgcolor: '#12e712' }
            }}
          >
            {t('auth.login', 'Login')}
          </Button>
        </Box>
      </Container>
    );
  }

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
          <VolumeUpIcon sx={{ color: '#4c9a4c', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
            {t('title')}
          </Typography>
        </Stack>
      </Box>

      {/* 搜索区域 */}
      <Box sx={{ px: 2, pt: 2 }}>
        <Paper sx={{ 
          p: 2, 
          borderRadius: 3, 
          border: '1px solid #e7f3e7',
          boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#4c9a4c' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery.trim() && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults({ vocabulary: [], topics: [], conversations: [] });
                    }}
                    size="small"
                    sx={{ color: '#999' }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#e7f3e7',
                },
                '&:hover fieldset': {
                  borderColor: '#4c9a4c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4c9a4c',
                },
              },
            }}
          />
        </Paper>
      </Box>

      {/* 标签页导航 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Paper sx={{ 
          borderRadius: 3, 
          border: '1px solid #e7f3e7',
          overflow: 'hidden'
        }}>
          {/* Modern Tab Navigation with Action Buttons - 2025-01-30 21:15:00 */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid #e7f3e7'
          }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flex: 1,
                '& .MuiTabs-indicator': {
                  backgroundColor: '#12e712',
                  height: 3,
                  borderRadius: 2
                },
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  px: 2,
                  py: 1.5,
                  color: '#4c9a4c',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    color: '#0d1b0d',
                    fontWeight: 600
                  }
                }
              }}
            >
              <Tab label={t('tabs.vocabulary')} value="vocabulary" />
              <Tab label={t('tabs.bookmarks')} value="bookmarks" />
              <Tab label={t('tabs.topics')} value="topics" />
            </Tabs>
            
            {/* Vocabulary Action Button - 简化为单个添加按钮 - 2025-01-30 21:20:00 */}
            {activeTab === 'vocabulary' && (
              <IconButton
                onClick={() => setShowAddDialog(true)}
                sx={{ 
                  bgcolor: '#4c9a4c',
                  color: 'white',
                  width: 40,
                  height: 40,
                  m: 1,
                  '&:hover': {
                    bgcolor: '#12e712',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <AddIcon />
              </IconButton>
            )}
          </Box>
        </Paper>
      </Box>

      {/* 内容区域 */}
      <Box sx={{ px: 2, pb: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#4c9a4c' }} />
          </Box>
        )}

        {/* 搜索结果页面 - 统一显示所有搜索结果 */}
        {searchQuery.trim() && (
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #e7f3e7',
              boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
                  🔍 搜索结果: "{searchQuery}"
                </Typography>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults({ vocabulary: [], topics: [], conversations: [] });
                  }}
                  sx={{ 
                    color: '#4c9a4c',
                    '&:hover': { bgcolor: '#f0f8f0' }
                  }}
                >
                  清除搜索
                </Button>
              </Box>

              {/* 词汇搜索结果 */}
              {searchResults.vocabulary.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4c9a4c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    📚 词汇 ({searchResults.vocabulary.length})
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' }
                  }}>
                    {searchResults.vocabulary.map(renderVocabularyCard)}
                  </Box>
                </Box>
              )}

              {/* 对话搜索结果 */}
              {searchResults.conversations.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4c9a4c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    💬 对话 ({searchResults.conversations.length})
                  </Typography>
                  <List>
                    {searchResults.conversations.map((conversation) => (
                      <ListItem 
                        key={conversation.id}
                        sx={{
                          mb: 1,
                          bgcolor: '#fff8e1',
                          borderRadius: 2,
                          border: '2px solid #ffd54f',
                          '&:hover': {
                            bgcolor: '#fff3c4',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 20px rgba(255,193,7,0.3)'
                          },
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate('/dialogue', {
                          state: {
                            topic: conversation.topic,
                            initialMessages: conversation.messages,
                            isHistory: true,
                            conversationId: conversation.id
                          }
                        })}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#ff9800', color: 'white' }}>
                            <SearchIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
                              {conversation.topic}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: '#f57c00' }}>
                              {conversation.messages?.length || 0} messages • {new Date(conversation.created_at).toLocaleDateString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* 话题模板搜索结果 */}
              {searchResults.topics.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4c9a4c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎯 话题模板 ({searchResults.topics.length})
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(250px, 1fr))' }
                  }}>
                    {searchResults.topics.map((topic) => (
                      <Card key={topic.id} sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e7f3e7',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate('/topic', { state: { suggestedTopic: topic.name } })}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold', mb: 1 }}>
                            {topic.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4c9a4c' }}>
                            {topic.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}

              {/* 无搜索结果 */}
              {searchResults.vocabulary.length === 0 && 
               searchResults.conversations.length === 0 && 
               searchResults.topics.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                    😔 没有找到相关内容
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                    尝试使用其他关键词搜索，或者
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults({ vocabulary: [], topics: [], conversations: [] });
                    }}
                    sx={{ 
                      bgcolor: '#4c9a4c',
                      color: 'white',
                      '&:hover': { bgcolor: '#12e712' }
                    }}
                  >
                    清除搜索，浏览所有内容
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* 正常标签页内容 - 仅在无搜索时显示 */}
        {!searchQuery.trim() && activeTab === 'vocabulary' && (
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #e7f3e7',
              boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#0d1b0d', fontWeight: 'bold' }}>
                {t('vocabulary.myWords', 'My Vocabulary')} ({vocabulary.length})
              </Typography>
              {vocabulary.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                    {t('vocabulary.empty', 'No vocabulary words yet')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    {t('vocabulary.addFirstWord', 'Add your first word to get started')}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'grid', 
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' }
                }}>
                  {vocabulary.map(renderVocabularyCard)}
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* Bookmarks Tab Content */}
        {!searchQuery.trim() && activeTab === 'bookmarks' && (
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #e7f3e7',
              boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#0d1b0d', fontWeight: 'bold' }}>
                {t('bookmarks.title', 'Bookmarked Content')}
              </Typography>
              
              {/* Bookmarked Vocabulary */}
              {bookmarks.some(b => b.type === 'vocabulary') && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#4c9a4c', fontWeight: 'bold' }}>
                    {t('bookmarks.vocabulary', 'Vocabulary')}
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' }
                  }}>
                    {bookmarks
                      .filter(b => b.type === 'vocabulary')
                      .map(bookmark => renderVocabularyCard(bookmark.content as VocabularyItem))
                    }
                  </Box>
                </Box>
              )}

              {bookmarks.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                    {t('bookmarks.empty', 'No bookmarks yet')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    {t('bookmarks.instruction', 'Bookmark vocabulary words to save them here')}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* Topics Tab Content - 显示收藏的对话 */}
        {!searchQuery.trim() && activeTab === 'topics' && (
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #e7f3e7',
              boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#0d1b0d', fontWeight: 'bold' }}>
                {t('topics.title', 'Bookmarked Conversations')}
              </Typography>
              
              {bookmarkedConversations.length > 0 ? (
                <List>
                  {bookmarkedConversations.map((conversation) => (
                    <ListItem 
                      key={conversation.id}
                      sx={{
                        mb: 1,
                        bgcolor: '#f8fcf8',
                        borderRadius: 2,
                        border: '1px solid #e7f3e7',
                        '&:hover': {
                          bgcolor: '#e7f3e7',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(76,154,76,0.15)'
                        },
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate('/dialogue', {
                        state: {
                          topic: conversation.topic,
                          initialMessages: conversation.messages,
                          isHistory: true,
                          conversationId: conversation.id
                        }
                      })}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#4c9a4c', color: 'white' }}>
                          <HistoryIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
                            {conversation.topic}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: '#4c9a4c' }}>
                            {conversation.messages?.length || 0} messages • {new Date(conversation.created_at).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                    {t('topics.empty', 'No bookmarked conversations yet')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    {t('topics.instruction', 'Bookmark conversations from history to see them here')}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/history')}
                    sx={{ 
                      mt: 2,
                      bgcolor: '#4c9a4c',
                      color: 'white',
                      '&:hover': { bgcolor: '#12e712' }
                    }}
                  >
                    {t('topics.goToHistory', 'Go to History')}
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Add Word Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
          {t('vocabulary.addWord', 'Add New Word')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('vocabulary.wordInput', 'Enter a word')}
            fullWidth
            variant="outlined"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isAddingWord) {
                handleAddWord();
              }
            }}
            error={!!addWordError}
            helperText={addWordError}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e7f3e7',
                },
                '&:hover fieldset': {
                  borderColor: '#4c9a4c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4c9a4c',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowAddDialog(false)}
            sx={{ color: '#666' }}
          >
            {t('buttons.cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={handleAddWord}
            disabled={!newWord.trim() || isAddingWord}
            variant="contained"
            sx={{ 
              bgcolor: '#4c9a4c',
              color: 'white',
              '&:hover': { bgcolor: '#12e712' }
            }}
          >
            {isAddingWord ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t('buttons.add', 'Add')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Global Alert Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={alert.type as 'success' | 'error' | 'info'} 
          onClose={() => setShowAlert(false)}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Vocabulary;