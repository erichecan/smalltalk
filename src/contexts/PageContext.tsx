import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface PageState {
  page: string;
  subPage?: string;
  exerciseType?: string;
}

interface InternalNavState {
  isInternalNav: boolean;
  history: PageState[];
}

interface PageContextType {
  pageState: PageState;
  setPageState: (state: PageState) => void;
  goBack: () => boolean;
  canGoBack: () => boolean;
  pushInternalState: (state: PageState) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
};

interface PageProviderProps {
  children: ReactNode;
}

export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [pageState, setPageState] = useState<PageState>({ page: '/' });
  const [internalNav, setInternalNav] = useState<InternalNavState>({ 
    isInternalNav: false, 
    history: [] 
  });

  // 普通的页面状态设置（不影响导航历史）
  const updatePageState = (state: PageState) => {
    setPageState(state);
  };

  // 推入内部导航状态（用于页面内的子状态导航）
  const pushInternalState = (state: PageState) => {
    setInternalNav(prev => ({
      isInternalNav: true,
      history: [...prev.history, pageState] // 保存当前状态
    }));
    setPageState(state);
  };

  const goBack = () => {
    if (internalNav.isInternalNav && internalNav.history.length > 0) {
      // 内部导航返回
      const previousState = internalNav.history[internalNav.history.length - 1];
      const newHistory = internalNav.history.slice(0, -1);
      
      setInternalNav({
        isInternalNav: newHistory.length > 0,
        history: newHistory
      });
      
      setPageState(previousState);
      
      // 触发自定义事件，让组件可以响应状态变化
      window.dispatchEvent(new CustomEvent('pageStateBack', { 
        detail: previousState 
      }));
      
      return true; // 表示处理了返回
    }
    return false; // 表示没有处理，应该使用浏览器历史
  };

  const canGoBack = () => {
    return internalNav.isInternalNav && internalNav.history.length > 0;
  };

  return (
    <PageContext.Provider value={{
      pageState,
      setPageState: updatePageState,
      goBack,
      canGoBack,
      pushInternalState
    }}>
      {children}
    </PageContext.Provider>
  );
}; 