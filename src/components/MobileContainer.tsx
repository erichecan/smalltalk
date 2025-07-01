import React from 'react';
import { cn } from '../utils/cn';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  fullHeight?: boolean;
  centered?: boolean;
}

/**
 * 移动端优化的容器组件
 * 替代MUI Container，确保移动端不会出现宽度溢出问题
 */
const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  noPadding = false,
  fullHeight = false,
  centered = false
}) => {
  return (
    <div
      className={cn(
        // 基础移动端容器样式
        'mobile-container prevent-overflow',
        // 可选的内边距
        !noPadding && 'safe-padding',
        // 可选的全高度
        fullHeight && 'min-h-screen',
        // 可选的居中
        centered && 'flex flex-col items-center justify-center',
        // 自定义类名
        className
      )}
    >
      {children}
    </div>
  );
};

export default MobileContainer;