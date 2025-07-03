import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { realtimeService, type FriendActivity, type LeaderboardUpdate, type RealtimeSubscription } from '../services/realtimeService';

export interface UseRealtimeReturn {
  // 好友动态
  friendActivities: FriendActivity[];
  clearFriendActivities: () => void;
  
  // 排行榜更新
  leaderboardUpdates: LeaderboardUpdate[];
  clearLeaderboardUpdates: () => void;
  
  // 连接状态
  connectionStatus: string;
  reconnect: () => void;
  
  // 订阅管理
  isSubscribed: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
}

/**
 * 实时功能Hook
 * 管理Supabase实时订阅
 */
export function useRealtime(): UseRealtimeReturn {
  const { user } = useAuth();
  const [friendActivities, setFriendActivities] = useState<FriendActivity[]>([]);
  const [leaderboardUpdates, setLeaderboardUpdates] = useState<LeaderboardUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const subscriptionsRef = useRef<RealtimeSubscription[]>([]);
  const statusIntervalRef = useRef<NodeJS.Timeout>();

  // 监听好友动态
  const handleFriendActivity = useCallback((activity: FriendActivity) => {
    setFriendActivities(prev => [activity, ...prev.slice(0, 49)]); // 保留最新50条
  }, []);

  // 监听排行榜更新
  const handleLeaderboardUpdate = useCallback((update: LeaderboardUpdate) => {
    setLeaderboardUpdates(prev => [update, ...prev.slice(0, 19)]); // 保留最新20条
  }, []);

  // 监听新帖子
  const handleNewPost = useCallback((post: any) => {
    // 触发自定义事件让社区组件更新
    const event = new CustomEvent('newCommunityPost', {
      detail: { post }
    });
    window.dispatchEvent(event);
  }, []);

  // 监听帖子更新
  const handlePostUpdate = useCallback((post: any) => {
    const event = new CustomEvent('updateCommunityPost', {
      detail: { post }
    });
    window.dispatchEvent(event);
  }, []);

  // 监听好友请求
  const handleFriendRequest = useCallback((friendship: any) => {
    const event = new CustomEvent('newFriendRequest', {
      detail: { friendship }
    });
    window.dispatchEvent(event);
  }, []);

  // 监听好友接受
  const handleFriendAccepted = useCallback((friendship: any) => {
    const event = new CustomEvent('friendRequestAccepted', {
      detail: { friendship }
    });
    window.dispatchEvent(event);
  }, []);

  // 错误处理
  const handleError = useCallback((error: any) => {
    console.error('Realtime subscription error:', error);
    setConnectionStatus('error');
  }, []);

  // 订阅实时更新
  const subscribe = useCallback(() => {
    if (!user || isSubscribed) return;

    try {
      const subscriptions: RealtimeSubscription[] = [];

      // 订阅好友动态
      const friendActivitySub = realtimeService.subscribeToFriendActivities(
        user.id,
        handleFriendActivity,
        handleError
      );
      subscriptions.push(friendActivitySub);

      // 订阅排行榜更新
      const leaderboardSub = realtimeService.subscribeToLeaderboardUpdates(
        handleLeaderboardUpdate,
        handleError
      );
      subscriptions.push(leaderboardSub);

      // 订阅社区帖子
      const communitySub = realtimeService.subscribeToCommunityPosts(
        handleNewPost,
        handlePostUpdate,
        handleError
      );
      subscriptions.push(communitySub);

      // 订阅好友状态
      const friendStatusSub = realtimeService.subscribeToFriendStatus(
        user.id,
        handleFriendRequest,
        handleFriendAccepted,
        handleError
      );
      subscriptions.push(friendStatusSub);

      subscriptionsRef.current = subscriptions;
      setIsSubscribed(true);
      setConnectionStatus('connected');

      console.log('Real-time subscriptions established');
    } catch (error) {
      console.error('Error subscribing to real-time updates:', error);
      handleError(error);
    }
  }, [user, isSubscribed, handleFriendActivity, handleLeaderboardUpdate, handleNewPost, handlePostUpdate, handleFriendRequest, handleFriendAccepted, handleError]);

  // 取消订阅
  const unsubscribe = useCallback(() => {
    subscriptionsRef.current.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    subscriptionsRef.current = [];
    setIsSubscribed(false);
    setConnectionStatus('disconnected');
    console.log('Real-time subscriptions canceled');
  }, []);

  // 重连
  const reconnect = useCallback(() => {
    unsubscribe();
    setTimeout(() => {
      realtimeService.reconnect();
      setTimeout(subscribe, 1000);
    }, 1000);
  }, [unsubscribe, subscribe]);

  // 清空数据
  const clearFriendActivities = useCallback(() => {
    setFriendActivities([]);
  }, []);

  const clearLeaderboardUpdates = useCallback(() => {
    setLeaderboardUpdates([]);
  }, []);

  // 监控连接状态
  useEffect(() => {
    if (isSubscribed) {
      statusIntervalRef.current = setInterval(() => {
        const status = realtimeService.getConnectionStatus();
        setConnectionStatus(status);
        
        // 如果连接断开，尝试重连
        if (status === 'disconnected' && isSubscribed) {
          console.log('Connection lost, attempting to reconnect...');
          reconnect();
        }
      }, 5000);

      return () => {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
        }
      };
    }
  }, [isSubscribed, reconnect]);

  // 用户登录时自动订阅
  useEffect(() => {
    if (user && !isSubscribed) {
      subscribe();
    } else if (!user && isSubscribed) {
      unsubscribe();
    }

    // 清理函数
    return () => {
      if (isSubscribed) {
        unsubscribe();
      }
    };
  }, [user]); // 只依赖user，避免无限循环

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      unsubscribe();
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  return {
    friendActivities,
    clearFriendActivities,
    leaderboardUpdates,
    clearLeaderboardUpdates,
    connectionStatus,
    reconnect,
    isSubscribed,
    subscribe,
    unsubscribe
  };
}