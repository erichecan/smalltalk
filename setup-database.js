// 数据库表创建脚本
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://znaacfatlmwotdxcfukp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuYWFjZmF0bG13b3RkeGNmdWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDQxOTksImV4cCI6MjA2Njc4MDE5OX0.CUP_cXn5HraPvcYeKMcog4g0CCPwXPUuKe_tOk1vYjA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 创建vocabulary表的SQL
const createVocabularyTable = `
CREATE TABLE IF NOT EXISTS vocabulary (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  definition TEXT,
  example TEXT,
  pronunciation TEXT,
  source TEXT DEFAULT 'manual',
  mastery_level INTEGER DEFAULT 0,
  bookmarked BOOLEAN DEFAULT false,
  chinese_translation TEXT,
  phonetic TEXT,
  part_of_speech TEXT,
  synonyms TEXT,
  antonyms TEXT,
  difficulty_level TEXT,
  usage_notes TEXT,
  last_reviewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery_level ON vocabulary(mastery_level);
`;

// 创建phrases表的SQL
const createPhrasesTable = `
CREATE TABLE IF NOT EXISTS phrases (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  phrase TEXT NOT NULL,
  translation TEXT,
  category TEXT,
  usage_example TEXT,
  bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_phrases_user_id ON phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_phrases_category ON phrases(category);
`;

async function setupDatabase() {
  console.log('开始创建数据库表...');
  
  try {
    // 创建vocabulary表
    const { error: vocabError } = await supabase.rpc('exec_sql', { 
      sql: createVocabularyTable 
    });
    
    if (vocabError) {
      console.error('创建vocabulary表时出错:', vocabError);
    } else {
      console.log('✅ vocabulary表创建成功');
    }
    
    // 创建phrases表
    const { error: phrasesError } = await supabase.rpc('exec_sql', { 
      sql: createPhrasesTable 
    });
    
    if (phrasesError) {
      console.error('创建phrases表时出错:', phrasesError);
    } else {
      console.log('✅ phrases表创建成功');
    }
    
    // 测试插入一条记录
    const { data, error } = await supabase
      .from('vocabulary')
      .insert([{
        user_id: 'test_user',
        word: 'test',
        definition: 'A test word',
        example: 'This is a test.',
        source: 'manual',
        mastery_level: 0,
        bookmarked: false
      }])
      .select()
      .single();
    
    if (error) {
      console.error('测试插入失败:', error);
    } else {
      console.log('✅ 测试插入成功:', data);
      
      // 删除测试记录
      await supabase.from('vocabulary').delete().eq('id', data.id);
      console.log('✅ 测试记录已清理');
    }
    
  } catch (error) {
    console.error('数据库设置失败:', error);
  }
}

setupDatabase();