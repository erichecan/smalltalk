// OAuth配置文件 - 直接Google OAuth集成 - 2025-01-30 16:58:00
// 绕过Supabase，直接使用Google OAuth进行认证

export const OAUTH_CONFIG = {
  // Google OAuth配置
  GOOGLE: {
    CLIENT_ID: '285349339081-t5rp69l5n6jb5l73ul329ou8f903vtrl.apps.googleusercontent.com',
    SCOPES: ['email', 'profile', 'openid'],
    ACCESS_TYPE: 'offline',
    PROMPT: 'consent',
    
    // 直接Google OAuth配置
    DIRECT_OAUTH: {
      // 认证端点
      AUTH_ENDPOINT: 'https://accounts.google.com/o/oauth2/v2/auth',
      // 令牌交换端点
      TOKEN_ENDPOINT: 'https://oauth2.googleapis.com/token',
      // 用户信息端点
      USERINFO_ENDPOINT: 'https://www.googleapis.com/oauth2/v2/userinfo',
      // 重定向URI（动态获取）
      REDIRECT_URI: () => `${window.location.origin}/auth-callback`,
    },
    
    // Google Cloud Console配置要求
    GOOGLE_CLOUD_CONFIG: {
      // 在Google Cloud Console的"Authorized JavaScript origins"中添加
      JAVASCRIPT_ORIGINS: [
        'http://localhost:5173',
        'http://localhost:5175', // 当前开发端口
        'https://smalltalking.netlify.app'
      ],
      
      // 在Google Cloud Console的"Authorized redirect URLs"中添加
      // 现在直接使用我们的回调URL，不再依赖Supabase
      REDIRECT_URLS: [
        'http://localhost:5173/auth-callback',
        'http://localhost:5175/auth-callback', // 当前开发端口
        'https://smalltalking.netlify.app/auth-callback'
      ]
    }
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

// 验证OAuth配置
export const validateOAuthConfig = (): boolean => {
  const { GOOGLE, ENVIRONMENT } = OAUTH_CONFIG;
  
  console.log('🔍 验证直接Google OAuth配置...');
  console.log('📍 当前环境:', ENVIRONMENT);
  console.log('🔑 Google Client ID:', GOOGLE.CLIENT_ID);
  console.log('🌐 当前域名:', ENVIRONMENT.CURRENT_ORIGIN);
  console.log('🔗 重定向URI:', GOOGLE.DIRECT_OAUTH.REDIRECT_URI());
  
  // 检查必要的配置
  if (!GOOGLE.CLIENT_ID) {
    console.error('❌ Google Client ID未配置');
    return false;
  }
  
  console.log('✅ 直接Google OAuth配置验证通过');
  return true;
};

// 获取当前环境的正确重定向URI
export const getCurrentRedirectUri = (): string => {
  const { ENVIRONMENT } = OAUTH_CONFIG;
  
  if (ENVIRONMENT.IS_LOCAL) {
    return `http://localhost:${ENVIRONMENT.CURRENT_PORT}/auth-callback`;
  }
  
  if (ENVIRONMENT.IS_PRODUCTION) {
    return 'https://smalltalking.netlify.app/auth-callback';
  }
  
  // 默认返回当前域名
  return `${ENVIRONMENT.CURRENT_ORIGIN}/auth-callback`;
};

export default OAUTH_CONFIG;
