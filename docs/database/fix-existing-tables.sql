-- 修复现有表结构
-- 为已存在的表添加缺失的列

-- 检查并修复conversation_history表
-- 添加messages列(如果不存在)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='conversation_history' AND column_name='messages') THEN
        ALTER TABLE conversation_history ADD COLUMN messages JSONB;
    END IF;
END $$;

-- 检查并修复conversation_history表的其他可能缺失的列
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='conversation_history' AND column_name='topic') THEN
        ALTER TABLE conversation_history ADD COLUMN topic TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='conversation_history' AND column_name='user_id') THEN
        ALTER TABLE conversation_history ADD COLUMN user_id TEXT NOT NULL;
    END IF;
END $$;

-- 添加bookmarked字段用于对话收藏功能 - 2025-01-30 15:45:12
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='conversation_history' AND column_name='bookmarked') THEN
        ALTER TABLE conversation_history ADD COLUMN bookmarked BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 创建缺失的表(如果不存在)
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

CREATE TABLE IF NOT EXISTS grammar_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  grammar_topic TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  last_practiced TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引(如果不存在)
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON conversation_history(created_at DESC);
-- 为bookmarked字段创建索引以优化查询性能 - 2025-01-30 15:45:12
CREATE INDEX IF NOT EXISTS idx_conversation_history_bookmarked ON conversation_history(bookmarked);
CREATE INDEX IF NOT EXISTS idx_phrases_user_id ON phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_grammar_progress_user_id ON grammar_progress(user_id);