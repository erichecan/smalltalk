-- SmallTalk 数据库简单重建脚本
-- 创建时间: 2025-01-31 12:45:00
-- 用途: 测试阶段简单粗暴重建数据库
-- 警告: 此脚本会删除所有数据！

-- ============================================
-- 第一阶段：删除所有可能存在的约束和触发器
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '开始数据库重建...';
END $$;

-- 删除触发器
DROP TRIGGER IF EXISTS trigger_update_points_stats ON points_transactions;
DROP TRIGGER IF EXISTS trigger_update_game_stats ON game_sessions;
DROP TRIGGER IF EXISTS trigger_update_vocabulary_stats ON vocabulary;
DROP TRIGGER IF EXISTS trigger_update_post_counts ON post_interactions;
DROP TRIGGER IF EXISTS trigger_update_friend_counts ON friendships;

-- 删除函数
DROP FUNCTION IF EXISTS update_user_learning_stats();
DROP FUNCTION IF EXISTS update_post_counts();
DROP FUNCTION IF EXISTS update_friend_counts();

-- ============================================
-- 第二阶段：删除所有表（级联删除）
-- ============================================

-- 删除社交表
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS post_interactions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_learning_stats CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 删除现有表数据
DELETE FROM conversation_history;
DELETE FROM vocabulary;
DELETE FROM user_points;
DELETE FROM learning_stats;
DELETE FROM grammar_progress;
DELETE FROM phrases;
DELETE FROM practice_records;
DELETE FROM practice_questions;
DELETE FROM game_sessions;
DELETE FROM points_transactions;
DELETE FROM user_achievements;
DELETE FROM user_learning_profiles;
DELETE FROM word_mastery_records;
DELETE FROM check_in_records;
DELETE FROM user_unlocks;
DELETE FROM achievements;
DELETE FROM learning_topics;

-- ============================================
-- 第三阶段：修复现有表结构
-- ============================================

-- 修复user_id类型
ALTER TABLE conversation_history ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE vocabulary ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE user_points ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE learning_stats ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE grammar_progress ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE phrases ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE practice_records ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- ============================================
-- 第四阶段：创建社交功能表
-- ============================================

-- 好友关系表
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- 社区帖子表
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'general' CHECK (post_type IN ('general', 'achievement', 'question', 'tip', 'milestone')),
    media_urls JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 帖子互动表
CREATE TABLE post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'report')),
    content TEXT,
    parent_comment_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知系统表
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'friend_request', 'friend_accepted', 'comment', 'like', 'mention', 'system', 'level_up')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 用户学习统计表
CREATE TABLE user_learning_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    points_this_week INTEGER DEFAULT 0,
    points_this_month INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    mastered_words INTEGER DEFAULT 0,
    learning_words INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    words_learned_today INTEGER DEFAULT 0,
    practice_sessions_today INTEGER DEFAULT 0,
    points_earned_today INTEGER DEFAULT 0,
    total_quiz_sessions INTEGER DEFAULT 0,
    total_matching_sessions INTEGER DEFAULT 0,
    best_quiz_score INTEGER DEFAULT 0,
    best_matching_score INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户个人资料表
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    location TEXT,
    website TEXT,
    learning_goals TEXT[],
    interests TEXT[],
    preferred_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    is_public BOOLEAN DEFAULT true,
    show_progress BOOLEAN DEFAULT true,
    show_achievements BOOLEAN DEFAULT true,
    allow_friend_requests BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 第五阶段：添加外键约束
-- ============================================

-- 基础表外键
ALTER TABLE conversation_history ADD CONSTRAINT conversation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE vocabulary ADD CONSTRAINT vocabulary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_points ADD CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE learning_stats ADD CONSTRAINT learning_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE grammar_progress ADD CONSTRAINT grammar_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE phrases ADD CONSTRAINT phrases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE practice_records ADD CONSTRAINT practice_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE practice_records ADD CONSTRAINT practice_records_vocabulary_id_fkey FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE;
ALTER TABLE game_sessions ADD CONSTRAINT game_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE practice_questions ADD CONSTRAINT practice_questions_word_id_fkey FOREIGN KEY (word_id) REFERENCES vocabulary(id) ON DELETE CASCADE;
ALTER TABLE practice_questions ADD CONSTRAINT practice_questions_session_id_fkey FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE;
ALTER TABLE points_transactions ADD CONSTRAINT points_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE;
ALTER TABLE user_learning_profiles ADD CONSTRAINT user_learning_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE word_mastery_records ADD CONSTRAINT word_mastery_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE word_mastery_records ADD CONSTRAINT word_mastery_records_word_id_fkey FOREIGN KEY (word_id) REFERENCES vocabulary(id) ON DELETE CASCADE;
ALTER TABLE check_in_records ADD CONSTRAINT check_in_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_unlocks ADD CONSTRAINT user_unlocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 社交表外键
ALTER TABLE friendships ADD CONSTRAINT friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE friendships ADD CONSTRAINT friendships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE post_interactions ADD CONSTRAINT post_interactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
ALTER TABLE post_interactions ADD CONSTRAINT post_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE post_interactions ADD CONSTRAINT post_interactions_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES post_interactions(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_learning_stats ADD CONSTRAINT user_learning_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 第六阶段：创建索引
-- ============================================

CREATE INDEX idx_user_learning_stats_total_points ON user_learning_stats(total_points DESC);
CREATE INDEX idx_user_learning_stats_level ON user_learning_stats(level DESC);
CREATE INDEX idx_friendships_requester_status ON friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee_status ON friendships(addressee_id, status);
CREATE INDEX idx_community_posts_user_created ON community_posts(user_id, created_at DESC);
CREATE INDEX idx_community_posts_public_created ON community_posts(is_public, created_at DESC);
CREATE INDEX idx_post_interactions_post_type ON post_interactions(post_id, interaction_type);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_game_sessions_user_created ON game_sessions(user_id, created_at DESC);
CREATE INDEX idx_points_transactions_user_created ON points_transactions(user_id, created_at DESC);

-- ============================================
-- 第七阶段：初始化数据
-- ============================================

-- 初始化成就
INSERT INTO achievements (id, category, name, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'learning', 'First Conversation', 'Complete your first AI conversation', '💬', 'common', 10, '{"conversations": 1}'),
('vocabulary_builder', 'learning', 'Vocabulary Builder', 'Learn your first 10 words', '📚', 'common', 20, '{"words_learned": 10}'),
('quiz_master', 'learning', 'Quiz Master', 'Complete 5 quiz sessions', '🎯', 'common', 15, '{"quiz_sessions": 5}'),
('social_butterfly', 'social', 'Social Butterfly', 'Make your first friend', '👥', 'common', 25, '{"friends": 1}'),
('streak_starter', 'streak', 'Streak Starter', 'Maintain a 3-day learning streak', '🔥', 'rare', 30, '{"streak_days": 3}'),
('point_collector', 'challenge', 'Point Collector', 'Earn 100 total points', '⭐', 'rare', 50, '{"total_points": 100}');

-- 初始化学习主题
INSERT INTO learning_topics (name, name_en, category, difficulty_level, description, description_en) VALUES
('日常对话', 'Daily Conversation', 'conversation', 1, '学习日常生活中的基本对话', 'Learn basic conversations for daily life'),
('商务英语', 'Business English', 'business', 3, '掌握商务场景中的专业用语', 'Master professional terms in business scenarios'),
('旅游英语', 'Travel English', 'travel', 2, '旅行时必备的英语表达', 'Essential English expressions for travel'),
('学术英语', 'Academic English', 'academic', 4, '学术写作和研究中的英语', 'English for academic writing and research');

-- ============================================
-- 第八阶段：验证
-- ============================================

DO $$
DECLARE
    social_tables INTEGER;
BEGIN
    SELECT COUNT(*) INTO social_tables 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('friendships', 'community_posts', 'post_interactions', 'notifications', 'user_learning_stats', 'user_profiles');
    
    RAISE NOTICE '✅ 数据库重建完成';
    RAISE NOTICE '   社交功能表: % / 6', social_tables;
    RAISE NOTICE '   基础成就: %', (SELECT COUNT(*) FROM achievements);
    RAISE NOTICE '   学习主题: %', (SELECT COUNT(*) FROM learning_topics);
    
    IF social_tables = 6 THEN
        RAISE NOTICE '🎉 重建成功！可以开始开发';
    END IF;
END $$;