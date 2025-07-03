import { useState, useEffect, useCallback, useRef } from 'react';
import { socialService } from '../services/socialService';
import { achievementService, type Achievement } from '../services/achievementService';
import { useAuth } from '../contexts/AuthContext';

export interface AchievementUnlockNotification {
  id: string;
  achievement: Achievement;
  timestamp: number;
}

export interface UseNotificationsReturn {
  // 成就解锁通知
  achievementNotifications: AchievementUnlockNotification[];
  showAchievementNotification: (achievement: Achievement) => void;
  hideAchievementNotification: (id: string) => void;
  
  // 系统通知
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
}

/**
 * 通知系统Hook
 * 管理成就解锁动画和系统通知
 */
export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [achievementNotifications, setAchievementNotifications] = useState<AchievementUnlockNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationQueue = useRef<Achievement[]>([]);
  const isProcessing = useRef(false);

  // 刷新系统通知
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const notifications = await socialService.getNotifications(user.id, 50);
      const unread = notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [user]);

  // 处理成就解锁通知队列
  const processNotificationQueue = useCallback(async () => {
    if (isProcessing.current || notificationQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    const achievement = notificationQueue.current.shift()!;
    
    const notification: AchievementUnlockNotification = {
      id: `achievement-${achievement.id}-${Date.now()}`,
      achievement,
      timestamp: Date.now()
    };

    setAchievementNotifications(prev => [...prev, notification]);

    // 5秒后自动移除通知
    setTimeout(() => {
      setAchievementNotifications(prev => 
        prev.filter(n => n.id !== notification.id)
      );
    }, 5000);

    // 处理下一个通知（延迟1秒避免重叠）
    setTimeout(() => {
      isProcessing.current = false;
      processNotificationQueue();
    }, 1000);
  }, []);

  // 显示成就解锁通知
  const showAchievementNotification = useCallback((achievement: Achievement) => {
    notificationQueue.current.push(achievement);
    processNotificationQueue();
  }, [processNotificationQueue]);

  // 隐藏成就解锁通知
  const hideAchievementNotification = useCallback((id: string) => {
    setAchievementNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // 监听成就解锁事件
  useEffect(() => {
    if (!user) return;

    const handleAchievementUnlocked = (event: CustomEvent) => {
      const { achievement } = event.detail;
      showAchievementNotification(achievement);
    };

    // 监听自定义事件
    window.addEventListener('achievementUnlocked', handleAchievementUnlocked as EventListener);
    
    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlocked as EventListener);
    };
  }, [user, showAchievementNotification]);

  // 定期刷新通知
  useEffect(() => {
    if (!user) return;

    refreshNotifications();
    
    // 每分钟刷新一次
    const interval = setInterval(refreshNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  return {
    achievementNotifications,
    showAchievementNotification,
    hideAchievementNotification,
    unreadCount,
    refreshNotifications
  };
}