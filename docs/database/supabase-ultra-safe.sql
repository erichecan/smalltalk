-- SmallTalk 社交功能数据库架构 (超安全版)
-- 创建时间: 2025-01-31 11:35:00
-- 特点: 每个操作都独立执行，避免依赖错误

-- ============================================
-- 第一步：创建用户积分表
-- ============================================
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  user_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 验证表是否创建成功
SELECT 'user_points table created successfully' as status;

-- ============================================
-- 第二步：创建成就定义表
-- ============================================
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

-- 验证表是否创建成功
SELECT 'achievements table created successfully' as status;

-- ============================================
-- 第三步：创建用户成就记录表
-- ============================================
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

-- 验证表是否创建成功
SELECT 'user_achievements table created successfully' as status;

-- ============================================
-- 第四步：创建基本索引 (逐个创建，避免错误)
-- ============================================

-- 用户积分表索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
SELECT 'user_id index created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
SELECT 'total_points index created successfully' as status;

-- 注意：这里先检查列是否存在，再创建索引
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'user_points' AND column_name = 'user_level') THEN
    CREATE INDEX IF NOT EXISTS idx_user_points_user_level ON user_points(user_level DESC);
    RAISE NOTICE 'user_level index created successfully';
  ELSE
    RAISE NOTICE 'user_level column does not exist, skipping index creation';
  END IF;
END $$;

-- 成就表索引
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
SELECT 'achievements category index created successfully' as status;

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
SELECT 'user_achievements user_id index created successfully' as status;

-- ============================================
-- 第五步：插入测试数据
-- ============================================
INSERT INTO achievements (id, title, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'First Conversation', 'Complete your first conversation', 'chat_bubble', 'common', 10, '{"type": "conversation_count", "value": 1}'),
('first_word', 'First Word', 'Learn your first word', 'book', 'common', 5, '{"type": "vocabulary_count", "value": 1}')
ON CONFLICT (id) DO NOTHING;

SELECT 'test data inserted successfully' as status;

-- ============================================
-- 第六步：创建简单视图 (检查表存在后再创建)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points') THEN
    CREATE OR REPLACE VIEW leaderboard_view AS
    SELECT 
      user_id,
      total_points,
      user_level,
      ROW_NUMBER() OVER (ORDER BY total_points DESC) as current_rank
    FROM user_points
    ORDER BY total_points DESC;
    RAISE NOTICE 'leaderboard_view created successfully';
  ELSE
    RAISE NOTICE 'user_points table does not exist, skipping view creation';
  END IF;
END $$;

-- ============================================
-- 第七步：验证所有表是否创建成功
-- ============================================
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM (
  SELECT 'user_points' as table_name
  UNION ALL
  SELECT 'achievements' as table_name
  UNION ALL
  SELECT 'user_achievements' as table_name
) t
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = t.table_name
);

-- ============================================
-- 完成！
-- ============================================
SELECT 'SmallTalk 社交功能基本架构创建完成！(超安全版)' as status;
