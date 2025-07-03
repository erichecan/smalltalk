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
  /** 是否由AI批量生成题目 - 2025-07-02 15:30:00 */
  generated_by_ai?: boolean;
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

// ==================== 游戏化系统类型定义 - 2025-01-30 10:30:00 ====================

// 游戏类型
export type GameType = 'quiz' | 'matching';

// 游戏模式
export type GameMode = 'classic';

// 游戏会话
export interface GameSession {
  id: string;
  user_id: string;
  game_type: GameType;
  mode: GameMode;
  theme?: string;
  score: number;
  max_score: number;
  accuracy: number;
  time_spent: number; // 秒
  questions_answered: number;
  correct_answers: number;
  streak_achieved: number;
  points_earned: number;
  perfect_score: boolean;
  session_data: Record<string, any>;
  created_at: string;
}

// 单词掌握记录
export interface WordMasteryRecord {
  id: string;
  user_id: string;
  word_id: number; // 对应vocabulary.id (integer)
  word: string;
  mastery_level: 0 | 1 | 2 | 3; // 0: 未学, 1: 学习中, 2: 已掌握, 3: 精通
  review_count: number;
  last_review?: string;
  next_review?: string;
  consecutive_correct: number;
  consecutive_incorrect: number;
  total_correct: number;
  total_incorrect: number;
  average_response_time: number;
  created_at: string;
  updated_at: string;
}

// 用户学习档案
export interface UserLearningProfile {
  id: string;
  user_id: string;
  skill_level: number; // 1-10
  total_words: number;
  mastered_words: number;
  current_streak: number;
  max_streak: number;
  preferred_game_mode: 'quiz' | 'matching' | 'mixed';
  daily_goal: number;
  learning_goals: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 积分系统
export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  daily_points: number;
  weekly_points: number;
  monthly_points: number;
  yearly_points: number;
  streak_bonus: number;
  achievement_bonus: number;
  last_daily_reset: string;
  last_weekly_reset: string;
  last_monthly_reset: string;
  created_at: string;
  updated_at: string;
}

// 积分交易记录
export interface PointsTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend';
  points: number;
  source: string; // 'quiz', 'matching', 'achievement', 'streak', etc.
  source_id?: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// 打卡记录
export interface CheckInRecord {
  id: string;
  user_id: string;
  check_in_date: string;
  consecutive_days: number;
  quality_checkin: boolean;
  activities_completed: number;
  words_learned: number;
  bonus_points: number;
  activities: any[];
  created_at: string;
}

// 成就定义
export interface Achievement {
  id: string;
  category: 'learning' | 'social' | 'streak' | 'challenge';
  name: string;
  description?: string;
  icon?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points_reward: number;
  requirements: Record<string, any>;
  rewards: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

// 用户成就记录
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress_value: number;
  target_value: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  progress_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 学习主题
export interface LearningTopic {
  id: string;
  name: string;
  name_en: string;
  category: string;
  difficulty_level: number; // 1-5
  word_count: number;
  unlock_points: number;
  icon?: string;
  description?: string;
  description_en?: string;
  is_premium: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// 用户解锁记录
export interface UserUnlock {
  id: string;
  user_id: string;
  unlock_type: 'topic' | 'achievement' | 'avatar' | 'theme';
  unlock_id: string;
  points_spent: number;
  unlocked_at: string;
}

// 练习题目记录
export interface PracticeQuestion {
  id: string;
  session_id: string;
  word_id: number; // 对应vocabulary.id (integer)
  question_type: 'word-meaning' | 'meaning-word' | 'sentence-completion' | 'synonym-match' | 'context-usage';
  question_text: string;
  options?: any[];
  correct_answer: string;
  user_answer?: string;
  is_correct?: boolean;
  response_time?: number;
  difficulty_rating?: number;
  created_at: string;
}

// 游戏题目（扩展自练习题目）
export interface GameQuestion extends ExerciseQuestion {
  game_session_id: string;
  time_limit?: number; // 秒
  points_value: number;
  difficulty_multiplier: number;
}

// 游戏结果
export interface GameResult {
  session_id: string;
  user_id: string;
  game_type: GameType;
  final_score: number;
  accuracy: number;
  time_spent: number;
  questions_answered: number;
  correct_answers: number;
  streak_achieved: number;
  points_earned: number;
  perfect_score: boolean;
  achievements_unlocked: string[];
  new_mastery_levels: WordMasteryRecord[];
}

// 积分计算配置
export interface PointsConfig {
  base_points_per_correct: number; // 每题基础分数
  speed_bonus_threshold: number; // 速度奖励阈值(秒)
  speed_bonus_points: number; // 速度奖励分数
  streak_bonus_multiplier: number; // 连击奖励倍数
  perfect_score_bonus: number; // 完美分数奖励
  accuracy_bonus_threshold: number; // 准确率奖励阈值
  accuracy_bonus_points: number; // 准确率奖励分数
}

// 游戏配置
export interface GameConfig {
  quiz: {
    questions_per_session: number;
    points_config: PointsConfig;
  };
  matching: {
    pairs_per_session: number;
    points_config: PointsConfig;
  };
}

// 排行榜条目
export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  game_type: GameType;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

// 社交功能类型
export interface FriendActivity {
  user_id: string;
  username: string;
  avatar?: string;
  activity_type: 'quiz_completed' | 'matching_completed' | 'achievement_unlocked' | 'streak_milestone';
  activity_data: Record<string, any>;
  created_at: string;
}

// 学习统计扩展
export interface ExtendedLearningStats extends LearningStats {
  // 游戏化统计
  total_games_played: number;
  quiz_games_played: number;
  matching_games_played: number;
  total_points_earned: number;
  achievements_unlocked: number;
  current_streak: number;
  max_streak: number;
  average_game_score: number;
  best_game_score: number;
  perfect_games: number;
}