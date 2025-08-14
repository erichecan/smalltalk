// OAuth配置文件 - 根据Supabase官方文档修复 - 2025-01-14 00:45:00

export const OAUTH_CONFIG = {
  // Google OAuth配置
  GOOGLE: {
    CLIENT_ID: '285349339081-t5rp69l5n6jb5l73ul329ou8f903vtrl.apps.googleusercontent.com',
    SCOPES: ['email', 'profile', 'openid'],
    ACCESS_TYPE: 'offline',
    PROMPT: 'consent',
    
    // 根据Supabase文档，这些URL需要在Google Cloud Console中配置
    // 而不是在我们的代码中使用
    GOOGLE_CLOUD_CONFIG: {
      // 在Google Cloud Console的"Authorized JavaScript origins"中添加
      JAVASCRIPT_ORIGINS: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://smalltalking.netlify.app'
      ],
      
      // 在Google Cloud Console的"Authorized redirect URLs"中添加
      // 这是Supabase Dashboard显示的回调URL
      REDIRECT_URL: 'https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback'
    }
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

// 验证OAuth配置
export const validateOAuthConfig = (): boolean => {
  const { GOOGLE, ENVIRONMENT } = OAUTH_CONFIG;
  
  console.log('🔍 验证OAuth配置...');
  console.log('📍 当前环境:', ENVIRONMENT);
  console.log('🔑 Google Client ID:', GOOGLE.CLIENT_ID);
  console.log('🌐 Supabase URL:', OAUTH_CONFIG.SUPABASE.URL);
  
  // 检查必要的配置
  if (!GOOGLE.CLIENT_ID) {
    console.error('❌ Google Client ID未配置');
    return false;
  }
  
  if (!OAUTH_CONFIG.SUPABASE.URL) {
    console.error('❌ Supabase URL未配置');
    return false;
  }
  
  console.log('✅ OAuth配置验证通过');
  return true;
};

export default OAUTH_CONFIG;
