import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env';

// 修复OAuth流程状态问题 - 2025-01-30 16:45:00
export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // 修复PKCE流程状态问题
    flowType: 'pkce',
    // 添加调试信息
    debug: process.env.NODE_ENV === 'development',
    // 确保正确的重定向处理
    redirectTo: window.location.origin + '/auth-callback'
  }
}); 