-- SmallTalk 社交功能数据库安装脚本
-- 创建时间: 2025-01-31 10:15:00
-- 用途: 快速安装社交功能所需的数据库表和初始数据
-- 使用方法: 在Supabase SQL编辑器中直接运行此脚本

-- ============================================
-- 检查和创建基础表结构
-- ============================================

-- 1. 用户积分表
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  daily_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  rank_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. 积分交易记录表
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus')),
  points INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户学习统计表
CREATE TABLE IF NOT EXISTS user_learning_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_conversations INTEGER DEFAULT 0,
  total_vocabulary INTEGER DEFAULT 0,
  mastered_vocabulary INTEGER DEFAULT 0,
  total_practice_sessions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. 成就定义表
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('conversation', 'vocabulary', 'practice', 'social', 'streak', 'special')),
  name_key TEXT NOT NULL,
  description_key TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_reward INTEGER DEFAULT 0,
  requirements JSONB NOT NULL,
  unlock_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  badge_color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 用户成就记录表
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  total_required INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 6. 好友关系表
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- 7. 社区帖子表
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('achievement', 'tip', 'question', 'celebration', 'general')),
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  attachments JSONB DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 帖子互动表
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'report')),
  content TEXT,
  parent_comment_id UUID REFERENCES post_interactions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- 9. 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('friend_request', 'friend_accepted', 'achievement_unlocked', 'post_liked', 'post_commented', 'level_up', 'streak_reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 创建必要的索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_stats_user_id ON user_learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- 启用行级安全策略 (RLS)
-- ============================================

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 创建基础安全策略
-- ============================================

-- 用户积分策略
CREATE POLICY "Users can view their own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON user_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 积分交易记录策略
CREATE POLICY "Users can view their own transactions" ON points_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON points_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户成就策略
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 好友关系策略
CREATE POLICY "Users can view friendships they are part of" ON friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can create friend requests" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update friendships they are part of" ON friendships
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 社区帖子策略
CREATE POLICY "Users can view public posts" ON community_posts
  FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users can create their own posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 通知策略
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 插入初始成就数据
-- ============================================

INSERT INTO achievements (id, category, name_key, description_key, icon, rarity, points_reward, requirements) VALUES
-- 对话类成就
('first_conversation', 'conversation', 'achievements.first_conversation.name', 'achievements.first_conversation.description', 'chat_bubble', 'common', 10, '{"type": "conversation_count", "value": 1}'),
('conversations_10', 'conversation', 'achievements.conversations_10.name', 'achievements.conversations_10.description', 'forum', 'common', 50, '{"type": "conversation_count", "value": 10}'),
('conversations_50', 'conversation', 'achievements.conversations_50.name', 'achievements.conversations_50.description', 'speaker_notes', 'rare', 200, '{"type": "conversation_count", "value": 50}'),
('conversations_100', 'conversation', 'achievements.conversations_100.name', 'achievements.conversations_100.description', 'record_voice_over', 'epic', 500, '{"type": "conversation_count", "value": 100}'),

-- 词汇类成就
('first_word', 'vocabulary', 'achievements.first_word.name', 'achievements.first_word.description', 'book', 'common', 5, '{"type": "vocabulary_count", "value": 1}'),
('vocabulary_100', 'vocabulary', 'achievements.vocabulary_100.name', 'achievements.vocabulary_100.description', 'library_books', 'common', 100, '{"type": "vocabulary_count", "value": 100}'),
('vocabulary_500', 'vocabulary', 'achievements.vocabulary_500.name', 'achievements.vocabulary_500.description', 'auto_stories', 'rare', 300, '{"type": "vocabulary_count", "value": 500}'),
('vocabulary_1000', 'vocabulary', 'achievements.vocabulary_1000.name', 'achievements.vocabulary_1000.description', 'menu_book', 'epic', 800, '{"type": "vocabulary_count", "value": 1000}'),

-- 练习类成就
('first_practice', 'practice', 'achievements.first_practice.name', 'achievements.first_practice.description', 'quiz', 'common', 10, '{"type": "practice_count", "value": 1}'),
('practice_perfectionist', 'practice', 'achievements.practice_perfectionist.name', 'achievements.practice_perfectionist.description', 'grade', 'rare', 150, '{"type": "perfect_scores", "value": 10}'),

-- 连击类成就
('streak_3', 'streak', 'achievements.streak_3.name', 'achievements.streak_3.description', 'local_fire_department', 'common', 30, '{"type": "streak_days", "value": 3}'),
('streak_7', 'streak', 'achievements.streak_7.name', 'achievements.streak_7.description', 'whatshot', 'common', 70, '{"type": "streak_days", "value": 7}'),
('streak_30', 'streak', 'achievements.streak_30.name', 'achievements.streak_30.description', 'fireplace', 'rare', 300, '{"type": "streak_days", "value": 30}'),
('streak_100', 'streak', 'achievements.streak_100.name', 'achievements.streak_100.description', 'offline_bolt', 'legendary', 1000, '{"type": "streak_days", "value": 100}'),

-- 社交类成就
('first_friend', 'social', 'achievements.first_friend.name', 'achievements.first_friend.description', 'person_add', 'common', 20, '{"type": "friend_count", "value": 1}'),
('social_butterfly', 'social', 'achievements.social_butterfly.name', 'achievements.social_butterfly.description', 'group', 'rare', 100, '{"type": "friend_count", "value": 10}'),
('community_member', 'social', 'achievements.community_member.name', 'achievements.community_member.description', 'forum', 'common', 25, '{"type": "community_posts", "value": 1}')

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 创建有用的视图
-- ============================================

-- 排行榜视图
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(up.total_points, 0) as total_points,
  COALESCE(up.level, 1) as level,
  COALESCE(uls.current_streak, 0) as current_streak,
  COALESCE(uls.total_conversations, 0) as total_conversations,
  COALESCE(uls.mastered_vocabulary, 0) as mastered_vocabulary,
  ROW_NUMBER() OVER (ORDER BY COALESCE(up.total_points, 0) DESC) as current_rank
FROM auth.users u
LEFT JOIN user_points up ON u.id = up.user_id
LEFT JOIN user_learning_stats uls ON u.id = uls.user_id
ORDER BY COALESCE(up.total_points, 0) DESC;

-- 用户成就进度视图
CREATE OR REPLACE VIEW user_achievements_progress AS
SELECT 
  ua.user_id,
  ua.achievement_id,
  a.category,
  a.name_key,
  a.description_key,
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
-- 完成安装
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SmallTalk 社交功能安装完成！';
  RAISE NOTICE '包含:';
  RAISE NOTICE '- 积分和排行榜系统';
  RAISE NOTICE '- 成就和徽章系统';  
  RAISE NOTICE '- 好友管理系统';
  RAISE NOTICE '- 社区功能基础';
  RAISE NOTICE '- 通知系统';
  RAISE NOTICE '- 安全策略 (RLS)';
  RAISE NOTICE '- 优化视图';
  RAISE NOTICE '==========================================';
END $$;