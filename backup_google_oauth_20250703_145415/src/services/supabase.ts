import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env';

// 使用统一的环境变量适配器
export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!); 