-- SmallTalk 数据库完整修复脚本
-- 创建时间: 2025-01-31 12:00:00
-- 用途: 修复数据库结构问题，添加完整社交功能支持
-- 执行顺序: 严格按照脚本顺序执行

-- ============================================
-- 第一阶段：数据完整性检查和备份
-- ============================================

-- 检查当前表状态
DO $$
BEGIN
    RAISE NOTICE '开始数据库修复脚本执行...';
    RAISE NOTICE '当前时间: %', NOW();
END $$;

-- 检查现有用户数据
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_conversations FROM conversation_history;
SELECT COUNT(*) as total_vocabulary FROM vocabulary;

-- ============================================
-- 第二阶段：修复数据类型不一致问题
-- ============================================

-- 步骤1：备份现有数据（创建临时表）
CREATE TEMPORARY TABLE temp_user_points AS SELECT * FROM user_points;
CREATE TEMPORARY TABLE temp_learning_stats AS SELECT * FROM learning_stats;
CREATE TEMPORARY TABLE temp_grammar_progress AS SELECT * FROM grammar_progress;
CREATE TEMPORARY TABLE temp_phrases AS SELECT * FROM phrases;
CREATE TEMPORARY TABLE temp_practice_records AS SELECT * FROM practice_records;
CREATE TEMPORARY TABLE temp_vocabulary AS SELECT * FROM vocabulary;

-- 步骤2：删除外键约束（如果存在）
ALTER TABLE practice_records DROP CONSTRAINT IF EXISTS practice_records_vocabulary_id_fkey;
ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS practice_questions_word_id_fkey;

-- 步骤3：修复user_id类型为UUID
-- 修复 user_points 表
ALTER TABLE user_points 
ALTER COLUMN user_id TYPE UUID USING 
    CASE 
        WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN user_id::UUID
        ELSE gen_random_uuid()
    END;

-- 修复 learning_stats 表
ALTER TABLE learning_stats 
ALTER COLUMN user_id TYPE UUID USING 
    CASE 
        WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN user_id::UUID
        ELSE gen_random_uuid()
    END;

-- 修复 grammar_progress 表
ALTER TABLE grammar_progress 
ALTER COLUMN user_id TYPE UUID USING 
    CASE 
        WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN user_id::UUID
        ELSE gen_random_uuid()
    END;

-- 修复 phrases 表
ALTER TABLE phrases 
ALTER COLUMN user_id TYPE UUID USING 
    CASE 
        WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN user_id::UUID
        ELSE gen_random_uuid()
    END;

-- 修复 practice_records 表
ALTER TABLE practice_records 
ALTER COLUMN user_id TYPE UUID USING 
    CASE 
        WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN user_id::UUID
        ELSE gen_random_uuid()
    END;

-- 修复 vocabulary 表
ALTER TABLE vocabulary 
ALTER COLUMN user_id TYPE UUID USING 
    CASE 
        WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN user_id::UUID
        ELSE gen_random_uuid()
    END;

-- 步骤4：重新添加外键约束
ALTER TABLE practice_records 
ADD CONSTRAINT practice_records_vocabulary_id_fkey 
FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id);

ALTER TABLE practice_questions 
ADD CONSTRAINT practice_questions_word_id_fkey 
FOREIGN KEY (word_id) REFERENCES vocabulary(id);

-- 步骤5：添加缺失的外键约束
ALTER TABLE user_points 
ADD CONSTRAINT user_points_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE learning_stats 
ADD CONSTRAINT learning_stats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE grammar_progress 
ADD CONSTRAINT grammar_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE phrases 
ADD CONSTRAINT phrases_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE practice_records 
ADD CONSTRAINT practice_records_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE vocabulary 
ADD CONSTRAINT vocabulary_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- ============================================
-- 第三阶段：创建缺失的社交功能表
-- ============================================

-- 好友关系表
CREATE TABLE IF NOT EXISTS public.friendships (
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
CREATE TABLE IF NOT EXISTS public.community_posts (
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
CREATE TABLE IF NOT EXISTS public.post_interactions (
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
CREATE TABLE IF NOT EXISTS public.notifications (
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

-- 用户学习统计表（整合版）
CREATE TABLE IF NOT EXISTS public.user_learning_stats (
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

-- 用户个人资料扩展表
CREATE TABLE IF NOT EXISTS public.user_profiles (
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

-- 学习主题扩展（如果不存在）
CREATE TABLE IF NOT EXISTS public.learning_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    word_count INTEGER DEFAULT 0,
    unlock_points INTEGER DEFAULT 0,
    icon TEXT,
    description TEXT,
    description_en TEXT,
    color_theme TEXT DEFAULT '#4CAF50',
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 第四阶段：创建性能优化索引
-- ============================================

-- 积分和排行榜索引
CREATE INDEX IF NOT EXISTS idx_user_learning_stats_total_points 
ON user_learning_stats(total_points DESC);

CREATE INDEX IF NOT EXISTS idx_user_learning_stats_weekly_points 
ON user_learning_stats(points_this_week DESC);

CREATE INDEX IF NOT EXISTS idx_user_learning_stats_monthly_points 
ON user_learning_stats(points_this_month DESC);

CREATE INDEX IF NOT EXISTS idx_user_learning_stats_level 
ON user_learning_stats(level DESC);

CREATE INDEX IF NOT EXISTS idx_user_learning_stats_current_streak 
ON user_learning_stats(current_streak DESC);

-- 好友系统索引
CREATE INDEX IF NOT EXISTS idx_friendships_requester_status 
ON friendships(requester_id, status);

CREATE INDEX IF NOT EXISTS idx_friendships_addressee_status 
ON friendships(addressee_id, status);

CREATE INDEX IF NOT EXISTS idx_friendships_status_created 
ON friendships(status, created_at DESC);

-- 社区功能索引
CREATE INDEX IF NOT EXISTS idx_community_posts_user_created 
ON community_posts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_public_created 
ON community_posts(is_public, created_at DESC) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_community_posts_type_created 
ON community_posts(post_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_interactions_post_type 
ON post_interactions(post_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_post_interactions_user_created 
ON post_interactions(user_id, created_at DESC);

-- 通知系统索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type_created 
ON notifications(type, created_at DESC);

-- 游戏和学习索引
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_created 
ON game_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_type_score 
ON game_sessions(game_type, score DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_created 
ON points_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_source 
ON points_transactions(source, created_at DESC);

-- 词汇学习索引
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_mastery 
ON vocabulary(user_id, mastery_level);

CREATE INDEX IF NOT EXISTS idx_vocabulary_next_review 
ON vocabulary(next_review) WHERE next_review IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_word_mastery_user_level 
ON word_mastery_records(user_id, mastery_level);

-- ============================================
-- 第五阶段：创建触发器和自动化函数
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
            updated_at = NOW()
        WHERE user_id = current_user_id;
        
        -- 更新等级
        UPDATE user_learning_stats 
        SET level = (total_points / 100) + 1
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
        
    ELSIF TG_TABLE_NAME = 'vocabulary' AND TG_OP = 'UPDATE' THEN
        -- 更新掌握词汇统计
        IF OLD.mastery_level < 3 AND NEW.mastery_level >= 3 THEN
            UPDATE user_learning_stats 
            SET 
                mastered_words = mastered_words + 1,
                learning_words = CASE 
                    WHEN learning_words > 0 THEN learning_words - 1
                    ELSE 0
                END,
                updated_at = NOW()
            WHERE user_id = current_user_id;
        ELSIF OLD.mastery_level >= 3 AND NEW.mastery_level < 3 THEN
            UPDATE user_learning_stats 
            SET 
                mastered_words = CASE 
                    WHEN mastered_words > 0 THEN mastered_words - 1
                    ELSE 0
                END,
                learning_words = learning_words + 1,
                updated_at = NOW()
            WHERE user_id = current_user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新帖子计数的触发器函数
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 更新帖子计数
        IF NEW.interaction_type = 'like' THEN
            UPDATE community_posts 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.post_id;
        ELSIF NEW.interaction_type = 'comment' THEN
            UPDATE community_posts 
            SET comments_count = comments_count + 1 
            WHERE id = NEW.post_id;
        ELSIF NEW.interaction_type = 'share' THEN
            UPDATE community_posts 
            SET shares_count = shares_count + 1 
            WHERE id = NEW.post_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 减少帖子计数
        IF OLD.interaction_type = 'like' THEN
            UPDATE community_posts 
            SET likes_count = GREATEST(likes_count - 1, 0)
            WHERE id = OLD.post_id;
        ELSIF OLD.interaction_type = 'comment' THEN
            UPDATE community_posts 
            SET comments_count = GREATEST(comments_count - 1, 0)
            WHERE id = OLD.post_id;
        ELSIF OLD.interaction_type = 'share' THEN
            UPDATE community_posts 
            SET shares_count = GREATEST(shares_count - 1, 0)
            WHERE id = OLD.post_id;
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
        -- 增加好友计数
        UPDATE user_learning_stats 
        SET friends_count = friends_count + 1 
        WHERE user_id IN (NEW.requester_id, NEW.addressee_id);
        
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        -- 好友请求被接受
        UPDATE user_learning_stats 
        SET friends_count = friends_count + 1 
        WHERE user_id IN (NEW.requester_id, NEW.addressee_id);
        
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
        -- 删除好友关系
        UPDATE user_learning_stats 
        SET friends_count = GREATEST(friends_count - 1, 0)
        WHERE user_id IN (OLD.requester_id, OLD.addressee_id);
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 第六阶段：创建触发器
-- ============================================

-- 积分和游戏统计触发器
DROP TRIGGER IF EXISTS trigger_update_points_stats ON points_transactions;
CREATE TRIGGER trigger_update_points_stats
    AFTER INSERT ON points_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_learning_stats();

DROP TRIGGER IF EXISTS trigger_update_game_stats ON game_sessions;
CREATE TRIGGER trigger_update_game_stats
    AFTER INSERT ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_learning_stats();

DROP TRIGGER IF EXISTS trigger_update_vocabulary_stats ON vocabulary;
CREATE TRIGGER trigger_update_vocabulary_stats
    AFTER INSERT OR UPDATE ON vocabulary
    FOR EACH ROW
    EXECUTE FUNCTION update_user_learning_stats();

-- 社区互动触发器
DROP TRIGGER IF EXISTS trigger_update_post_counts ON post_interactions;
CREATE TRIGGER trigger_update_post_counts
    AFTER INSERT OR DELETE ON post_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

-- 好友关系触发器
DROP TRIGGER IF EXISTS trigger_update_friend_counts ON friendships;
CREATE TRIGGER trigger_update_friend_counts
    AFTER INSERT OR UPDATE OR DELETE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_friend_counts();

-- ============================================
-- 第七阶段：创建RLS（行级安全）策略
-- ============================================

-- 启用RLS
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

CREATE POLICY "Users can update their own profile" ON user_profiles
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
-- 第八阶段：初始化数据和验证
-- ============================================

-- 为现有用户创建统计记录
INSERT INTO user_learning_stats (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 为现有用户创建资料记录
INSERT INTO user_profiles (user_id, display_name)
SELECT id, COALESCE(raw_user_meta_data->>'name', email) 
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 初始化基础成就数据
INSERT INTO achievements (id, category, name, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'learning', 'First Conversation', 'Complete your first AI conversation', '💬', 'common', 10, '{"conversations": 1}'),
('vocabulary_builder', 'learning', 'Vocabulary Builder', 'Learn your first 10 words', '📚', 'common', 20, '{"words_learned": 10}'),
('quiz_master', 'learning', 'Quiz Master', 'Complete 5 quiz sessions', '🎯', 'common', 15, '{"quiz_sessions": 5}'),
('social_butterfly', 'social', 'Social Butterfly', 'Make your first friend', '👥', 'common', 25, '{"friends": 1}'),
('streak_starter', 'streak', 'Streak Starter', 'Maintain a 3-day learning streak', '🔥', 'rare', 30, '{"streak_days": 3}'),
('point_collector', 'challenge', 'Point Collector', 'Earn 100 total points', '⭐', 'rare', 50, '{"total_points": 100}')
ON CONFLICT (id) DO NOTHING;

-- 创建默认学习主题
INSERT INTO learning_topics (name, name_en, category, difficulty_level, description, description_en) VALUES
('日常对话', 'Daily Conversation', 'conversation', 1, '学习日常生活中的基本对话', 'Learn basic conversations for daily life'),
('商务英语', 'Business English', 'business', 3, '掌握商务场景中的专业用语', 'Master professional terms in business scenarios'),
('旅游英语', 'Travel English', 'travel', 2, '旅行时必备的英语表达', 'Essential English expressions for travel'),
('学术英语', 'Academic English', 'academic', 4, '学术写作和研究中的英语', 'English for academic writing and research')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 第九阶段：验证和完成
-- ============================================

-- 验证表创建
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('friendships', 'community_posts', 'post_interactions', 'notifications', 'user_learning_stats', 'user_profiles');
    
    IF table_count = 6 THEN
        RAISE NOTICE '✅ 所有社交功能表创建成功';
    ELSE
        RAISE WARNING '⚠️ 社交功能表创建不完整，只创建了 % 个表', table_count;
    END IF;
END $$;

-- 验证索引创建
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE '✅ 创建了 % 个性能优化索引', index_count;
END $$;

-- 验证触发器
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    RAISE NOTICE '✅ 创建了 % 个触发器', trigger_count;
END $$;

-- 最终验证
SELECT 
    'user_learning_stats' as table_name,
    COUNT(*) as record_count
FROM user_learning_stats
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count
FROM user_profiles
UNION ALL
SELECT 
    'achievements' as table_name,
    COUNT(*) as record_count
FROM achievements
UNION ALL
SELECT 
    'learning_topics' as table_name,
    COUNT(*) as record_count
FROM learning_topics;

-- 完成提示
DO $$
BEGIN
    RAISE NOTICE '🎉 数据库修复脚本执行完成！';
    RAISE NOTICE '完成时间: %', NOW();
    RAISE NOTICE '下一步: 可以开始实施社交功能的服务层和UI组件';
END $$;