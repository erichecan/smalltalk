// 环境变量适配器 - 统一兼容 process.env 和 import.meta.env
// 优先使用 process.env（Jest 测试环境），其次使用 import.meta.env（Vite 开发/生产环境）

function getEnv(key: string) {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // 只在浏览器环境下访问 import.meta.env
  if (typeof window !== 'undefined') {
    try {
      // 直接访问 import.meta.env，在 Vite 环境下是安全的
      return (import.meta as any).env?.[key];
    } catch (e) {}
  }
  return undefined;
}

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
export const GEMINI_API_KEY = getEnv('VITE_GEMINI_API_KEY');

// 验证必需的环境变量
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing required environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// 导出其他可能需要的环境变量
export const NODE_ENV = getEnv('MODE') || getEnv('NODE_ENV');
export const IS_DEV = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';
export const IS_PROD = NODE_ENV === 'production'; 