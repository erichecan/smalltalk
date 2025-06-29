import '@testing-library/jest-dom';

// 设置测试环境变量
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.VITE_GEMINI_API_KEY = 'test-gemini-key';
process.env.NODE_ENV = 'test'; 