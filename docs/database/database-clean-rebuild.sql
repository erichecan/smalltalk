-- SmallTalk 数据库清空重建脚本
-- 创建时间: 2025-01-31 12:30:00
-- 用途: 测试阶段清空所有数据，重建完整社交功能数据库
-- 警告: 此脚本会删除所有用户数据！仅适用于开发/测试环境！

-- ============================================
-- 第一阶段：清空所有现有数据和约束
-- ============================================

-- 警告提示
DO $$
BEGIN
    RAISE NOTICE '⚠️  警告：即将清空所有用户数据！';
    RAISE NOTICE '🕐 开始时间: %', NOW();
    RAISE NOTICE '🎯 目标：重建完整社交功能数据库';
END $$;

-- 删除所有外键约束
ALTER TABLE IF EXISTS practice_records DROP CONSTRAINT IF EXISTS practice_records_vocabulary_id_fkey CASCADE;
ALTER TABLE IF EXISTS practice_questions DROP CONSTRAINT IF EXISTS practice_questions_word_id_fkey CASCADE;
ALTER TABLE IF EXISTS practice_questions DROP CONSTRAINT IF EXISTS practice_questions_session_id_fkey CASCADE;
ALTER TABLE IF EXISTS user_achievements DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey CASCADE;
ALTER TABLE IF EXISTS user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS user_learning_profiles DROP CONSTRAINT IF EXISTS user_learning_profiles_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS word_mastery_records DROP CONSTRAINT IF EXISTS word_mastery_records_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS word_mastery_records DROP CONSTRAINT IF EXISTS word_mastery_records_word_id_fkey CASCADE;
ALTER TABLE IF EXISTS check_in_records DROP CONSTRAINT IF EXISTS check_in_records_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS game_sessions DROP CONSTRAINT IF EXISTS game_sessions_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS points_transactions DROP CONSTRAINT IF EXISTS points_transactions_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS user_unlocks DROP CONSTRAINT IF EXISTS user_unlocks_user_id_fkey CASCADE;

-- 删除所有触发器
DROP TRIGGER IF EXISTS trigger_update_points_stats ON points_transactions;
DROP TRIGGER IF EXISTS trigger_update_game_stats ON game_sessions;
DROP TRIGGER IF EXISTS trigger_update_vocabulary_stats ON vocabulary;
DROP TRIGGER IF EXISTS trigger_update_post_counts ON post_interactions;
DROP TRIGGER IF EXISTS trigger_update_friend_counts ON friendships;

-- 删除所有触发器函数
DROP FUNCTION IF EXISTS update_user_learning_stats() CASCADE;
DROP FUNCTION IF EXISTS update_post_counts() CASCADE;
DROP FUNCTION IF EXISTS update_friend_counts() CASCADE;

-- 清空所有表数据
TRUNCATE TABLE IF EXISTS conversation_history CASCADE;
TRUNCATE TABLE IF EXISTS vocabulary CASCADE;
TRUNCATE TABLE IF EXISTS user_points CASCADE;
TRUNCATE TABLE IF EXISTS learning_stats CASCADE;
TRUNCATE TABLE IF EXISTS grammar_progress CASCADE;
TRUNCATE TABLE IF EXISTS phrases CASCADE;
TRUNCATE TABLE IF EXISTS practice_records CASCADE;
TRUNCATE TABLE IF EXISTS practice_questions CASCADE;
TRUNCATE TABLE IF EXISTS game_sessions CASCADE;
TRUNCATE TABLE IF EXISTS points_transactions CASCADE;
TRUNCATE TABLE IF EXISTS user_achievements CASCADE;
TRUNCATE TABLE IF EXISTS user_learning_profiles CASCADE;
TRUNCATE TABLE IF EXISTS word_mastery_records CASCADE;
TRUNCATE TABLE IF EXISTS check_in_records CASCADE;
TRUNCATE TABLE IF EXISTS user_unlocks CASCADE;
TRUNCATE TABLE IF EXISTS achievements CASCADE;
TRUNCATE TABLE IF EXISTS learning_topics CASCADE;

-- 删除可能存在的社交表
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS post_interactions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_learning_stats CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================
-- 第二阶段：统一所有表的user_id类型为UUID
-- ============================================

-- 修复所有表的user_id类型
ALTER TABLE conversation_history ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE vocabulary ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE user_points ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE learning_stats ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE grammar_progress ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE phrases ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE practice_records ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- ============================================
-- 第三阶段：创建完整的社交功能表结构
-- ============================================

-- 好友关系表
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- 社区帖子表
CREATE TABLE public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'general' 
        CHECK (post_type IN ('general', 'achievement', 'question', 'tip', 'milestone')),
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
CREATE TABLE public.post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL 
        CHECK (interaction_type IN ('like', 'comment', 'share', 'report')),
    content TEXT,
    parent_comment_id UUID REFERENCES post_interactions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知系统表
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL 
        CHECK (type IN ('achievement', 'friend_request', 'friend_accepted', 'comment', 'like', 'mention', 'system', 'level_up')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 用户学习统计表（整合版本）
CREATE TABLE public.user_learning_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- 积分和等级
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    points_this_week INTEGER DEFAULT 0,
    points_this_month INTEGER DEFAULT 0,
    -- 学习统计
    total_words INTEGER DEFAULT 0,
    mastered_words INTEGER DEFAULT 0,
    learning_words INTEGER DEFAULT 0,
    -- 连续学习
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    -- 今日统计
    words_learned_today INTEGER DEFAULT 0,
    practice_sessions_today INTEGER DEFAULT 0,
    points_earned_today INTEGER DEFAULT 0,
    -- 游戏统计
    total_quiz_sessions INTEGER DEFAULT 0,
    total_matching_sessions INTEGER DEFAULT 0,
    best_quiz_score INTEGER DEFAULT 0,
    best_matching_score INTEGER DEFAULT 0,
    -- 社交统计
    friends_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户个人资料表
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
-- 第四阶段：重新创建所有外键约束
-- ============================================

-- 基础表外键约束
ALTER TABLE conversation_history 
ADD CONSTRAINT conversation_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE vocabulary 
ADD CONSTRAINT vocabulary_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_points 
ADD CONSTRAINT user_points_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE learning_stats 
ADD CONSTRAINT learning_stats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE grammar_progress 
ADD CONSTRAINT grammar_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE phrases 
ADD CONSTRAINT phrases_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE practice_records 
ADD CONSTRAINT practice_records_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE practice_records 
ADD CONSTRAINT practice_records_vocabulary_id_fkey 
FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE;

-- 游戏和练习表外键
ALTER TABLE game_sessions 
ADD CONSTRAINT game_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE practice_questions 
ADD CONSTRAINT practice_questions_word_id_fkey 
FOREIGN KEY (word_id) REFERENCES vocabulary(id) ON DELETE CASCADE;

ALTER TABLE practice_questions 
ADD CONSTRAINT practice_questions_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE;

ALTER TABLE points_transactions 
ADD CONSTRAINT points_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 成就系统外键
ALTER TABLE user_achievements 
ADD CONSTRAINT user_achievements_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_achievements 
ADD CONSTRAINT user_achievements_achievement_id_fkey 
FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE;

-- 其他表外键
ALTER TABLE user_learning_profiles 
ADD CONSTRAINT user_learning_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE word_mastery_records 
ADD CONSTRAINT word_mastery_records_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE word_mastery_records 
ADD CONSTRAINT word_mastery_records_word_id_fkey 
FOREIGN KEY (word_id) REFERENCES vocabulary(id) ON DELETE CASCADE;

ALTER TABLE check_in_records 
ADD CONSTRAINT check_in_records_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_unlocks 
ADD CONSTRAINT user_unlocks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 第五阶段：创建性能优化索引
-- ============================================

-- 积分和排行榜索引
CREATE INDEX idx_user_learning_stats_total_points ON user_learning_stats(total_points DESC);
CREATE INDEX idx_user_learning_stats_level ON user_learning_stats(level DESC);
CREATE INDEX idx_user_learning_stats_weekly_points ON user_learning_stats(points_this_week DESC);
CREATE INDEX idx_user_learning_stats_current_streak ON user_learning_stats(current_streak DESC);

-- 好友系统索引
CREATE INDEX idx_friendships_requester_status ON friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee_status ON friendships(addressee_id, status);
CREATE INDEX idx_friendships_status_created ON friendships(status, created_at DESC);

-- 社区功能索引
CREATE INDEX idx_community_posts_user_created ON community_posts(user_id, created_at DESC);
CREATE INDEX idx_community_posts_public_created ON community_posts(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX idx_community_posts_type_created ON community_posts(post_type, created_at DESC);
CREATE INDEX idx_post_interactions_post_type ON post_interactions(post_id, interaction_type);
CREATE INDEX idx_post_interactions_user_created ON post_interactions(user_id, created_at DESC);

-- 通知系统索引
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type_created ON notifications(type, created_at DESC);

-- 游戏和学习索引
CREATE INDEX idx_game_sessions_user_created ON game_sessions(user_id, created_at DESC);
CREATE INDEX idx_game_sessions_type_score ON game_sessions(game_type, score DESC);
CREATE INDEX idx_points_transactions_user_created ON points_transactions(user_id, created_at DESC);
CREATE INDEX idx_points_transactions_source ON points_transactions(source, created_at DESC);

-- 词汇学习索引
CREATE INDEX idx_vocabulary_user_mastery ON vocabulary(user_id, mastery_level);
CREATE INDEX idx_vocabulary_next_review ON vocabulary(next_review) WHERE next_review IS NOT NULL;
CREATE INDEX idx_word_mastery_user_level ON word_mastery_records(user_id, mastery_level);

-- ============================================
-- 第六阶段：创建自动化触发器函数
-- ============================================

-- 更新用户统计的触发器函数
CREATE OR REPLACE FUNCTION update_user_learning_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- 获取用户ID
    current_user_id := CASE 
        WHEN TG_TABLE_NAME = 'points_transactions' THEN NEW.user_id
        WHEN TG_TABLE_NAME = 'game_sessions' THEN NEW.user_id
        WHEN TG_TABLE_NAME = 'vocabulary' THEN NEW.user_id
        ELSE NEW.user_id
    END;
    
    -- 确保用户统计记录存在
    INSERT INTO user_learning_stats (user_id) 
    VALUES (current_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 根据触发表更新相应统计
    IF TG_TABLE_NAME = 'points_transactions' AND TG_OP = 'INSERT' THEN
        -- 更新积分统计
        UPDATE user_learning_stats 
        SET 
            total_points = total_points + NEW.points,
            points_earned_today = CASE 
                WHEN last_study_date = current_date 
                THEN points_earned_today + NEW.points
                ELSE NEW.points
            END,
            last_study_date = current_date,
            level = (total_points + NEW.points) / 100 + 1,
            updated_at = NOW()
        WHERE user_id = current_user_id;
        
    ELSIF TG_TABLE_NAME = 'game_sessions' AND TG_OP = 'INSERT' THEN
        -- 更新游戏统计
        UPDATE user_learning_stats 
        SET 
            total_quiz_sessions = CASE 
                WHEN NEW.game_type = 'quiz' THEN total_quiz_sessions + 1
                ELSE total_quiz_sessions
            END,
            total_matching_sessions = CASE 
                WHEN NEW.game_type = 'matching' THEN total_matching_sessions + 1
                ELSE total_matching_sessions
            END,
            best_quiz_score = CASE 
                WHEN NEW.game_type = 'quiz' AND NEW.score > best_quiz_score THEN NEW.score
                ELSE best_quiz_score
            END,
            best_matching_score = CASE 
                WHEN NEW.game_type = 'matching' AND NEW.score > best_matching_score THEN NEW.score
                ELSE best_matching_score
            END,
            practice_sessions_today = CASE 
                WHEN last_study_date = current_date 
                THEN practice_sessions_today + 1
                ELSE 1
            END,
            last_study_date = current_date,
            updated_at = NOW()
        WHERE user_id = current_user_id;
        
    ELSIF TG_TABLE_NAME = 'vocabulary' AND TG_OP = 'INSERT' THEN
        -- 更新词汇统计
        UPDATE user_learning_stats 
        SET 
            total_words = total_words + 1,
            words_learned_today = CASE 
                WHEN last_study_date = current_date 
                THEN words_learned_today + 1
                ELSE 1
            END,
            last_study_date = current_date,
            updated_at = NOW()
        WHERE user_id = current_user_id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新帖子计数的触发器函数
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.interaction_type = 'like' THEN
            UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.interaction_type = 'comment' THEN
            UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.interaction_type = 'share' THEN
            UPDATE community_posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.interaction_type = 'like' THEN
            UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
        ELSIF OLD.interaction_type = 'comment' THEN
            UPDATE community_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
        ELSIF OLD.interaction_type = 'share' THEN
            UPDATE community_posts SET shares_count = GREATEST(shares_count - 1, 0) WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 更新好友计数的触发器函数
CREATE OR REPLACE FUNCTION update_friend_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        UPDATE user_learning_stats SET friends_count = friends_count + 1 
        WHERE user_id IN (NEW.requester_id, NEW.addressee_id);
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        UPDATE user_learning_stats SET friends_count = friends_count + 1 
        WHERE user_id IN (NEW.requester_id, NEW.addressee_id);
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
        UPDATE user_learning_stats SET friends_count = GREATEST(friends_count - 1, 0)
        WHERE user_id IN (OLD.requester_id, OLD.addressee_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 第七阶段：创建触发器
-- ============================================

-- 积分和游戏统计触发器
CREATE TRIGGER trigger_update_points_stats
    AFTER INSERT ON points_transactions
    FOR EACH ROW EXECUTE FUNCTION update_user_learning_stats();

CREATE TRIGGER trigger_update_game_stats
    AFTER INSERT ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_learning_stats();

CREATE TRIGGER trigger_update_vocabulary_stats
    AFTER INSERT ON vocabulary
    FOR EACH ROW EXECUTE FUNCTION update_user_learning_stats();

-- 社区互动触发器
CREATE TRIGGER trigger_update_post_counts
    AFTER INSERT OR DELETE ON post_interactions
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- 好友关系触发器
CREATE TRIGGER trigger_update_friend_counts
    AFTER INSERT OR UPDATE OR DELETE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_friend_counts();

-- ============================================
-- 第八阶段：启用RLS和创建安全策略
-- ============================================

-- 启用行级安全
ALTER TABLE user_learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 用户统计策略
CREATE POLICY "Users can view their own stats" ON user_learning_stats
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON user_learning_stats
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert user stats" ON user_learning_stats
    FOR INSERT WITH CHECK (true);

-- 用户资料策略
CREATE POLICY "Users can view public profiles" ON user_profiles
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- 好友关系策略
CREATE POLICY "Users can view their friendships" ON friendships
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can manage their friendships" ON friendships
    FOR ALL USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 社区帖子策略
CREATE POLICY "Users can view public posts" ON community_posts
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage their posts" ON community_posts
    FOR ALL USING (auth.uid() = user_id);

-- 帖子互动策略
CREATE POLICY "Users can view post interactions" ON post_interactions
    FOR SELECT USING (true);
CREATE POLICY "Users can manage their interactions" ON post_interactions
    FOR ALL USING (auth.uid() = user_id);

-- 通知策略
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 第九阶段：初始化基础数据
-- ============================================

-- 初始化成就数据
INSERT INTO achievements (id, category, name, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'learning', 'First Conversation', 'Complete your first AI conversation', '💬', 'common', 10, '{"conversations": 1}'),
('vocabulary_builder', 'learning', 'Vocabulary Builder', 'Learn your first 10 words', '📚', 'common', 20, '{"words_learned": 10}'),
('quiz_master', 'learning', 'Quiz Master', 'Complete 5 quiz sessions', '🎯', 'common', 15, '{"quiz_sessions": 5}'),
('social_butterfly', 'social', 'Social Butterfly', 'Make your first friend', '👥', 'common', 25, '{"friends": 1}'),
('streak_starter', 'streak', 'Streak Starter', 'Maintain a 3-day learning streak', '🔥', 'rare', 30, '{"streak_days": 3}'),
('point_collector', 'challenge', 'Point Collector', 'Earn 100 total points', '⭐', 'rare', 50, '{"total_points": 100}'),
('word_master', 'learning', 'Word Master', 'Master 50 words', '🏆', 'epic', 100, '{"mastered_words": 50}'),
('social_star', 'social', 'Social Star', 'Get 10 friends', '🌟', 'epic', 150, '{"friends": 10}'),
('streak_legend', 'streak', 'Streak Legend', 'Maintain a 30-day streak', '🔥', 'legendary', 500, '{"streak_days": 30}');

-- 初始化学习主题
INSERT INTO learning_topics (name, name_en, category, difficulty_level, description, description_en, color_theme) VALUES
('日常对话', 'Daily Conversation', 'conversation', 1, '学习日常生活中的基本对话', 'Learn basic conversations for daily life', '#4CAF50'),
('商务英语', 'Business English', 'business', 3, '掌握商务场景中的专业用语', 'Master professional terms in business scenarios', '#2196F3'),
('旅游英语', 'Travel English', 'travel', 2, '旅行时必备的英语表达', 'Essential English expressions for travel', '#FF9800'),
('学术英语', 'Academic English', 'academic', 4, '学术写作和研究中的英语', 'English for academic writing and research', '#9C27B0'),
('面试英语', 'Interview English', 'career', 3, '求职面试的英语技巧', 'English skills for job interviews', '#F44336'),
('生活购物', 'Shopping & Lifestyle', 'lifestyle', 1, '购物和生活场景的英语', 'English for shopping and daily life', '#00BCD4');

-- ============================================
-- 第十阶段：验证和完成
-- ============================================

-- 验证表创建
DO $$
DECLARE
    social_tables INTEGER;
    indexes_count INTEGER;
    triggers_count INTEGER;
BEGIN
    -- 检查社交表
    SELECT COUNT(*) INTO social_tables 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('friendships', 'community_posts', 'post_interactions', 'notifications', 'user_learning_stats', 'user_profiles');
    
    -- 检查索引
    SELECT COUNT(*) INTO indexes_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    -- 检查触发器
    SELECT COUNT(*) INTO triggers_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    RAISE NOTICE '✅ 数据库重建完成统计:';
    RAISE NOTICE '   社交功能表: % / 6', social_tables;
    RAISE NOTICE '   性能索引: %', indexes_count;
    RAISE NOTICE '   自动触发器: %', triggers_count;
    RAISE NOTICE '   基础成就: %', (SELECT COUNT(*) FROM achievements);
    RAISE NOTICE '   学习主题: %', (SELECT COUNT(*) FROM learning_topics);
    
    IF social_tables = 6 THEN
        RAISE NOTICE '🎉 社交功能数据库重建成功！';
        RAISE NOTICE '🚀 现在可以开始开发服务层和UI组件！';
    ELSE
        RAISE WARNING '⚠️ 部分表创建失败，请检查错误日志';
    END IF;
END $$;

-- 完成提示
DO $$
BEGIN
    RAISE NOTICE '🎯 数据库清空重建脚本执行完成！';
    RAISE NOTICE '完成时间: %', NOW();
    RAISE NOTICE '📋 下一步工作:';
    RAISE NOTICE '   1. 创建积分系统服务层 (pointsService.ts)';
    RAISE NOTICE '   2. 重构Profile页面为标签页架构';
    RAISE NOTICE '   3. 实现成就系统服务层';
    RAISE NOTICE '   4. 创建排行榜UI组件';
END $$;