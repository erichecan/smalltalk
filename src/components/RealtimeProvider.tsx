import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRealtime, type UseRealtimeReturn } from '../hooks/useRealtime';

interface RealtimeContextType extends UseRealtimeReturn {}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtimeContext = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: ReactNode;
}

/**
 * 实时功能提供者
 * 提供全局实时数据管理
 */
const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
  const realtimeHook = useRealtime();

  // 可以在这里添加全局实时事件监听
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !realtimeHook.isSubscribed) {
        // 页面重新变为可见时，重新订阅
        realtimeHook.subscribe();
      } else if (document.visibilityState === 'hidden' && realtimeHook.isSubscribed) {
        // 页面隐藏时，可以选择保持连接或断开连接
        // 这里选择保持连接以接收后台通知
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [realtimeHook.isSubscribed, realtimeHook.subscribe]);

  return (
    <RealtimeContext.Provider value={realtimeHook}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default RealtimeProvider;