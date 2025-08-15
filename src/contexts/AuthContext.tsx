import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { googleAuthService } from '../services/googleAuth';
import type { GoogleUser } from '../services/googleAuth';
import { OAUTH_CONFIG, validateOAuthConfig } from '../config/oauth';

// React hooks健康检查 - 2025-01-30 16:40:22
if (typeof React === 'undefined' || !React.useState) {
  console.error('React or React.useState is not available');
  throw new Error('React hooks are not properly loaded');
}

// 用户类型 - 统一Google和Supabase用户
interface ExtendedUser {
  id: string;
  email: string | null;
  name?: string | null;
  avatar?: string | null;
  provider: 'google' | 'supabase'; // 标识认证提供商
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

    // 初始化时验证OAuth配置
    useEffect(() => {
      console.log('🔍 初始化认证系统...');
      validateOAuthConfig();
    }, []);

    // 监听认证状态变化
    useEffect(() => {
      // 检查Google OAuth状态
      const checkGoogleAuth = () => {
        const googleUser = googleAuthService.getCurrentUser();
        if (googleUser) {
          console.log('✅ 检测到Google OAuth用户:', googleUser.email);
          setUser({
            id: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            provider: 'google'
          });
          return true;
        }
        return false;
      };

      // 检查Supabase状态（作为备用）
      const checkSupabaseAuth = async () => {
        try {
          const { data: { user: currentUser }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('❌ 获取Supabase用户信息失败:', error);
            return false;
          }
          
          if (currentUser) {
            console.log('✅ 检测到Supabase用户:', currentUser.email);
            setUser({
              id: currentUser.id,
              email: currentUser.email || '',
              name: currentUser.user_metadata?.name || currentUser.email || '',
              provider: 'supabase'
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('❌ 检查Supabase认证状态失败:', error);
          return false;
        }
      };

      // 初始化认证状态
      const initializeAuth = async () => {
        try {
          console.log('🔍 初始化认证状态...');
          
          // 优先检查Google OAuth
          if (checkGoogleAuth()) {
            return;
          }
          
          // 如果没有Google用户，检查Supabase
          await checkSupabaseAuth();
          
        } catch (error) {
          console.error('❌ 初始化认证状态失败:', error);
        }
      };

      initializeAuth();

      // 监听页面可见性变化，用于处理OAuth回调
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          // 页面变为可见时，检查是否有OAuth回调参数
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('code') && urlParams.get('state')) {
            console.log('🔄 检测到OAuth回调，处理认证...');
            handleOAuthCallback();
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, []);

    // 处理OAuth回调
    const handleOAuthCallback = async () => {
      try {
        console.log('🔄 处理OAuth回调...');
        
        const googleUser = await googleAuthService.handleCallback();
        if (googleUser) {
          console.log('✅ OAuth回调处理成功:', googleUser.email);
          setUser({
            id: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            provider: 'google'
          });
          
          // 重定向到主页面
          window.location.href = '/topic';
        }
      } catch (error) {
        console.error('❌ OAuth回调处理失败:', error);
        // 重定向到登录页面
        window.location.href = '/login';
      }
    };

    const login = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    };

    const register = async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    };

    const logout = async () => {
      try {
        // 根据当前用户的提供商进行相应的登出
        if (user?.provider === 'google') {
          await googleAuthService.signOut();
        } else {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        }
        
        setUser(null);
        console.log('✅ 用户登出成功');
        
      } catch (error) {
        console.error('❌ 登出失败:', error);
        throw error;
      }
    };

    const googleLogin = async () => {
      // 使用新的直接Google OAuth服务 - 2025-01-30 17:00:00
      try {
        console.log('🚀 启动直接Google OAuth登录...');
        
        // 清理可能的旧认证状态
        if (user?.provider === 'supabase') {
          await supabase.auth.signOut();
        }
        
        // 启动Google OAuth流程
        await googleAuthService.signIn();
        
        console.log('✅ Google OAuth流程已启动，用户将被重定向到Google登录页面');
        
      } catch (error) {
        console.error('❌ Google OAuth登录失败:', error);
        throw error;
      }
    };

    const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
      try {
        if (user?.provider === 'google') {
          // Google用户暂时不支持更新资料（需要后端支持）
          console.warn('⚠️ Google用户资料更新需要后端支持');
          return;
        }
        
        // Supabase用户更新
        const updates: Record<string, string> = {};
        if (data.displayName) updates.full_name = data.displayName;
        if (data.photoURL) updates.avatar_url = data.photoURL;
        
        const { error } = await supabase.auth.updateUser({ data: updates });
        if (error) throw error;
        
        // 本地同步
        setUser((prev) => prev ? { ...prev, name: data.displayName ?? prev.name, avatar: data.photoURL ?? prev.avatar } : prev);
        
      } catch (error) {
        console.error('❌ 更新用户资料失败:', error);
        throw error;
      }
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