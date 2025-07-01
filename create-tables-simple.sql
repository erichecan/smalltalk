-- SmallTalk 应用数据库表结构 (简化版)
-- 只创建表和索引，不添加复杂约束

-- 1. 词汇表 (vocabulary) - 已存在，跳过
-- CREATE TABLE vocabulary (...)

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
  conversation_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建基本索引
CREATE INDEX IF NOT EXISTS idx_phrases_user_id ON phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_phrases_created_at ON phrases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_grammar_progress_user_id ON grammar_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON conversation_history(created_at DESC);