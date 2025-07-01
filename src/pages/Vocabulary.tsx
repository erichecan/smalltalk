import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import type { 
  VocabularyItem, 
  PhraseItem, 
  LearningTab, 
  SearchResult,
  TopicItem,
  BookmarkItem
} from '../types/learning';
import {
  vocabularyService,
  phrasesService,
  searchService,
  topicsService,
  bookmarksService
} from '../services/learningService';
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
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  VolumeUp as VolumeUpIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import MobileContainer from '../components/MobileContainer';

function Vocabulary() {
  const { t } = useTranslation('learning');
  const { changeLanguage, currentLanguage, supportedLanguages } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Get categories from translations - 修复对象渲染问题 - 2025-01-30 16:40:22
  const PHRASE_CATEGORIES = [
    'All',
    'Greetings', 
    'Travel',
    'Business',
    'Socializing',
    'Dining'
  ];
  
  const GRAMMAR_CATEGORIES = [
    'All',
    'Verb Tenses',
    'Sentence Structure',
    'Prepositions',
    'Vocabulary'
  ];
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<LearningTab>('vocabulary');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 数据状态
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [phrases, setPhrases] = useState<PhraseItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // 添加单词状态
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [addWordError, setAddWordError] = useState<string | null>(null);
  
  // 批量导入状态
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{
    success: string[];
    errors: string[];
  } | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  
  // 选词菜单状态
  const [showWordMenu, setShowWordMenu] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [wordMenuPosition, setWordMenuPosition] = useState({ x: 0, y: 0 });

  // 过滤器状态
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState('All');
  const [selectedGrammarCategory, setSelectedGrammarCategory] = useState('All');

  // 全局alert状态
  const [alert, setAlert] = useState({ type: 'info', message: '' });
  const [showAlert, setShowAlert] = useState(false);

  // 初始化数据
  useEffect(() => {
    loadUserData();
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [vocabData, phrasesData, bookmarksData] = await Promise.all([
        vocabularyService.getUserVocabulary(user?.id || 'guest'),
        phrasesService.getUserPhrases(user?.id || 'guest'),
        user ? bookmarksService.getUserBookmarks(user.id) : Promise.resolve([])
      ]);
      
      setVocabulary(vocabData);
      setPhrases(phrasesData);
      setBookmarks(bookmarksData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索功能
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!user && !isAuthenticated) return;
    
    try {
      const results = await searchService.search(searchQuery, user?.id || 'guest');
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // 切换收藏状态
  const toggleBookmark = useCallback(async (item: VocabularyItem | PhraseItem, type: 'vocabulary' | 'phrase') => {
    const newBookmarked = !item.bookmarked;
    
    try {
      if (type === 'vocabulary') {
        await vocabularyService.updateVocabulary(item.id, { bookmarked: newBookmarked });
        setVocabulary(prev => prev.map(v => 
          v.id === item.id ? { ...v, bookmarked: newBookmarked } : v
        ));
      } else {
        await phrasesService.updatePhraseBookmark(item.id, newBookmarked);
        setPhrases(prev => prev.map(p => 
          p.id === item.id ? { ...p, bookmarked: newBookmarked } : p
        ));
      }
      
      // 更新收藏列表
      if (user) {
        const newBookmarks = await bookmarksService.getUserBookmarks(user.id);
        setBookmarks(newBookmarks);
      }
      
      setSuccess(newBookmarked ? '已收藏' : '已取消收藏');
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('更新收藏状态失败');
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
        
        setAlert({ type: 'info', message: '已取消掌握，单词恢复到学习列表' });
        setShowAlert(true);
      } catch (err) {
        console.error('Error updating mastery:', err);
        setAlert({ type: 'error', message: '操作失败，请稍后重试' });
        setShowAlert(true);
      }
      return;
    }

    // 点击掌握 - 删除单词
    try {
      // 从数据库删除
      await vocabularyService.deleteVocabulary(vocabularyItem.id);
      
      // 从本地状态删除
      setVocabulary(prev => prev.filter(v => v.id !== vocabularyItem.id));
      
      // 同时从收藏列表删除（如果有的话）
      if (user) {
        const newBookmarks = await bookmarksService.getUserBookmarks(user.id);
        setBookmarks(newBookmarks);
      }
      
      setAlert({ type: 'success', message: `单词 "${vocabularyItem.word}" 已掌握并移除` });
      setShowAlert(true);
    } catch (err) {
      console.error('Error mastering vocabulary:', err);
      setAlert({ type: 'error', message: '标记掌握失败，请稍后重试' });
      setShowAlert(true);
    }
  }, [user]);

  // 播放发音
  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
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

    const target = event.target as HTMLElement;
    let wordToAdd: string | null = null;

    // 2025-01-30 17:15:30: 优先使用浏览器选择API获取双击的单词
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      // 验证是否为有效英文单词
      if (/^[a-zA-Z0-9'-]+$/.test(selectedText) && selectedText.length > 1 && /[a-zA-Z]/.test(selectedText)) {
        wordToAdd = selectedText;
        // 清除选择
        selection.removeAllRanges();
      }
    }

    // 2025-01-30 17:16:00: Fallback - 从文本中提取单词
    if (!wordToAdd) {
      const words = text.match(/[a-zA-Z0-9'-]+/g);
      if (words && words.length > 0) {
        // 简单选择第一个有效单词作为fallback
        const firstValidWord = words.find(word => word.length > 1 && /[a-zA-Z]/.test(word));
        if (firstValidWord) {
          wordToAdd = firstValidWord;
        }
      }
    }

    if (wordToAdd) {
      console.log('Adding word from vocabulary page:', wordToAdd);
      
      // 添加飞行动画效果
      triggerVocabularyPageAnimation(wordToAdd, { x: event.clientX, y: event.clientY });
      
      // 添加到词汇表
      await handleAddWord(wordToAdd);
    }
  };

  // 2025-01-30 17:16:30: 词汇页面专用动画效果
  const triggerVocabularyPageAnimation = (word: string, startPosition: { x: number; y: number }) => {
    // 创建一个闪烁的成功指示器
    const successIndicator = document.createElement('div');
    successIndicator.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
        color: white;
        padding: 10px 16px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
        white-space: nowrap;
        position: relative;
        overflow: hidden;
      ">
        <span style="margin-right: 8px;">✨</span>
        ${word}
        <span style="margin-left: 8px;">已添加</span>
        <div style="
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 0.8s ease-in-out;
        "></div>
      </div>
    `;

    // 设置初始样式
    Object.assign(successIndicator.style, {
      position: 'fixed',
      left: `${startPosition.x}px`,
      top: `${startPosition.y}px`,
      zIndex: '10000',
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%) scale(0)',
      transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    });

    // 添加CSS动画（如果还没有）
    if (!document.getElementById('vocabulary-page-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'vocabulary-page-styles';
      styleSheet.textContent = `
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes bounceIn {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2) rotate(-10deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes bounceOut {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0) rotate(90deg); opacity: 0; }
        }
      `;
      document.head.appendChild(styleSheet);
    }

    document.body.appendChild(successIndicator);

    // 启动动画序列
    requestAnimationFrame(() => {
      // 第一阶段：弹入效果
      successIndicator.style.animation = 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      successIndicator.style.transform = 'translate(-50%, -50%) scale(1)';
      
      setTimeout(() => {
        // 第二阶段：保持显示
        successIndicator.style.animation = '';
        
        setTimeout(() => {
          // 第三阶段：弹出消失
          successIndicator.style.animation = 'bounceOut 0.4s ease-in-out';
          
          setTimeout(() => {
            if (document.body.contains(successIndicator)) {
              document.body.removeChild(successIndicator);
            }
          }, 400);
        }, 1500);
      }, 600);
    });
  };

  // 添加单词到词汇表 - 支持手动添加和对话选择 - 2025-01-30
  const handleAddWord = async (word: string, definition?: string) => {
    if (!isAuthenticated || !user) {
      setAlert({ type: 'error', message: '请先登录后再添加词汇' });
      setShowAlert(true);
      setShowWordMenu(false);
      setAddWordError('请先登录后再添加词汇');
      return;
    }

    if (!word.trim()) {
      setAlert({ type: 'error', message: '单词不能为空' });
      setShowAlert(true);
      setShowWordMenu(false);
      setAddWordError('单词不能为空');
      return;
    }

    // 检查是否已存在
    const existingWord = vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase());
    if (existingWord) {
      setAlert({ type: 'info', message: '该单词已在词汇表中' });
      setShowAlert(true);
      setShowWordMenu(false);
      setAddWordError('该单词已在词汇表中');
      return;
    }

    // 开始添加流程
    setIsAddingWord(true);
    setAddWordError(null);

    try {
      // 使用AI获取单词详细信息
      const result = await vocabularyService.addVocabularyWithAI(user.id, word.trim());
      
      // 添加到本地状态
      setVocabulary(prev => [result, ...prev]);
      
      // 显示成功消息
      setAlert({ type: 'success', message: `单词 "${word}" 已成功添加到词汇表` });
      setShowAlert(true);
      
      // 清理状态
      setShowWordMenu(false);
      setShowAddDialog(false);
      setNewWord('');
      
    } catch (error) {
      console.error('添加单词失败:', error);
      const errorMessage = '添加单词失败，请稍后重试';
      setAlert({ type: 'error', message: errorMessage });
      setShowAlert(true);
      setAddWordError(errorMessage);
    } finally {
      setIsAddingWord(false);
    }
  };

  // 关闭选词菜单
  const handleCloseWordMenu = () => {
    setShowWordMenu(false);
    setSelectedWord('');
  };

  // 文件导入功能 - 2025-01-30 16:40:22
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportError(null);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !user) return;
    
    setIsImporting(true);
    setImportError(null);
    
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const results = {
        success: [] as string[],
        errors: [] as string[]
      };
      
      for (const line of lines) {
        try {
          let word, definition, example = '';
          
          if (selectedFile.name.endsWith('.csv')) {
            const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
            word = parts[0];
            definition = parts[1] || '待添加定义';
            example = parts[2] || '';
          } else {
            const parts = line.split('-').map(p => p.trim());
            word = parts[0];
            definition = parts[1] || '待添加定义';
          }
          
          if (word && /^[a-zA-Z\s'-]+$/.test(word)) {
            const exists = vocabulary.some(item => 
              item.word.toLowerCase() === word.toLowerCase()
            );
            
            if (!exists) {
              const newItem: VocabularyItem = {
                id: `vocab_${Date.now()}_${Math.random()}`,
                word: word,
                definition: definition,
                example: example,
                pronunciation: '',
                difficulty_level: 1,
                masteryLevel: 0,
                bookmarked: false,
                addedAt: new Date().toISOString(),
                lastReviewed: null,
                source: 'import',
                userId: user.id
              };
              
              await vocabularyService.addVocabulary(newItem);
              setVocabulary(prev => [newItem, ...prev]);
              results.success.push(word);
            } else {
              results.errors.push(`"${word}" 已存在`);
            }
          } else {
            results.errors.push(`"${word}" 格式无效`);
          }
        } catch (err) {
          results.errors.push(`处理 "${line}" 时出错`);
        }
      }
      
      setImportResults(results);
      
    } catch (err) {
      setImportError('文件读取失败，请检查文件格式');
    } finally {
      setIsImporting(false);
    }
  };

  // 过滤短语
  const filteredPhrases = selectedPhraseCategory === 'All' 
    ? phrases 
    : phrases.filter(p => {
        const categoryMap: { [key: string]: string } = {
          'All': 'All',
          'Greetings': '问候',
          'Travel': '旅行', 
          'Business': '商务',
          'Socializing': '社交',
          'Dining': '餐饮'
        };
        return p.category === (categoryMap[selectedPhraseCategory] || selectedPhraseCategory);
      });

  // 渲染词汇卡片 - Material-UI版本
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
                mb: 1,
                wordBreak: 'break-word'
              }}
            >
              {item.word}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }}>
              {item.definition}
            </Typography>
            {item.example && (
              <Paper sx={{ 
                p: 2, 
                mt: 1, 
                bgcolor: 'rgba(202, 236, 202, 0.1)', 
                borderRadius: 2,
                border: '1px solid rgba(202, 236, 202, 0.2)'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontStyle: 'italic', 
                    color: '#2E7D32',
                    '&::before': { content: '"🗣️ "' },
                    '&::after': { content: '""' }
                  }}
                >
                  {item.example}
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
        
        {/* AI增强信息 */}
        {(item.pronunciation || item.phonetic || item.part_of_speech) && (
          <Box sx={{ mb: 2 }}>
            {item.pronunciation && (
              <Chip 
                label={`/${item.pronunciation}/`} 
                size="small" 
                sx={{ 
                  mr: 1, 
                  mb: 1, 
                  bgcolor: '#E3F2FD',
                  color: '#1565C0',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#BBDEFB' }
                }} 
              />
            )}
            {item.part_of_speech && (
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
            )}
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
        
        {/* 使用提示 - 2025-01-30 17:20:00: 支持双击添加词汇 */}
        {item.usage_notes && (
          <Paper 
            sx={{ 
              p: 2, 
              mt: 2, 
              bgcolor: 'rgba(227, 242, 253, 0.7)', 
              cursor: 'pointer',
              borderRadius: 2,
              border: '1px solid rgba(25, 118, 210, 0.2)',
              '&:hover': { 
                bgcolor: 'rgba(187, 222, 251, 0.7)',
                transform: 'scale(1.02)'
              },
              transition: 'all 0.3s ease'
            }}
            onDoubleClick={(e) => handleDoubleClick(e, item.usage_notes || '')}
            title="双击文本中的单词可快速添加到词汇表"
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LightbulbIcon sx={{ fontSize: 18, color: '#1976D2', mt: 0.1, flexShrink: 0 }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#1976D2',
                  fontWeight: 500,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  lineHeight: 1.5
                }}
              >
                {item.usage_notes}
              </Typography>
            </Box>
          </Paper>
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
                bgcolor: item.difficulty_level <= 2 ? '#E8F5E8' : item.difficulty_level <= 3 ? '#FFF3E0' : '#FFEBEE',
                color: item.difficulty_level <= 2 ? '#2E7D32' : item.difficulty_level <= 3 ? '#F57C00' : '#C62828',
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
            title="标记为掌握（将删除此单词）"
          >
            <CheckCircleOutlineIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );

  // 渲染短语卡片 - Material-UI版本
  const renderPhraseCard = (item: PhraseItem) => (
    <Card key={item.id} sx={{ 
      borderRadius: 4,
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f7f0 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid rgba(202, 236, 202, 0.2)',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
        '& .phrase-actions': {
          opacity: 1
        }
      },
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <IconButton 
            onClick={() => playPronunciation(item.phrase)}
            sx={{ 
              bgcolor: '#E7F3E7', 
              color: '#0D1C0D',
              width: 45,
              height: 45,
              '&:hover': { 
                bgcolor: '#CFE8CF',
                transform: 'rotate(15deg) scale(1.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <VolumeUpIcon />
          </IconButton>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ 
              color: '#0D1C0D', 
              fontWeight: 'bold',
              mb: 1,
              wordBreak: 'break-word'
            }}>
              {item.phrase}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
              {item.translation}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip 
                label={item.category} 
                size="small" 
                sx={{ 
                  bgcolor: '#F0F7F0',
                  color: '#2E7D32',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#E8F5E8' }
                }}
              />
              <IconButton
                className="phrase-actions"
                onClick={() => toggleBookmark(item, 'phrase')}
                sx={{
                  color: item.bookmarked ? '#FFD700' : '#DDD',
                  opacity: 0,
                  '&:hover': {
                    color: item.bookmarked ? '#FFC107' : '#FFD700',
                    transform: 'scale(1.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {item.bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <MobileContainer>
      <Box sx={{ 
        bgcolor: 'linear-gradient(135deg, #f8fcf8 0%, #f0f7f0 100%)', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fcf8 0%, #f0f7f0 100%)'
      }}>
        {/* Modern Header with Gradient */}
        <Paper sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          background: 'linear-gradient(135deg, #CAECCA 0%, #B8E0B8 100%)',
          elevation: 0,
          borderRadius: 0,
          boxShadow: '0 4px 20px rgba(202, 236, 202, 0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 3, justifyContent: 'space-between' }}>
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                color: '#0D1C0D',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ 
              color: '#0D1C0D', 
              fontWeight: 'bold', 
              flex: 1, 
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Learning Center
            </Typography>
            <Box sx={{ width: 48 }} />
          </Box>

          {/* Modern Search with Glass Effect */}
          <Box sx={{ px: 3, pb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search phrases, vocabulary, grammar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#5D895D' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 5,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '& fieldset': { border: 'none' },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 8px 25px rgba(202, 236, 202, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                },
                '& .MuiInputBase-input': {
                  py: 2
                }
              }}
            />
          </Box>

          {/* Modern Tab Navigation */}
          <Box sx={{ px: 3, pb: 1 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                '& .MuiTab-root': { 
                  color: 'rgba(13, 28, 13, 0.7)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderRadius: 3,
                  mx: 0.5,
                  minHeight: 48,
                  '&.Mui-selected': { 
                    color: '#0D1C0D',
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  },
                  transition: 'all 0.2s ease'
                },
                '& .MuiTabs-indicator': { 
                  bgcolor: '#0D1C0D',
                  height: 3,
                  borderRadius: 1.5
                }
              }}
            >
              <Tab label="Vocabulary" value="vocabulary" />
              <Tab label="Phrases" value="phrases" />
              <Tab label="Grammar" value="grammar" />
              <Tab label="Bookmarks" value="bookmarks" />
              <Tab label="Topics" value="topics" />
            </Tabs>
          </Box>
        </Paper>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
              <CircularProgress 
                sx={{ 
                  color: '#4c9a4c',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }} 
                size={50}
                thickness={4}
              />
            </Box>
          )}

          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ 
                color: '#0D1C0D', 
                mb: 3, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <SearchIcon />
                搜索结果
              </Typography>
              {searchResults.map((result) => (
                <Paper key={result.id} sx={{ 
                  p: 3, 
                  mb: 2, 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(202, 236, 202, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0D1C0D', mb: 1 }}>
                    {result.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {result.content}
                  </Typography>
                  <Chip 
                    label={result.type} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#E7F3E7',
                      color: '#2E7D32',
                      fontWeight: 600
                    }}
                  />
                </Paper>
              ))}
            </Box>
          )}

          {/* Vocabulary Tab */}
          {activeTab === 'vocabulary' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ 
                  color: '#0D1C0D', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  📚 我的词汇表
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => setShowAddDialog(true)}
                    sx={{ 
                      color: '#4c9a4c',
                      borderColor: '#4c9a4c',
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { 
                        bgcolor: 'rgba(76, 154, 76, 0.1)',
                        borderColor: '#3d7a3d',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(76, 154, 76, 0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    + 添加单词
                  </Button>
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => setShowImportDialog(true)}
                    startIcon={<UploadIcon />}
                    sx={{ 
                      bgcolor: '#4c9a4c',
                      color: 'white',
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { 
                        bgcolor: '#3d7a3d',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(76, 154, 76, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    导入词汇
                  </Button>
                </Box>
              </Box>
              
              {vocabulary.length === 0 ? (
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
                  border: '2px dashed #CAECCA',
                  '&:hover': {
                    borderColor: '#4c9a4c',
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Box sx={{ fontSize: '4rem', mb: 2 }}>📖</Box>
                  <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    开始你的学习之旅
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                    还没有添加任何词汇。在对话中选择单词或通过导入功能添加词汇，开始建立你的个人词汇库。
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ 
                  display: 'grid', 
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(350px, 1fr))' }
                }}>
                  {vocabulary.map(renderVocabularyCard)}
                </Box>
              )}
            </Box>
          )}

          {/* Phrases Tab */}
          {activeTab === 'phrases' && (
            <Box>
              <Typography variant="h5" sx={{ 
                color: '#0D1C0D', 
                mb: 3, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                💬 常用短语
              </Typography>
              
              {/* Modern Category Filter */}
              <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {PHRASE_CATEGORIES.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => setSelectedPhraseCategory(category)}
                    sx={{
                      bgcolor: selectedPhraseCategory === category ? '#4c9a4c' : 'rgba(255, 255, 255, 0.9)',
                      color: selectedPhraseCategory === category ? 'white' : '#5D895D',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      '&:hover': {
                        bgcolor: selectedPhraseCategory === category ? '#3d7a3d' : '#E7F3E7',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      },
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Box>
              
              {filteredPhrases.length === 0 ? (
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
                  border: '2px dashed #CAECCA'
                }}>
                  <Box sx={{ fontSize: '3rem', mb: 2 }}>🔍</Box>
                  <Typography variant="h6" color="text.secondary">
                    没有找到相关短语
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ 
                  display: 'grid', 
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' }
                }}>
                  {filteredPhrases.map(renderPhraseCard)}
                </Box>
              )}
            </Box>
          )}

          {/* Grammar Tab */}
          {activeTab === 'grammar' && (
            <Box>
              <Typography variant="h5" sx={{ 
                color: '#0D1C0D', 
                mb: 3, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                📝 语法要点
              </Typography>
              
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
                border: '1px solid rgba(202, 236, 202, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ fontSize: '4rem', mb: 2 }}>🚀</Box>
                <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  语法功能即将推出
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  我们正在开发更多语法学习功能，敬请期待！
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <Box>
              <Typography variant="h5" sx={{ 
                color: '#0D1C0D', 
                mb: 3, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                ⭐ 我的收藏
              </Typography>
              
              {bookmarks.length === 0 ? (
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
                  border: '2px dashed #CAECCA'
                }}>
                  <BookmarkBorderIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    还没有收藏任何内容
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    点击书签图标来收藏你喜欢的学习材料
                  </Typography>
                </Paper>
              ) : (
                <>
                  {/* Vocabulary Bookmarks */}
                  {bookmarks.filter(b => b.type === 'vocabulary').length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#0D1C0D', 
                        mb: 2, 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        📚 词汇收藏
                      </Typography>
                      <Box sx={{ 
                        display: 'grid', 
                        gap: 3,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(350px, 1fr))' }
                      }}>
                        {bookmarks
                          .filter(b => b.type === 'vocabulary')
                          .map(bookmark => renderVocabularyCard(bookmark.content as VocabularyItem))
                        }
                      </Box>
                    </Box>
                  )}
                  
                  {/* Phrase Bookmarks */}
                  {bookmarks.filter(b => b.type === 'phrase').length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        color: '#0D1C0D', 
                        mb: 2, 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        💬 短语收藏
                      </Typography>
                      <Box sx={{ 
                        display: 'grid', 
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' }
                      }}>
                        {bookmarks
                          .filter(b => b.type === 'phrase')
                          .map(bookmark => renderPhraseCard(bookmark.content as PhraseItem))
                        }
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <Box>
              <Typography variant="h5" sx={{ 
                color: '#0D1C0D', 
                mb: 3, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                🎯 推荐话题
              </Typography>
              
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)',
                border: '1px solid rgba(202, 236, 202, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ fontSize: '4rem', mb: 2 }}>✨</Box>
                <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  话题功能即将推出
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  我们正在准备更多有趣的学习话题，让学习更加生动有趣！
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>

        {/* 添加单词菜单 */}
        {showWordMenu && selectedWord && (
          <Paper
            sx={{
              position: 'fixed',
              top: wordMenuPosition.y + 10,
              left: wordMenuPosition.x,
              zIndex: 1000,
              p: 2,
              boxShadow: 3,
              borderRadius: 2,
              minWidth: 200
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              选中的单词: "{selectedWord}"
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleAddWord(selectedWord);
              }}
              sx={{ 
                bgcolor: '#CAECCA', 
                color: '#0D1C0D',
                '&:hover': { bgcolor: '#B8E0B8' }
              }}
            >
              添加到词汇表
            </Button>
          </Paper>
        )}

        {/* 手动添加单词对话框 - 2025-01-30 */}
        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ pb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0D1C0D' }}>
              添加新单词
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="输入单词"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="例如：hello"
              variant="outlined"
              margin="normal"
              disabled={isAddingWord}
              sx={{ 
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
              AI 将自动为您生成单词的释义、例句和发音信息
            </Typography>
            {addWordError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {addWordError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => {
                setShowAddDialog(false);
                setNewWord('');
                setAddWordError(null);
              }}
              disabled={isAddingWord}
            >
              取消
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                if (newWord.trim()) {
                  handleAddWord(newWord.trim());
                }
              }}
              disabled={!newWord.trim() || isAddingWord}
              sx={{ 
                bgcolor: '#4c9a4c',
                '&:hover': { bgcolor: '#3d7a3d' }
              }}
            >
              {isAddingWord ? (
                <>
                  <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                  添加中...
                </>
              ) : (
                '添加单词'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 文件导入对话框 */}
        <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)}>
          <DialogTitle>导入词汇</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              支持 .txt 和 .csv 格式的文件。每行一个单词，或使用逗号分隔。
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={isImporting}
              sx={{ mb: 2 }}
            >
              {isImporting ? '导入中...' : '选择文件'}
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileImport}
                disabled={isImporting}
                style={{ display: 'none' }}
              />
            </Button>
            {isImporting && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowImportDialog(false)}>取消</Button>
          </DialogActions>
        </Dialog>

        {/* Global Alert Notification - 2025-01-30 16:40:22 */}
        <Snackbar 
          open={showAlert} 
          autoHideDuration={4000} 
          onClose={() => setShowAlert(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={alert.type as 'success' | 'error' | 'info' | 'warning'} 
            onClose={() => setShowAlert(false)}
            sx={{
              borderRadius: 3,
              '& .MuiAlert-icon': { alignSelf: 'center' },
              minWidth: 280
            }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </MobileContainer>
  );
}

export default Vocabulary;