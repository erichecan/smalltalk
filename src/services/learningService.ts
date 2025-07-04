// 学习中心数据服务
import { supabase } from './supabase';
import { getVocabularyInfo, type VocabularyInfo } from './ai';
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
  // 解析字符串数组（支持JSON格式和逗号分隔格式）
  parseStringArray(str: string): string[] {
    if (!str) return [];
    
    try {
      // 尝试解析JSON格式
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string');
      }
    } catch (e) {
      // JSON解析失败，尝试逗号分隔
    }
    
    // 逗号分隔格式
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  },
  // 获取用户词汇
  async getUserVocabulary(userId: string): Promise<VocabularyItem[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .neq('mastery_level', 2) // 过滤掉已掌握的单词
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
        lastReviewed: item.last_reviewed,
        chinese_translation: item.chinese_translation,
        phonetic: item.phonetic,
        part_of_speech: item.part_of_speech,
        synonyms: typeof item.synonyms === 'string' 
          ? (item.synonyms ? this.parseStringArray(item.synonyms) : [])
          : (item.synonyms || []),
        antonyms: typeof item.antonyms === 'string'
          ? (item.antonyms ? this.parseStringArray(item.antonyms) : [])
          : (item.antonyms || []),
        difficulty_level: item.difficulty_level,
        usage_notes: item.usage_notes,
        // 遗忘曲线字段 - 2025-01-30 23:05:00
        ease_factor: item.ease_factor || 2.5,
        interval: item.interval || 0,
        repetitions: item.repetitions || 0,
        next_review: item.next_review,
        total_reviews: item.total_reviews || 0,
        correct_reviews: item.correct_reviews || 0
      })) || MOCK_VOCABULARY;
    } catch (error) {
      console.warn('Error fetching vocabulary, using mock data:', error);
      return MOCK_VOCABULARY;
    }
  },

  // 获取用户已掌握的词汇
  async getMasteredVocabulary(userId: string): Promise<VocabularyItem[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .eq('mastery_level', 2) // 只获取已掌握的单词
        .order('last_reviewed', { ascending: false });
      
      if (error) {
        console.warn('Vocabulary table not found:', error.message);
        return [];
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
        lastReviewed: item.last_reviewed,
        chinese_translation: item.chinese_translation,
        phonetic: item.phonetic,
        part_of_speech: item.part_of_speech,
        synonyms: typeof item.synonyms === 'string' 
          ? (item.synonyms ? this.parseStringArray(item.synonyms) : [])
          : (item.synonyms || []),
        antonyms: typeof item.antonyms === 'string'
          ? (item.antonyms ? this.parseStringArray(item.antonyms) : [])
          : (item.antonyms || []),
        difficulty_level: item.difficulty_level,
        usage_notes: item.usage_notes,
        ease_factor: item.ease_factor || 2.5,
        interval: item.interval || 0,
        repetitions: item.repetitions || 0,
        next_review: item.next_review,
        total_reviews: item.total_reviews || 0,
        correct_reviews: item.correct_reviews || 0
      })) || [];
    } catch (error) {
      console.warn('Error fetching mastered vocabulary:', error);
      return [];
    }
  },

  // 添加词汇 - 2025-01-30 23:00:00 增加遗忘曲线字段初始化
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
          last_reviewed: vocabulary.lastReviewed,
          chinese_translation: vocabulary.chinese_translation,
          phonetic: vocabulary.phonetic,
          part_of_speech: vocabulary.part_of_speech,
          synonyms: vocabulary.synonyms,
          antonyms: vocabulary.antonyms,
          difficulty_level: vocabulary.difficulty_level,
          usage_notes: vocabulary.usage_notes,
          // 遗忘曲线字段初始化 - 2025-01-30 23:00:00
          ease_factor: vocabulary.ease_factor || 2.5,
          interval: vocabulary.interval || 0,
          repetitions: vocabulary.repetitions || 0,
          next_review: vocabulary.next_review || null,
          total_reviews: vocabulary.total_reviews || 0,
          correct_reviews: vocabulary.correct_reviews || 0
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
        lastReviewed: data.last_reviewed,
        chinese_translation: data.chinese_translation,
        phonetic: data.phonetic,
        part_of_speech: data.part_of_speech,
        synonyms: data.synonyms,
        antonyms: data.antonyms,
        difficulty_level: data.difficulty_level,
        usage_notes: data.usage_notes,
        // 遗忘曲线字段 - 2025-01-30 23:05:00
        ease_factor: data.ease_factor,
        interval: data.interval,
        repetitions: data.repetitions,
        next_review: data.next_review,
        total_reviews: data.total_reviews,
        correct_reviews: data.correct_reviews
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
  },

  // 删除词汇 - 用于掌握后的删除操作 - 2025-01-30
  async deleteVocabulary(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log(`Vocabulary item ${id} deleted successfully`);
    } catch (error) {
      console.warn('Cannot delete vocabulary from database, table may not exist:', error);
      // 在实际应用中，即使数据库删除失败，UI层面也会处理删除
    }
  },

  // AI增强的词汇添加功能 - 支持去重和更新
  async addVocabularyWithAI(userId: string, word: string, context?: string): Promise<VocabularyItem> {
    try {
      console.log(`Adding vocabulary with AI enhancement: ${word}`);
      
      // 先检查单词是否已存在
      const { data: existingWords, error: checkError } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .eq('word', word.toLowerCase());
      
      if (checkError) {
        console.warn('Error checking existing vocabulary:', checkError);
      }
      
      // 调用AI获取词汇信息
      const aiInfo = await getVocabularyInfo(word);
      
      // 构建完整的词汇项
      const vocabularyItem: Omit<VocabularyItem, 'id' | 'createdAt'> = {
        word: aiInfo.word,
        definition: aiInfo.definition,
        example: aiInfo.example_sentence,
        pronunciation: aiInfo.phonetic,
        source: context ? 'conversation' : 'manual',
        masteryLevel: 0,
        bookmarked: false,
        chinese_translation: aiInfo.chinese_translation,
        phonetic: aiInfo.phonetic,
        part_of_speech: aiInfo.part_of_speech,
        synonyms: aiInfo.synonyms,
        antonyms: aiInfo.antonyms,
        difficulty_level: aiInfo.difficulty_level,
        usage_notes: aiInfo.usage_notes
      };

      // 如果单词已存在，更新现有记录
      if (existingWords && existingWords.length > 0) {
        const existingWord = existingWords[0];
        console.log(`Word "${word}" already exists, updating existing record`);
        
        const { data, error } = await supabase
          .from('vocabulary')
          .update({
            // 更新定义等信息为最新的AI生成内容
            definition: vocabularyItem.definition,
            example: vocabularyItem.example,
            pronunciation: vocabularyItem.pronunciation,
            chinese_translation: vocabularyItem.chinese_translation,
            phonetic: vocabularyItem.phonetic,
            part_of_speech: vocabularyItem.part_of_speech,
            synonyms: Array.isArray(vocabularyItem.synonyms) 
              ? JSON.stringify(vocabularyItem.synonyms) 
              : vocabularyItem.synonyms,
            antonyms: Array.isArray(vocabularyItem.antonyms)
              ? JSON.stringify(vocabularyItem.antonyms)
              : vocabularyItem.antonyms,
            difficulty_level: vocabularyItem.difficulty_level,
            usage_notes: vocabularyItem.usage_notes,
            // 重置掌握等级（重新遇到说明需要复习）
            mastery_level: Math.max(0, existingWord.mastery_level - 1),
            // 更新最后复习时间
            last_reviewed: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingWord.id)
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
          lastReviewed: data.last_reviewed,
          chinese_translation: data.chinese_translation,
          phonetic: data.phonetic,
          part_of_speech: data.part_of_speech,
          synonyms: typeof data.synonyms === 'string' 
            ? (data.synonyms ? this.parseStringArray(data.synonyms) : [])
            : (data.synonyms || []),
          antonyms: typeof data.antonyms === 'string'
            ? (data.antonyms ? this.parseStringArray(data.antonyms) : [])
            : (data.antonyms || []),
          difficulty_level: data.difficulty_level,
          usage_notes: data.usage_notes
        };
      }

      // 如果单词不存在，创建新记录
      try {
        console.log(`Creating new vocabulary record for: ${word}`);
        const { data, error } = await supabase
          .from('vocabulary')
          .insert([{
            user_id: userId,
            word: vocabularyItem.word.toLowerCase(), // 统一小写存储
            definition: vocabularyItem.definition,
            example: vocabularyItem.example,
            pronunciation: vocabularyItem.pronunciation,
            source: vocabularyItem.source,
            mastery_level: vocabularyItem.masteryLevel,
            bookmarked: vocabularyItem.bookmarked,
            chinese_translation: vocabularyItem.chinese_translation,
            phonetic: vocabularyItem.phonetic,
            part_of_speech: vocabularyItem.part_of_speech,
            synonyms: Array.isArray(vocabularyItem.synonyms) 
              ? JSON.stringify(vocabularyItem.synonyms) 
              : vocabularyItem.synonyms,
            antonyms: Array.isArray(vocabularyItem.antonyms)
              ? JSON.stringify(vocabularyItem.antonyms)
              : vocabularyItem.antonyms,
            difficulty_level: vocabularyItem.difficulty_level,
            usage_notes: vocabularyItem.usage_notes
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
            lastReviewed: data.last_reviewed,
            chinese_translation: data.chinese_translation,
            phonetic: data.phonetic,
            part_of_speech: data.part_of_speech,
            synonyms: typeof data.synonyms === 'string' 
              ? (data.synonyms ? this.parseStringArray(data.synonyms) : [])
              : (data.synonyms || []),
            antonyms: typeof data.antonyms === 'string'
              ? (data.antonyms ? this.parseStringArray(data.antonyms) : [])
              : (data.antonyms || []),
            difficulty_level: data.difficulty_level,
            usage_notes: data.usage_notes
          };
        } catch (dbError) {
          console.error('Database save failed:', dbError);
          throw new Error(`Failed to save vocabulary to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }
    } catch (error) {
      console.error('Error adding vocabulary with AI:', error);
      throw new Error('Failed to add vocabulary. Please try again.');
    }
  },

  // 批量AI增强词汇添加
  async addMultipleVocabularyWithAI(userId: string, words: string[]): Promise<VocabularyItem[]> {
    const results: VocabularyItem[] = [];
    const errors: string[] = [];

    for (const word of words) {
      try {
        const vocabularyItem = await this.addVocabularyWithAI(userId, word.trim());
        results.push(vocabularyItem);
      } catch (error) {
        console.error(`Failed to add word "${word}":`, error);
        errors.push(word);
      }
    }

    if (errors.length > 0) {
      console.warn(`Failed to add ${errors.length} words:`, errors);
    }

    return results;
  },

  // 文件导入功能
  async importVocabularyFromFile(userId: string, file: File): Promise<{ success: VocabularyItem[], errors: string[] }> {
    try {
      const fileContent = await this.readFileContent(file);
      const words = this.parseFileContent(fileContent, file.name);
      
      if (words.length === 0) {
        throw new Error('No valid words found in the file');
      }

      const results: VocabularyItem[] = [];
      const errors: string[] = [];

      console.log(`Importing ${words.length} words from file: ${file.name}`);

      for (const word of words) {
        try {
          const vocabularyItem = await this.addVocabularyWithAI(userId, word);
          results.push(vocabularyItem);
        } catch (error) {
          console.error(`Failed to import word "${word}":`, error);
          errors.push(`${word}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { success: results, errors };
    } catch (error) {
      console.error('Error importing vocabulary from file:', error);
      throw new Error(`Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // 读取文件内容
  async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file, 'UTF-8');
    });
  },

  // 解析文件内容
  parseFileContent(content: string, fileName: string): string[] {
    const lowercaseFileName = fileName.toLowerCase();
    let words: string[] = [];

    if (lowercaseFileName.endsWith('.txt')) {
      // TXT格式：每行一个单词
      words = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && /^[a-zA-Z\s'-]+$/.test(line)); // 只保留英文单词
    } else if (lowercaseFileName.endsWith('.csv')) {
      // CSV格式：支持 word,definition,example (可选列)
      const lines = content.split('\n');
      words = lines
        .slice(1) // 跳过标题行
        .map(line => {
          const columns = line.split(',');
          return columns[0]?.trim(); // 只取第一列（单词）
        })
        .filter(word => word && word.length > 0 && /^[a-zA-Z\s'-]+$/.test(word));
    } else {
      throw new Error('Unsupported file format. Please use .txt or .csv files.');
    }

    // 去重并验证
    const uniqueWords = [...new Set(words)];
    const validWords = uniqueWords.filter(word => {
      // 基本验证：长度合理，只包含英文字符
      return word.length >= 2 && word.length <= 50 && /^[a-zA-Z\s'-]+$/.test(word);
    });

    if (validWords.length === 0) {
      throw new Error('No valid English words found in the file');
    }

    console.log(`Parsed ${validWords.length} valid words from ${fileName}`);
    return validWords;
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
    try {
      // 获取收藏的词汇（排除已掌握的）
      const { data: vocabData, error: vocabError } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .eq('bookmarked', true)
        .neq('mastery_level', 2) // 排除已掌握的单词
        .order('created_at', { ascending: false });

      // 获取收藏的短语
      const phrases = await phrasesService.getUserPhrases(userId);

      const bookmarks: BookmarkItem[] = [];
      
      // 添加词汇收藏
      if (vocabData && !vocabError) {
        vocabData.forEach(item => {
          bookmarks.push({
            id: `vocab_${item.id}`,
            type: 'vocabulary',
            itemId: item.id,
            content: {
              id: item.id,
              word: item.word,
              definition: item.definition,
              example: item.example,
              pronunciation: item.pronunciation,
              source: item.source,
              masteryLevel: item.mastery_level,
              bookmarked: item.bookmarked,
              createdAt: item.created_at,
              lastReviewed: item.last_reviewed,
              chinese_translation: item.chinese_translation,
              phonetic: item.phonetic,
              part_of_speech: item.part_of_speech,
              synonyms: typeof item.synonyms === 'string' 
                ? (item.synonyms ? vocabularyService.parseStringArray(item.synonyms) : [])
                : (item.synonyms || []),
              antonyms: typeof item.antonyms === 'string'
                ? (item.antonyms ? vocabularyService.parseStringArray(item.antonyms) : [])
                : (item.antonyms || []),
              difficulty_level: item.difficulty_level,
              usage_notes: item.usage_notes
            },
            createdAt: item.created_at
          });
        });
      } else {
        // 如果数据库查询失败，使用原来的方法
        const vocabulary = await vocabularyService.getUserVocabulary(userId);
        vocabulary.filter(v => v.bookmarked).forEach(v => {
          bookmarks.push({
            id: `vocab_${v.id}`,
            type: 'vocabulary',
            itemId: v.id,
            content: v,
            createdAt: v.createdAt
          });
        });
      }

      // 添加短语收藏
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
    } catch (error) {
      console.warn('Error fetching bookmarks:', error);
      return [];
    }
  },

  // 切换收藏状态
  async toggleBookmark(userId: string, itemId: string, type: 'vocabulary' | 'phrase'): Promise<void> {
    if (type === 'vocabulary') {
      // 获取当前词汇项
      const vocabulary = await vocabularyService.getUserVocabulary(userId);
      const item = vocabulary.find(v => v.id === itemId);
      if (item) {
        await vocabularyService.updateVocabulary(itemId, { bookmarked: !item.bookmarked });
      }
    } else if (type === 'phrase') {
      // 获取当前短语项
      const phrases = await phrasesService.getUserPhrases(userId);
      const item = phrases.find(p => p.id === itemId);
      if (item) {
        await phrasesService.updatePhraseBookmark(itemId, !item.bookmarked);
      }
    }
  },

  // 删除收藏
  async deleteBookmark(id: string): Promise<void> {
    // 解析ID类型
    if (id.startsWith('vocab_')) {
      const itemId = id.replace('vocab_', '');
      await vocabularyService.updateVocabulary(itemId, { bookmarked: false });
    } else if (id.startsWith('phrase_')) {
      const itemId = id.replace('phrase_', '');
      await phrasesService.updatePhraseBookmark(itemId, false);
    }
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

// 搜索服务 - 2025-01-30 18:30:00
export const searchService = {
  // 完整的搜索功能：搜索单词名称、话题模板和收藏的对话
  async search(query: string, userId: string): Promise<{ vocabulary: VocabularyItem[], topics: TopicItem[], conversations: any[] }> {
    if (!query.trim()) return { vocabulary: [], topics: [], conversations: [] };

    const searchTerm = query.toLowerCase();
    const results: { vocabulary: VocabularyItem[], topics: TopicItem[], conversations: any[] } = { 
      vocabulary: [], 
      topics: [], 
      conversations: [] 
    };

    try {
      // 搜索词汇 - 仅匹配单词名称
      const vocabulary = await vocabularyService.getUserVocabulary(userId);
      const matchedVocabulary = vocabulary.filter(v => 
        v.word.toLowerCase().includes(searchTerm)
      );
      
      // 搜索话题模板 - 搜索话题的全部内容
      const topics = topicsService.getTopics();
      const matchedTopics = topics.filter(t => {
        const searchableContent = [
          t.name,
          t.description || '',
          t.icon || '',
        ].join(' ').toLowerCase();
        
        return searchableContent.includes(searchTerm);
      });

      // 搜索收藏的对话 - 搜索对话的所有内容
      try {
        const { getBookmarkedConversations } = await import('../services/historyService');
        const conversationsResult = await getBookmarkedConversations(userId);
        
        if (conversationsResult.data) {
          const matchedConversations = conversationsResult.data.filter(conversation => {
            // 搜索对话主题
            if (conversation.topic.toLowerCase().includes(searchTerm)) {
              return true;
            }
            
            // 搜索对话消息内容
            if (conversation.messages && Array.isArray(conversation.messages)) {
              return conversation.messages.some(message => 
                message.text && message.text.toLowerCase().includes(searchTerm)
              );
            }
            
            return false;
          });
          
          results.conversations = matchedConversations;
        }
      } catch (error) {
        console.warn('Error searching conversations:', error);
        results.conversations = [];
      }

      results.vocabulary = matchedVocabulary;
      results.topics = matchedTopics;
      
    } catch (error) {
      console.warn('Search error:', error);
    }

    return results;
  }
};