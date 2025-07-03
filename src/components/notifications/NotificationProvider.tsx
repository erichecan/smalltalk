import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import AchievementNotification from './AchievementNotification';
import { useNotifications, type UseNotificationsReturn } from '../../hooks/useNotifications';

interface NotificationContextType extends UseNotificationsReturn {}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * 通知系统提供者
 * 提供全局通知管理和显示组件
 */
const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const notificationHook = useNotifications();
  
  const {
    achievementNotifications,
    hideAchievementNotification
  } = notificationHook;

  return (
    <NotificationContext.Provider value={notificationHook}>
      {children}
      
      {/* 成就解锁通知显示区域 */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {achievementNotifications.map((notification) => (
          <Box
            key={notification.id}
            sx={{
              mb: 2,
              pointerEvents: 'auto'
            }}
          >
            <AchievementNotification
              achievement={notification.achievement}
              isVisible={true}
              onClose={() => hideAchievementNotification(notification.id)}
              duration={5000}
            />
          </Box>
        ))}
      </Box>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;