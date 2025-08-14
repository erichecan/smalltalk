import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { OAUTH_CONFIG, getCurrentRedirectUrl, validateOAuthConfig, buildGoogleOAuthUrl } from '../config/oauth';

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
      // 强制重定向拦截器 - 防止localhost:3000 fallback - 2025-01-13 23:47:00
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        const currentUrl = window.location.href;
        if (currentUrl.includes('localhost:3000')) {
          console.warn('🚨 检测到localhost:3000重定向，正在拦截...');
          event.preventDefault();
          event.returnValue = '';
          
          // 强制重定向到正确的URL
          const correctUrl = currentUrl.replace('localhost:3000', 'localhost:5173');
          window.location.href = correctUrl;
        }
      };

      // 监听页面卸载事件
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // 监听URL变化
      const handleUrlChange = () => {
        const currentUrl = window.location.href;
        if (currentUrl.includes('localhost:3000')) {
          console.warn('🚨 检测到URL变化到localhost:3000，正在重定向...');
          const correctUrl = currentUrl.replace('localhost:3000', 'localhost:5173');
          window.location.href = correctUrl;
        }
      };

      // 使用MutationObserver监听DOM变化
      const observer = new MutationObserver(handleUrlChange);
      observer.observe(document.body, { childList: true, subtree: true });

      // 定期检查URL
      const urlCheckInterval = setInterval(handleUrlChange, 1000);

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
        window.removeEventListener('beforeunload', handleBeforeUnload);
        observer.disconnect();
        clearInterval(urlCheckInterval);
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
      // Google OAuth 登录 - 使用集中配置避免localhost:3000 fallback - 2025-01-13 23:50:00
      try {
        // 验证OAuth配置
        if (!validateOAuthConfig()) {
          throw new Error('OAuth配置验证失败');
        }

        const redirectUrl = getCurrentRedirectUrl();
        console.log('🚀 Google OAuth redirect URL:', redirectUrl);

        // 方法1: 尝试使用Supabase OAuth
        try {
          const { error } = await supabase.auth.signInWithOAuth({ 
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              queryParams: {
                access_type: OAUTH_CONFIG.GOOGLE.ACCESS_TYPE,
                prompt: OAUTH_CONFIG.GOOGLE.PROMPT,
                redirect_uri: redirectUrl,
                response_type: OAUTH_CONFIG.GOOGLE.RESPONSE_TYPE,
                scope: OAUTH_CONFIG.GOOGLE.SCOPES.join(' '),
                client_id: OAUTH_CONFIG.GOOGLE.CLIENT_ID
              }
            }
          });
          
          if (error) {
            console.error('❌ Supabase Google OAuth error:', error);
            throw error;
          }
          
          console.log('✅ Supabase Google OAuth initiated successfully');
          return;
        } catch (supabaseError) {
          console.warn('⚠️ Supabase OAuth failed, trying direct Google OAuth:', supabaseError);
        }

        // 方法2: 直接重定向到Google OAuth
        console.log('🔄 Using direct Google OAuth redirect...');
        const googleOAuthUrl = buildGoogleOAuthUrl(redirectUrl);
        console.log('🔗 Direct Google OAuth URL:', googleOAuthUrl);
        
        // 重定向到Google OAuth
        window.location.href = googleOAuthUrl;
        
      } catch (error) {
        console.error('❌ Google OAuth login completely failed:', error);
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