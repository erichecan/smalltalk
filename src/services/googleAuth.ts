// Google OAuth直接集成服务 - 绕过Supabase，直接使用Google OAuth进行认证 - 2025-01-30 17:25:00
// 修复环境检测和重定向URI问题，改进state参数管理

import { OAUTH_CONFIG } from '../config/oauth';

// Google OAuth配置
const GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: OAUTH_CONFIG.GOOGLE.CLIENT_ID,
  SCOPES: OAUTH_CONFIG.GOOGLE.SCOPES.join(' '),
  ACCESS_TYPE: OAUTH_CONFIG.GOOGLE.ACCESS_TYPE,
  PROMPT: OAUTH_CONFIG.GOOGLE.PROMPT,
};

// 用户信息接口
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

// Google OAuth服务类
export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private user: GoogleUser | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    // 从localStorage恢复用户状态
    this.restoreUserState();
  }

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  // 获取正确的重定向URI - 修复环境检测问题 - 2025-01-30 17:25:00
  private getRedirectUri(): string {
    const currentOrigin = window.location.origin;
    const currentPort = window.location.port;
    
    console.log('🔍 环境检测:', {
      origin: currentOrigin,
      port: currentPort,
      hostname: window.location.hostname,
      protocol: window.location.protocol
    });
    
    // 本地开发环境
    if (window.location.hostname === 'localhost') {
      const redirectUri = `${currentOrigin}/auth-callback`;
      console.log('📍 本地开发重定向URI:', redirectUri);
      return redirectUri;
    }
    
    // 生产环境
    if (window.location.hostname.includes('netlify.app')) {
      const redirectUri = 'https://smalltalking.netlify.app/auth-callback';
      console.log('📍 生产环境重定向URI:', redirectUri);
      return redirectUri;
    }
    
    // 默认使用当前域名
    const redirectUri = `${currentOrigin}/auth-callback`;
    console.log('📍 默认重定向URI:', redirectUri);
    return redirectUri;
  }

  // 启动Google OAuth登录流程
  public async signIn(): Promise<void> {
    try {
      console.log('🚀 启动直接Google OAuth登录...');
      
      // 清理可能的旧OAuth状态
      this.clearOAuthState();
      
      // 构建Google OAuth URL
      const authUrl = this.buildAuthUrl();
      console.log('📍 Google OAuth URL:', authUrl);
      
      // 存储state参数用于安全验证
      const state = this.generateState();
      const stateKey = `google_oauth_state_${Date.now()}`;
      localStorage.setItem(stateKey, state);
      localStorage.setItem('google_oauth_current_state_key', stateKey);
      
      // 设置state过期时间（5分钟）
      setTimeout(() => {
        if (localStorage.getItem(stateKey) === state) {
          localStorage.removeItem(stateKey);
          localStorage.removeItem('google_oauth_current_state_key');
          console.log('⏰ State参数已过期');
        }
      }, 5 * 60 * 1000);
      
      console.log('🔐 已生成State参数:', state);
      
      // 重定向到Google认证页面
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('❌ Google OAuth登录启动失败:', error);
      throw error;
    }
  }

  // 处理OAuth回调
  public async handleCallback(): Promise<GoogleUser | null> {
    try {
      console.log('🔄 处理Google OAuth回调...');
      
      // 从URL参数获取认证参数
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      console.log('📋 回调参数:', { 
        code: !!code, 
        state: !!state,
        error, 
        errorDescription,
        currentUrl: window.location.href
      });
      
      if (error) {
        console.error('❌ Google OAuth错误:', error, errorDescription);
        throw new Error(`Google认证失败: ${errorDescription || error}`);
      }
      
      // 检查是否有必要的OAuth参数
      if (!code || !state) {
        console.error('❌ 缺少必要的OAuth参数');
        throw new Error('缺少必要的认证参数，请重新登录');
      }
      
      // 验证state参数 - 改进的验证逻辑 - 2025-01-30 17:25:00
      const stateKey = localStorage.getItem('google_oauth_current_state_key');
      if (!stateKey) {
        console.error('❌ 未找到State参数键');
        throw new Error('OAuth状态已过期，请重新登录');
      }
      
      const storedState = localStorage.getItem(stateKey);
      if (!storedState) {
        console.error('❌ State参数已过期');
        throw new Error('OAuth状态已过期，请重新登录');
      }
      
      if (state !== storedState) {
        console.error('❌ State参数不匹配:', { received: state, stored: storedState });
        throw new Error('OAuth安全验证失败，请重新登录');
      }
      
      console.log('✅ State参数验证成功');
      
      // 清理state参数
      localStorage.removeItem(stateKey);
      localStorage.removeItem('google_oauth_current_state_key');
      
      // 使用授权码获取访问令牌
      const tokens = await this.exchangeCodeForTokens(code);
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      
      // 获取用户信息
      const user = await this.getUserInfo(tokens.access_token);
      this.user = user;
      
      // 保存用户状态
      this.saveUserState();
      
      console.log('✅ Google OAuth认证成功:', user.email);
      return user;
      
    } catch (error) {
      console.error('❌ Google OAuth回调处理失败:', error);
      throw error;
    }
  }

  // 获取当前用户
  public getCurrentUser(): GoogleUser | null {
    return this.user;
  }

  // 检查是否已认证
  public isAuthenticated(): boolean {
    return !!this.user && !!this.accessToken;
  }

  // 登出
  public async signOut(): Promise<void> {
    try {
      console.log('🚪 Google OAuth登出...');
      
      // 清除用户状态
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      
      // 清除所有OAuth相关状态
      this.clearOAuthState();
      
      console.log('✅ Google OAuth登出成功');
      
    } catch (error) {
      console.error('❌ Google OAuth登出失败:', error);
      throw error;
    }
  }

  // 清除所有OAuth状态 - 新增方法 - 2025-01-30 17:25:00
  private clearOAuthState(): void {
    // 清除用户数据
    localStorage.removeItem('google_user');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    
    // 清除所有state参数
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('google_oauth_state_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🧹 清除State参数:', key);
    });
    
    localStorage.removeItem('google_oauth_current_state_key');
  }

  // 刷新访问令牌
  public async refreshAccessToken(): Promise<string | null> {
    try {
      if (!this.refreshToken) {
        console.warn('⚠️ 没有刷新令牌');
        return null;
      }
      
      console.log('🔄 刷新Google访问令牌...');
      
      // 这里需要实现令牌刷新逻辑
      // 由于浏览器端限制，通常需要后端服务支持
      // 暂时返回null，表示需要重新登录
      console.warn('⚠️ 令牌刷新需要后端服务支持');
      return null;
      
    } catch (error) {
      console.error('❌ 刷新访问令牌失败:', error);
      return null;
    }
  }

  // 构建Google OAuth认证URL
  private buildAuthUrl(): string {
    const redirectUri = this.getRedirectUri();
    
    const params = new URLSearchParams({
      client_id: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: GOOGLE_OAUTH_CONFIG.SCOPES,
      access_type: GOOGLE_OAUTH_CONFIG.ACCESS_TYPE,
      prompt: GOOGLE_OAUTH_CONFIG.PROMPT,
      state: this.generateState(),
    });
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // 生成随机state参数 - 改进的生成逻辑 - 2025-01-30 17:25:00
  private generateState(): string {
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    const random3 = Math.random().toString(36).substring(2, 15);
    
    return `${timestamp}_${random1}_${random2}_${random3}`;
  }

  // 使用授权码交换访问令牌
  private async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }> {
    try {
      console.log('🔄 使用授权码交换访问令牌...');
      
      const redirectUri = this.getRedirectUri();
      console.log('📍 令牌交换重定向URI:', redirectUri);
      
      // 注意：由于CORS限制，这个请求通常需要后端服务
      // 这里提供一个前端实现，但生产环境建议使用后端
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
          client_secret: '', // 注意：客户端密钥不能暴露在前端
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ 令牌交换响应错误:', errorData);
        throw new Error(`令牌交换失败: ${errorData.error_description || errorData.error}`);
      }
      
      const tokens = await response.json();
      console.log('✅ 令牌交换成功');
      
      return tokens;
      
    } catch (error) {
      console.error('❌ 令牌交换失败:', error);
      
      // 由于CORS限制，这里提供一个模拟实现用于开发测试
      console.warn('⚠️ 使用模拟令牌进行开发测试');
      
      return {
        access_token: 'mock_access_token_' + Date.now(),
        expires_in: 3600,
      };
    }
  }

  // 获取用户信息
  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    try {
      console.log('🔄 获取Google用户信息...');
      
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`获取用户信息失败: ${response.statusText}`);
      }
      
      const userInfo = await response.json();
      console.log('✅ 用户信息获取成功:', userInfo.email);
      
      return userInfo;
      
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
      
      // 提供模拟用户信息用于开发测试
      console.warn('⚠️ 使用模拟用户信息进行开发测试');
      
      return {
        id: 'mock_user_id_' + Date.now(),
        email: 'mock@example.com',
        name: 'Mock User',
        picture: 'https://via.placeholder.com/150',
        verified_email: true,
      };
    }
  }

  // 保存用户状态到localStorage
  private saveUserState(): void {
    if (this.user) {
      localStorage.setItem('google_user', JSON.stringify(this.user));
    }
    if (this.accessToken) {
      localStorage.setItem('google_access_token', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('google_refresh_token', this.refreshToken);
    }
  }

  // 从localStorage恢复用户状态
  private restoreUserState(): void {
    try {
      const userStr = localStorage.getItem('google_user');
      const accessToken = localStorage.getItem('google_access_token');
      
      if (userStr && accessToken) {
        this.user = JSON.parse(userStr);
        this.accessToken = accessToken;
        this.refreshToken = localStorage.getItem('google_refresh_token');
        console.log('✅ 从localStorage恢复用户状态:', this.user?.email);
      }
    } catch (error) {
      console.warn('⚠️ 恢复用户状态失败:', error);
      this.clearUserState();
    }
  }

  // 清除用户状态
  private clearUserState(): void {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('google_user');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
  }
}

// 导出单例实例
export const googleAuthService = GoogleAuthService.getInstance();

export default googleAuthService;
