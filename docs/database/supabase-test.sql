-- SmallTalk 社交功能测试版 (仅创建基本表结构)
-- 创建时间: 2025-01-31 11:25:00
-- 用途: 测试基本表创建，避免所有复杂操作

-- 测试：只创建最基本的表结构
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  user_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  points_reward INTEGER DEFAULT 0,
  requirements JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  total_required INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 创建基本索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_level ON user_points(user_level DESC);

-- 插入测试数据
INSERT INTO achievements (id, title, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'First Conversation', 'Complete your first conversation', 'chat_bubble', 'common', 10, '{"type": "conversation_count", "value": 1}'),
('first_word', 'First Word', 'Learn your first word', 'book', 'common', 5, '{"type": "vocabulary_count", "value": 1}')
ON CONFLICT (id) DO NOTHING;

-- 创建简单视图
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  user_id,
  total_points,
  user_level,
  ROW_NUMBER() OVER (ORDER BY total_points DESC) as current_rank
FROM user_points
ORDER BY total_points DESC;

-- 完成消息
SELECT 'SmallTalk 社交功能基本表结构创建完成！' as status;
