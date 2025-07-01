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

function Vocabulary() {
  const { t } = useTranslation('learning');
  const { changeLanguage, currentLanguage, supportedLanguages } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Get categories from translations
  const PHRASE_CATEGORIES = [
    t('phrases.categories.all'),
    t('phrases.categories.greetings'),
    t('phrases.categories.travel'),
    t('phrases.categories.business'),
    t('phrases.categories.socializing'),
    t('phrases.categories.dining')
  ];
  
  const GRAMMAR_CATEGORIES = [
    t('grammar.categories.all'),
    t('grammar.categories.verbTenses'),
    t('grammar.categories.sentenceStructure'),
    t('grammar.categories.prepositions'),
    t('grammar.categories.vocabulary')
  ];
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<LearningTab>('vocabulary');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const [importResults, setImportResults] = useState<{ success: VocabularyItem[], errors: string[] } | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  
  // 定义loadUserData函数
  const loadUserData = async () => {
    console.log('loadUserData called, current loading state:', loading);
    setLoading(true);
    try {
      const [vocabData, phrasesData, bookmarksData] = await Promise.all([
        vocabularyService.getUserVocabulary(user?.id || 'guest'),
        phrasesService.getUserPhrases(user?.id || 'guest'),
        user ? bookmarksService.getUserBookmarks(user.id) : Promise.resolve([])
      ]);
      
      // 只显示未掌握的词汇（masteryLevel !== 2）
      const filteredVocab = vocabData.filter(v => v.masteryLevel !== 2);
      setVocabulary(filteredVocab);
      setPhrases(phrasesData);
      setBookmarks(bookmarksData);
      
      console.log(`Loaded ${filteredVocab.length} vocabulary (${vocabData.length} total), ${phrasesData.length} phrases from database`);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(t('errors.loadFailed'));
    } finally {
      console.log('loadUserData finished, setting loading to false');
      setLoading(false);
    }
  };
  
  // 监听tab切换，当切换到vocabulary时重新加载数据（但不要频繁重载）
  useEffect(() => {
    if (activeTab === 'vocabulary' && vocabulary.length === 0) {
      loadUserData(); // 只有当数据为空时才重新加载
    } else if (activeTab === 'bookmarks') {
      // 切换到收藏页面时从本地状态刷新收藏数据
      const refreshBookmarks = () => {
        const updatedBookmarks: BookmarkItem[] = [];
        
        // 从本地vocabulary状态获取收藏
        vocabulary.filter(v => v.bookmarked).forEach(v => {
          updatedBookmarks.push({
            id: `vocab_${v.id}`,
            type: 'vocabulary',
            itemId: v.id,
            content: v,
            createdAt: v.createdAt
          });
        });
        
        // 从本地phrases状态获取收藏
        phrases.filter(p => p.bookmarked).forEach(p => {
          updatedBookmarks.push({
            id: `phrase_${p.id}`,
            type: 'phrase',
            itemId: p.id,
            content: p,
            createdAt: p.createdAt
          });
        });
        
        // 按时间排序并更新状态
        updatedBookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookmarks(updatedBookmarks);
      };
      
      refreshBookmarks();
    }
  }, [activeTab, user, vocabulary, phrases]);
  
  // 过滤器状态 - 使用翻译键作为默认值
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState(t('phrases.categories.all'));
  const [selectedGrammarCategory, setSelectedGrammarCategory] = useState(t('grammar.categories.all'));

  // 选词功能状态
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showWordMenu, setShowWordMenu] = useState(false);
  const [wordMenuPosition, setWordMenuPosition] = useState({ x: 0, y: 0 });
  const [isAddingSelectedWord, setIsAddingSelectedWord] = useState(false);
  const [wordAddSuccess, setWordAddSuccess] = useState<string | null>(null);
  
  // 成功提示状态
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 当语言切换时重置过滤器状态
  useEffect(() => {
    setSelectedPhraseCategory(t('phrases.categories.all'));
    setSelectedGrammarCategory(t('grammar.categories.all'));
  }, [currentLanguage, t]);

  // 初始化数据
  useEffect(() => {
    loadUserData(); // 直接加载数据，包括localStorage备份
  }, [isAuthenticated, user]);

  // 监听页面可见性变化，增量同步数据而不是完全重新加载
  useEffect(() => {
    const syncNewVocabulary = async () => {
      if (!user) return;
      
      try {
        // 只获取新的词汇数据进行增量更新
        const allVocabData = await vocabularyService.getUserVocabulary(user.id);
        const currentVocabIds = new Set(vocabulary.map(v => v.id));
        
        // 找出新添加的词汇（未掌握的）
        const newVocab = allVocabData.filter(v => 
          v.masteryLevel !== 2 && !currentVocabIds.has(v.id)
        );
        
        if (newVocab.length > 0) {
          console.log('Found new vocabulary items:', newVocab);
          setVocabulary(prev => [...newVocab, ...prev]);
        }
      } catch (err) {
        console.error('Error syncing vocabulary:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && vocabulary.length > 0) {
        console.log('Page became visible, syncing new vocabulary...');
        syncNewVocabulary();
      }
    };

    const handleFocus = () => {
      if (vocabulary.length > 0) {
        console.log('Page gained focus, syncing new vocabulary...');
        syncNewVocabulary();
      }
    };

    // 添加popstate事件监听，当从其他页面返回时增量同步
    const handlePopState = () => {
      if (vocabulary.length > 0) {
        console.log('Browser back/forward navigation, syncing new vocabulary...');
        setTimeout(() => syncNewVocabulary(), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, user, vocabulary]);

  // 搜索功能
  useEffect(() => {
    if (searchQuery.trim() && user) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, user]);

  const handleSearch = async () => {
    if (!user) return;
    
    try {
      const results = await searchService.search(searchQuery, user.id);
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
        // 更新vocabulary列表
        setVocabulary(prev => prev.map(v => 
          v.id === item.id ? { ...v, bookmarked: newBookmarked } : v
        ));
      } else {
        await phrasesService.updatePhraseBookmark(item.id, newBookmarked);
        // 更新phrases列表
        setPhrases(prev => prev.map(p => 
          p.id === item.id ? { ...p, bookmarked: newBookmarked } : p
        ));
      }
      
      // 立即更新收藏列表 - 使用本地状态构建收藏列表以确保同步
      const updatedBookmarks: BookmarkItem[] = [];
      
      // 从本地vocabulary状态获取收藏
      vocabulary.filter(v => v.bookmarked).forEach(v => {
        updatedBookmarks.push({
          id: `vocab_${v.id}`,
          type: 'vocabulary',
          itemId: v.id,
          content: v,
          createdAt: v.createdAt
        });
      });
      
      // 从本地phrases状态获取收藏
      phrases.filter(p => p.bookmarked).forEach(p => {
        updatedBookmarks.push({
          id: `phrase_${p.id}`,
          type: 'phrase',
          itemId: p.id,
          content: p,
          createdAt: p.createdAt
        });
      });
      
      // 按时间排序并更新状态
      updatedBookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookmarks(updatedBookmarks);
      console.log('Updated bookmarks from local state:', updatedBookmarks);
      
      // 显示收藏状态提示
      const itemName = 'word' in item ? item.word : item.phrase;
      setSuccessMessage(newBookmarked ? `"${itemName}" 已添加到收藏` : `"${itemName}" 已从收藏中移除`);
      setError(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError(t('errors.bookmarkFailed'));
    }
  }, [user, t, vocabulary, phrases]);

  // 切换掌握状态
  const toggleMastery = useCallback(async (vocabularyItem: VocabularyItem) => {
    const newLevel = vocabularyItem.masteryLevel === 2 ? 0 : 2;
    
    try {
      await vocabularyService.updateVocabulary(vocabularyItem.id, { 
        masteryLevel: newLevel,
        lastReviewed: new Date().toISOString()
      });
      
      if (newLevel === 2) {
        // 已掌握的单词从词汇列表中移除
        setVocabulary(prev => prev.filter(v => v.id !== vocabularyItem.id));
        
        // 显示成功消息
        setSuccessMessage(`单词 "${vocabularyItem.word}" 已标记为已掌握！`);
        setError(null);
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        // 重新添加到词汇列表
        setVocabulary(prev => prev.map(v => 
          v.id === vocabularyItem.id ? { ...v, masteryLevel: newLevel } : v
        ));
      }
    } catch (err) {
      console.error('Error toggling mastery:', err);
      setError(t('errors.masteryFailed'));
    }
  }, [t]);

  // 添加新词汇
  const handleAddVocabulary = async () => {
    if (!newWord.trim()) {
      setAddWordError(t('vocabulary.add.emptyWord'));
      return;
    }

    setIsAddingWord(true);
    setAddWordError(null);

    try {
      const vocabularyItem = await vocabularyService.addVocabularyWithAI(
        user?.id || 'guest',
        newWord.trim()
      );
      
      // 添加到本地状态
      setVocabulary(prev => [vocabularyItem, ...prev]);
      
      // 重置状态
      setNewWord('');
      setShowAddDialog(false);
      
      console.log('Successfully added vocabulary:', vocabularyItem);
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      setAddWordError(error instanceof Error ? error.message : t('vocabulary.add.failed'));
    } finally {
      setIsAddingWord(false);
    }
  };

  // 关闭添加对话框
  const handleCloseAddDialog = () => {
    if (isAddingWord) return; // 防止在加载时关闭
    setShowAddDialog(false);
    setNewWord('');
    setAddWordError(null);
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'txt' && fileExtension !== 'csv') {
        setImportError(t('vocabulary.import.invalidFileType'));
        return;
      }
      
      // 验证文件大小 (限制为1MB)
      if (file.size > 1024 * 1024) {
        setImportError(t('vocabulary.import.fileTooLarge'));
        return;
      }
      
      setSelectedFile(file);
      setImportError(null);
    }
  };

  // 开始导入文件
  const handleImportFile = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportError(null);
    setImportResults(null);

    try {
      const results = await vocabularyService.importVocabularyFromFile(
        user?.id || 'guest',
        selectedFile
      );
      
      // 更新本地状态
      if (results.success.length > 0) {
        setVocabulary(prev => [...results.success, ...prev]);
      }
      
      setImportResults(results);
      
      // 如果全部成功，3秒后自动关闭对话框
      if (results.errors.length === 0) {
        setTimeout(() => {
          handleCloseImportDialog();
        }, 3000);
      }
      
      console.log('Import completed:', results);
    } catch (error) {
      console.error('Error importing file:', error);
      setImportError(error instanceof Error ? error.message : t('vocabulary.import.failed'));
    } finally {
      setIsImporting(false);
    }
  };

  // 关闭导入对话框
  const handleCloseImportDialog = () => {
    if (isImporting) return;
    setShowImportDialog(false);
    setSelectedFile(null);
    setImportError(null);
    setImportResults(null);
    setImportProgress({ current: 0, total: 0 });
  };

  // 播放发音
  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  // 处理文本选择
  const handleTextSelection = (event: React.MouseEvent) => {
    if (!isAuthenticated) return; // 只有登录用户才能使用选词功能
    
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      // 检查是否为英文单词（包含字母的单词）
      if (/^[a-zA-Z'-]+$/.test(selectedText) && selectedText.length > 1) {
        setSelectedWord(selectedText);
        setWordMenuPosition({ x: event.clientX, y: event.clientY });
        setShowWordMenu(true);
      }
    }
  };

  // 添加选中的单词到词汇表
  const handleAddSelectedWord = async () => {
    if (!selectedWord || !user) return;
    
    setIsAddingSelectedWord(true);
    try {
      const vocabularyItem = await vocabularyService.addVocabularyWithAI(user.id, selectedWord);
      
      // 添加到本地状态
      setVocabulary(prev => [vocabularyItem, ...prev]);
      
      setWordAddSuccess(selectedWord);
      setShowWordMenu(false);
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setWordAddSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding word to vocabulary:', error);
    } finally {
      setIsAddingSelectedWord(false);
    }
  };

  // 点击其他地方关闭选词菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setShowWordMenu(false);
    };

    if (showWordMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showWordMenu]);

  // 获取话题图标
  const getTopicIcon = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      chat: 'chat_bubble_outline',
      restaurant: 'restaurant',
      flight: 'flight',
      work: 'work',
      shopping_cart: 'shopping_cart',
      local_hospital: 'local_hospital'
    };
    return iconMap[iconName] || 'chat_bubble_outline';
  };

  // 渲染词汇卡片 - 增强版本显示AI信息
  const renderVocabularyCard = (item: VocabularyItem) => (
    <div key={item.id} className="bg-white p-4 rounded-xl hover:bg-gray-50 cursor-pointer mb-3 shadow-sm">
      {/* 头部：单词和控制按钮 */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => playPronunciation(item.word)}
          className="text-[#0D1C0D] flex items-center justify-center rounded-lg bg-[#E7F3E7] shrink-0 size-12 hover:bg-[#CFE8CF]"
        >
          <span className="material-icons">volume_up</span>
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`text-[#0D1C0D] text-lg font-semibold leading-normal ${item.masteryLevel === 2 ? 'line-through opacity-70' : ''}`}>
              {item.word}
            </p>
            {item.phonetic && (
              <span className="text-gray-500 text-sm italic">
                {item.phonetic}
              </span>
            )}
            {item.part_of_speech && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {item.part_of_speech}
              </span>
            )}
          </div>
          {item.difficulty_level && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              item.difficulty_level === 'beginner' ? 'bg-green-100 text-green-600' :
              item.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              {item.difficulty_level}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => toggleBookmark(item, 'vocabulary')}
            className={`p-2 rounded-lg ${
              item.bookmarked 
                ? 'text-[#0FDB0F] hover:bg-[#E7F3E7]' 
                : 'text-gray-400 hover:text-[#0FDB0F] hover:bg-[#E7F3E7]'
            }`}
          >
            <span className="material-icons">
              {item.bookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
          <button
            onClick={() => toggleMastery(item)}
            className={`p-2 rounded-lg ${
              item.masteryLevel === 2 
                ? 'text-[#0FDB0F] hover:bg-[#E7F3E7]' 
                : 'text-gray-400 hover:text-[#0FDB0F] hover:bg-[#E7F3E7]'
            }`}
          >
            <span className="material-icons">
              {item.masteryLevel === 2 ? 'check_circle' : 'check_circle_outline'}
            </span>
          </button>
        </div>
      </div>

      {/* 定义和翻译 */}
      <div className="mb-2">
        <p 
          className="text-gray-700 text-sm font-normal leading-normal mb-1 cursor-text hover:bg-gray-50 rounded p-1 -m-1"
          onMouseUp={handleTextSelection}
        >
          {item.definition}
        </p>
        {item.chinese_translation && (
          <p 
            className="text-blue-600 text-sm font-normal leading-normal cursor-text hover:bg-gray-50 rounded p-1 -m-1"
            onMouseUp={handleTextSelection}
          >
            {item.chinese_translation}
          </p>
        )}
      </div>

      {/* 例句 */}
      <div className="mb-3">
        <p 
          className="text-gray-500 text-sm italic leading-normal cursor-text hover:bg-gray-50 rounded p-1 -m-1"
          onMouseUp={handleTextSelection}
        >
          "{item.example}"
        </p>
      </div>

      {/* 同义词和反义词 */}
      {(item.synonyms?.length > 0 || item.antonyms?.length > 0) && (
        <div className="flex gap-4 mb-2">
          {item.synonyms?.length > 0 && (
            <div className="flex-1">
              <span className="text-xs text-gray-500 font-medium">Synonyms:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.synonyms.slice(0, 3).map((synonym, index) => (
                  <span key={index} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
          )}
          {item.antonyms?.length > 0 && (
            <div className="flex-1">
              <span className="text-xs text-gray-500 font-medium">Antonyms:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.antonyms.slice(0, 2).map((antonym, index) => (
                  <span key={index} className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                    {antonym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 使用提示 */}
      {item.usage_notes && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p 
            className="text-blue-700 text-xs cursor-text hover:bg-blue-100 rounded p-1 -m-1"
            onMouseUp={handleTextSelection}
          >
            <span className="material-icons text-sm mr-1">lightbulb</span>
            {item.usage_notes}
          </p>
        </div>
      )}
    </div>
  );

  // 渲染短语卡片 - 简洁风格
  const renderPhraseCard = (item: PhraseItem) => (
    <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl hover:bg-gray-50 cursor-pointer mb-2">
      <div className="text-[#0D1C0D] flex items-center justify-center rounded-lg bg-[#E7F3E7] shrink-0 size-12">
        <span className="material-icons">chat_bubble_outline</span>
      </div>
      
      <div className="flex-1">
        <p 
          className="text-[#0D1C0D] text-base font-medium leading-normal cursor-text hover:bg-gray-50 rounded p-1 -m-1"
          onMouseUp={handleTextSelection}
        >
          {item.phrase}
        </p>
        <p 
          className="text-gray-600 text-sm font-normal leading-normal cursor-text hover:bg-gray-50 rounded p-1 -m-1"
          onMouseUp={handleTextSelection}
        >
          {item.translation}
        </p>
        <p 
          className="text-gray-500 text-xs italic leading-normal mt-1 cursor-text hover:bg-gray-50 rounded p-1 -m-1"
          onMouseUp={handleTextSelection}
        >
          "{item.usageExample}"
        </p>
      </div>
      
      <button
        onClick={() => toggleBookmark(item, 'phrase')}
        className={`p-2 rounded-lg ${
          item.bookmarked 
            ? 'text-[#0FDB0F] hover:bg-[#E7F3E7]' 
            : 'text-gray-400 hover:text-[#0FDB0F] hover:bg-[#E7F3E7]'
        }`}
      >
        <span className="material-icons">
          {item.bookmarked ? 'bookmark' : 'bookmark_border'}
        </span>
      </button>
    </div>
  );

  // 渲染话题卡片 - 简洁风格
  const renderTopicCard = (topic: TopicItem) => (
    <div
      key={topic.id}
      className="flex items-center gap-3 bg-white p-3 rounded-xl hover:bg-gray-50 cursor-pointer mb-2"
      onClick={() => navigate('/topic', { state: { selectedTopic: topic.name } })}
    >
      <div className="text-[#0D1C0D] flex items-center justify-center rounded-lg bg-[#E7F3E7] shrink-0 size-12">
        <span className="material-icons">{getTopicIcon(topic.icon)}</span>
      </div>
      <div className="flex-1">
        <p className="text-[#0D1C0D] text-base font-medium leading-normal">
          {topic.name}
        </p>
        {topic.description && (
          <p className="text-gray-600 text-sm font-normal leading-normal">
            {topic.description}
          </p>
        )}
      </div>
    </div>
  );

  // 过滤短语 - 使用翻译映射
  const filteredPhrases = selectedPhraseCategory === t('phrases.categories.all')
    ? phrases 
    : phrases.filter(p => {
        // Map translated categories back to original data categories
        const categoryMap: { [key: string]: string } = {
          [t('phrases.categories.greetings')]: '问候',
          [t('phrases.categories.travel')]: '旅行', 
          [t('phrases.categories.business')]: '商务',
          [t('phrases.categories.socializing')]: '社交',
          [t('phrases.categories.dining')]: '餐饮'
        };
        return p.category === (categoryMap[selectedPhraseCategory] || selectedPhraseCategory);
      });

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#F8FCF8] justify-between overflow-x-hidden" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      {/* Header with Language Switcher */}
      <header className="sticky top-0 z-10 bg-[#F8FCF8]">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-[#0D1C0D] flex size-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <span className="material-icons">arrow_back_ios_new</span>
          </button>
          <h1 className="text-[#0D1C0D] text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            {t('title')}
          </h1>
          {/* Language Switcher */}
          <div className="relative">
            <select 
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-[#E7F3E7] text-[#0D1C0D] rounded-lg px-3 py-1 text-sm border-none focus:outline-none hover:bg-[#CFE8CF]"
            >
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search - 完全按照HTML设计稿 */}
        <div className="px-4 py-3">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-full h-full shadow-sm">
              <div className="text-[#0D1C0D] flex bg-[#E7F3E7] items-center justify-center pl-4 rounded-l-full border-r-0">
                <span className="material-icons text-gray-500">search</span>
              </div>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-[#0D1C0D] focus:outline-0 focus:ring-0 border-none bg-[#E7F3E7] h-full placeholder:text-gray-500 px-4 text-base font-normal leading-normal" 
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Tab Navigation - 按照HTML设计稿 */}
        <div className="pb-0">
          <div className="flex border-b border-[#CFE8CF] px-2 gap-1 overflow-x-auto whitespace-nowrap">
            {[
              { key: 'vocabulary', label: t('tabs.vocabulary') },
              { key: 'phrases', label: t('tabs.phrases') },
              { key: 'grammar', label: t('tabs.grammar') },
              { key: 'topics', label: t('tabs.topics') },
              { key: 'bookmarks', label: t('tabs.bookmarks') }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as LearningTab)}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-3 flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'border-b-[#0FDB0F] text-[#0D1C0D]'
                    : 'border-b-transparent text-[#4B9B4B] hover:text-[#0D1C0D]'
                }`}
              >
                <p className={`text-sm leading-normal ${
                  activeTab === tab.key ? 'font-semibold' : 'font-medium'
                }`}>
                  {tab.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Success Alert */}
      {successMessage && (
        <div className="mx-4 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{successMessage}</p>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-green-400 hover:text-green-600 float-right p-1 rounded-lg hover:bg-green-100"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 float-right p-1 rounded-lg hover:bg-red-100"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mx-4 mt-2 bg-white rounded-xl shadow-sm p-3">
          <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">{t('search.results')}</h3>
          <div className="space-y-1">
            {searchResults.map((result) => (
              <div 
                key={result.id}
                className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => setActiveTab(result.type)}
              >
                <p className="text-[#0D1C0D] font-medium">{result.title}</p>
                <p className="text-gray-600 text-sm">{result.subtitle} - {result.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Vocabulary Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#0D1C0D] mb-4">{t('vocabulary.add.title')}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vocabulary.add.wordLabel')}
              </label>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder={t('vocabulary.add.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FDB0F] focus:border-transparent"
                disabled={isAddingWord}
                onKeyPress={(e) => e.key === 'Enter' && !isAddingWord && handleAddVocabulary()}
              />
            </div>

            {addWordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{addWordError}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-700 text-sm">
                <span className="material-icons text-sm mr-1">info</span>
                {t('vocabulary.add.aiHelp')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseAddDialog}
                disabled={isAddingWord}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddVocabulary}
                disabled={isAddingWord || !newWord.trim()}
                className="flex-1 px-4 py-2 bg-[#0FDB0F] text-white rounded-lg hover:bg-[#0CBF0C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAddingWord ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('vocabulary.add.adding')}
                  </div>
                ) : (
                  t('vocabulary.add.submit')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import File Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-[#0D1C0D] mb-4">{t('vocabulary.import.title')}</h3>
            
            {/* 文件选择区域 */}
            {!importResults && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('vocabulary.import.fileLabel')}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0FDB0F] transition-colors">
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileSelect}
                    disabled={isImporting}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="material-icons text-gray-400 text-4xl mb-2 block">upload_file</span>
                    <p className="text-gray-600 mb-1">{t('vocabulary.import.dropZone')}</p>
                    <p className="text-xs text-gray-500">{t('vocabulary.import.supportedFormats')}</p>
                  </label>
                </div>
                
                {selectedFile && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-green-600">check_circle</span>
                      <span className="text-green-700 text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-green-600 text-xs">({(selectedFile.size / 1024).toFixed(1)}KB)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 导入过程中的进度显示 */}
            {isImporting && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{t('vocabulary.import.processing')}</span>
                  <span className="text-sm text-gray-500">{importProgress.current}/{importProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#0FDB0F] h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: importProgress.total > 0 ? `${(importProgress.current / importProgress.total) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* 导入结果 */}
            {importResults && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-[#0D1C0D] mb-3">{t('vocabulary.import.results')}</h4>
                
                {/* 成功统计 */}
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-green-600">check_circle</span>
                    <span className="text-green-700 font-medium">
                      {t('vocabulary.import.successCount', { count: importResults.success.length })}
                    </span>
                  </div>
                </div>

                {/* 错误统计 */}
                {importResults.errors.length > 0 && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-icons text-red-600">error</span>
                      <span className="text-red-700 font-medium">
                        {t('vocabulary.import.errorCount', { count: importResults.errors.length })}
                      </span>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {importResults.errors.slice(0, 5).map((error, index) => (
                        <p key={index} className="text-red-600 text-xs mb-1">{error}</p>
                      ))}
                      {importResults.errors.length > 5 && (
                        <p className="text-red-500 text-xs italic">
                          {t('vocabulary.import.moreErrors', { count: importResults.errors.length - 5 })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 错误显示 */}
            {importError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{importError}</p>
              </div>
            )}

            {/* 文件格式说明 */}
            {!importResults && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-700 text-sm mb-2">
                  <span className="material-icons text-sm mr-1">info</span>
                  {t('vocabulary.import.formatInfo')}
                </p>
                <ul className="text-blue-600 text-xs list-disc list-inside space-y-1">
                  <li>{t('vocabulary.import.txtFormat')}</li>
                  <li>{t('vocabulary.import.csvFormat')}</li>
                </ul>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseImportDialog}
                disabled={isImporting}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {importResults ? t('common.close') : t('common.cancel')}
              </button>
              {!importResults && (
                <button
                  onClick={handleImportFile}
                  disabled={isImporting || !selectedFile}
                  className="flex-1 px-4 py-2 bg-[#0FDB0F] text-white rounded-lg hover:bg-[#0CBF0C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isImporting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('vocabulary.import.importing')}
                    </div>
                  ) : (
                    t('vocabulary.import.submit')
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow pb-24 px-2">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0FDB0F]"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Vocabulary Tab */}
            {activeTab === 'vocabulary' && (
              <div>
                <h2 className="text-[#0D1C0D] text-xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-6">
                  {t('vocabulary.title')}
                </h2>
                <div className="space-y-2 px-2">
                  {vocabulary.map(renderVocabularyCard)}
                </div>
                {vocabulary.length === 0 && (
                  <div className="bg-white mx-4 p-8 rounded-xl shadow-sm text-center">
                    <span className="material-icons text-gray-400 text-5xl mb-4 block">check_circle</span>
                    <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">太棒了！</h3>
                    <p className="text-gray-600">你已经掌握了所有词汇，继续加油学习新单词吧！</p>
                  </div>
                )}
              </div>
            )}

            {/* Phrases Tab */}
            {activeTab === 'phrases' && (
              <div>
                {/* Category Filter - 按照HTML设计稿 */}
                <div className="px-4 py-3">
                  <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                    {PHRASE_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedPhraseCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 ${
                          selectedPhraseCategory === category
                            ? 'bg-[#0FDB0F] text-white'
                            : 'bg-[#E7F3E7] text-[#4B9B4B] hover:bg-[#CFE8CF]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <h2 className="text-[#0D1C0D] text-xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-3">
                  {t('phrases.title')}
                </h2>
                <div className="space-y-2 px-2">
                  {filteredPhrases.map(renderPhraseCard)}
                </div>
              </div>
            )}

            {/* Grammar Tab */}
            {activeTab === 'grammar' && (
              <div>
                {/* Category Filter */}
                <div className="px-4 py-3">
                  <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                    {GRAMMAR_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedGrammarCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 ${
                          selectedGrammarCategory === category
                            ? 'bg-[#0FDB0F] text-white'
                            : 'bg-[#E7F3E7] text-[#4B9B4B] hover:bg-[#CFE8CF]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white mx-4 p-4 rounded-xl shadow-sm mb-4">
                  <h2 className="text-[#0D1C0D] text-xl font-bold mb-4">{t('grammar.categories.verbTenses')}</h2>
                  
                  <div className="mb-4">
                    <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">{t('grammar.topics.presentPerfect.title')}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {t('grammar.topics.presentPerfect.description')}
                    </p>
                    <div className="bg-[#F0F7F0] p-3 rounded-lg">
                      <p className="text-[#0D1C0D] font-medium mb-1">例句:</p>
                      <p className="text-[#3A6A3A] italic" dangerouslySetInnerHTML={{ __html: `'${t('grammar.topics.presentPerfect.example')}'` }} />
                    </div>
                  </div>

                  <hr className="border-[#CFE8CF] my-4" />

                  <div>
                    <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">{t('grammar.topics.simplePast.title')}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {t('grammar.topics.simplePast.description')}
                    </p>
                    <div className="bg-[#F0F7F0] p-3 rounded-lg">
                      <p className="text-[#0D1C0D] font-medium mb-1">例句:</p>
                      <p className="text-[#3A6A3A] italic" dangerouslySetInnerHTML={{ __html: `'${t('grammar.topics.simplePast.example')}'` }} />
                    </div>
                  </div>
                </div>

                {/* Practice Exercise */}
                <div className="bg-white mx-4 p-4 rounded-xl shadow-sm">
                  <h2 className="text-[#0D1C0D] text-xl font-bold mb-4">{t('grammar.exercise.title')}</h2>
                  <p className="text-[#0D1C0D] font-medium mb-2">{t('grammar.exercise.instruction')}</p>
                  <p className="text-gray-600 mb-4">{t('grammar.exercise.question')}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 border border-[#CFE8CF] rounded-lg text-[#0D1C0D] hover:bg-gray-50">
                      {t('grammar.exercise.options.went')}
                    </button>
                    <button className="flex-1 px-4 py-2 border border-[#CFE8CF] rounded-lg text-[#0D1C0D] hover:bg-gray-50">
                      {t('grammar.exercise.options.go')}
                    </button>
                    <button className="flex-1 px-4 py-2 border border-[#CFE8CF] rounded-lg text-[#0D1C0D] hover:bg-gray-50">
                      {t('grammar.exercise.options.goes')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <div>
                <h2 className="text-[#0D1C0D] text-xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-6">
                  {t('topics.title')}
                </h2>
                <div className="space-y-2 px-2">
                  {topicsService.getTopics().map(renderTopicCard)}
                </div>
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div>
                <h2 className="text-[#0D1C0D] text-xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-6">
                  {t('bookmarks.title')}
                </h2>
                
                {bookmarks.length === 0 ? (
                  <div className="bg-white mx-4 p-8 rounded-xl shadow-sm text-center">
                    <span className="material-icons text-gray-400 text-5xl mb-4 block">bookmark_border</span>
                    <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">{t('bookmarks.empty.title')}</h3>
                    <p className="text-gray-600">{t('bookmarks.empty.description')}</p>
                  </div>
                ) : (
                  <div className="space-y-4 px-2">
                    {/* Vocabulary Bookmarks */}
                    {bookmarks.filter(b => b.type === 'vocabulary').length > 0 && (
                      <div className="bg-[#F0F7F0] p-4 rounded-xl">
                        <h3 className="text-[#0D1C0D] text-lg font-semibold mb-3">{t('bookmarks.sections.vocabulary')}</h3>
                        <div className="space-y-2">
                          {bookmarks
                            .filter(b => b.type === 'vocabulary')
                            .map(bookmark => {
                              const vocabItem = bookmark.content as VocabularyItem;
                              return renderVocabularyCard(vocabItem);
                            })
                          }
                        </div>
                      </div>
                    )}

                    {/* Phrase Bookmarks */}
                    {bookmarks.filter(b => b.type === 'phrase').length > 0 && (
                      <div className="bg-[#F0F7F0] p-4 rounded-xl">
                        <h3 className="text-[#0D1C0D] text-lg font-semibold mb-3">{t('bookmarks.sections.phrases')}</h3>
                        <div className="space-y-2">
                          {bookmarks
                            .filter(b => b.type === 'phrase')
                            .map(bookmark => {
                              const phraseItem = bookmark.content as PhraseItem;
                              return renderPhraseCard(phraseItem);
                            })
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Buttons - only show on vocabulary tab */}
      {activeTab === 'vocabulary' && (
        <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-40">
          {/* File Import Button */}
          <button
            onClick={() => setShowImportDialog(true)}
            className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
            style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
            title={t('vocabulary.import.title')}
          >
            <span className="material-icons text-xl">file_upload</span>
          </button>
          
          {/* Add Word Button */}
          <button
            onClick={() => setShowAddDialog(true)}
            className="bg-[#0FDB0F] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-[#0CBF0C] transition-colors"
            style={{ boxShadow: '0 4px 12px rgba(15, 219, 15, 0.3)' }}
            title={t('vocabulary.add.title')}
          >
            <span className="material-icons text-2xl">add</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Vocabulary;