import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
// @ts-ignore
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

// Mock scrollIntoView for JSDOM
Element.prototype.scrollIntoView = jest.fn();

// 设置测试环境变量
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.VITE_GEMINI_API_KEY = 'test-gemini-key';
process.env.NODE_ENV = 'test'; 