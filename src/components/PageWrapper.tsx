import React from 'react';
import { cn } from '../utils/cn';
import MobileContainer from './MobileContainer';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /**
   * 页面类型，影响布局和样式
   */
  variant?: 'default' | 'auth' | 'fullscreen' | 'dialog';
  /**
   * 是否需要安全区域内边距
   */
  safeArea?: boolean;
  /**
   * 背景色主题
   */
  background?: 'default' | 'primary' | 'white';
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
}

/**
 * 页面包装组件
 * 为所有页面提供一致的移动端优化布局
 */
const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className,
  variant = 'default',
  safeArea = true,
  background = 'default',
  loading = false
}) => {
  const getBackgroundClass = () => {
    switch (background) {
      case 'primary':
        return 'bg-primary-50';
      case 'white':
        return 'bg-white';
      default:
        return 'bg-primary-50';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'auth':
        return 'min-h-screen flex flex-col justify-center items-center py-8';
      case 'fullscreen':
        return 'min-h-screen flex flex-col';
      case 'dialog':
        return 'min-h-screen flex flex-col justify-center items-center p-4';
      default:
        return 'min-h-screen flex flex-col';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        'min-h-screen flex flex-col justify-center items-center',
        getBackgroundClass(),
        'mobile-container prevent-overflow'
      )}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-primary-700 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // 基础移动端容器
        'mobile-container prevent-overflow',
        // 背景色
        getBackgroundClass(),
        // 变体样式
        getVariantClasses(),
        // 触摸优化
        'touch-optimized',
        // 自定义类名
        className
      )}
    >
      <MobileContainer 
        noPadding={!safeArea}
        className={cn(
          'flex-1',
          variant === 'auth' && 'max-w-sm w-full',
          variant === 'dialog' && 'max-w-md w-full'
        )}
      >
        {children}
      </MobileContainer>
    </div>
  );
};

export default PageWrapper;