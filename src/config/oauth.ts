// OAuth配置文件 - 直接Google OAuth集成 - 2025-01-30 17:28:00
// 绕过Supabase，直接使用Google OAuth进行认证，改进环境检测

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
      REDIRECT_URI: () => getCurrentRedirectUri(),
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
  
  // 环境检测 - 改进的环境检测逻辑 - 2025-01-30 17:28:00
  ENVIRONMENT: {
    IS_LOCAL: window.location.hostname === 'localhost',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: window.location.hostname.includes('netlify.app'),
    CURRENT_PORT: window.location.port || '5173',
    CURRENT_ORIGIN: window.location.origin,
    CURRENT_HOSTNAME: window.location.hostname,
    CURRENT_PROTOCOL: window.location.protocol
  }
};

// 验证OAuth配置
export const validateOAuthConfig = (): boolean => {
  const { GOOGLE, ENVIRONMENT } = OAUTH_CONFIG;
  
  console.log('🔍 验证直接Google OAuth配置...');
  console.log('📍 当前环境:', ENVIRONMENT);
  console.log('🔑 Google Client ID:', GOOGLE.CLIENT_ID);
  console.log('🌐 当前域名:', ENVIRONMENT.CURRENT_ORIGIN);
  console.log('🔗 重定向URI:', getCurrentRedirectUri());
  
  // 检查必要的配置
  if (!GOOGLE.CLIENT_ID) {
    console.error('❌ Google Client ID未配置');
    return false;
  }
  
  // 检查环境配置
  if (ENVIRONMENT.IS_LOCAL) {
    console.log('✅ 本地开发环境检测成功');
  } else if (ENVIRONMENT.IS_PRODUCTION) {
    console.log('✅ 生产环境检测成功');
  } else {
    console.log('⚠️ 未知环境，使用默认配置');
  }
  
  console.log('✅ 直接Google OAuth配置验证通过');
  return true;
};

// 获取当前环境的正确重定向URI - 改进的环境检测 - 2025-01-30 17:28:00
export const getCurrentRedirectUri = (): string => {
  const { ENVIRONMENT } = OAUTH_CONFIG;
  
  console.log('🔍 重定向URI环境检测:', {
    hostname: ENVIRONMENT.CURRENT_HOSTNAME,
    port: ENVIRONMENT.CURRENT_PORT,
    origin: ENVIRONMENT.CURRENT_ORIGIN,
    isLocal: ENVIRONMENT.IS_LOCAL,
    isProduction: ENVIRONMENT.IS_PRODUCTION
  });
  
  // 本地开发环境
  if (ENVIRONMENT.IS_LOCAL) {
    const redirectUri = `http://localhost:${ENVIRONMENT.CURRENT_PORT}/auth-callback`;
    console.log('📍 本地开发重定向URI:', redirectUri);
    return redirectUri;
  }
  
  // 生产环境
  if (ENVIRONMENT.IS_PRODUCTION) {
    const redirectUri = 'https://smalltalking.netlify.app/auth-callback';
    console.log('📍 生产环境重定向URI:', redirectUri);
    return redirectUri;
  }
  
  // 默认使用当前域名
  const redirectUri = `${ENVIRONMENT.CURRENT_ORIGIN}/auth-callback`;
  console.log('📍 默认重定向URI:', redirectUri);
  return redirectUri;
};

// 获取环境信息用于调试 - 新增方法 - 2025-01-30 17:28:00
export const getEnvironmentInfo = () => {
  const { ENVIRONMENT } = OAUTH_CONFIG;
  
  return {
    ...ENVIRONMENT,
    redirectUri: getCurrentRedirectUri(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };
};

export default OAUTH_CONFIG;
