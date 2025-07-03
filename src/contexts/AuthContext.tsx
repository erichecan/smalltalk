import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../services/supabase';

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
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
          });
        } else {
          setUser(null);
        }
      });

      // 初始化时同步一次
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email || '',
          });
        }
      });
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
      // Google OAuth 登录 - 防止Google库fallback到localhost:3000 - 2025-07-03 15:10:00
      const getRedirectUrl = () => {
        const origin = window.location.origin;
        // 防止fallback到localhost:3000，强制使用正确的URL
        if (origin.includes('localhost:3000')) {
          return 'https://smalltalking.netlify.app/topic';
        }
        // 生产环境直接使用配置的域名
        if (origin.includes('netlify.app')) {
          return origin + '/topic';
        }
        // 本地开发环境
        if (origin.includes('localhost')) {
          return origin + '/topic';
        }
        // 默认使用生产环境URL
        return 'https://smalltalking.netlify.app/topic';
      };

      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) {
        console.error('Supabase Google OAuth error:', error);
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