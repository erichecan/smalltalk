-- SmallTalk 数据库修复脚本 - 最终版本
-- 创建时间: 2024-03-21 15:30:00

-- 第一步：删除已存在的表（如果存在）
DROP TABLE IF EXISTS user_points CASCADE;

-- 第二步：创建新的表结构
CREATE TABLE user_points (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1, -- 使用 level 而不是 user_level
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_points_user_id_key UNIQUE (user_id)
);

-- 第三步：创建索引
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX idx_user_points_level ON user_points(level DESC);

-- 第四步：添加触发器以自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON user_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 第五步：添加基础数据（如果需要）
INSERT INTO user_points (user_id, total_points, level)
VALUES 
    ('system', 0, 1)
ON CONFLICT (user_id) DO NOTHING;

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