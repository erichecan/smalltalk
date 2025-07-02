// 学习中心相关类型定义

export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example: string;
  pronunciation?: string;
  source: 'conversation' | 'manual' | 'system';
  masteryLevel: 0 | 1 | 2; // 0: 未学, 1: 学习中, 2: 已掌握
  bookmarked: boolean;
  createdAt: string;
  lastReviewed?: string;
  // 新增字段
  chinese_translation?: string;
  phonetic?: string;
  part_of_speech?: string;
  synonyms?: string[];
  antonyms?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  usage_notes?: string;
  // 遗忘曲线相关字段 - 2025-01-30 21:35:00
  ease_factor?: number; // 难度因子 (默认2.5)
  interval?: number; // 当前间隔天数
  repetitions?: number; // 复习次数
  next_review?: string; // 下次复习时间
  total_reviews?: number; // 总复习次数
  correct_reviews?: number; // 正确复习次数
}

export interface PhraseItem {
  id: string;
  phrase: string;
  translation: string;
  category: string;
  usageExample: string;
  bookmarked: boolean;
  createdAt: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  examples: string[];
  exercises?: GrammarExercise[];
}

export interface GrammarExercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface GrammarProgress {
  id: string;
  userId: string;
  grammarTopic: string;
  progressPercentage: number;
  lastPracticed?: string;
}

export interface TopicItem {
  id: string;
  name: string;
  icon: string;
  description?: string;
  learningProgress?: number;
}

// 扩展的话题项，支持收藏对话 - 2025-01-30 18:42:00
export interface ExtendedTopicItem extends TopicItem {
  conversation?: any; // 如果存在，表示这是一个收藏的对话
}

export interface BookmarkItem {
  id: string;
  type: 'vocabulary' | 'phrase' | 'grammar';
  itemId: string;
  content: VocabularyItem | PhraseItem | GrammarTopic;
  createdAt: string;
}

// Tab类型
export type LearningTab = 'vocabulary' | 'topics' | 'bookmarks';

// 搜索结果类型
export interface SearchResult {
  id: string;
  type: LearningTab;
  title: string;
  subtitle: string;
  content: any;
}

// 练习系统相关类型定义 - 2025-01-30 21:35:00

// 练习记录
export interface PracticeRecord {
  id: string;
  user_id: string;
  vocabulary_id: string;
  exercise_type: ExerciseType;
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  response_time: number; // 响应时间(秒)
  difficulty_rating?: 0 | 1 | 2 | 3 | 4 | 5; // 用户主观难度评分
  created_at: string;
}

// 练习题型
export type ExerciseType = 
  | 'word-meaning-match'     // 词义匹配
  | 'meaning-word-match'     // 释义选词
  | 'sentence-completion'    // 句子填空
  | 'pronunciation-practice' // 发音练习
  | 'synonym-match'          // 同义词匹配
  | 'context-usage';         // 语境应用

// 练习题目
export interface ExerciseQuestion {
  id: string;
  type: ExerciseType;
  vocabulary: VocabularyItem;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

// 练习会话
export interface PracticeSession {
  id: string;
  user_id: string;
  questions: ExerciseQuestion[];
  current_question_index: number;
  start_time: string;
  end_time?: string;
  total_questions: number;
  correct_answers: number;
  session_type: 'daily-review' | 'intensive-practice' | 'weak-points';
}

// 遗忘曲线配置
export interface SpacedRepetitionConfig {
  ease_factor_default: number; // 默认难度因子 2.5
  ease_factor_min: number;     // 最小难度因子 1.3
  ease_factor_max: number;     // 最大难度因子 3.0
  interval_modifier: number;   // 间隔修正因子 1.0
  first_interval: number;      // 首次间隔(天) 1
  second_interval: number;     // 第二次间隔(天) 6
  graduating_interval: number; // 毕业间隔(天) 15
  max_interval: number;        // 最大间隔(天) 365
}

// 学习统计
export interface LearningStats {
  user_id: string;
  total_vocabulary: number;
  mastered_vocabulary: number;
  learning_vocabulary: number;
  daily_reviews: number;
  streak_days: number;
  accuracy_rate: number;
  average_response_time: number;
  last_practice_date?: string;
  created_at: string;
  updated_at: string;
}

// 每日练习计划
export interface DailyPractice {
  user_id: string;
  date: string;
  review_words: VocabularyItem[]; // 需要复习的词汇
  new_words: VocabularyItem[];    // 新学习的词汇
  total_target: number;           // 目标练习数量
  completed: number;              // 已完成数量
  is_completed: boolean;
}

// 遗忘曲线算法结果
export interface SpacedRepetitionResult {
  vocabulary_id: string;
  next_review_date: string;
  new_interval: number;
  new_ease_factor: number;
  new_repetitions: number;
  performance_rating: number; // 0-5, 根据正确率和响应时间计算
}