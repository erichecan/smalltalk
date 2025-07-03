-- 最简单的数据库修复脚本
-- 直接解决问题，不再绕弯子

-- 1. 删除触发器（忽略错误）
DROP TRIGGER IF EXISTS trigger_update_points_stats ON points_transactions;
DROP TRIGGER IF EXISTS trigger_update_game_stats ON game_sessions;
DROP TRIGGER IF EXISTS trigger_update_vocabulary_stats ON vocabulary;

-- 2. 删除函数（忽略错误）
DROP FUNCTION IF EXISTS update_user_learning_stats();

-- 3. 清空现有数据
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

-- 4. 修复user_id类型
ALTER TABLE conversation_history ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE vocabulary ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE user_points ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE learning_stats ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE grammar_progress ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE phrases ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE practice_records ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- 5. 创建社交表
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    addressee_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_learning_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 添加外键约束
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

-- 7. 初始化基础数据
INSERT INTO achievements (id, category, name, description, icon, rarity, points_reward, requirements) VALUES
('first_conversation', 'learning', 'First Conversation', 'Complete your first AI conversation', '💬', 'common', 10, '{"conversations": 1}'),
('vocabulary_builder', 'learning', 'Vocabulary Builder', 'Learn 10 words', '📚', 'common', 20, '{"words_learned": 10}'),
('quiz_master', 'learning', 'Quiz Master', 'Complete 5 quizzes', '🎯', 'common', 15, '{"quiz_sessions": 5}');

-- 完成
SELECT 'Database rebuild completed successfully!' as status;