import { supabase } from './supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/realtime-js';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface FriendActivity {
  id: string;
  user_id: string;
  activity_type: 'level_up' | 'achievement_unlock' | 'points_earned' | 'new_post' | 'friend_added';
  activity_data: Record<string, any>;
  created_at: string;
  user_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface LeaderboardUpdate {
  user_id: string;
  old_rank?: number;
  new_rank: number;
  total_points: number;
  level: number;
  display_name?: string;
}

class RealtimeService {
  private activeChannels: Map<string, RealtimeChannel> = new Map();

  /**
   * 订阅好友动态更新
   */
  subscribeToFriendActivities(
    userId: string,
    onActivity: (activity: FriendActivity) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = `friend-activities-${userId}`;
    
    // 移除已存在的订阅
    this.unsubscribeFromChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_activities',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<FriendActivity>) => {
          if (payload.new) {
            onActivity(payload.new as FriendActivity);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // 处理实时通知更新
          if (payload.new) {
            this.handleNotificationUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to friend activities for user ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to friend activities:', status);
          onError?.(status);
        }
      });

    this.activeChannels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    };
  }

  /**
   * 订阅排行榜更新
   */
  subscribeToLeaderboardUpdates(
    onLeaderboardUpdate: (update: LeaderboardUpdate) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = 'leaderboard-updates';
    
    // 移除已存在的订阅
    this.unsubscribeFromChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_learning_stats'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new && payload.old) {
            this.handleLeaderboardChange(payload.new, payload.old, onLeaderboardUpdate);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_learning_stats'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new) {
            this.handleNewUserStats(payload.new, onLeaderboardUpdate);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to leaderboard updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to leaderboard updates:', status);
          onError?.(status);
        }
      });

    this.activeChannels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    };
  }

  /**
   * 订阅社区帖子更新
   */
  subscribeToCommunityPosts(
    onNewPost: (post: any) => void,
    onPostUpdate: (post: any) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = 'community-posts';
    
    // 移除已存在的订阅
    this.unsubscribeFromChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
          filter: 'is_public=eq.true'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new) {
            onNewPost(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_posts',
          filter: 'is_public=eq.true'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new) {
            onPostUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to community posts');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to community posts:', status);
          onError?.(status);
        }
      });

    this.activeChannels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    };
  }

  /**
   * 订阅好友状态更新
   */
  subscribeToFriendStatus(
    userId: string,
    onFriendRequest: (friendship: any) => void,
    onFriendAccepted: (friendship: any) => void,
    onError?: (error: any) => void
  ): RealtimeSubscription {
    const channelName = `friend-status-${userId}`;
    
    // 移除已存在的订阅
    this.unsubscribeFromChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new && payload.new.status === 'pending') {
            onFriendRequest(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new && payload.new.status === 'accepted') {
            onFriendAccepted(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to friend status for user ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to friend status:', status);
          onError?.(status);
        }
      });

    this.activeChannels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromChannel(channelName)
    };
  }

  /**
   * 发送好友活动更新
   */
  async broadcastFriendActivity(
    userId: string,
    activityType: FriendActivity['activity_type'],
    activityData: Record<string, any>
  ): Promise<void> {
    try {
      // 获取用户的好友列表
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (!friendships || friendships.length === 0) return;

      // 为每个好友创建活动记录
      const friendIds = friendships.map(f => 
        f.requester_id === userId ? f.addressee_id : f.requester_id
      );

      const activities = friendIds.map(friendId => ({
        user_id: friendId,
        friend_user_id: userId,
        activity_type: activityType,
        activity_data: activityData,
        created_at: new Date().toISOString()
      }));

      // 批量插入好友活动记录
      const { error } = await supabase
        .from('friend_activities')
        .insert(activities);

      if (error) {
        console.error('Error broadcasting friend activity:', error);
      }
    } catch (error) {
      console.error('Error in broadcastFriendActivity:', error);
    }
  }

  /**
   * 处理排行榜变化
   */
  private async handleLeaderboardChange(
    newData: any,
    oldData: any,
    callback: (update: LeaderboardUpdate) => void
  ): Promise<void> {
    // 如果积分有显著变化，触发排行榜更新
    const pointsDiff = (newData.total_points || 0) - (oldData.total_points || 0);
    const levelChange = (newData.level || 1) - (oldData.level || 1);

    if (pointsDiff >= 10 || levelChange > 0) {
      try {
        // 获取用户显示名称
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', newData.user_id)
          .single();

        const update: LeaderboardUpdate = {
          user_id: newData.user_id,
          new_rank: 0, // 需要计算实际排名
          total_points: newData.total_points,
          level: newData.level,
          display_name: profile?.display_name
        };

        callback(update);
      } catch (error) {
        console.error('Error handling leaderboard change:', error);
      }
    }
  }

  /**
   * 处理新用户统计
   */
  private async handleNewUserStats(
    newData: any,
    callback: (update: LeaderboardUpdate) => void
  ): Promise<void> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('user_id', newData.user_id)
        .single();

      const update: LeaderboardUpdate = {
        user_id: newData.user_id,
        new_rank: 0, // 新用户通常在排行榜末尾
        total_points: newData.total_points || 0,
        level: newData.level || 1,
        display_name: profile?.display_name
      };

      callback(update);
    } catch (error) {
      console.error('Error handling new user stats:', error);
    }
  }

  /**
   * 处理通知更新
   */
  private handleNotificationUpdate(notification: any): void {
    // 触发自定义事件通知UI更新
    const event = new CustomEvent('newNotification', {
      detail: { notification }
    });
    window.dispatchEvent(event);
  }

  /**
   * 取消订阅指定频道
   */
  private unsubscribeFromChannel(channelName: string): void {
    const channel = this.activeChannels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.activeChannels.delete(channelName);
      console.log(`Unsubscribed from channel: ${channelName}`);
    }
  }

  /**
   * 取消所有订阅
   */
  unsubscribeAll(): void {
    this.activeChannels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from channel: ${channelName}`);
    });
    this.activeChannels.clear();
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): string {
    return supabase.getChannels().length > 0 ? 'CONNECTED' : 'DISCONNECTED';
  }

  /**
   * 重新连接
   */
  reconnect(): void {
    // 先断开所有连接
    this.unsubscribeAll();
    // 重新订阅所有频道
    this.activeChannels.forEach((channel, name) => {
      channel.subscribe();
    });
  }
}

export const realtimeService = new RealtimeService();