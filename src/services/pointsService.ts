import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// 积分系统接口定义
export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface UserLearningStats {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  current_streak: number;
  friends_count: number;
  created_at: string;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend';
  points: number;
  source: string;
  source_id?: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  level: number;
  rank: number;
  display_name?: string;
}

// 积分来源定义
export const POINTS_SOURCES = {
  conversation: 'CONVERSATION',
  vocabulary: 'VOCABULARY', 
  quiz: 'QUIZ',
  matching: 'MATCHING',
  streak: 'STREAK',
  achievement: 'ACHIEVEMENT',
  daily_login: 'DAILY_LOGIN',
  friend_invite: 'FRIEND_INVITE'
} as const;

// 积分奖励配置
export const POINTS_REWARDS = {
  [POINTS_SOURCES.conversation]: 10,
  [POINTS_SOURCES.vocabulary]: 5,
  [POINTS_SOURCES.quiz]: 15,
  [POINTS_SOURCES.matching]: 12,
  [POINTS_SOURCES.streak]: 20,
  [POINTS_SOURCES.daily_login]: 5,
  [POINTS_SOURCES.friend_invite]: 50
} as const;

class PointsService {
  /**
   * 获取用户积分统计
   */
  async getUserStats(userId: string): Promise<UserLearningStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_learning_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * 初始化用户积分记录
   */
  async initializeUserStats(userId: string): Promise<UserLearningStats> {
    try {
      const { data, error } = await supabase
        .from('user_learning_stats')
        .insert([{
          user_id: userId,
          total_points: 0,
          level: 1,
          current_streak: 0,
          friends_count: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initializing user stats:', error);
      throw error;
    }
  }

  /**
   * 奖励积分
   */
  async awardPoints(
    userId: string, 
    source: keyof typeof POINTS_SOURCES, 
    customPoints?: number,
    sourceId?: string,
    description?: string
  ): Promise<PointsTransaction> {
    try {
      const points = customPoints || POINTS_REWARDS[source] || 0;
      
      // 创建积分交易记录
      const { data: transaction, error: transactionError } = await supabase
        .from('points_transactions')
        .insert([{
          user_id: userId,
          transaction_type: 'earn',
          points: points,
          source: source,
          source_id: sourceId,
          description: description || `Earned ${points} points from ${source}`,
          metadata: { timestamp: new Date().toISOString() }
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 更新用户统计
      await this.updateUserStats(userId, points);

      return transaction;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  /**
   * 更新用户统计
   */
  private async updateUserStats(userId: string, pointsToAdd: number): Promise<void> {
    try {
      // 获取或创建用户统计
      let stats = await this.getUserStats(userId);
      if (!stats) {
        stats = await this.initializeUserStats(userId);
      }

      const newTotalPoints = stats.total_points + pointsToAdd;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;

      // 更新统计
      const { error } = await supabase
        .from('user_learning_stats')
        .update({
          total_points: newTotalPoints,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // 如果升级了，触发升级事件
      if (newLevel > stats.level) {
        await this.handleLevelUp(userId, newLevel);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  /**
   * 处理升级事件
   */
  private async handleLevelUp(userId: string, newLevel: number): Promise<void> {
    try {
      // 创建升级通知
      await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: 'level_up',
          title: '🎉 Level Up!',
          message: `Congratulations! You've reached level ${newLevel}!`,
          data: { new_level: newLevel }
        }]);

      // 升级奖励积分
      const levelUpBonus = newLevel * 10;
      await supabase
        .from('points_transactions')
        .insert([{
          user_id: userId,
          transaction_type: 'earn',
          points: levelUpBonus,
          source: 'level_up',
          description: `Level ${newLevel} bonus`,
          metadata: { level: newLevel }
        }]);

      // 广播升级活动 (延迟导入避免循环依赖)
      try {
        const { realtimeService } = await import('./realtimeService');
        await realtimeService.broadcastFriendActivity(userId, 'level_up', {
          level: newLevel,
          bonus_points: levelUpBonus
        });
      } catch (error) {
        console.error('Error broadcasting level up activity:', error);
      }
    } catch (error) {
      console.error('Error handling level up:', error);
    }
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(limit: number = 50, timeframe: 'all' | 'week' | 'month' = 'all'): Promise<LeaderboardEntry[]> {
    try {
      // 首先获取用户统计数据
      const { data: statsData, error: statsError } = await supabase
        .from('user_learning_stats')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (statsError) {
        console.error('Supabase stats query error:', statsError);
        throw statsError;
      }

      if (!statsData) {
        console.warn('No leaderboard data returned');
        return [];
      }

      // 获取用户信息
      const userIds = statsData.map(stat => stat.user_id);
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id, email')
        .in('id', userIds);

      if (userError) {
        console.error('Supabase user query error:', userError);
      }

      // 创建用户ID到邮箱的映射
      const userEmailMap = new Map(
        userData?.map(user => [user.id, user.email]) || []
      );

      return statsData.map((entry, index) => ({
        user_id: entry.user_id,
        total_points: entry.total_points || 0,
        level: entry.level || 1,
        rank: index + 1,
        display_name: userEmailMap.get(entry.user_id)?.split('@')[0] || 'Anonymous'
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard data');
    }
  }

  /**
   * 获取用户排名
   */
  async getUserRank(userId: string): Promise<number> {
    try {
      const userStats = await this.getUserStats(userId);
      if (!userStats) return 0;

      const { count, error } = await supabase
        .from('user_learning_stats')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', userStats.total_points);

      if (error) throw error;
      return (count || 0) + 1;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return 0;
    }
  }

  /**
   * 获取用户积分历史
   */
  async getPointsHistory(userId: string, limit: number = 20): Promise<PointsTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching points history:', error);
      throw error;
    }
  }

  /**
   * 消费积分
   */
  async spendPoints(
    userId: string, 
    points: number, 
    source: string, 
    description: string,
    sourceId?: string
  ): Promise<boolean> {
    try {
      const stats = await this.getUserStats(userId);
      if (!stats || stats.total_points < points) {
        return false; // 积分不足
      }

      // 创建消费记录
      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert([{
          user_id: userId,
          transaction_type: 'spend',
          points: points,
          source: source,
          source_id: sourceId,
          description: description,
          metadata: { timestamp: new Date().toISOString() }
        }]);

      if (transactionError) throw transactionError;

      // 更新用户统计
      const { error: updateError } = await supabase
        .from('user_learning_stats')
        .update({
          total_points: stats.total_points - points,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error spending points:', error);
      return false;
    }
  }

  /**
   * 批量奖励积分（用于游戏完成等场景）
   */
  async awardGameCompletionPoints(
    userId: string,
    gameType: 'quiz' | 'matching',
    score: number,
    isNewRecord: boolean = false
  ): Promise<void> {
    try {
      let basePoints = POINTS_REWARDS[
        gameType === 'quiz' ? POINTS_SOURCES.quiz : POINTS_SOURCES.matching
      ];
      
      // 分数加成
      const scoreBonus = Math.floor(score / 10);
      
      // 新记录加成
      const recordBonus = isNewRecord ? 20 : 0;
      
      const totalPoints = basePoints + scoreBonus + recordBonus;

      await this.awardPoints(
        userId,
        gameType === 'quiz' ? POINTS_SOURCES.quiz : POINTS_SOURCES.matching,
        totalPoints,
        undefined,
        `Game completed: ${score} points${isNewRecord ? ' (New Record!)' : ''}`
      );
    } catch (error) {
      console.error('Error awarding game completion points:', error);
      throw error;
    }
  }
}

export const pointsService = new PointsService();