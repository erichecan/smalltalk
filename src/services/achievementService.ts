import { supabase } from './supabase';
import { pointsService } from './pointsService';

// 成就系统接口定义
export interface Achievement {
  id: string;
  category: 'learning' | 'social' | 'streak' | 'challenge';
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points_reward: number;
  requirements: Record<string, any>;
  rewards?: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress_value: number;
  target_value: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  progress_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
  achievement?: Achievement;
}

export interface AchievementProgress {
  achievement_id: string;
  progress_value: number;
  target_value: number;
  percentage: number;
  is_completed: boolean;
}

// 成就检查条件类型
export interface AchievementCheckData {
  conversations?: number;
  words_learned?: number;
  quiz_sessions?: number;
  matching_sessions?: number;
  streak_days?: number;
  total_points?: number;
  friends?: number;
  posts?: number;
  mastered_words?: number;
  perfect_scores?: number;
}

class AchievementService {
  /**
   * 获取所有可用成就
   */
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  /**
   * 获取用户成就进度
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  /**
   * 获取用户已解锁的成就
   */
  async getUnlockedAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .eq('is_unlocked', true)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unlocked achievements:', error);
      throw error;
    }
  }

  /**
   * 初始化用户成就记录
   */
  async initializeUserAchievements(userId: string): Promise<void> {
    try {
      // 获取所有活跃成就
      const achievements = await this.getAllAchievements();
      
      // 检查用户是否已有成就记录
      const { data: existingRecords } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      const existingAchievementIds = new Set(existingRecords?.map(r => r.achievement_id) || []);

      // 为没有记录的成就创建初始记录
      const newRecords = achievements
        .filter(achievement => !existingAchievementIds.has(achievement.id))
        .map(achievement => ({
          user_id: userId,
          achievement_id: achievement.id,
          progress_value: 0,
          target_value: this.getTargetValue(achievement.requirements),
          is_unlocked: false,
          progress_data: {}
        }));

      if (newRecords.length > 0) {
        const { error } = await supabase
          .from('user_achievements')
          .insert(newRecords);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error initializing user achievements:', error);
      throw error;
    }
  }

  /**
   * 检查并更新成就进度
   */
  async checkAchievements(userId: string, checkData: AchievementCheckData): Promise<UserAchievement[]> {
    try {
      // 确保用户有成就记录
      await this.initializeUserAchievements(userId);

      // 获取用户当前成就状态
      const userAchievements = await this.getUserAchievements(userId);
      const newlyUnlocked: UserAchievement[] = [];

      for (const userAchievement of userAchievements) {
        if (userAchievement.is_unlocked) continue;

        const achievement = userAchievement.achievement;
        if (!achievement) continue;

        // 计算新的进度值
        const newProgress = this.calculateProgress(achievement.requirements, checkData);
        const targetValue = userAchievement.target_value;

        // 如果进度有变化，更新记录
        if (newProgress !== userAchievement.progress_value) {
          const isCompleted = newProgress >= targetValue;

          const updateData: Partial<UserAchievement> = {
            progress_value: newProgress,
            updated_at: new Date().toISOString()
          };

          // 如果成就完成，标记为已解锁
          if (isCompleted && !userAchievement.is_unlocked) {
            updateData.is_unlocked = true;
            updateData.unlocked_at = new Date().toISOString();
            newlyUnlocked.push({
              ...userAchievement,
              ...updateData
            } as UserAchievement);
          }

          // 更新数据库记录
          const { error } = await supabase
            .from('user_achievements')
            .update(updateData)
            .eq('id', userAchievement.id);

          if (error) throw error;

          // 如果成就解锁，发放奖励
          if (isCompleted && !userAchievement.is_unlocked) {
            await this.grantAchievementRewards(userId, achievement);
            
            // 触发成就解锁动画事件
            this.triggerAchievementUnlockEvent(achievement);
          }
        }
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  /**
   * 发放成就奖励
   */
  private async grantAchievementRewards(userId: string, achievement: Achievement): Promise<void> {
    try {
      // 发放积分奖励
      if (achievement.points_reward > 0) {
        await pointsService.awardPoints(
          userId,
          'ACHIEVEMENT' as any,
          achievement.points_reward,
          achievement.id,
          `Achievement unlocked: ${achievement.name}`
        );
      }

      // 创建解锁通知
      await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: 'achievement',
          title: `🏆 Achievement Unlocked!`,
          message: `You've earned the "${achievement.name}" achievement!`,
          data: {
            achievement_id: achievement.id,
            achievement_name: achievement.name,
            achievement_icon: achievement.icon,
            points_reward: achievement.points_reward
          }
        }]);

      // 广播成就解锁活动 (延迟导入避免循环依赖)
      try {
        const { realtimeService } = await import('./realtimeService');
        await realtimeService.broadcastFriendActivity(userId, 'achievement_unlock', {
          achievement_id: achievement.id,
          achievement_name: achievement.name,
          achievement_icon: achievement.icon,
          points_reward: achievement.points_reward,
          rarity: achievement.rarity
        });
      } catch (error) {
        console.error('Error broadcasting achievement unlock activity:', error);
      }

      // 处理其他奖励（如果有）
      if (achievement.rewards) {
        await this.processAdditionalRewards(userId, achievement.rewards);
      }
    } catch (error) {
      console.error('Error granting achievement rewards:', error);
    }
  }

  /**
   * 处理额外奖励
   */
  private async processAdditionalRewards(userId: string, rewards: Record<string, any>): Promise<void> {
    try {
      // 这里可以处理其他类型的奖励，比如解锁新主题、头像等
      if (rewards.unlock_topic) {
        // TODO: 解锁新的学习主题
      }
      
      if (rewards.unlock_avatar) {
        // TODO: 解锁新的头像
      }
      
      if (rewards.unlock_badge) {
        // TODO: 解锁新的徽章
      }
    } catch (error) {
      console.error('Error processing additional rewards:', error);
    }
  }

  /**
   * 计算成就进度
   */
  private calculateProgress(requirements: Record<string, any>, checkData: AchievementCheckData): number {
    // 根据成就要求的类型计算进度
    if (requirements.conversations && checkData.conversations !== undefined) {
      return Math.min(checkData.conversations, requirements.conversations);
    }
    
    if (requirements.words_learned && checkData.words_learned !== undefined) {
      return Math.min(checkData.words_learned, requirements.words_learned);
    }
    
    if (requirements.quiz_sessions && checkData.quiz_sessions !== undefined) {
      return Math.min(checkData.quiz_sessions, requirements.quiz_sessions);
    }
    
    if (requirements.matching_sessions && checkData.matching_sessions !== undefined) {
      return Math.min(checkData.matching_sessions, requirements.matching_sessions);
    }
    
    if (requirements.streak_days && checkData.streak_days !== undefined) {
      return Math.min(checkData.streak_days, requirements.streak_days);
    }
    
    if (requirements.total_points && checkData.total_points !== undefined) {
      return Math.min(checkData.total_points, requirements.total_points);
    }
    
    if (requirements.friends && checkData.friends !== undefined) {
      return Math.min(checkData.friends, requirements.friends);
    }
    
    if (requirements.posts && checkData.posts !== undefined) {
      return Math.min(checkData.posts, requirements.posts);
    }
    
    if (requirements.mastered_words && checkData.mastered_words !== undefined) {
      return Math.min(checkData.mastered_words, requirements.mastered_words);
    }
    
    if (requirements.perfect_scores && checkData.perfect_scores !== undefined) {
      return Math.min(checkData.perfect_scores, requirements.perfect_scores);
    }

    return 0;
  }

  /**
   * 获取成就目标值
   */
  private getTargetValue(requirements: Record<string, any>): number {
    // 返回要求中的数值作为目标值
    const values = Object.values(requirements).filter(v => typeof v === 'number');
    return values.length > 0 ? Math.max(...values) : 1;
  }

  /**
   * 获取成就进度摘要
   */
  async getAchievementSummary(userId: string): Promise<{
    total: number;
    unlocked: number;
    in_progress: number;
    locked: number;
    total_points_earned: number;
  }> {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      
      const unlocked = userAchievements.filter(ua => ua.is_unlocked);
      const in_progress = userAchievements.filter(ua => !ua.is_unlocked && ua.progress_value > 0);
      const locked = userAchievements.filter(ua => !ua.is_unlocked && ua.progress_value === 0);
      
      const total_points_earned = unlocked.reduce((sum, ua) => {
        return sum + (ua.achievement?.points_reward || 0);
      }, 0);

      return {
        total: userAchievements.length,
        unlocked: unlocked.length,
        in_progress: in_progress.length,
        locked: locked.length,
        total_points_earned
      };
    } catch (error) {
      console.error('Error getting achievement summary:', error);
      return {
        total: 0,
        unlocked: 0,
        in_progress: 0,
        locked: 0,
        total_points_earned: 0
      };
    }
  }

  /**
   * 快速成就检查（基于用户统计数据）
   */
  async quickAchievementCheck(userId: string): Promise<UserAchievement[]> {
    try {
      // 获取用户学习统计数据
      const userStats = await pointsService.getUserStats(userId);
      if (!userStats) return [];

      // 构建检查数据
      const checkData: AchievementCheckData = {
        total_points: userStats.total_points,
        friends: userStats.friends_count,
        // 这里需要从其他地方获取更多数据
        // conversations: ?, 
        // words_learned: ?,
        // quiz_sessions: ?,
        // matching_sessions: ?,
        // streak_days: userStats.current_streak,
      };

      return await this.checkAchievements(userId, checkData);
    } catch (error) {
      console.error('Error in quick achievement check:', error);
      return [];
    }
  }

  /**
   * 手动解锁成就（管理员功能）
   */
  async manualUnlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      // 获取成就信息
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();

      if (achievementError || !achievement) {
        throw new Error('Achievement not found');
      }

      // 更新用户成就记录
      const { error: updateError } = await supabase
        .from('user_achievements')
        .update({
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          progress_value: this.getTargetValue(achievement.requirements),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId);

      if (updateError) throw updateError;

      // 发放奖励
      await this.grantAchievementRewards(userId, achievement);

      return true;
    } catch (error) {
      console.error('Error manually unlocking achievement:', error);
      return false;
    }
  }

  /**
   * 触发成就解锁事件（用于动画通知）
   */
  private triggerAchievementUnlockEvent(achievement: Achievement): void {
    try {
      // 创建自定义事件
      const event = new CustomEvent('achievementUnlocked', {
        detail: { achievement }
      });
      
      // 分发事件
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error triggering achievement unlock event:', error);
    }
  }
}

export const achievementService = new AchievementService();