import { supabase } from './supabase';
import { pointsService } from './pointsService';
import { achievementService } from './achievementService';
import { socialService } from './socialService';
import { realtimeService } from './realtimeService';

/**
 * 社交集成服务
 * 负责将学习活动集成到社交系统中
 */
class SocialIntegrationService {
  /**
   * 处理对话完成事件
   */
  async handleConversationCompleted(userId: string, conversationId: string, topicCount: number = 1): Promise<void> {
    try {
      // 奖励对话积分
      await pointsService.awardPoints(
        userId,
        pointsService.POINTS_SOURCES.conversation,
        undefined,
        conversationId,
        'Completed conversation practice'
      );

      // 检查相关成就
      await achievementService.checkAchievements(userId, {
        conversations: topicCount
      });

      // 更新学习连续天数
      await this.updateLearningStreak(userId);

      // 广播好友活动
      await realtimeService.broadcastFriendActivity(userId, 'points_earned', {
        source: 'conversation',
        points: 10,
        topics: topicCount
      });

    } catch (error) {
      console.error('Error handling conversation completion:', error);
    }
  }

  /**
   * 处理词汇学习事件
   */
  async handleVocabularyLearned(userId: string, wordsCount: number, vocabularyIds: string[] = []): Promise<void> {
    try {
      // 奖励词汇学习积分
      await pointsService.awardPoints(
        userId,
        pointsService.POINTS_SOURCES.vocabulary,
        wordsCount * 5, // 每个单词5分
        vocabularyIds.join(','),
        `Learned ${wordsCount} new words`
      );

      // 检查词汇相关成就
      await achievementService.checkAchievements(userId, {
        words_learned: wordsCount
      });

      // 更新学习连续天数
      await this.updateLearningStreak(userId);

      // 广播好友活动
      await realtimeService.broadcastFriendActivity(userId, 'points_earned', {
        source: 'vocabulary',
        points: wordsCount * 5,
        words_learned: wordsCount
      });

    } catch (error) {
      console.error('Error handling vocabulary learning:', error);
    }
  }

  /**
   * 处理每日登录事件
   */
  async handleDailyLogin(userId: string): Promise<void> {
    try {
      // 检查今天是否已经登录奖励过
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingTransaction } = await supabase
        .from('points_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('source', pointsService.POINTS_SOURCES.daily_login)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .single();

      if (!existingTransaction) {
        // 奖励每日登录积分
        await pointsService.awardPoints(
          userId,
          pointsService.POINTS_SOURCES.daily_login,
          undefined,
          undefined,
          'Daily login bonus'
        );

        // 更新学习连续天数
        await this.updateLearningStreak(userId);
      }

    } catch (error) {
      console.error('Error handling daily login:', error);
    }
  }

  /**
   * 更新学习连续天数
   */
  private async updateLearningStreak(userId: string): Promise<void> {
    try {
      const stats = await pointsService.getUserStats(userId);
      if (!stats) return;

      const today = new Date();
      const lastStudyDate = stats.last_study_date ? new Date(stats.last_study_date) : null;
      
      let newStreakDays = stats.current_streak;
      
      if (lastStudyDate) {
        const daysDiff = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // 连续学习，增加连续天数
          newStreakDays = stats.current_streak + 1;
        } else if (daysDiff > 1) {
          // 中断了，重置为1
          newStreakDays = 1;
        }
        // daysDiff === 0 表示今天已经学习过，保持当前连续天数
      } else {
        // 第一次学习
        newStreakDays = 1;
      }

      // 更新连续天数
      await supabase
        .from('user_learning_stats')
        .update({
          current_streak: newStreakDays,
          max_streak: Math.max(newStreakDays, stats.max_streak),
          last_study_date: today.toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // 检查连续学习成就
      if (newStreakDays > stats.current_streak) {
        await achievementService.checkAchievements(userId, {
          streak_days: newStreakDays
        });

        // 连续学习奖励
        if (newStreakDays % 7 === 0) { // 每7天奖励一次
          await pointsService.awardPoints(
            userId,
            pointsService.POINTS_SOURCES.streak,
            newStreakDays * 2, // 连续天数 * 2 的积分
            undefined,
            `${newStreakDays} days learning streak!`
          );
        }
      }

    } catch (error) {
      console.error('Error updating learning streak:', error);
    }
  }

  /**
   * 处理好友添加事件
   */
  async handleFriendAdded(userId: string, friendId: string): Promise<void> {
    try {
      // 检查好友数量相关成就
      const friends = await socialService.getFriends(userId);
      
      await achievementService.checkAchievements(userId, {
        friends: friends.length
      });

    } catch (error) {
      console.error('Error handling friend added:', error);
    }
  }

  /**
   * 处理帖子发布事件
   */
  async handlePostCreated(userId: string, postId: string): Promise<void> {
    try {
      // 获取用户发帖数量
      const { data: posts } = await supabase
        .from('community_posts')
        .select('id')
        .eq('user_id', userId);

      const postCount = posts?.length || 0;

      // 检查发帖相关成就
      await achievementService.checkAchievements(userId, {
        posts: postCount
      });

    } catch (error) {
      console.error('Error handling post created:', error);
    }
  }

  /**
   * 获取用户社交活动摘要
   */
  async getUserSocialSummary(userId: string): Promise<{
    total_points: number;
    level: number;
    current_streak: number;
    friends_count: number;
    posts_count: number;
    achievements_count: number;
  }> {
    try {
      const [stats, achievements, friends, posts] = await Promise.all([
        pointsService.getUserStats(userId),
        achievementService.getUnlockedAchievements(userId),
        socialService.getFriends(userId),
        socialService.getPosts(100, 0, undefined, userId)
      ]);

      return {
        total_points: stats?.total_points || 0,
        level: stats?.level || 1,
        current_streak: stats?.current_streak || 0,
        friends_count: friends.length,
        posts_count: posts.length,
        achievements_count: achievements.length
      };

    } catch (error) {
      console.error('Error getting user social summary:', error);
      return {
        total_points: 0,
        level: 1,
        current_streak: 0,
        friends_count: 0,
        posts_count: 0,
        achievements_count: 0
      };
    }
  }

  /**
   * 批量更新用户统计（用于数据同步）
   */
  async syncUserStats(userId: string): Promise<void> {
    try {
      // 获取所有相关数据
      const [
        conversationCount,
        vocabularyCount,
        gameSessionCount,
        friendsCount,
        postsCount,
        achievementsCount
      ] = await Promise.all([
        this.getConversationCount(userId),
        this.getVocabularyCount(userId),
        this.getGameSessionCount(userId),
        this.getFriendsCount(userId),
        this.getPostsCount(userId),
        this.getAchievementsCount(userId)
      ]);

      // 批量检查成就
      await achievementService.checkAchievements(userId, {
        conversations: conversationCount,
        words_learned: vocabularyCount,
        quiz_sessions: gameSessionCount.quiz,
        matching_sessions: gameSessionCount.matching,
        friends: friendsCount,
        posts: postsCount
      });

    } catch (error) {
      console.error('Error syncing user stats:', error);
    }
  }

  // 辅助方法
  private async getConversationCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('conversation_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  }

  private async getVocabularyCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  }

  private async getGameSessionCount(userId: string): Promise<{ quiz: number; matching: number }> {
    const [quizCount, matchingCount] = await Promise.all([
      supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('game_type', 'quiz'),
      supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('game_type', 'matching')
    ]);

    return {
      quiz: quizCount.count || 0,
      matching: matchingCount.count || 0
    };
  }

  private async getFriendsCount(userId: string): Promise<number> {
    const friends = await socialService.getFriends(userId);
    return friends.length;
  }

  private async getPostsCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  }

  private async getAchievementsCount(userId: string): Promise<number> {
    const achievements = await achievementService.getUnlockedAchievements(userId);
    return achievements.length;
  }
}

export const socialIntegrationService = new SocialIntegrationService();