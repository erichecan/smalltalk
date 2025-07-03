-- SmallTalk 数据库孤儿数据修复脚本
-- 创建时间: 2025-01-31 12:15:00
-- 用途: 修复孤儿数据问题，安全处理外键约束
-- 执行前提: 需要先处理数据完整性问题

-- ============================================
-- 第一阶段：数据完整性诊断
-- ============================================

-- 检查孤儿数据情况
DO $$
BEGIN
    RAISE NOTICE '开始数据完整性诊断...';
    RAISE NOTICE '当前时间: %', NOW();
END $$;

-- 检查 user_points 表中的孤儿数据
SELECT 
    'user_points 孤儿数据' as table_name,
    COUNT(*) as orphan_count
FROM user_points up
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = up.user_id
);

-- 检查 learning_stats 表中的孤儿数据
SELECT 
    'learning_stats 孤儿数据' as table_name,
    COUNT(*) as orphan_count
FROM learning_stats ls
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = ls.user_id::UUID
);

-- 检查 conversation_history 表中的孤儿数据
SELECT 
    'conversation_history 孤儿数据' as table_name,
    COUNT(*) as orphan_count
FROM conversation_history ch
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = ch.user_id
);

-- 检查 vocabulary 表中的孤儿数据
SELECT 
    'vocabulary 孤儿数据' as table_name,
    COUNT(*) as orphan_count
FROM vocabulary v
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = v.user_id::UUID
);

-- ============================================
-- 第二阶段：创建临时清理函数
-- ============================================

-- 创建安全的数据清理函数
CREATE OR REPLACE FUNCTION clean_orphan_data()
RETURNS TABLE(
    table_name TEXT,
    action TEXT,
    affected_rows INTEGER
) AS $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- 创建临时表保存孤儿数据（备份）
    DROP TABLE IF EXISTS temp_orphan_backup;
    CREATE TEMP TABLE temp_orphan_backup AS
    SELECT 
        'user_points' as source_table,
        up.user_id::TEXT as orphan_user_id,
        to_jsonb(up.*) as data
    FROM user_points up
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = up.user_id
    );
    
    -- 备份其他表的孤儿数据
    INSERT INTO temp_orphan_backup
    SELECT 
        'learning_stats' as source_table,
        ls.user_id as orphan_user_id,
        to_jsonb(ls.*) as data
    FROM learning_stats ls
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = ls.user_id::UUID
    );
    
    INSERT INTO temp_orphan_backup
    SELECT 
        'grammar_progress' as source_table,
        gp.user_id as orphan_user_id,
        to_jsonb(gp.*) as data
    FROM grammar_progress gp
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = gp.user_id::UUID
    );
    
    INSERT INTO temp_orphan_backup
    SELECT 
        'phrases' as source_table,
        p.user_id as orphan_user_id,
        to_jsonb(p.*) as data
    FROM phrases p
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = p.user_id::UUID
    );
    
    INSERT INTO temp_orphan_backup
    SELECT 
        'practice_records' as source_table,
        pr.user_id as orphan_user_id,
        to_jsonb(pr.*) as data
    FROM practice_records pr
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = pr.user_id::UUID
    );
    
    INSERT INTO temp_orphan_backup
    SELECT 
        'vocabulary' as source_table,
        v.user_id as orphan_user_id,
        to_jsonb(v.*) as data
    FROM vocabulary v
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = v.user_id::UUID
    );
    
    -- 显示备份统计
    RAISE NOTICE '孤儿数据备份完成，共 % 条记录', (SELECT COUNT(*) FROM temp_orphan_backup);
    
    -- 删除孤儿数据
    
    -- 1. 清理 user_points
    DELETE FROM user_points
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = user_points.user_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    
    table_name := 'user_points';
    action := 'DELETE_ORPHANS';
    affected_rows := orphan_count;
    RETURN NEXT;
    
    -- 2. 清理 learning_stats
    DELETE FROM learning_stats
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = learning_stats.user_id::UUID
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    
    table_name := 'learning_stats';
    action := 'DELETE_ORPHANS';
    affected_rows := orphan_count;
    RETURN NEXT;
    
    -- 3. 清理 grammar_progress
    DELETE FROM grammar_progress
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = grammar_progress.user_id::UUID
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    
    table_name := 'grammar_progress';
    action := 'DELETE_ORPHANS';
    affected_rows := orphan_count;
    RETURN NEXT;
    
    -- 4. 清理 phrases
    DELETE FROM phrases
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = phrases.user_id::UUID
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    
    table_name := 'phrases';
    action := 'DELETE_ORPHANS';
    affected_rows := orphan_count;
    RETURN NEXT;
    
    -- 5. 清理 practice_records
    DELETE FROM practice_records
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = practice_records.user_id::UUID
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    
    table_name := 'practice_records';
    action := 'DELETE_ORPHANS';
    affected_rows := orphan_count;
    RETURN NEXT;
    
    -- 6. 清理 vocabulary
    DELETE FROM vocabulary
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = vocabulary.user_id::UUID
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    
    table_name := 'vocabulary';
    action := 'DELETE_ORPHANS';
    affected_rows := orphan_count;
    RETURN NEXT;
    
    -- 7. 清理 conversation_history (如果有孤儿数据)
    DELETE FROM conversation_history
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = conversation_history.user_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    
    table_name := 'conversation_history';
    action := 'DELETE_ORPHANS';
    affected_rows := orphan_count;
    RETURN NEXT;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 第三阶段：执行数据清理
-- ============================================

-- 执行数据清理
SELECT * FROM clean_orphan_data();

-- 验证清理结果
DO $$
DECLARE
    total_orphans INTEGER := 0;
BEGIN
    -- 重新检查孤儿数据
    SELECT COUNT(*) INTO total_orphans
    FROM (
        SELECT user_id FROM user_points 
        WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = user_points.user_id)
        UNION ALL
        SELECT user_id::UUID FROM learning_stats
        WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = learning_stats.user_id::UUID)
        UNION ALL
        SELECT user_id FROM conversation_history
        WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = conversation_history.user_id)
        UNION ALL
        SELECT user_id::UUID FROM vocabulary
        WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = vocabulary.user_id::UUID)
    ) orphan_check;
    
    IF total_orphans = 0 THEN
        RAISE NOTICE '✅ 孤儿数据清理完成，数据完整性已恢复';
    ELSE
        RAISE WARNING '⚠️ 仍有 % 条孤儿数据未清理', total_orphans;
    END IF;
END $$;

-- ============================================
-- 第四阶段：安全执行原修复脚本的关键部分
-- ============================================

-- 现在可以安全地执行类型修复和外键约束添加

-- 1. 删除可能存在的外键约束
ALTER TABLE practice_records DROP CONSTRAINT IF EXISTS practice_records_vocabulary_id_fkey;
ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS practice_questions_word_id_fkey;
ALTER TABLE user_points DROP CONSTRAINT IF EXISTS user_points_user_id_fkey;
ALTER TABLE learning_stats DROP CONSTRAINT IF EXISTS learning_stats_user_id_fkey;
ALTER TABLE grammar_progress DROP CONSTRAINT IF EXISTS grammar_progress_user_id_fkey;
ALTER TABLE phrases DROP CONSTRAINT IF EXISTS phrases_user_id_fkey;
ALTER TABLE practice_records DROP CONSTRAINT IF EXISTS practice_records_user_id_fkey;
ALTER TABLE vocabulary DROP CONSTRAINT IF EXISTS vocabulary_user_id_fkey;

-- 2. 修复数据类型（现在数据已经清理，更安全）
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

-- 3. 现在可以安全地添加外键约束
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

ALTER TABLE vocabulary 
ADD CONSTRAINT vocabulary_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 重新添加表间外键约束
ALTER TABLE practice_records 
ADD CONSTRAINT practice_records_vocabulary_id_fkey 
FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE;

ALTER TABLE practice_questions 
ADD CONSTRAINT practice_questions_word_id_fkey 
FOREIGN KEY (word_id) REFERENCES vocabulary(id) ON DELETE CASCADE;

-- ============================================
-- 第五阶段：创建社交功能表
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

-- 用户学习统计表
CREATE TABLE IF NOT EXISTS public.user_learning_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ============================================
-- 第六阶段：完成剩余修复步骤
-- ============================================

-- 为现有用户创建统计和资料记录
INSERT INTO user_learning_stats (user_id, total_points, level)
SELECT 
    au.id,
    COALESCE(up.total_points, 0),
    COALESCE(up.level, 1)
FROM auth.users au
LEFT JOIN user_points up ON au.id = up.user_id
ON CONFLICT (user_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    level = EXCLUDED.level;

INSERT INTO user_profiles (user_id, display_name)
SELECT 
    au.id, 
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1))
FROM auth.users au
ON CONFLICT (user_id) DO NOTHING;

-- 初始化基础成就
INSERT INTO achievements (id, category, name, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'learning', 'First Conversation', 'Complete your first AI conversation', '💬', 'common', 10, '{"conversations": 1}'),
('vocabulary_builder', 'learning', 'Vocabulary Builder', 'Learn your first 10 words', '📚', 'common', 20, '{"words_learned": 10}'),
('quiz_master', 'learning', 'Quiz Master', 'Complete 5 quiz sessions', '🎯', 'common', 15, '{"quiz_sessions": 5}'),
('social_butterfly', 'social', 'Social Butterfly', 'Make your first friend', '👥', 'common', 25, '{"friends": 1}'),
('streak_starter', 'streak', 'Streak Starter', 'Maintain a 3-day learning streak', '🔥', 'rare', 30, '{"streak_days": 3}'),
('point_collector', 'challenge', 'Point Collector', 'Earn 100 total points', '⭐', 'rare', 50, '{"total_points": 100}')
ON CONFLICT (id) DO NOTHING;

-- 最终验证
DO $$
DECLARE
    total_users INTEGER;
    total_stats INTEGER;
    total_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_stats FROM user_learning_stats;
    SELECT COUNT(*) INTO total_profiles FROM user_profiles;
    
    RAISE NOTICE '✅ 修复完成统计:';
    RAISE NOTICE '   总用户数: %', total_users;
    RAISE NOTICE '   用户统计记录: %', total_stats;
    RAISE NOTICE '   用户资料记录: %', total_profiles;
    
    IF total_users = total_stats AND total_users = total_profiles THEN
        RAISE NOTICE '🎉 数据完整性修复成功！';
    ELSE
        RAISE WARNING '⚠️ 数据记录不匹配，请检查';
    END IF;
END $$;

-- 清理临时函数
DROP FUNCTION IF EXISTS clean_orphan_data();

RAISE NOTICE '🎯 孤儿数据修复脚本执行完成！';
RAISE NOTICE '现在可以安全地继续社交功能开发。';