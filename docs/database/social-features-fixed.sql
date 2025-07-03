-- SmallTalk 社交功能数据库架构 (修复版)
-- 创建时间: 2025-01-31 10:30:00
-- 修复内容: 兼容现有数据库架构，使用正确的数据类型
-- 目的: 为SmallTalk应用添加完整的社交功能支持

-- ============================================
-- 1. 用户积分和排行榜系统
-- ============================================

-- 1.1 用户积分表 - 存储用户的各类积分数据
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构的TEXT类型
  total_points INTEGER DEFAULT 0, -- 总积分
  daily_points INTEGER DEFAULT 0, -- 今日积分
  weekly_points INTEGER DEFAULT 0, -- 本周积分
  monthly_points INTEGER DEFAULT 0, -- 本月积分
  yearly_points INTEGER DEFAULT 0, -- 本年积分
  streak_bonus INTEGER DEFAULT 0, -- 连击奖励积分
  achievement_bonus INTEGER DEFAULT 0, -- 成就奖励积分
  user_level INTEGER DEFAULT 1, -- 用户等级 (修改列名避免冲突)
  experience_points INTEGER DEFAULT 0, -- 经验值
  next_level_points INTEGER DEFAULT 100, -- 升级所需积分
  rank_position INTEGER DEFAULT 0, -- 排行榜位置
  last_daily_reset DATE DEFAULT CURRENT_DATE,
  last_weekly_reset DATE DEFAULT CURRENT_DATE,
  last_monthly_reset DATE DEFAULT CURRENT_DATE,
  last_yearly_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 1.2 积分交易记录表 - 记录所有积分变动
CREATE TABLE IF NOT EXISTS points_transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus')),
  points INTEGER NOT NULL, -- 积分数量(正数为获得,负数为消费)
  source TEXT NOT NULL, -- 积分来源: 'conversation', 'practice', 'achievement', 'streak', 'daily_login', 'vocabulary_mastery'
  source_id TEXT, -- 关联记录ID
  description TEXT, -- 交易描述
  metadata JSONB DEFAULT '{}', -- 额外信息(如练习类型、成就名称等)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1.3 用户学习统计表 - 用于排行榜计算
CREATE TABLE IF NOT EXISTS user_learning_stats (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  total_conversations INTEGER DEFAULT 0, -- 总对话数
  total_vocabulary INTEGER DEFAULT 0, -- 总词汇数
  mastered_vocabulary INTEGER DEFAULT 0, -- 已掌握词汇数
  total_practice_sessions INTEGER DEFAULT 0, -- 总练习次数
  current_streak INTEGER DEFAULT 0, -- 当前连续学习天数
  max_streak INTEGER DEFAULT 0, -- 历史最高连续天数
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00, -- 练习准确率
  average_session_time INTEGER DEFAULT 0, -- 平均学习时长(秒)
  last_activity_date DATE, -- 最后活动日期
  preferred_difficulty TEXT DEFAULT 'medium', -- 偏好难度
  learning_goals JSONB DEFAULT '{}', -- 学习目标设置
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 2. 成就和徽章系统
-- ============================================

-- 2.1 成就定义表 - 定义所有可获得的成就
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY, -- 使用字符串ID: 'first_conversation', 'vocab_master_100' 等
  category TEXT NOT NULL CHECK (category IN ('conversation', 'vocabulary', 'practice', 'social', 'streak', 'special')),
  title TEXT NOT NULL, -- 成就标题 (修改列名)
  description TEXT NOT NULL, -- 成就描述 (修改列名)
  icon TEXT NOT NULL, -- 图标名称或URL
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_reward INTEGER DEFAULT 0, -- 完成奖励积分
  requirements JSONB NOT NULL, -- 解锁条件: {"type": "conversation_count", "value": 1}
  unlock_order INTEGER DEFAULT 0, -- 显示顺序
  is_hidden BOOLEAN DEFAULT FALSE, -- 是否为隐藏成就
  is_active BOOLEAN DEFAULT TRUE, -- 是否激活
  badge_color TEXT DEFAULT '#10B981', -- 徽章颜色
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2.2 用户成就记录表 - 记录用户获得的成就
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0, -- 当前进度
  total_required INTEGER DEFAULT 1, -- 总需求量
  is_completed BOOLEAN DEFAULT FALSE, -- 是否完成
  completed_at TIMESTAMP, -- 完成时间
  metadata JSONB DEFAULT '{}', -- 额外数据
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 2.3 成就分享记录表 - 记录成就分享
CREATE TABLE IF NOT EXISTS achievement_shares (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  share_platform TEXT, -- 分享平台: 'community', 'external'
  share_message TEXT, -- 分享消息
  likes_count INTEGER DEFAULT 0, -- 点赞数
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. 好友系统
-- ============================================

-- 3.1 好友关系表 - 存储好友关系
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id TEXT NOT NULL, -- 发起请求的用户，兼容现有架构
  addressee_id TEXT NOT NULL, -- 接收请求的用户，兼容现有架构
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  requested_at TIMESTAMP DEFAULT NOW(), -- 请求时间
  responded_at TIMESTAMP, -- 响应时间
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- 3.2 好友活动表 - 记录好友的学习活动
CREATE TABLE IF NOT EXISTS friend_activities (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  activity_type TEXT NOT NULL CHECK (activity_type IN ('conversation', 'vocabulary_learned', 'achievement_unlocked', 'streak_milestone', 'level_up')),
  activity_data JSONB DEFAULT '{}', -- 活动详细数据
  is_private BOOLEAN DEFAULT FALSE, -- 是否私密(不显示给好友)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3.3 好友排行榜缓存表 - 优化好友排行榜查询
CREATE TABLE IF NOT EXISTS friend_leaderboard_cache (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  friend_id TEXT NOT NULL, -- 兼容现有架构
  friend_rank INTEGER, -- 好友在该用户好友列表中的排名
  points_difference INTEGER, -- 与该用户的积分差
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================
-- 4. 社区功能
-- ============================================

-- 4.1 社区帖子表 - 存储用户发布的内容
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  post_type TEXT NOT NULL CHECK (post_type IN ('achievement', 'tip', 'question', 'celebration', 'general')),
  title TEXT, -- 帖子标题(可选)
  content TEXT NOT NULL, -- 帖子内容
  tags TEXT[], -- 标签数组
  attachments JSONB DEFAULT '{}', -- 附件信息(图片、成就链接等)
  is_pinned BOOLEAN DEFAULT FALSE, -- 是否置顶
  is_featured BOOLEAN DEFAULT FALSE, -- 是否精选
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count INTEGER DEFAULT 0, -- 点赞数
  comments_count INTEGER DEFAULT 0, -- 评论数
  shares_count INTEGER DEFAULT 0, -- 分享数
  views_count INTEGER DEFAULT 0, -- 浏览数
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4.2 帖子互动表 - 记录点赞、评论等互动
CREATE TABLE IF NOT EXISTS post_interactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- 兼容现有架构
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'report')),
  content TEXT, -- 评论内容
  parent_comment_id INTEGER REFERENCES post_interactions(id) ON DELETE CASCADE, -- 回复的评论ID
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id, interaction_type) -- 防止重复点赞
);

-- 4.3 社区话题表 - 管理热门话题和分类
CREATE TABLE IF NOT EXISTS community_topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- 话题名称
  description TEXT, -- 话题描述
  icon TEXT, -- 话题图标
  color TEXT DEFAULT '#10B981', -- 主题色
  posts_count INTEGER DEFAULT 0, -- 帖子数量
  followers_count INTEGER DEFAULT 0, -- 关注数
  is_trending BOOLEAN DEFAULT FALSE, -- 是否为热门话题
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name)
);

-- 4.4 用户关注话题表 - 记录用户关注的话题
CREATE TABLE IF NOT EXISTS user_topic_follows (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- ============================================
-- 5. 通知系统
-- ============================================

-- 5.1 通知表 - 存储所有类型的通知
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 兼容现有架构
  notification_type TEXT NOT NULL CHECK (notification_type IN ('friend_request', 'friend_accepted', 'achievement_unlocked', 'post_liked', 'post_commented', 'level_up', 'streak_reminder')),
  title TEXT NOT NULL, -- 通知标题
  message TEXT NOT NULL, -- 通知内容
  data JSONB DEFAULT '{}', -- 额外数据(如关联的用户ID、帖子ID等)
  is_read BOOLEAN DEFAULT FALSE, -- 是否已读
  action_url TEXT, -- 点击跳转的URL
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP -- 阅读时间
);

-- ============================================
-- 6. 创建索引优化查询性能
-- ============================================

-- 积分系统索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_level ON user_points(user_level DESC);

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
-- 7. 插入初始成就数据
-- ============================================

-- 插入基础成就定义
INSERT INTO achievements (id, category, title, description, icon, rarity, points_reward, requirements) VALUES
-- 对话类成就
('first_conversation', 'conversation', 'First Conversation', 'Complete your first conversation', 'chat_bubble', 'common', 10, '{"type": "conversation_count", "value": 1}'),
('conversations_10', 'conversation', '10 Conversations', 'Complete 10 conversations', 'forum', 'common', 50, '{"type": "conversation_count", "value": 10}'),
('conversations_50', 'conversation', '50 Conversations', 'Complete 50 conversations', 'speaker_notes', 'rare', 200, '{"type": "conversation_count", "value": 50}'),
('conversations_100', 'conversation', '100 Conversations', 'Complete 100 conversations', 'record_voice_over', 'epic', 500, '{"type": "conversation_count", "value": 100}'),

-- 词汇类成就
('first_word', 'vocabulary', 'First Word', 'Learn your first word', 'book', 'common', 5, '{"type": "vocabulary_count", "value": 1}'),
('vocabulary_100', 'vocabulary', '100 Words', 'Learn 100 words', 'library_books', 'common', 100, '{"type": "vocabulary_count", "value": 100}'),
('vocabulary_500', 'vocabulary', '500 Words', 'Learn 500 words', 'auto_stories', 'rare', 300, '{"type": "vocabulary_count", "value": 500}'),
('vocabulary_1000', 'vocabulary', '1000 Words', 'Learn 1000 words', 'menu_book', 'epic', 800, '{"type": "vocabulary_count", "value": 1000}'),

-- 练习类成就
('first_practice', 'practice', 'First Practice', 'Complete your first practice session', 'quiz', 'common', 10, '{"type": "practice_count", "value": 1}'),
('practice_perfectionist', 'practice', 'Perfectionist', 'Get 10 perfect scores', 'grade', 'rare', 150, '{"type": "perfect_scores", "value": 10}'),

-- 连击类成就
('streak_3', 'streak', '3 Day Streak', 'Learn for 3 consecutive days', 'local_fire_department', 'common', 30, '{"type": "streak_days", "value": 3}'),
('streak_7', 'streak', '7 Day Streak', 'Learn for 7 consecutive days', 'whatshot', 'common', 70, '{"type": "streak_days", "value": 7}'),
('streak_30', 'streak', '30 Day Streak', 'Learn for 30 consecutive days', 'fireplace', 'rare', 300, '{"type": "streak_days", "value": 30}'),
('streak_100', 'streak', '100 Day Streak', 'Learn for 100 consecutive days', 'offline_bolt', 'legendary', 1000, '{"type": "streak_days", "value": 100}'),

-- 社交类成就
('first_friend', 'social', 'First Friend', 'Add your first friend', 'person_add', 'common', 20, '{"type": "friend_count", "value": 1}'),
('social_butterfly', 'social', 'Social Butterfly', 'Have 10 friends', 'group', 'rare', 100, '{"type": "friend_count", "value": 10}'),
('community_member', 'social', 'Community Member', 'Make your first community post', 'forum', 'common', 25, '{"type": "community_posts", "value": 1}')

ON CONFLICT (id) DO NOTHING;

-- 初始化基础社区话题
INSERT INTO community_topics (name, description, icon, color) VALUES
('General Discussion', 'Share anything about language learning', 'chat', '#10B981'),
('Grammar Help', 'Ask questions about grammar rules', 'school', '#3B82F6'),
('Vocabulary Tips', 'Share and discover new words', 'book', '#8B5CF6'),
('Practice Partners', 'Find people to practice with', 'people', '#F59E0B'),
('Achievements', 'Celebrate your learning milestones', 'emoji_events', '#EF4444'),
('Study Tips', 'Share effective learning strategies', 'lightbulb', '#06B6D4')

ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. 数据完整性约束和触发器
-- ============================================

-- 创建函数：更新用户积分时自动更新等级
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  -- 简单的等级计算：每100积分升一级
  NEW.user_level = GREATEST(1, NEW.total_points / 100 + 1);
  NEW.next_level_points = NEW.user_level * 100;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_user_level ON user_points;
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF total_points ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- 创建函数：更新帖子统计数据
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts 
    SET 
      likes_count = CASE WHEN NEW.interaction_type = 'like' THEN likes_count + 1 ELSE likes_count END,
      comments_count = CASE WHEN NEW.interaction_type = 'comment' THEN comments_count + 1 ELSE comments_count END,
      shares_count = CASE WHEN NEW.interaction_type = 'share' THEN shares_count + 1 ELSE shares_count END
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts 
    SET 
      likes_count = CASE WHEN OLD.interaction_type = 'like' THEN GREATEST(0, likes_count - 1) ELSE likes_count END,
      comments_count = CASE WHEN OLD.interaction_type = 'comment' THEN GREATEST(0, comments_count - 1) ELSE comments_count END,
      shares_count = CASE WHEN OLD.interaction_type = 'share' THEN GREATEST(0, shares_count - 1) ELSE shares_count END
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_post_stats ON post_interactions;
CREATE TRIGGER trigger_update_post_stats
  AFTER INSERT OR DELETE ON post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_stats();

-- ============================================
-- 9. 创建有用的视图
-- ============================================

-- 排行榜视图 (简化版，兼容现有数据结构)
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
-- 完成！数据库架构创建完毕
-- ============================================

-- 创建成功消息
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'SmallTalk 社交功能数据库架构创建完成！(修复版)';
  RAISE NOTICE '包含功能:';
  RAISE NOTICE '1. 完整的积分和排行榜系统';
  RAISE NOTICE '2. 成就和徽章系统';
  RAISE NOTICE '3. 好友管理系统';
  RAISE NOTICE '4. 社区功能';
  RAISE NOTICE '5. 通知系统';
  RAISE NOTICE '6. 性能优化索引';
  RAISE NOTICE '7. 自动触发器和约束';
  RAISE NOTICE '8. 兼容现有数据库架构';
  RAISE NOTICE '=================================================';
END $$;
