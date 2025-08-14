// OAuth配置文件 - 集中管理所有OAuth设置 - 2025-01-13 23:48:00

export const OAUTH_CONFIG = {
  // Google OAuth配置
  GOOGLE: {
    CLIENT_ID: '285349339081-t5rp69l5n6jb5l73ul329ou8f903vtrl.apps.googleusercontent.com',
    SCOPES: ['email', 'profile', 'openid'],
    ACCESS_TYPE: 'offline',
    PROMPT: 'consent',
    RESPONSE_TYPE: 'code',
    
    // 重定向URL配置
    REDIRECT_URLS: {
      LOCAL: 'http://localhost:5173/auth-callback',
      PRODUCTION: 'https://smalltalking.netlify.app/auth-callback',
      SUPABASE_CALLBACK: 'https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback'
    },
    
    // 授权域名配置
    AUTHORIZED_DOMAINS: [
      'znaacfatlmwotdxcfukp.supabase.co',
      'smalltalking.netlify.app',
      'localhost'
    ],
    
    // JavaScript origins配置
    JAVASCRIPT_ORIGINS: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://smalltalking.netlify.app',
      'https://znaacfatlmwotdxcfukp.supabase.co'
    ]
  },
  
  // Supabase配置
  SUPABASE: {
    URL: 'https://znaacfatlmwotdxcfukp.supabase.co',
    AUTH_ENDPOINT: 'https://znaacfatlmwotdxcfukp.supabase.co/auth/v1'
  },
  
  // 环境检测
  ENVIRONMENT: {
    IS_LOCAL: window.location.hostname === 'localhost',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: window.location.hostname.includes('netlify.app'),
    CURRENT_PORT: window.location.port || '5173',
    CURRENT_ORIGIN: window.location.origin
  }
};

// 获取当前环境的重定向URL
export const getCurrentRedirectUrl = (): string => {
  const { ENVIRONMENT, GOOGLE } = OAUTH_CONFIG;
  
  if (ENVIRONMENT.IS_LOCAL) {
    return `http://localhost:${ENVIRONMENT.CURRENT_PORT}/topic`;
  }
  
  if (ENVIRONMENT.IS_PRODUCTION) {
    return GOOGLE.REDIRECT_URLS.PRODUCTION;
  }
  
  // 默认返回生产环境URL
  return GOOGLE.REDIRECT_URLS.PRODUCTION;
};

// 验证OAuth配置
export const validateOAuthConfig = (): boolean => {
  const { GOOGLE, ENVIRONMENT } = OAUTH_CONFIG;
  
  console.log('🔍 验证OAuth配置...');
  console.log('📍 当前环境:', ENVIRONMENT);
  console.log('🔑 Google Client ID:', GOOGLE.CLIENT_ID);
  console.log('🔄 重定向URL:', getCurrentRedirectUrl());
  
  // 检查必要的配置
  if (!GOOGLE.CLIENT_ID) {
    console.error('❌ Google Client ID未配置');
    return false;
  }
  
  if (!getCurrentRedirectUrl()) {
    console.error('❌ 重定向URL未配置');
    return false;
  }
  
  console.log('✅ OAuth配置验证通过');
  return true;
};

// 构建Google OAuth URL
export const buildGoogleOAuthUrl = (redirectUrl?: string): string => {
  const { GOOGLE } = OAUTH_CONFIG;
  const finalRedirectUrl = redirectUrl || getCurrentRedirectUrl();
  
  const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  oauthUrl.searchParams.set('client_id', GOOGLE.CLIENT_ID);
  oauthUrl.searchParams.set('redirect_uri', finalRedirectUrl);
  oauthUrl.searchParams.set('response_type', GOOGLE.RESPONSE_TYPE);
  oauthUrl.searchParams.set('scope', GOOGLE.SCOPES.join(' '));
  oauthUrl.searchParams.set('access_type', GOOGLE.ACCESS_TYPE);
  oauthUrl.searchParams.set('prompt', GOOGLE.PROMPT);
  
  return oauthUrl.toString();
};

export default OAUTH_CONFIG;
