-- Supabase 数据库修复脚本
-- 考虑到现有约束和表结构

-- 1. 删除现有外键约束（如果存在）
ALTER TABLE conversation_history DROP CONSTRAINT IF EXISTS conversation_history_user_id_fkey;
ALTER TABLE vocabulary DROP CONSTRAINT IF EXISTS vocabulary_user_id_fkey;
ALTER TABLE user_points DROP CONSTRAINT IF EXISTS user_points_user_id_fkey;
ALTER TABLE learning_stats DROP CONSTRAINT IF EXISTS learning_stats_user_id_fkey;
ALTER TABLE grammar_progress DROP CONSTRAINT IF EXISTS grammar_progress_user_id_fkey;
ALTER TABLE phrases DROP CONSTRAINT IF EXISTS phrases_user_id_fkey;
ALTER TABLE practice_records DROP CONSTRAINT IF EXISTS practice_records_user_id_fkey;
ALTER TABLE practice_records DROP CONSTRAINT IF EXISTS practice_records_vocabulary_id_fkey;
ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS game_sessions_user_id_fkey;
ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS practice_questions_word_id_fkey;
ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS practice_questions_session_id_fkey;
ALTER TABLE points_transactions DROP CONSTRAINT IF EXISTS points_transactions_user_id_fkey;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey;

-- 2. 清空数据
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

-- 3. 修复user_id类型
ALTER TABLE conversation_history ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE vocabulary ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE user_points ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE learning_stats ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE grammar_progress ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE phrases ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE practice_records ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- 4. 创建社交表（如果不存在）
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_learning_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 重新添加外键约束
ALTER TABLE conversation_history ADD CONSTRAINT conversation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE vocabulary ADD CONSTRAINT vocabulary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE user_points ADD CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE learning_stats ADD CONSTRAINT learning_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE grammar_progress ADD CONSTRAINT grammar_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE phrases ADD CONSTRAINT phrases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE practice_records ADD CONSTRAINT practice_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE practice_records ADD CONSTRAINT practice_records_vocabulary_id_fkey FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id);
ALTER TABLE game_sessions ADD CONSTRAINT game_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE practice_questions ADD CONSTRAINT practice_questions_word_id_fkey FOREIGN KEY (word_id) REFERENCES vocabulary(id);
ALTER TABLE practice_questions ADD CONSTRAINT practice_questions_session_id_fkey FOREIGN KEY (session_id) REFERENCES game_sessions(id);
ALTER TABLE points_transactions ADD CONSTRAINT points_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES achievements(id);

-- 社交表外键
ALTER TABLE friendships ADD CONSTRAINT friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id);
ALTER TABLE friendships ADD CONSTRAINT friendships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES auth.users(id);
ALTER TABLE user_learning_stats ADD CONSTRAINT user_learning_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE community_posts ADD CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 6. 初始化数据
INSERT INTO achievements (id, category, name, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'learning', 'First Conversation', 'Complete your first AI conversation', '💬', 'common', 10, '{"conversations": 1}'),
('vocabulary_builder', 'learning', 'Vocabulary Builder', 'Learn 10 words', '📚', 'common', 20, '{"words_learned": 10}'),
('quiz_master', 'learning', 'Quiz Master', 'Complete 5 quizzes', '🎯', 'common', 15, '{"quiz_sessions": 5}');

-- 完成
SELECT 'Supabase database fix completed!' as status;