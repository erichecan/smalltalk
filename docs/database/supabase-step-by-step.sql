-- SmallTalk 社交功能分步执行版
-- 创建时间: 2025-01-31 11:30:00
-- 使用方法: 每次只执行一个步骤，确保成功后再执行下一步

-- ============================================
-- 步骤1: 删除可能存在的旧表 (可选)
-- ============================================
-- 如果遇到错误，请先执行这个步骤
/*
DROP VIEW IF EXISTS leaderboard_view CASCADE;
DROP VIEW IF EXISTS user_achievements_progress CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS post_interactions CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS community_topics CASCADE;
DROP TABLE IF EXISTS friend_activities CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_learning_stats CASCADE;
DROP TABLE IF EXISTS points_transactions CASCADE;
DROP TABLE IF EXISTS user_points CASCADE;
*/

-- ============================================
-- 步骤2: 创建用户积分表
-- ============================================
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  daily_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  yearly_points INTEGER DEFAULT 0,
  streak_bonus INTEGER DEFAULT 0,
  achievement_bonus INTEGER DEFAULT 0,
  user_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  next_level_points INTEGER DEFAULT 100,
  rank_position INTEGER DEFAULT 0,
  last_daily_reset DATE DEFAULT CURRENT_DATE,
  last_weekly_reset DATE DEFAULT CURRENT_DATE,
  last_monthly_reset DATE DEFAULT CURRENT_DATE,
  last_yearly_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 步骤3: 创建积分交易记录表
-- ============================================
CREATE TABLE IF NOT EXISTS points_transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus')),
  points INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 步骤4: 创建用户学习统计表
-- ============================================
CREATE TABLE IF NOT EXISTS user_learning_stats (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_conversations INTEGER DEFAULT 0,
  total_vocabulary INTEGER DEFAULT 0,
  mastered_vocabulary INTEGER DEFAULT 0,
  total_practice_sessions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
  average_session_time INTEGER DEFAULT 0,
  last_activity_date DATE,
  preferred_difficulty TEXT DEFAULT 'medium',
  learning_goals JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 步骤5: 创建成就定义表
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('conversation', 'vocabulary', 'practice', 'social', 'streak', 'special')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_reward INTEGER DEFAULT 0,
  requirements JSONB NOT NULL,
  unlock_order INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  badge_color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 步骤6: 创建用户成就记录表
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  total_required INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 步骤7: 创建好友关系表
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id TEXT NOT NULL,
  addressee_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- ============================================
-- 步骤8: 创建好友活动表
-- ============================================
CREATE TABLE IF NOT EXISTS friend_activities (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('conversation', 'vocabulary_learned', 'achievement_unlocked', 'streak_milestone', 'level_up')),
  activity_data JSONB DEFAULT '{}',
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 步骤9: 创建社区帖子表
-- ============================================
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('achievement', 'tip', 'question', 'celebration', 'general')),
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  attachments JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 步骤10: 创建帖子互动表
-- ============================================
CREATE TABLE IF NOT EXISTS post_interactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'report')),
  content TEXT,
  parent_comment_id INTEGER REFERENCES post_interactions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- ============================================
-- 步骤11: 创建社区话题表
-- ============================================
CREATE TABLE IF NOT EXISTS community_topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#10B981',
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name)
);

-- ============================================
-- 步骤12: 创建通知表
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('friend_request', 'friend_accepted', 'achievement_unlocked', 'post_liked', 'post_commented', 'level_up', 'streak_reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- ============================================
-- 步骤13: 创建索引
-- ============================================
-- 积分系统索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_level ON user_points(user_level DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_source ON points_transactions(source);

CREATE INDEX IF NOT EXISTS idx_user_learning_stats_user_id ON user_learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_stats_total_conversations ON user_learning_stats(total_conversations DESC);
CREATE INDEX IF NOT EXISTS idx_user_learning_stats_current_streak ON user_learning_stats(current_streak DESC);

-- 成就系统索引
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_unlock_order ON achievements(unlock_order);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(is_completed, completed_at DESC);

-- 好友系统索引
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON friendships(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_friend_activities_user_id ON friend_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_activities_created_at ON friend_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_activities_type ON friend_activities(activity_type);

-- 社区功能索引
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility ON community_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes ON community_posts(likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);

-- 通知系统索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- ============================================
-- 步骤14: 插入初始数据
-- ============================================
-- 插入基础成就
INSERT INTO achievements (id, category, title, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'conversation', 'First Conversation', 'Complete your first conversation', 'chat_bubble', 'common', 10, '{"type": "conversation_count", "value": 1}'),
('conversations_10', 'conversation', '10 Conversations', 'Complete 10 conversations', 'forum', 'common', 50, '{"type": "conversation_count", "value": 10}'),
('conversations_50', 'conversation', '50 Conversations', 'Complete 50 conversations', 'speaker_notes', 'rare', 200, '{"type": "conversation_count", "value": 50}'),
('first_word', 'vocabulary', 'First Word', 'Learn your first word', 'book', 'common', 5, '{"type": "vocabulary_count", "value": 1}'),
('vocabulary_100', 'vocabulary', '100 Words', 'Learn 100 words', 'library_books', 'common', 100, '{"type": "vocabulary_count", "value": 100}'),
('vocabulary_500', 'vocabulary', '500 Words', 'Learn 500 words', 'auto_stories', 'rare', 300, '{"type": "vocabulary_count", "value": 500}'),
('first_practice', 'practice', 'First Practice', 'Complete your first practice session', 'quiz', 'common', 10, '{"type": "practice_count", "value": 1}'),
('streak_3', 'streak', '3 Day Streak', 'Learn for 3 consecutive days', 'local_fire_department', 'common', 30, '{"type": "streak_days", "value": 3}'),
('streak_7', 'streak', '7 Day Streak', 'Learn for 7 consecutive days', 'whatshot', 'common', 70, '{"type": "streak_days", "value": 7}'),
('first_friend', 'social', 'First Friend', 'Add your first friend', 'person_add', 'common', 20, '{"type": "friend_count", "value": 1}')
ON CONFLICT (id) DO NOTHING;

-- 插入基础话题
INSERT INTO community_topics (name, description, icon, color) VALUES
('General Discussion', 'Share anything about language learning', 'chat', '#10B981'),
('Grammar Help', 'Ask questions about grammar rules', 'school', '#3B82F6'),
('Vocabulary Tips', 'Share and discover new words', 'book', '#8B5CF6'),
('Practice Partners', 'Find people to practice with', 'people', '#F59E0B'),
('Achievements', 'Celebrate your learning milestones', 'emoji_events', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 步骤15: 创建视图 (最后执行)
-- ============================================
-- 排行榜视图
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  up.user_id,
  up.total_points,
  up.user_level,
  COALESCE(uls.current_streak, 0) as current_streak,
  COALESCE(uls.total_conversations, 0) as total_conversations,
  COALESCE(uls.mastered_vocabulary, 0) as mastered_vocabulary,
  ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as current_rank
FROM user_points up
LEFT JOIN user_learning_stats uls ON up.user_id = uls.user_id
ORDER BY up.total_points DESC;

-- 用户成就进度视图
CREATE OR REPLACE VIEW user_achievements_progress AS
SELECT 
  ua.user_id,
  ua.achievement_id,
  a.category,
  a.title,
  a.description,
  a.icon,
  a.rarity,
  a.points_reward,
  ua.progress,
  ua.total_required,
  ua.is_completed,
  ua.completed_at,
  CASE 
    WHEN ua.total_required > 0 THEN ROUND((ua.progress::decimal / ua.total_required) * 100, 2)
    ELSE 0 
  END as progress_percentage
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
WHERE a.is_active = true;

-- ============================================
-- 完成！
-- ============================================
SELECT 'SmallTalk 社交功能数据库架构创建完成！(分步执行版)' as status;
