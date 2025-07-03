// 游戏引擎服务 - Quiz和Matching游戏核心逻辑
// 2025-01-30 10:45:00

import { supabase } from './supabase';
import { practiceEngine } from './practiceEngine';
import type { 
  GameType, 
  GameMode, 
  GameSession, 
  GameQuestion, 
  GameResult,
  PointsConfig,
  GameConfig,
  WordMasteryRecord,
  UserPoints,
  PointsTransaction,
  Achievement,
  UserAchievement,
  VocabularyItem,
  ExerciseQuestion
} from '../types/learning';

export class GameEngine {
  // 默认游戏配置
  private defaultConfig: GameConfig = {
    quiz: {
      questions_per_session: 10,
      points_config: {
        base_points_per_correct: 10,
        speed_bonus_threshold: 10,
        speed_bonus_points: 5,
        streak_bonus_multiplier: 1.5,
        perfect_score_bonus: 100,
        accuracy_bonus_threshold: 0.8,
        accuracy_bonus_points: 50
      }
    },
    matching: {
      pairs_per_session: 8,
      points_config: {
        base_points_per_correct: 8,
        speed_bonus_threshold: 60,
        speed_bonus_points: 25,
        streak_bonus_multiplier: 1.3,
        perfect_score_bonus: 80,
        accuracy_bonus_threshold: 0.9,
        accuracy_bonus_points: 40
      }
    }
  };

  /**
   * 创建新的游戏会话
   */
  async createGameSession(
    userId: string,
    gameType: GameType,
    mode: GameMode = 'classic',
    theme?: string
  ): Promise<GameSession> {
    const sessionId = `game-${userId}-${Date.now()}`;
    
    const session: Omit<GameSession, 'id'> = {
      user_id: userId,
      game_type: gameType,
      mode,
      theme,
      score: 0,
      max_score: 0,
      accuracy: 0,
      time_spent: 0,
      questions_answered: 0,
      correct_answers: 0,
      streak_achieved: 0,
      points_earned: 0,
      perfect_score: false,
      session_data: {},
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({ ...session, id: sessionId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating game session:', error);
      // 返回内存中的会话对象
      return { ...session, id: sessionId };
    }
  }

  /**
   * 为Quiz游戏生成题目
   */
  async generateQuizQuestions(
    sessionId: string,
    count: number = 10,
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<GameQuestion[]> {
    try {
      // 获取用户需要复习的词汇
      let { data: vocabulary } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('next_review', '<=', new Date().toISOString())
        .order('next_review', { ascending: true })
        .limit(count * 2); // 获取更多词汇以便选择

      if (!vocabulary || vocabulary.length === 0) {
        // 如果没有需要复习的词汇，获取所有词汇
        const { data: allVocabulary } = await supabase
          .from('vocabulary')
          .select('*')
          .limit(count * 2);
        
        if (!allVocabulary) return [];
        vocabulary = allVocabulary;
      }

      // 随机选择词汇
      const selectedVocabulary = vocabulary
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      const questions: GameQuestion[] = [];
      const config = this.defaultConfig.quiz;

      for (const vocab of selectedVocabulary) {
        try {
          const baseQuestion = await practiceEngine.generateQuestion(vocab, 0.7);
          
          const gameQuestion: GameQuestion = {
            ...baseQuestion,
            game_session_id: sessionId,
            points_value: config.points_config.base_points_per_correct,
            difficulty_multiplier: this.calculateDifficultyMultiplier(vocab.difficulty_level || 'beginner')
          };

          questions.push(gameQuestion);
        } catch (error) {
          console.error(`Failed to generate question for ${vocab.word}:`, error);
        }
      }

      return questions;
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      return [];
    }
  }

  /**
   * 为Matching游戏生成配对
   */
  async generateMatchingPairs(
    sessionId: string,
    pairCount: number = 8,
    theme?: string
  ): Promise<{ left: VocabularyItem[], right: string[] }> {
    try {
      // 获取词汇
      let query = supabase
        .from('vocabulary')
        .select('*')
        .limit(pairCount * 2);

      if (theme) {
        // 如果有主题，按主题筛选
        query = query.eq('category', theme);
      }

      const { data: vocabulary } = await query;

      if (!vocabulary || vocabulary.length < pairCount) {
        // 如果词汇不够，获取更多
        const { data: moreVocabulary } = await supabase
          .from('vocabulary')
          .select('*')
          .limit(pairCount * 3);
        
        if (moreVocabulary) {
          vocabulary!.push(...moreVocabulary);
        }
      }

      // 确保vocabulary不为null
      if (!vocabulary || vocabulary.length === 0) {
        return { left: [], right: [] };
      }

      // 随机选择词汇
      const selectedVocabulary = vocabulary
        .sort(() => Math.random() - 0.5)
        .slice(0, pairCount);

      const left = selectedVocabulary;
      const right = selectedVocabulary.map(vocab => 
        vocab.chinese_translation || vocab.definition || '暂无释义'
      );

      return { left, right };
    } catch (error) {
      console.error('Error generating matching pairs:', error);
      return { left: [], right: [] };
    }
  }

  /**
   * 计算Quiz游戏积分
   */
  calculateQuizPoints(
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number,
    streakCount: number,
    config: PointsConfig = this.defaultConfig.quiz.points_config
  ): number {
    // 基础分数
    let points = correctAnswers * config.base_points_per_correct;

    // 速度奖励
    const averageTimePerQuestion = timeSpent / totalQuestions;
    if (averageTimePerQuestion < config.speed_bonus_threshold) {
      points += config.speed_bonus_points;
    }

    // 连击奖励
    if (streakCount >= 3) {
      points = Math.floor(points * config.streak_bonus_multiplier);
    }

    // 完美分数奖励
    if (correctAnswers === totalQuestions) {
      points += config.perfect_score_bonus;
    }

    // 准确率奖励
    const accuracy = correctAnswers / totalQuestions;
    if (accuracy >= config.accuracy_bonus_threshold) {
      points += config.accuracy_bonus_points;
    }

    return points;
  }

  /**
   * 计算Matching游戏积分
   */
  calculateMatchingPoints(
    correctMatches: number,
    totalMatches: number,
    timeSpent: number,
    config: PointsConfig = this.defaultConfig.matching.points_config
  ): number {
    // 基础分数
    let points = correctMatches * config.base_points_per_correct;

    // 速度奖励
    if (timeSpent < config.speed_bonus_threshold) {
      points += config.speed_bonus_points;
    }

    // 完美分数奖励
    if (correctMatches === totalMatches) {
      points += config.perfect_score_bonus;
    }

    // 准确率奖励
    const accuracy = correctMatches / totalMatches;
    if (accuracy >= config.accuracy_bonus_threshold) {
      points += config.accuracy_bonus_points;
    }

    return points;
  }

  /**
   * 计算难度倍数
   */
  private calculateDifficultyMultiplier(difficulty: string): number {
    switch (difficulty) {
      case 'beginner': return 1.0;
      case 'intermediate': return 1.2;
      case 'advanced': return 1.5;
      default: return 1.0;
    }
  }

  /**
   * 记录游戏结果
   */
  async recordGameResult(
    sessionId: string,
    userId: string,
    gameType: GameType,
    finalScore: number,
    accuracy: number,
    timeSpent: number,
    questionsAnswered: number,
    correctAnswers: number,
    streakAchieved: number,
    pointsEarned: number,
    perfectScore: boolean
  ): Promise<GameResult> {
    try {
      // 更新游戏会话
      const { error: sessionError } = await supabase
        .from('game_sessions')
        .update({
          score: finalScore,
          max_score: questionsAnswered * 10, // 假设每题满分10分
          accuracy,
          time_spent: timeSpent,
          questions_answered: questionsAnswered,
          correct_answers: correctAnswers,
          streak_achieved: streakAchieved,
          points_earned: pointsEarned,
          perfect_score: perfectScore
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // 添加积分
      await this.addPoints(userId, pointsEarned, gameType, sessionId);

      // 检查并解锁成就
      const achievementsUnlocked = await this.checkAchievements(userId, gameType, {
        score: finalScore,
        accuracy,
        streak: streakAchieved,
        perfect: perfectScore
      });

      // 更新单词掌握记录
      const newMasteryLevels = await this.updateWordMastery(userId, sessionId);

      const result: GameResult = {
        session_id: sessionId,
        user_id: userId,
        game_type: gameType,
        final_score: finalScore,
        accuracy,
        time_spent: timeSpent,
        questions_answered: questionsAnswered,
        correct_answers: correctAnswers,
        streak_achieved: streakAchieved,
        points_earned: pointsEarned,
        perfect_score: perfectScore,
        achievements_unlocked: achievementsUnlocked,
        new_mastery_levels: newMasteryLevels
      };

      return result;
    } catch (error) {
      console.error('Error recording game result:', error);
      throw error;
    }
  }

  /**
   * 添加积分
   */
  private async addPoints(
    userId: string,
    points: number,
    source: string,
    sourceId?: string
  ): Promise<void> {
    try {
      // 获取用户积分记录
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userPoints) {
        // 更新现有记录
        await supabase
          .from('user_points')
          .update({
            total_points: userPoints.total_points + points,
            daily_points: userPoints.daily_points + points,
            weekly_points: userPoints.weekly_points + points,
            monthly_points: userPoints.monthly_points + points,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // 创建新记录
        await supabase
          .from('user_points')
          .insert({
            user_id: userId,
            total_points: points,
            daily_points: points,
            weekly_points: points,
            monthly_points: points,
            yearly_points: points,
            streak_bonus: 0,
            achievement_bonus: 0,
            last_daily_reset: new Date().toISOString(),
            last_weekly_reset: new Date().toISOString(),
            last_monthly_reset: new Date().toISOString()
          });
      }

      // 记录积分交易
      await supabase
        .from('points_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'earn',
          points,
          source,
          source_id: sourceId,
          description: `完成${source}游戏获得积分`,
          metadata: { game_type: source },
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error adding points:', error);
    }
  }

  /**
   * 检查成就解锁
   */
  private async checkAchievements(
    userId: string,
    gameType: GameType,
    gameStats: {
      score: number;
      accuracy: number;
      streak: number;
      perfect: boolean;
    }
  ): Promise<string[]> {
    try {
      const unlockedAchievements: string[] = [];

      // 获取所有成就
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true);

      if (!achievements) return unlockedAchievements;

      for (const achievement of achievements) {
        const requirements = achievement.requirements;
        
        // 检查是否已解锁
        const { data: existingAchievement } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .eq('is_unlocked', true)
          .single();

        if (existingAchievement) continue;

        // 检查解锁条件
        let shouldUnlock = false;

        switch (requirements.type) {
          case 'quiz_count':
            const quizCount = await this.getGameCount(userId, 'quiz');
            shouldUnlock = quizCount >= requirements.value;
            break;
          case 'matching_count':
            const matchingCount = await this.getGameCount(userId, 'matching');
            shouldUnlock = matchingCount >= requirements.value;
            break;
          case 'perfect_streak':
            shouldUnlock = gameStats.streak >= requirements.value;
            break;
          case 'matching_speed':
            shouldUnlock = gameType === 'matching' && gameStats.score >= requirements.value;
            break;
          case 'perfect_score':
            shouldUnlock = gameStats.perfect;
            break;
        }

        if (shouldUnlock) {
          // 解锁成就
          await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              progress_value: requirements.value,
              target_value: requirements.value,
              is_unlocked: true,
              unlocked_at: new Date().toISOString(),
              progress_data: gameStats
            });

          unlockedAchievements.push(achievement.id);

          // 添加成就奖励积分
          if (achievement.points_reward > 0) {
            await this.addPoints(userId, achievement.points_reward, 'achievement', achievement.id);
          }
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * 获取游戏次数
   */
  private async getGameCount(userId: string, gameType: GameType): Promise<number> {
    try {
      const { count } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('game_type', gameType);

      return count || 0;
    } catch (error) {
      console.error('Error getting game count:', error);
      return 0;
    }
  }

  /**
   * 更新单词掌握记录
   */
  private async updateWordMastery(
    userId: string,
    sessionId: string
  ): Promise<WordMasteryRecord[]> {
    try {
      // 获取会话中的练习题目
      const { data: questions } = await supabase
        .from('practice_questions')
        .select('*')
        .eq('session_id', sessionId);

      if (!questions) return [];

      const updatedMastery: WordMasteryRecord[] = [];

      for (const question of questions) {
        if (!question.is_correct) continue;

        // 获取或创建掌握记录
        let { data: masteryRecord } = await supabase
          .from('word_mastery_records')
          .select('*')
          .eq('user_id', userId)
          .eq('word_id', question.word_id)
          .single();

        if (!masteryRecord) {
          // 创建新记录
          const { data: newRecord } = await supabase
            .from('word_mastery_records')
            .insert({
              user_id: userId,
              word_id: question.word_id,
              word: '', // 需要从vocabulary表获取
              mastery_level: 1,
              review_count: 1,
              consecutive_correct: 1,
              consecutive_incorrect: 0,
              total_correct: 1,
              total_incorrect: 0,
              average_response_time: question.response_time || 0
            })
            .select()
            .single();

          if (newRecord) {
            updatedMastery.push(newRecord);
          }
        } else {
          // 更新现有记录
          const newTotalCorrect = masteryRecord.total_correct + 1;
          const newConsecutiveCorrect = masteryRecord.consecutive_correct + 1;
          const newReviewCount = masteryRecord.review_count + 1;
          
          // 计算新的掌握等级
          let newMasteryLevel = masteryRecord.mastery_level;
          if (newTotalCorrect >= 10 && newConsecutiveCorrect >= 5) {
            newMasteryLevel = 3; // 精通
          } else if (newTotalCorrect >= 5 && newConsecutiveCorrect >= 3) {
            newMasteryLevel = 2; // 已掌握
          } else if (newTotalCorrect >= 2) {
            newMasteryLevel = 1; // 学习中
          }

          const { data: updatedRecord } = await supabase
            .from('word_mastery_records')
            .update({
              mastery_level: newMasteryLevel,
              review_count: newReviewCount,
              consecutive_correct: newConsecutiveCorrect,
              total_correct: newTotalCorrect,
              average_response_time: (masteryRecord.average_response_time + (question.response_time || 0)) / 2,
              last_review: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', masteryRecord.id)
            .select()
            .single();

          if (updatedRecord) {
            updatedMastery.push(updatedRecord);
          }
        }
      }

      return updatedMastery;
    } catch (error) {
      console.error('Error updating word mastery:', error);
      return [];
    }
  }

  /**
   * 获取用户游戏统计
   */
  async getUserGameStats(userId: string): Promise<{
    totalGames: number;
    quizGames: number;
    matchingGames: number;
    totalPoints: number;
    bestScore: number;
    perfectGames: number;
    currentStreak: number;
  }> {
    try {
      // 获取游戏会话统计
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId);

      if (!sessions || sessions.length === 0) {
        return {
          totalGames: 0,
          quizGames: 0,
          matchingGames: 0,
          totalPoints: 0,
          bestScore: 0,
          perfectGames: 0,
          currentStreak: 0
        };
      }

      const quizGames = sessions.filter(s => s.game_type === 'quiz').length;
      const matchingGames = sessions.filter(s => s.game_type === 'matching').length;
      const totalPoints = sessions.reduce((sum, s) => sum + (s.points_earned || 0), 0);
      const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.score || 0)) : 0;
      const perfectGames = sessions.filter(s => s.perfect_score).length;

      // 获取用户积分记录
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      return {
        totalGames: sessions.length,
        quizGames,
        matchingGames,
        totalPoints,
        bestScore,
        perfectGames,
        currentStreak: userPoints?.current_streak || 0
      };
    } catch (error) {
      console.error('Error getting user game stats:', error);
      return {
        totalGames: 0,
        quizGames: 0,
        matchingGames: 0,
        totalPoints: 0,
        bestScore: 0,
        perfectGames: 0,
        currentStreak: 0
      };
    }
  }
}

// 导出默认实例
export const gameEngine = new GameEngine(); 