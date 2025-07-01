-- SmallTalk 应用完整数据库表结构
-- 创建所有必需的表

-- 1. 词汇表 (vocabulary)
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
  synonyms TEXT, -- JSON字符串格式
  antonyms TEXT, -- JSON字符串格式
  difficulty_level TEXT,
  usage_notes TEXT,
  last_reviewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 短语表 (phrases)
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

-- 3. 语法进度表 (grammar_progress)
CREATE TABLE IF NOT EXISTS grammar_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  grammar_topic TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  last_practiced TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 对话历史表 (conversation_history)
CREATE TABLE IF NOT EXISTS conversation_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic TEXT,
  conversation_data JSONB, -- 存储完整的对话数据
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引优化查询性能
-- vocabulary表索引
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery_level ON vocabulary(mastery_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_bookmarked ON vocabulary(bookmarked);
CREATE INDEX IF NOT EXISTS idx_vocabulary_created_at ON vocabulary(created_at DESC);

-- phrases表索引
CREATE INDEX IF NOT EXISTS idx_phrases_user_id ON phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_phrases_category ON phrases(category);
CREATE INDEX IF NOT EXISTS idx_phrases_bookmarked ON phrases(bookmarked);
CREATE INDEX IF NOT EXISTS idx_phrases_created_at ON phrases(created_at DESC);

-- grammar_progress表索引
CREATE INDEX IF NOT EXISTS idx_grammar_progress_user_id ON grammar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_grammar_progress_topic ON grammar_progress(grammar_topic);

-- conversation_history表索引
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON conversation_history(created_at DESC);

-- 为了数据完整性，添加一些约束
-- vocabulary表约束
ALTER TABLE vocabulary 
ADD CONSTRAINT IF NOT EXISTS chk_mastery_level 
CHECK (mastery_level >= 0 AND mastery_level <= 2);

-- grammar_progress表约束
ALTER TABLE grammar_progress 
ADD CONSTRAINT IF NOT EXISTS chk_progress_percentage 
CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- 创建唯一约束避免重复数据
ALTER TABLE vocabulary 
ADD CONSTRAINT IF NOT EXISTS unq_vocabulary_user_word 
UNIQUE (user_id, word);

ALTER TABLE grammar_progress 
ADD CONSTRAINT IF NOT EXISTS unq_grammar_progress_user_topic 
UNIQUE (user_id, grammar_topic);

-- 注释说明
COMMENT ON TABLE vocabulary IS '用户词汇表';
COMMENT ON COLUMN vocabulary.mastery_level IS '掌握程度: 0=未学, 1=学习中, 2=已掌握';
COMMENT ON COLUMN vocabulary.synonyms IS 'JSON字符串格式的同义词数组';
COMMENT ON COLUMN vocabulary.antonyms IS 'JSON字符串格式的反义词数组';

COMMENT ON TABLE phrases IS '用户短语表';
COMMENT ON TABLE grammar_progress IS '语法学习进度表';
COMMENT ON TABLE conversation_history IS '对话历史记录表';
COMMENT ON COLUMN conversation_history.conversation_data IS 'JSONB格式存储完整对话内容';