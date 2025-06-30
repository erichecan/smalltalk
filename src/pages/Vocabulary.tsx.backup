import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

const PHRASE_CATEGORIES = ['All', 'Greetings', 'Travel', 'Business', 'Socializing', 'Dining'];
const GRAMMAR_CATEGORIES = ['All', '动词时态', '句子结构', '介词', '词汇'];

export default function Vocabulary() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
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
  
  // 过滤器状态
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState('All');
  const [selectedGrammarCategory, setSelectedGrammarCategory] = useState('All');

  // 初始化数据
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      loadUserData(); // 使用模拟数据
    }
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
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('更新收藏状态失败');
    }
  }, [user]);

  // 切换掌握状态
  const toggleMastery = useCallback(async (vocabularyItem: VocabularyItem) => {
    const newLevel = vocabularyItem.masteryLevel === 2 ? 0 : 2;
    
    try {
      await vocabularyService.updateVocabulary(vocabularyItem.id, { 
        masteryLevel: newLevel,
        lastReviewed: new Date().toISOString()
      });
      
      setVocabulary(prev => prev.map(v => 
        v.id === vocabularyItem.id ? { ...v, masteryLevel: newLevel } : v
      ));
    } catch (err) {
      console.error('Error toggling mastery:', err);
      setError('更新学习状态失败');
    }
  }, []);

  // 播放发音
  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

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

  // 渲染词汇卡片 - 简洁风格
  const renderVocabularyCard = (item: VocabularyItem) => (
    <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl hover:bg-gray-50 cursor-pointer mb-2">
      <button
        onClick={() => playPronunciation(item.word)}
        className="text-[#0D1C0D] flex items-center justify-center rounded-lg bg-[#E7F3E7] shrink-0 size-12 hover:bg-[#CFE8CF]"
      >
        <span className="material-icons">volume_up</span>
      </button>
      
      <div className="flex-1">
        <p className={`text-[#0D1C0D] text-base font-medium leading-normal ${item.masteryLevel === 2 ? 'line-through opacity-70' : ''}`}>
          {item.word}
        </p>
        <p className="text-gray-600 text-sm font-normal leading-normal">
          {item.definition}
        </p>
        <p className="text-gray-500 text-xs italic leading-normal mt-1">
          "{item.example}"
        </p>
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
  );

  // 渲染短语卡片 - 简洁风格
  const renderPhraseCard = (item: PhraseItem) => (
    <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl hover:bg-gray-50 cursor-pointer mb-2">
      <div className="text-[#0D1C0D] flex items-center justify-center rounded-lg bg-[#E7F3E7] shrink-0 size-12">
        <span className="material-icons">chat_bubble_outline</span>
      </div>
      
      <div className="flex-1">
        <p className="text-[#0D1C0D] text-base font-medium leading-normal">
          {item.phrase}
        </p>
        <p className="text-gray-600 text-sm font-normal leading-normal">
          {item.translation}
        </p>
        <p className="text-gray-500 text-xs italic leading-normal mt-1">
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

  // 过滤短语
  const filteredPhrases = selectedPhraseCategory === 'All' 
    ? phrases 
    : phrases.filter(p => {
        const categoryMap: { [key: string]: string } = {
          'Greetings': '问候',
          'Travel': '旅行', 
          'Business': '商务',
          'Socializing': '社交',
          'Dining': '餐饮'
        };
        return p.category === (categoryMap[selectedPhraseCategory] || selectedPhraseCategory);
      });

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#F8FCF8] justify-between overflow-x-hidden" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      {/* Header - 完全按照HTML设计稿 */}
      <header className="sticky top-0 z-10 bg-[#F8FCF8]">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-[#0D1C0D] flex size-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <span className="material-icons">arrow_back_ios_new</span>
          </button>
          <h1 className="text-[#0D1C0D] text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Learning Center
          </h1>
          <div className="size-10"></div>
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
                placeholder="Search phrases, vocabulary, grammar..."
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
              { key: 'vocabulary', label: 'Vocabulary' },
              { key: 'phrases', label: 'Phrases' },
              { key: 'grammar', label: 'Grammar' },
              { key: 'topics', label: 'Topics' },
              { key: 'bookmarks', label: 'Bookmarks' }
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
          <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">Search Results</h3>
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
                  Vocabulary from Conversations
                </h2>
                <div className="space-y-2 px-2">
                  {vocabulary.map(renderVocabularyCard)}
                </div>
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
                  Common Phrases
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
                  <h2 className="text-[#0D1C0D] text-xl font-bold mb-4">动词时态</h2>
                  
                  <div className="mb-4">
                    <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">现在完成时</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      用现在完成时来谈论过去开始并延续到现在的动作。
                    </p>
                    <div className="bg-[#F0F7F0] p-3 rounded-lg">
                      <p className="text-[#0D1C0D] font-medium mb-1">例句:</p>
                      <p className="text-[#3A6A3A] italic">
                        'I <strong>have lived</strong> in London for five years.'
                      </p>
                    </div>
                  </div>

                  <hr className="border-[#CFE8CF] my-4" />

                  <div>
                    <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">一般过去时</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      用一般过去时来谈论过去完成的动作。
                    </p>
                    <div className="bg-[#F0F7F0] p-3 rounded-lg">
                      <p className="text-[#0D1C0D] font-medium mb-1">例句:</p>
                      <p className="text-[#3A6A3A] italic">
                        'I <strong>visited</strong> Paris last summer.'
                      </p>
                    </div>
                  </div>
                </div>

                {/* Practice Exercise */}
                <div className="bg-white mx-4 p-4 rounded-xl shadow-sm">
                  <h2 className="text-[#0D1C0D] text-xl font-bold mb-4">练习题</h2>
                  <p className="text-[#0D1C0D] font-medium mb-2">填空:</p>
                  <p className="text-gray-600 mb-4">I ____ (go) to the park yesterday.</p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 border border-[#CFE8CF] rounded-lg text-[#0D1C0D] hover:bg-gray-50">
                      went
                    </button>
                    <button className="flex-1 px-4 py-2 border border-[#CFE8CF] rounded-lg text-[#0D1C0D] hover:bg-gray-50">
                      go
                    </button>
                    <button className="flex-1 px-4 py-2 border border-[#CFE8CF] rounded-lg text-[#0D1C0D] hover:bg-gray-50">
                      goes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <div>
                <h2 className="text-[#0D1C0D] text-xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-6">
                  Learning Topics
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
                  My Bookmarks
                </h2>
                
                {bookmarks.length === 0 ? (
                  <div className="bg-white mx-4 p-8 rounded-xl shadow-sm text-center">
                    <span className="material-icons text-gray-400 text-5xl mb-4 block">bookmark_border</span>
                    <h3 className="text-[#0D1C0D] text-lg font-semibold mb-2">还没有收藏任何内容</h3>
                    <p className="text-gray-600">点击书签图标来收藏学习材料</p>
                  </div>
                ) : (
                  <div className="space-y-4 px-2">
                    {/* Vocabulary Bookmarks */}
                    {bookmarks.filter(b => b.type === 'vocabulary').length > 0 && (
                      <div className="bg-[#F0F7F0] p-4 rounded-xl">
                        <h3 className="text-[#0D1C0D] text-lg font-semibold mb-3">词汇收藏</h3>
                        <div className="space-y-2">
                          {bookmarks
                            .filter(b => b.type === 'vocabulary')
                            .map(bookmark => renderVocabularyCard(bookmark.content as VocabularyItem))
                          }
                        </div>
                      </div>
                    )}

                    {/* Phrase Bookmarks */}
                    {bookmarks.filter(b => b.type === 'phrase').length > 0 && (
                      <div className="bg-[#F0F7F0] p-4 rounded-xl">
                        <h3 className="text-[#0D1C0D] text-lg font-semibold mb-3">短语收藏</h3>
                        <div className="space-y-2">
                          {bookmarks
                            .filter(b => b.type === 'phrase')
                            .map(bookmark => renderPhraseCard(bookmark.content as PhraseItem))
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
    </div>
  );
}