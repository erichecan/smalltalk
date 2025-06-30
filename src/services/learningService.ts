// 学习中心数据服务
import { supabase } from './supabase';
import type { 
  VocabularyItem, 
  PhraseItem, 
  GrammarTopic, 
  GrammarProgress, 
  TopicItem,
  BookmarkItem 
} from '../types/learning';

// 模拟数据（当数据库表不存在时使用）
const MOCK_VOCABULARY: VocabularyItem[] = [
  {
    id: '1',
    word: 'Joy',
    definition: 'A feeling of great pleasure and happiness.',
    example: 'Her eyes sparkled with joy.',
    source: 'conversation',
    masteryLevel: 0,
    bookmarked: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2', 
    word: 'Compliment',
    definition: 'To express admiration or approval.',
    example: 'He paid her a lovely compliment on her dress.',
    source: 'conversation',
    masteryLevel: 0,
    bookmarked: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    word: 'Get along',
    definition: 'To have a friendly relationship with someone.',
    example: 'Do you and your sister get along?',
    source: 'conversation', 
    masteryLevel: 0,
    bookmarked: true,
    createdAt: new Date().toISOString()
  }
];

const MOCK_PHRASES: PhraseItem[] = [
  {
    id: '1',
    phrase: 'Hi, how are you?',
    translation: '你好，你怎么样？',
    category: '问候',
    usageExample: 'Hi, how are you doing today?',
    bookmarked: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    phrase: "It's a pleasure to meet you.",
    translation: '很高兴见到你。',
    category: '问候',
    usageExample: "It's a pleasure to meet you, John.",
    bookmarked: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    phrase: 'Have a wonderful day!',
    translation: '祝你有美好的一天！',
    category: '问候',
    usageExample: 'Thanks for your help, have a wonderful day!',
    bookmarked: false,
    createdAt: new Date().toISOString()
  }
];

// 词汇相关服务
export const vocabularyService = {
  // 获取用户词汇
  async getUserVocabulary(userId: string): Promise<VocabularyItem[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Vocabulary table not found, using mock data:', error.message);
        return MOCK_VOCABULARY;
      }
      
      return data?.map(item => ({
        id: item.id,
        word: item.word,
        definition: item.definition,
        example: item.example,
        pronunciation: item.pronunciation,
        source: item.source,
        masteryLevel: item.mastery_level,
        bookmarked: item.bookmarked,
        createdAt: item.created_at,
        lastReviewed: item.last_reviewed
      })) || MOCK_VOCABULARY;
    } catch (error) {
      console.warn('Error fetching vocabulary, using mock data:', error);
      return MOCK_VOCABULARY;
    }
  },

  // 添加词汇
  async addVocabulary(userId: string, vocabulary: Omit<VocabularyItem, 'id' | 'createdAt'>): Promise<VocabularyItem> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert([{
          user_id: userId,
          word: vocabulary.word,
          definition: vocabulary.definition,
          example: vocabulary.example,
          pronunciation: vocabulary.pronunciation,
          source: vocabulary.source,
          mastery_level: vocabulary.masteryLevel,
          bookmarked: vocabulary.bookmarked,
          last_reviewed: vocabulary.lastReviewed
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        word: data.word,
        definition: data.definition,
        example: data.example,
        pronunciation: data.pronunciation,
        source: data.source,
        masteryLevel: data.mastery_level,
        bookmarked: data.bookmarked,
        createdAt: data.created_at,
        lastReviewed: data.last_reviewed
      };
    } catch (error) {
      console.warn('Cannot add vocabulary to database, table may not exist:', error);
      // 返回一个模拟的新词汇项
      return {
        id: Date.now().toString(),
        ...vocabulary,
        createdAt: new Date().toISOString()
      };
    }
  },

  // 更新词汇状态
  async updateVocabulary(id: string, updates: Partial<VocabularyItem>): Promise<void> {
    try {
      const dbUpdates: any = {};
      if (updates.masteryLevel !== undefined) dbUpdates.mastery_level = updates.masteryLevel;
      if (updates.bookmarked !== undefined) dbUpdates.bookmarked = updates.bookmarked;
      if (updates.lastReviewed !== undefined) dbUpdates.last_reviewed = updates.lastReviewed;

      const { error } = await supabase
        .from('vocabulary')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.warn('Cannot update vocabulary in database, table may not exist:', error);
      // 在实际应用中，这里可以将更新存储到本地状态或localStorage
    }
  }
};

// 短语相关服务
export const phrasesService = {
  // 获取用户短语
  async getUserPhrases(userId: string, category?: string): Promise<PhraseItem[]> {
    try {
      let query = supabase
        .from('phrases')
        .select('*')
        .eq('user_id', userId);
      
      if (category && category !== '全部') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Phrases table not found, using mock data:', error.message);
        return category && category !== '全部' 
          ? MOCK_PHRASES.filter(p => p.category === category)
          : MOCK_PHRASES;
      }
      
      return data?.map(item => ({
        id: item.id,
        phrase: item.phrase,
        translation: item.translation,
        category: item.category,
        usageExample: item.usage_example,
        bookmarked: item.bookmarked,
        createdAt: item.created_at
      })) || MOCK_PHRASES;
    } catch (error) {
      console.warn('Error fetching phrases, using mock data:', error);
      return category && category !== '全部' 
        ? MOCK_PHRASES.filter(p => p.category === category)
        : MOCK_PHRASES;
    }
  },

  // 更新短语收藏状态
  async updatePhraseBookmark(id: string, bookmarked: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('phrases')
        .update({ bookmarked })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.warn('Cannot update phrase bookmark in database, table may not exist:', error);
      // 在实际应用中，这里可以将更新存储到本地状态或localStorage
    }
  }
};

// 语法相关服务
export const grammarService = {
  // 获取语法进度
  async getGrammarProgress(userId: string): Promise<GrammarProgress[]> {
    const { data, error } = await supabase
      .from('grammar_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data?.map(item => ({
      id: item.id,
      userId: item.user_id,
      grammarTopic: item.grammar_topic,
      progressPercentage: item.progress_percentage,
      lastPracticed: item.last_practiced
    })) || [];
  },

  // 更新语法进度
  async updateGrammarProgress(userId: string, topic: string, percentage: number): Promise<void> {
    const { error } = await supabase
      .from('grammar_progress')
      .upsert({
        user_id: userId,
        grammar_topic: topic,
        progress_percentage: percentage,
        last_practiced: new Date().toISOString()
      });
    
    if (error) throw error;
  }
};

// 收藏相关服务
export const bookmarksService = {
  // 获取用户收藏
  async getUserBookmarks(userId: string): Promise<BookmarkItem[]> {
    // 这里需要联合查询多个表，为简化实现，先使用本地状态
    // 实际项目中应该建立专门的收藏表
    const [vocabulary, phrases] = await Promise.all([
      vocabularyService.getUserVocabulary(userId),
      phrasesService.getUserPhrases(userId)
    ]);

    const bookmarks: BookmarkItem[] = [];
    
    vocabulary.filter(v => v.bookmarked).forEach(v => {
      bookmarks.push({
        id: `vocab_${v.id}`,
        type: 'vocabulary',
        itemId: v.id,
        content: v,
        createdAt: v.createdAt
      });
    });

    phrases.filter(p => p.bookmarked).forEach(p => {
      bookmarks.push({
        id: `phrase_${p.id}`,
        type: 'phrase',
        itemId: p.id,
        content: p,
        createdAt: p.createdAt
      });
    });

    return bookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

// 话题相关服务
export const topicsService = {
  // 获取学习话题
  getTopics(): TopicItem[] {
    return [
      { id: '1', name: 'Small Talk', icon: 'chat', description: '日常聊天' },
      { id: '2', name: 'Ordering Food', icon: 'restaurant', description: '点餐用语' },
      { id: '3', name: 'Travel', icon: 'flight', description: '旅行英语' },
      { id: '4', name: 'Work', icon: 'work', description: '职场英语' },
      { id: '5', name: 'Shopping', icon: 'shopping_cart', description: '购物英语' },
      { id: '6', name: 'Healthcare', icon: 'local_hospital', description: '医疗英语' }
    ];
  }
};

// 搜索服务
export const searchService = {
  // 全局搜索
  async search(query: string, userId: string) {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results = [];

    try {
      // 搜索词汇
      const vocabulary = await vocabularyService.getUserVocabulary(userId);
      vocabulary.forEach(v => {
        if (v.word.toLowerCase().includes(searchTerm) || 
            v.definition.toLowerCase().includes(searchTerm)) {
          results.push({
            id: v.id,
            type: 'vocabulary' as const,
            title: v.word,
            subtitle: v.definition,
            content: v
          });
        }
      });

      // 搜索短语
      const phrases = await phrasesService.getUserPhrases(userId);
      phrases.forEach(p => {
        if (p.phrase.toLowerCase().includes(searchTerm) || 
            p.translation.toLowerCase().includes(searchTerm)) {
          results.push({
            id: p.id,
            type: 'phrases' as const,
            title: p.phrase,
            subtitle: p.translation,
            content: p
          });
        }
      });

      // 搜索话题
      const topics = topicsService.getTopics();
      topics.forEach(t => {
        if (t.name.toLowerCase().includes(searchTerm)) {
          results.push({
            id: t.id,
            type: 'topics' as const,
            title: t.name,
            subtitle: t.description || '',
            content: t
          });
        }
      });
    } catch (error) {
      console.warn('Search error:', error);
    }

    return results;
  }
};