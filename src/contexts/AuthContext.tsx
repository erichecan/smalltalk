import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { OAUTH_CONFIG } from '../config/oauth';

// React hooks健康检查 - 2025-01-30 16:40:22
if (typeof React === 'undefined' || !React.useState) {
  console.error('React or React.useState is not available');
  throw new Error('React hooks are not properly loaded');
}

// 用户类型
interface ExtendedUser {
  id: string;
  email: string | null;
  name?: string | null;
  avatar?: string | null;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // useState健康检查 - 2025-01-30 16:40:22
  try {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    
    // 确认useState正常工作
    if (typeof setUser !== 'function') {
      throw new Error('useState hook did not return proper setter function');
    }

    // 监听 Supabase 认证状态
    useEffect(() => {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 认证状态变化:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            console.log('✅ 用户已登录:', session.user.email);
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email || '',
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 用户已登出');
          setUser(null);
        }
      });

      // 初始化时同步一次
      const initializeAuth = async () => {
        try {
          console.log('🔍 初始化认证状态...');
          const { data: { user: currentUser }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('❌ 获取用户信息失败:', error);
            return;
          }
          
          if (currentUser) {
            console.log('✅ 当前用户:', currentUser.email);
            setUser({
              id: currentUser.id,
              email: currentUser.email || '',
              name: currentUser.user_metadata?.name || currentUser.email || '',
            });
          } else {
            console.log('ℹ️ 没有当前用户');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ 初始化认证状态失败:', error);
        }
      };

      initializeAuth();
      return () => {
        listener?.subscription.unsubscribe();
      };
    }, []);

    const login = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    };

    const register = async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    };

    const logout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    };

    const googleLogin = async () => {
      // Google OAuth 登录 - 使用Supabase标准流程，根据官方文档修复 - 2025-01-14 00:45:00
      try {
        console.log('🚀 启动Google OAuth登录...');
        
        // 根据Supabase官方文档，使用最简单的OAuth调用
        // 不需要指定redirectTo，让Supabase处理完整的重定向流程
        const { error } = await supabase.auth.signInWithOAuth({ 
          provider: 'google',
          options: {
            queryParams: {
              access_type: OAUTH_CONFIG.GOOGLE.ACCESS_TYPE,
              prompt: OAUTH_CONFIG.GOOGLE.PROMPT,
            }
          }
        });
        
        if (error) {
          console.error('❌ Supabase Google OAuth error:', error);
          throw error;
        }
        
        console.log('✅ Supabase Google OAuth initiated successfully');
        console.log('ℹ️ 用户将被重定向到Google登录页面，然后回到Supabase回调URL');
        
      } catch (error) {
        console.error('❌ Google OAuth login failed:', error);
        throw error;
      }
    };

    const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
      const updates: Record<string, string> = {};
      if (data.displayName) updates.full_name = data.displayName;
      if (data.photoURL) updates.avatar_url = data.photoURL;
      const { error } = await supabase.auth.updateUser({ data: updates });
      if (error) throw error;
      // 本地同步
      setUser((prev) => prev ? { ...prev, name: data.displayName ?? prev.name, avatar: data.photoURL ?? prev.avatar } : prev);
    };

    const value = {
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      googleLogin,
      updateUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  } catch (error) {
    console.error('AuthProvider error:', error);
    throw error;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 