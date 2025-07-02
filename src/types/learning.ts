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