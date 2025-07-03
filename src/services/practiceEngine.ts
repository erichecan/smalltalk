// 练习引擎服务 - 生成各种类型的词汇练习题目
// 2025-01-30 21:45:00

import { supabase } from './supabase';
import { spacedRepetitionEngine } from './spacedRepetition';
import { vocabularyService } from './learningService';
import type { 
  VocabularyItem, 
  ExerciseQuestion, 
  ExerciseType, 
  PracticeSession,
  PracticeRecord
} from '../types/learning';
import i18n from '../i18n';

export class PracticeEngine {
  /**
   * 生成词义匹配题目
   * 给出英文单词，选择正确的中文释义
   */
  async generateWordMeaningMatch(vocabulary: VocabularyItem): Promise<ExerciseQuestion> {
    // 获取其他词汇作为干扰项
    const { data: distractors } = await supabase
      .from('vocabulary')
      .select('definition, chinese_translation')
      .neq('id', vocabulary.id)
      .limit(3);

    const options = [
      vocabulary.definition || vocabulary.chinese_translation || '暂无释义',
      ...(distractors?.map(d => d.definition || d.chinese_translation || '暂无释义') || [])
    ];

    // 随机排序选项
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    const correctAnswer = shuffledOptions.find(option => 
      option === (vocabulary.definition || vocabulary.chinese_translation)
    ) || options[0];

    const lang = i18n.language || 'en';
    const isEn = lang.startsWith('en');

    return {
      id: `${vocabulary.id}-word-meaning-${Date.now()}`,
      type: 'word-meaning-match',
      vocabulary,
      question: isEn ? `What does "${vocabulary.word}" mean?` : `"${vocabulary.word}" 的含义是？`,
      options: shuffledOptions,
      correct_answer: correctAnswer,
      explanation: vocabulary.usage_notes || `${vocabulary.word}: ${vocabulary.definition}`
    };
  }

  /**
   * 生成释义选词题目
   * 给出中文释义，选择正确的英文单词
   */
  async generateMeaningWordMatch(vocabulary: VocabularyItem): Promise<ExerciseQuestion> {
    // 获取其他词汇作为干扰项
    const { data: distractors } = await supabase
      .from('vocabulary')
      .select('word')
      .neq('id', vocabulary.id)
      .limit(3);

    const options = [
      vocabulary.word,
      ...(distractors?.map(d => d.word) || [])
    ];

    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    const lang = i18n.language || 'en';
    const isEn = lang.startsWith('en');

    const questionText = isEn
      ? `Which word means "${vocabulary.definition || vocabulary.chinese_translation}"?`
      : `哪个单词的意思是"${vocabulary.chinese_translation || vocabulary.definition}"？`;

    return {
      id: `${vocabulary.id}-meaning-word-${Date.now()}`,
      type: 'meaning-word-match',
      vocabulary,
      question: questionText,
      options: shuffledOptions,
      correct_answer: vocabulary.word,
      explanation: `${vocabulary.word}: ${vocabulary.definition}`
    };
  }

  /**
   * 生成句子填空题目
   * 在例句中挖掉目标单词，让用户填空
   */
  async generateSentenceCompletion(vocabulary: VocabularyItem): Promise<ExerciseQuestion> {
    const lang = i18n.language || 'en';
    const isEn = lang.startsWith('en');
    const example = vocabulary.example || `This is an example with ${vocabulary.word}.`;

    const questionSentence = example.replace(new RegExp(`\\b${vocabulary.word}\\b`, 'gi'), '______');

    const { data: distractors } = await supabase
      .from('vocabulary')
      .select('word')
      .neq('id', vocabulary.id)
      .eq('part_of_speech', vocabulary.part_of_speech || null)
      .limit(3);

    const options = [vocabulary.word, ...(distractors?.map(d => d.word) || [])];
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      id: `${vocabulary.id}-sentence-${Date.now()}`,
      type: 'sentence-completion',
      vocabulary,
      question: isEn ? `Fill in the blank: ${questionSentence}` : `请填空：${questionSentence}`,
      options: shuffledOptions,
      correct_answer: vocabulary.word,
      explanation: isEn ? `Complete sentence: ${example}` : `完整句子：${example}`
    };
  }

  /**
   * 生成同义词匹配题目
   */
  async generateSynonymMatch(vocabulary: VocabularyItem): Promise<ExerciseQuestion> {
    const lang = i18n.language || 'en';
    const isEn = lang.startsWith('en');
    const synonyms = vocabulary.synonyms || [];
    
    if (synonyms.length === 0) {
      // 如果没有同义词，生成一个备用题目
      return this.generateWordMeaningMatch(vocabulary);
    }

    const correctSynonym = synonyms[0];
    
    // 获取干扰项
    const { data: distractors } = await supabase
      .from('vocabulary')
      .select('word')
      .neq('id', vocabulary.id)
      .limit(3);

    const options = [
      correctSynonym,
      ...(distractors?.map(d => d.word) || [])
    ];

    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      id: `${vocabulary.id}-synonym-${Date.now()}`,
      type: 'synonym-match',
      vocabulary,
      question: isEn ? `Which of the following is a synonym of "${vocabulary.word}"?` : `"${vocabulary.word}" 的同义词是？`,
      options: shuffledOptions,
      correct_answer: correctSynonym,
      explanation: `${vocabulary.word} 的同义词包括：${synonyms.join(', ')}`
    };
  }

  /**
   * 生成语境应用题目
   * 给出一个使用场景，选择合适的单词
   */
  async generateContextUsage(vocabulary: VocabularyItem): Promise<ExerciseQuestion> {
    const lang = i18n.language || 'en';
    const isEn = lang.startsWith('en');
    const contexts = isEn
      ? [
        `Which word would you use to express "${vocabulary.definition}"?`,
        `When you want to say "${vocabulary.definition}", which word is appropriate?`,
        `Choose the most suitable word for the context below:\n${vocabulary.example || `Need a word that means "${vocabulary.definition}"`}`
      ]
      : [
        `在表达${vocabulary.chinese_translation || vocabulary.definition}的时候，你会使用哪个词？`,
        `当你想要说"${vocabulary.definition}"时，应该用哪个单词？`,
        `在下面的语境中，哪个词最合适？\n${vocabulary.example || `需要一个表示"${vocabulary.definition}"的词`}`
      ];

    const randomContext = contexts[Math.floor(Math.random() * contexts.length)];

    // 获取干扰项
    const { data: distractors } = await supabase
      .from('vocabulary')
      .select('word')
      .neq('id', vocabulary.id)
      .limit(3);

    const options = [
      vocabulary.word,
      ...(distractors?.map(d => d.word) || [])
    ];

    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      id: `${vocabulary.id}-context-${Date.now()}`,
      type: 'context-usage',
      vocabulary,
      question: randomContext,
      options: shuffledOptions,
      correct_answer: vocabulary.word,
      explanation: vocabulary.usage_notes || `${vocabulary.word} 适用于这种语境`
    };
  }

  /**
   * 根据词汇难度和用户水平智能选择题型
   */
  selectExerciseType(vocabulary: VocabularyItem, userAccuracy: number): ExerciseType {
    const difficultyLevel = vocabulary.difficulty_level || 'beginner';
    const masteryLevel = vocabulary.masteryLevel || 0;

    // 新学习的词汇，从简单题型开始
    if (masteryLevel === 0 || userAccuracy < 0.6) {
      return Math.random() > 0.5 ? 'word-meaning-match' : 'meaning-word-match';
    }

    // 学习中的词汇，使用中等难度题型
    if (masteryLevel === 1 || userAccuracy < 0.8) {
      const mediumTypes: ExerciseType[] = ['sentence-completion', 'context-usage'];
      if (vocabulary.synonyms && vocabulary.synonyms.length > 0) {
        mediumTypes.push('synonym-match');
      }
      return mediumTypes[Math.floor(Math.random() * mediumTypes.length)];
    }

    // 已掌握的词汇，使用复杂题型巩固
    const advancedTypes: ExerciseType[] = ['context-usage', 'sentence-completion'];
    if (vocabulary.synonyms && vocabulary.synonyms.length > 0) {
      advancedTypes.push('synonym-match');
    }
    return advancedTypes[Math.floor(Math.random() * advancedTypes.length)];
  }

  /**
   * 为单个词汇生成练习题目
   */
  async generateQuestion(vocabulary: VocabularyItem, userAccuracy: number = 0.7): Promise<ExerciseQuestion> {
    const exerciseType = this.selectExerciseType(vocabulary, userAccuracy);

    switch (exerciseType) {
      case 'word-meaning-match':
        return this.generateWordMeaningMatch(vocabulary);
      case 'meaning-word-match':
        return this.generateMeaningWordMatch(vocabulary);
      case 'sentence-completion':
        return this.generateSentenceCompletion(vocabulary);
      case 'synonym-match':
        return this.generateSynonymMatch(vocabulary);
      case 'context-usage':
        return this.generateContextUsage(vocabulary);
      default:
        return this.generateWordMeaningMatch(vocabulary);
    }
  }

  /**
   * 创建练习会话
   */
  async createPracticeSession(
    userId: string, 
    vocabularyList: VocabularyItem[],
    sessionType: 'daily-review' | 'intensive-practice' | 'weak-points' = 'daily-review',
    useAI: boolean = true
  ): Promise<PracticeSession> {
    // 1) 尝试使用 AI 批量生成题目 - 2025-07-02 14:45:00
    const questions: ExerciseQuestion[] = [];
    let aiGenerated = false;

    if (useAI) {
      try {
        const { generateExerciseQuestions } = await import('./ai');
        const aiQs = await generateExerciseQuestions(vocabularyList);
        if (aiQs && aiQs.length > 0) {
          questions.push(...aiQs);
          console.log(`[AI] Generated ${aiQs.length} questions via Gemini`);
          aiGenerated = true;
        }
      } catch (aiError) {
        console.warn('AI question generation failed, falling back to local engine:', aiError);
      }
    }

    // 2) 如果AI未生成或数量不足，使用本地逻辑补足
    if (questions.length < vocabularyList.length) {
      // 获取用户准确率用于智能题型选择
      const stats = await spacedRepetitionEngine.getLearningStats(userId);
      const userAccuracy = stats.accuracy_rate;

      for (const vocab of vocabularyList) {
        if (questions.find(q => q.vocabulary.word === vocab.word)) continue; // 已有AI题目
        try {
          const question = await this.generateQuestion(vocab, userAccuracy);
          questions.push(question);
        } catch (error) {
          console.error(`Failed to generate fallback question for ${vocab.word}:`, error);
        }
      }
    }

    // 随机排序题目
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    return {
      id: `session-${userId}-${Date.now()}`,
      user_id: userId,
      questions: shuffledQuestions,
      current_question_index: 0,
      start_time: new Date().toISOString(),
      total_questions: shuffledQuestions.length,
      correct_answers: 0,
      session_type: sessionType,
      generated_by_ai: aiGenerated
    };
  }

  /**
   * 记录练习结果并更新遗忘曲线
   */
  async recordPracticeResult(
    sessionId: string,
    questionId: string,
    userAnswer: string,
    correctAnswer: string,
    responseTime: number,
    userDifficulty?: 0 | 1 | 2 | 3 | 4 | 5
  ): Promise<void> {
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    
    // 计算表现评分
    const performanceRating = spacedRepetitionEngine.calculatePerformanceRating(
      isCorrect,
      responseTime,
      10, // 目标时间10秒
      userDifficulty
    );

    // 创建练习记录
    const practiceRecord: Omit<PracticeRecord, 'id'> = {
      user_id: sessionId.split('-')[1], // 从sessionId提取userId
      vocabulary_id: questionId.split('-')[0], // 从questionId提取vocabularyId
      exercise_type: questionId.includes('word-meaning') ? 'word-meaning-match' :
                    questionId.includes('meaning-word') ? 'meaning-word-match' :
                    questionId.includes('sentence') ? 'sentence-completion' :
                    questionId.includes('synonym') ? 'synonym-match' : 'context-usage',
      question: '', // 题目内容
      user_answer: userAnswer,
      correct_answer: correctAnswer,
      is_correct: isCorrect,
      response_time: responseTime,
      difficulty_rating: userDifficulty,
      created_at: new Date().toISOString()
    };

    try {
      // 保存练习记录到数据库 - 2025-01-30 23:15:00 添加容错处理
      try {
        await supabase
          .from('practice_records')
          .insert(practiceRecord);
      } catch (dbError) {
        console.warn('Cannot save practice record, table may not exist:', dbError);
      }

      // 更新词汇的遗忘曲线数据
      const vocabularyId = questionId.split('-')[0];
      const { data: vocabulary } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('id', vocabularyId)
        .single();

      if (vocabulary) {
        const spacingResult = spacedRepetitionEngine.calculateNextReview(
          {
            id: vocabulary.id,
            word: vocabulary.word,
            definition: vocabulary.definition,
            example: vocabulary.example,
            pronunciation: vocabulary.pronunciation,
            source: vocabulary.source,
            masteryLevel: vocabulary.mastery_level,
            bookmarked: vocabulary.bookmarked,
            createdAt: vocabulary.created_at,
            lastReviewed: vocabulary.last_reviewed,
            chinese_translation: vocabulary.chinese_translation,
            phonetic: vocabulary.phonetic,
            part_of_speech: vocabulary.part_of_speech,
            synonyms: vocabulary.synonyms,
            antonyms: vocabulary.antonyms,
            difficulty_level: vocabulary.difficulty_level,
            usage_notes: vocabulary.usage_notes,
            ease_factor: vocabulary.ease_factor,
            interval: vocabulary.interval,
            repetitions: vocabulary.repetitions,
            next_review: vocabulary.next_review,
            total_reviews: vocabulary.total_reviews,
            correct_reviews: vocabulary.correct_reviews
          },
          performanceRating
        );

        await spacedRepetitionEngine.updateVocabularySpacing(vocabularyId, spacingResult);

        // 更新掌握度等级
        const newMasteryLevel = performanceRating >= 4 && (vocabulary.repetitions || 0) >= 3 ? 2 :
                              performanceRating >= 3 ? 1 : 0;
        
        if (newMasteryLevel !== vocabulary.mastery_level) {
          await vocabularyService.updateVocabulary(vocabularyId, { masteryLevel: newMasteryLevel });
        }
      }
    } catch (error) {
      console.error('Error recording practice result:', error);
    }
  }

  /**
   * 获取推荐的练习词汇
   * 优先级：过期复习 > 薄弱环节 > 新词汇
   */
  async getRecommendedPractice(userId: string, count: number = 10): Promise<VocabularyItem[]> {
    // 获取今日需要复习的词汇
    const reviewWords = await spacedRepetitionEngine.getTodayReviews(userId);
    
    if (reviewWords.length >= count) {
      return reviewWords.slice(0, count);
    }

    // 如果复习词汇不够，添加薄弱环节的词汇
    const { data: weakWords } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('user_id', userId)
      .eq('mastery_level', 0) // 未掌握的词汇
      .order('correct_reviews', { ascending: true })
      .limit(count - reviewWords.length);

    const additionalWords = weakWords?.map(item => ({
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
      ease_factor: item.ease_factor,
      interval: item.interval,
      repetitions: item.repetitions,
      next_review: item.next_review,
      total_reviews: item.total_reviews,
      correct_reviews: item.correct_reviews
    })) || [];

    return [...reviewWords, ...additionalWords].slice(0, count);
  }
}

// 导出默认实例
export const practiceEngine = new PracticeEngine(); 