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

export interface BookmarkItem {
  id: string;
  type: 'vocabulary' | 'phrase' | 'grammar';
  itemId: string;
  content: VocabularyItem | PhraseItem | GrammarTopic;
  createdAt: string;
}

// Tab类型
export type LearningTab = 'vocabulary' | 'phrases' | 'grammar' | 'topics' | 'bookmarks';

// 搜索结果类型
export interface SearchResult {
  id: string;
  type: LearningTab;
  title: string;
  subtitle: string;
  content: any;
}