// 遗忘曲线算法服务 - 基于 SuperMemo 2 算法的改进版本
// 2025-01-30 21:40:00

import { supabase } from './supabase';
import type { 
  VocabularyItem, 
  PracticeRecord, 
  SpacedRepetitionConfig, 
  SpacedRepetitionResult,
  DailyPractice,
  LearningStats
} from '../types/learning';

// 默认配置
const DEFAULT_CONFIG: SpacedRepetitionConfig = {
  ease_factor_default: 2.5,
  ease_factor_min: 1.3,
  ease_factor_max: 3.0,
  interval_modifier: 1.0,
  first_interval: 1,
  second_interval: 6,
  graduating_interval: 15,
  max_interval: 365
};

export class SpacedRepetitionEngine {
  private config: SpacedRepetitionConfig;

  constructor(config: Partial<SpacedRepetitionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 计算练习表现评分 (0-5)
   * 基于正确率、响应时间和用户主观难度评分
   */
  calculatePerformanceRating(
    isCorrect: boolean,
    responseTime: number,
    targetTime: number = 10, // 目标响应时间(秒)
    userDifficulty?: number
  ): number {
    if (!isCorrect) {
      return 0; // 答错直接0分
    }

    let rating = 3; // 基础分数(答对了)

    // 根据响应时间调整 (越快越好)
    const timeRatio = Math.min(targetTime / responseTime, 2);
    if (timeRatio > 1.5) {
      rating += 2; // 非常快 -> 5分
    } else if (timeRatio > 1.2) {
      rating += 1; // 较快 -> 4分  
    } else if (timeRatio < 0.5) {
      rating -= 1; // 较慢 -> 2分
    }

    // 根据用户主观难度调整
    if (userDifficulty !== undefined) {
      if (userDifficulty <= 1) {
        rating = Math.min(5, rating + 1); // 觉得简单
      } else if (userDifficulty >= 4) {
        rating = Math.max(1, rating - 1); // 觉得困难
      }
    }

    return Math.max(0, Math.min(5, rating));
  }

  /**
   * 核心算法：计算下次复习时间和难度因子
   * 基于 SuperMemo 2 算法
   */
  calculateNextReview(
    vocabulary: VocabularyItem,
    performanceRating: number
  ): SpacedRepetitionResult {
    const currentEase = vocabulary.ease_factor || this.config.ease_factor_default;
    const currentInterval = vocabulary.interval || 0;
    const currentRepetitions = vocabulary.repetitions || 0;

    let newEaseFactor = currentEase;
    let newInterval = 0;
    let newRepetitions = currentRepetitions;

    if (performanceRating >= 3) {
      // 答对了
      newRepetitions += 1;

      if (newRepetitions === 1) {
        newInterval = this.config.first_interval;
      } else if (newRepetitions === 2) {
        newInterval = this.config.second_interval;
      } else {
        newInterval = Math.round(currentInterval * newEaseFactor * this.config.interval_modifier);
      }

      // 调整难度因子
      newEaseFactor = Math.max(
        this.config.ease_factor_min,
        Math.min(
          this.config.ease_factor_max,
          currentEase + (0.1 - (5 - performanceRating) * (0.08 + (5 - performanceRating) * 0.02))
        )
      );
    } else {
      // 答错了，重新开始
      newRepetitions = 0;
      newInterval = this.config.first_interval;
      newEaseFactor = Math.max(
        this.config.ease_factor_min,
        currentEase - 0.2
      );
    }

    // 限制最大间隔
    newInterval = Math.min(newInterval, this.config.max_interval);

    // 计算下次复习日期
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      vocabulary_id: vocabulary.id,
      next_review_date: nextReviewDate.toISOString().split('T')[0],
      new_interval: newInterval,
      new_ease_factor: newEaseFactor,
      new_repetitions: newRepetitions,
      performance_rating: performanceRating
    };
  }

  /**
   * 更新词汇的遗忘曲线数据
   */
  async updateVocabularySpacing(
    vocabularyId: string, 
    result: SpacedRepetitionResult
  ): Promise<void> {
    try {
      // 先获取当前值，然后更新
      const { data: currentData } = await supabase
        .from('vocabulary')
        .select('total_reviews, correct_reviews')
        .eq('id', vocabularyId)
        .single();

      const currentTotalReviews = currentData?.total_reviews || 0;
      const currentCorrectReviews = currentData?.correct_reviews || 0;

      const { error } = await supabase
        .from('vocabulary')
        .update({
          ease_factor: result.new_ease_factor,
          interval: result.new_interval,
          repetitions: result.new_repetitions,
          next_review: result.next_review_date,
          last_reviewed: new Date().toISOString(),
          total_reviews: currentTotalReviews + 1,
          correct_reviews: result.performance_rating >= 3 
            ? currentCorrectReviews + 1 
            : currentCorrectReviews
        })
        .eq('id', vocabularyId);

      if (error) {
        console.error('Error updating vocabulary spacing:', error);
        throw error;
      }
    } catch (error) {
      console.warn('Cannot update vocabulary spacing, table may not exist:', error);
    }
  }

  /**
   * 获取今日需要复习的词汇
   */
  async getTodayReviews(userId: string): Promise<VocabularyItem[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Getting today reviews for user:', userId, 'date:', today); // 调试信息 - 2025-01-30 23:50:00
      
      // 首先尝试使用遗忘曲线字段查询
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .or(`next_review.is.null,next_review.lte.${today}`)
        .order('next_review', { ascending: true, nullsFirst: true });

      if (error) {
        console.warn('Spaced repetition query failed, trying fallback:', error);
        
        // 如果遗忘曲线字段不存在，使用基础查询
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('vocabulary')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return [];
        }

        console.log('Using fallback data for today reviews:', fallbackData?.length || 0);
        
        // 返回所有词汇（模拟需要复习的状态）
        return fallbackData?.map(item => ({
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
          synonyms: item.synonyms,
          antonyms: item.antonyms,
          difficulty_level: item.difficulty_level,
          usage_notes: item.usage_notes,
          // 默认遗忘曲线字段值
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
          next_review: undefined,
          total_reviews: 0,
          correct_reviews: 0
        })) || [];
      }

      console.log('Today reviews query successful:', data?.length || 0);

      // 转换数据格式
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
        synonyms: item.synonyms,
        antonyms: item.antonyms,
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
      console.warn('Error getting today reviews:', error);
      return [];
    }
  }

  /**
   * 生成每日练习计划
   */
  async generateDailyPractice(
    userId: string, 
    targetWords: number = 20
  ): Promise<DailyPractice> {
    const today = new Date().toISOString().split('T')[0];
    console.log('Generating daily practice for user:', userId, 'target:', targetWords); // 调试信息 - 2025-01-30 23:55:00
    
    // 获取需要复习的词汇
    const reviewWords = await this.getTodayReviews(userId);
    console.log('Review words found:', reviewWords.length);
    
    // 获取新词汇（最近添加但还没开始复习的）
    let newWords: VocabularyItem[] = [];
    try {
      const { data: newWordsData, error: newWordsError } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .is('next_review', null)
        .order('created_at', { ascending: false })
        .limit(Math.max(0, targetWords - reviewWords.length));

      if (newWordsError) {
        console.warn('New words query with next_review failed, using fallback:', newWordsError);
        
        // 如果next_review字段不存在，获取所有词汇并排除已在reviewWords中的
        const { data: allWordsData, error: allWordsError } = await supabase
          .from('vocabulary')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(targetWords);

        if (allWordsError) {
          console.error('Fallback new words query failed:', allWordsError);
        } else {
          // 过滤掉已经在reviewWords中的词汇
          const reviewWordIds = new Set(reviewWords.map(w => w.id));
          const filteredWords = allWordsData?.filter(item => !reviewWordIds.has(item.id)) || [];
          
          newWords = filteredWords.slice(0, Math.max(0, targetWords - reviewWords.length)).map(item => ({
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
            synonyms: item.synonyms,
            antonyms: item.antonyms,
            difficulty_level: item.difficulty_level,
            usage_notes: item.usage_notes,
            ease_factor: 2.5,
            interval: 0,
            repetitions: 0,
            next_review: undefined,
            total_reviews: 0,
            correct_reviews: 0
          }));
        }
      } else {
        newWords = newWordsData?.map(item => ({
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
          synonyms: item.synonyms,
          antonyms: item.antonyms,
          difficulty_level: item.difficulty_level,
          usage_notes: item.usage_notes,
          ease_factor: item.ease_factor || 2.5,
          interval: item.interval || 0,
          repetitions: item.repetitions || 0,
          next_review: item.next_review,
          total_reviews: item.total_reviews || 0,
          correct_reviews: item.correct_reviews || 0
        })) || [];
      }
    } catch (error) {
      console.error('Error getting new words:', error);
    }

    console.log('New words found:', newWords.length);

    const result = {
      user_id: userId,
      date: today,
      review_words: reviewWords,
      new_words: newWords,
      total_target: targetWords,
      completed: 0,
      is_completed: false
    };

    console.log('Daily practice plan generated:', {
      reviewWords: result.review_words.length,
      newWords: result.new_words.length,
      totalTarget: result.total_target
    });

    return result;
  }

  /**
   * 检查数据库表结构状态 - 2025-01-30 23:25:00 调试工具
   */
  async checkDatabaseStatus(userId: string): Promise<{
    vocabularyTableExists: boolean;
    practiceRecordsTableExists: boolean;
    learningStatsTableExists: boolean;
    hasSpacedRepetitionFields: boolean;
    vocabularyCount: number;
    practiceRecordsCount: number;
    errorMessages: string[];
  }> {
    const status = {
      vocabularyTableExists: false,
      practiceRecordsTableExists: false,
      learningStatsTableExists: false,
      hasSpacedRepetitionFields: false,
      vocabularyCount: 0,
      practiceRecordsCount: 0,
      errorMessages: [] as string[]
    };

    try {
      // 检查vocabulary表
      const { data: vocabData, error: vocabError } = await supabase
        .from('vocabulary')
        .select('id, ease_factor, interval, repetitions')
        .eq('user_id', userId)
        .limit(1);

      if (!vocabError) {
        status.vocabularyTableExists = true;
        if (vocabData && vocabData.length > 0) {
          const item = vocabData[0];
          status.hasSpacedRepetitionFields = 
            item.ease_factor !== undefined && 
            item.interval !== undefined && 
            item.repetitions !== undefined;
        }
        
        // 获取词汇总数
        const { count: vocabCount } = await supabase
          .from('vocabulary')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        status.vocabularyCount = vocabCount || 0;
      } else {
        status.errorMessages.push(`Vocabulary table error: ${vocabError.message}`);
      }

      // 检查practice_records表
      const { error: practiceError } = await supabase
        .from('practice_records')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!practiceError) {
        status.practiceRecordsTableExists = true;
        
        const { count: practiceCount } = await supabase
          .from('practice_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        status.practiceRecordsCount = practiceCount || 0;
      } else {
        status.errorMessages.push(`Practice records table error: ${practiceError.message}`);
      }

      // 检查learning_stats表
      const { error: statsError } = await supabase
        .from('learning_stats')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!statsError) {
        status.learningStatsTableExists = true;
      } else {
        status.errorMessages.push(`Learning stats table error: ${statsError.message}`);
      }

    } catch (error) {
      status.errorMessages.push(`General database error: ${error}`);
    }

    return status;
  }

  /**
   * 获取学习统计
   */
  async getLearningStats(userId: string): Promise<LearningStats> {
    try {
      console.log('Getting learning stats for user:', userId); // 调试信息 - 2025-01-30 23:45:00
      
      // 获取词汇统计 - 处理字段名不匹配问题
      const { data: vocabStats, error: vocabError } = await supabase
        .from('vocabulary')
        .select('mastery_level, total_reviews, correct_reviews, id, word')
        .eq('user_id', userId);

      console.log('Vocabulary stats query result:', {
        data: vocabStats,
        error: vocabError,
        count: vocabStats?.length || 0
      });

      if (vocabError) {
        console.error('Error querying vocabulary stats:', vocabError);
        // 如果查询失败，尝试不包含新字段的查询
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('vocabulary')
          .select('mastery_level, id, word')
          .eq('user_id', userId);
        
        console.log('Fallback query result:', {
          data: fallbackData,
          error: fallbackError,
          count: fallbackData?.length || 0
        });

        if (fallbackError) {
          throw new Error(`Both vocabulary queries failed: ${vocabError.message}, ${fallbackError.message}`);
        }

        // 使用fallback数据，没有reviews信息
        const totalVocabulary = fallbackData?.length || 0;
        const masteredVocabulary = fallbackData?.filter(v => v.mastery_level === 2).length || 0;
        const learningVocabulary = fallbackData?.filter(v => v.mastery_level === 1).length || 0;

        return {
          user_id: userId,
          total_vocabulary: totalVocabulary,
          mastered_vocabulary: masteredVocabulary,
          learning_vocabulary: learningVocabulary,
          daily_reviews: 0, // 无法计算，因为缺少遗忘曲线字段
          streak_days: 0,
          accuracy_rate: 0, // 无法计算，因为缺少reviews字段
          average_response_time: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const totalVocabulary = vocabStats?.length || 0;
      const masteredVocabulary = vocabStats?.filter(v => v.mastery_level === 2).length || 0;
      const learningVocabulary = vocabStats?.filter(v => v.mastery_level === 1).length || 0;

      // 计算准确率 - 处理字段可能不存在的情况
      const totalReviews = vocabStats?.reduce((sum, v) => sum + (v.total_reviews || 0), 0) || 0;
      const correctReviews = vocabStats?.reduce((sum, v) => sum + (v.correct_reviews || 0), 0) || 0;
      const accuracyRate = totalReviews > 0 ? correctReviews / totalReviews : 0;

      console.log('Calculated stats:', {
        totalVocabulary,
        masteredVocabulary,
        learningVocabulary,
        totalReviews,
        correctReviews,
        accuracyRate
      });

      // 获取今日复习数量 - 添加容错处理
      let todayReviewsCount = 0;
      try {
        const todayReviews = await this.getTodayReviews(userId);
        todayReviewsCount = todayReviews.length;
        console.log('Today reviews count:', todayReviewsCount);
      } catch (reviewError) {
        console.warn('Failed to get today reviews:', reviewError);
      }

      const result = {
        user_id: userId,
        total_vocabulary: totalVocabulary,
        mastered_vocabulary: masteredVocabulary,
        learning_vocabulary: learningVocabulary,
        daily_reviews: todayReviewsCount,
        streak_days: 0, // TODO: 计算连续学习天数
        accuracy_rate: accuracyRate,
        average_response_time: 0, // TODO: 从练习记录计算
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Final learning stats result:', result);
      return result;
    } catch (error) {
      console.error('Error getting learning stats:', error);
      return {
        user_id: userId,
        total_vocabulary: 0,
        mastered_vocabulary: 0,
        learning_vocabulary: 0,
        daily_reviews: 0,
        streak_days: 0,
        accuracy_rate: 0,
        average_response_time: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }
}

// 导出默认实例
export const spacedRepetitionEngine = new SpacedRepetitionEngine();

// 开发环境调试工具 - 2025-01-30 23:30:00
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).debugSpacedRepetition = {
    checkDatabaseStatus: spacedRepetitionEngine.checkDatabaseStatus.bind(spacedRepetitionEngine),
    spacedRepetitionEngine
  };
  console.log('%c🧠 SmallTalk Practice Debug Tools Available!', 'color: #10B981; font-weight: bold; font-size: 14px;');
  console.log('%c使用 window.debugSpacedRepetition.checkDatabaseStatus("your-user-id") 检查数据库状态', 'color: #666;');
} 