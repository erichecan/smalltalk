-- Quiz与Matching游戏化学习功能数据库升级脚本（修复版本）
-- 创建时间：2025-01-30 09:35:00
-- 修复了ALTER TABLE语法错误，确保每个字段单独添加

-- 开始事务
BEGIN;

-- 输出开始信息
SELECT 'Quiz与Matching游戏化功能数据库升级开始...' as message;

-- ==================== 第一步：升级现有vocabulary表 ====================
SELECT 'Step 1: 升级vocabulary表，添加游戏化相关字段...' as step;

-- 添加基础信息字段（每个字段单独添加）
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS chinese_translation TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS phonetic TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS part_of_speech TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS synonyms TEXT[];
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS antonyms TEXT[];
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner';
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS usage_notes TEXT;

-- 添加遗忘曲线相关字段
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS ease_factor DECIMAL(3,2) DEFAULT 2.5;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 0;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS next_review DATE;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS correct_reviews INTEGER DEFAULT 0;

-- 添加检查约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_name = 'vocabulary' 
        AND tc.constraint_name = 'vocabulary_difficulty_level_check'
    ) THEN
        ALTER TABLE vocabulary ADD CONSTRAINT vocabulary_difficulty_level_check 
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
    END IF;
END $$;

SELECT 'Step 1 完成: vocabulary表升级成功' as result;

-- ==================== 第二步：创建用户学习档案表 ====================
SELECT 'Step 2: 创建用户学习档案表...' as step;

CREATE TABLE IF NOT EXISTS user_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_level INTEGER DEFAULT 1 CHECK (skill_level BETWEEN 1 AND 10),
  total_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  preferred_game_mode TEXT DEFAULT 'quiz' CHECK (preferred_game_mode IN ('quiz', 'matching', 'mixed')),
  daily_goal INTEGER DEFAULT 20,
  learning_goals JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

SELECT 'Step 2 完成: user_learning_profiles表创建成功' as result;

-- ==================== 第三步：创建游戏会话记录表 ====================
SELECT 'Step 3: 创建游戏会话记录表...' as step;

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('quiz', 'matching')),
  mode TEXT CHECK (mode IN ('classic', 'timed', 'challenge', 'theme')),
  theme TEXT,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  streak_achieved INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  perfect_score BOOLEAN DEFAULT FALSE,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Step 3 完成: game_sessions表创建成功' as result;

-- ==================== 第四步：创建单词掌握记录表 ====================
SELECT 'Step 4: 创建单词掌握记录表...' as step;

CREATE TABLE IF NOT EXISTS word_mastery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 3),
  review_count INTEGER DEFAULT 0,
  last_review TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  consecutive_correct INTEGER DEFAULT 0,
  consecutive_incorrect INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_incorrect INTEGER DEFAULT 0,
  average_response_time DECIMAL(6,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

SELECT 'Step 4 完成: word_mastery_records表创建成功' as result;

-- ==================== 第五步：创建用户积分表 ====================
SELECT 'Step 5: 创建用户积分表...' as step;

CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  daily_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  yearly_points INTEGER DEFAULT 0,
  streak_bonus INTEGER DEFAULT 0,
  achievement_bonus INTEGER DEFAULT 0,
  last_daily_reset DATE DEFAULT CURRENT_DATE,
  last_weekly_reset DATE DEFAULT CURRENT_DATE,
  last_monthly_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

SELECT 'Step 5 完成: user_points表创建成功' as result;

-- ==================== 第六步：创建积分交易记录表 ====================
SELECT 'Step 6: 创建积分交易记录表...' as step;

CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend')),
  points INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Step 6 完成: points_transactions表创建成功' as result;

-- ==================== 第七步：创建打卡记录表 ====================
SELECT 'Step 7: 创建打卡记录表...' as step;

CREATE TABLE IF NOT EXISTS check_in_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE DEFAULT CURRENT_DATE,
  consecutive_days INTEGER DEFAULT 1,
  quality_checkin BOOLEAN DEFAULT FALSE,
  activities_completed INTEGER DEFAULT 0,
  words_learned INTEGER DEFAULT 0,
  bonus_points INTEGER DEFAULT 0,
  activities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, check_in_date)
);

SELECT 'Step 7 完成: check_in_records表创建成功' as result;

-- ==================== 第八步：创建成就定义表 ====================
SELECT 'Step 8: 创建成就定义表...' as step;

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('learning', 'social', 'streak', 'challenge')),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_reward INTEGER DEFAULT 0,
  requirements JSONB NOT NULL,
  rewards JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Step 8 完成: achievements表创建成功' as result;

-- ==================== 第九步：创建用户成就记录表 ====================
SELECT 'Step 9: 创建用户成就记录表...' as step;

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  progress_value INTEGER DEFAULT 0,
  target_value INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  progress_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

SELECT 'Step 9 完成: user_achievements表创建成功' as result;

-- ==================== 第十步：创建学习主题表 ====================
SELECT 'Step 10: 创建学习主题表...' as step;

CREATE TABLE IF NOT EXISTS learning_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  word_count INTEGER DEFAULT 0,
  unlock_points INTEGER DEFAULT 0,
  icon TEXT,
  description TEXT,
  description_en TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Step 10 完成: learning_topics表创建成功' as result;

-- ==================== 第十一步：创建用户解锁记录表 ====================
SELECT 'Step 11: 创建用户解锁记录表...' as step;

CREATE TABLE IF NOT EXISTS user_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  unlock_type TEXT NOT NULL CHECK (unlock_type IN ('topic', 'achievement', 'avatar', 'theme')),
  unlock_id TEXT NOT NULL,
  points_spent INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, unlock_type, unlock_id)
);

SELECT 'Step 11 完成: user_unlocks表创建成功' as result;

-- ==================== 第十二步：创建练习题目记录表 ====================
SELECT 'Step 12: 创建练习题目记录表...' as step;

CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  word_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('word-meaning', 'meaning-word', 'sentence-completion', 'synonym-match', 'context-usage')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN,
  response_time DECIMAL(6,2),
  difficulty_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Step 12 完成: practice_questions表创建成功' as result;

-- ==================== 第十三步：创建索引 ====================
SELECT 'Step 13: 创建优化索引...' as step;

-- vocabulary表索引
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty ON vocabulary(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_next_review ON vocabulary(next_review);

-- game_sessions表索引
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_date ON game_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON game_sessions(game_type);

-- word_mastery_records表索引
CREATE INDEX IF NOT EXISTS idx_word_mastery_user_next_review ON word_mastery_records(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_word_mastery_level ON word_mastery_records(mastery_level);

-- points_transactions表索引
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_date ON points_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_source ON points_transactions(source);

-- check_in_records表索引
CREATE INDEX IF NOT EXISTS idx_check_in_user_date ON check_in_records(user_id, check_in_date DESC);

-- user_achievements表索引
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_unlocked ON user_achievements(user_id, is_unlocked);

-- practice_questions表索引
CREATE INDEX IF NOT EXISTS idx_practice_questions_session ON practice_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_questions_word ON practice_questions(word_id);

SELECT 'Step 13 完成: 索引创建成功' as result;

-- ==================== 第十四步：插入默认数据 ====================
SELECT 'Step 14: 插入默认成就数据...' as step;

-- 插入成就数据
INSERT INTO achievements (id, category, name, description, icon, rarity, points_reward, requirements) VALUES
('first_quiz', 'learning', '初出茅庐', '完成第一次Quiz练习', '🏆', 'common', 50, '{"type": "quiz_count", "value": 1}'),
('first_matching', 'learning', '初试身手', '完成第一次Matching练习', '🎯', 'common', 50, '{"type": "matching_count", "value": 1}'),
('quiz_master_10', 'learning', 'Quiz新手', '完成10次Quiz练习', '📝', 'common', 100, '{"type": "quiz_count", "value": 10}'),
('quiz_master_50', 'learning', 'Quiz达人', '完成50次Quiz练习', '📚', 'rare', 300, '{"type": "quiz_count", "value": 50}'),
('quiz_master_100', 'learning', 'Quiz专家', '完成100次Quiz练习', '🎓', 'epic', 500, '{"type": "quiz_count", "value": 100}'),
('matching_master_10', 'learning', 'Matching新手', '完成10次Matching练习', '🎲', 'common', 100, '{"type": "matching_count", "value": 10}'),
('matching_master_50', 'learning', 'Matching达人', '完成50次Matching练习', '🧩', 'rare', 300, '{"type": "matching_count", "value": 50}'),
('perfect_streak_5', 'learning', '神射手', '连续5题全对', '🎯', 'rare', 200, '{"type": "perfect_streak", "value": 5}'),
('perfect_streak_10', 'learning', '完美十连', '连续10题全对', '⚡', 'epic', 500, '{"type": "perfect_streak", "value": 10}'),
('speed_demon', 'learning', '闪电侠', '在30秒内完成一次Matching游戏', '⚡', 'rare', 300, '{"type": "matching_speed", "value": 30}'),
('vocab_learner_100', 'learning', '词汇入门', '学会100个单词', '📖', 'common', 200, '{"type": "words_learned", "value": 100}'),
('vocab_learner_500', 'learning', '词汇达人', '学会500个单词', '📚', 'rare', 500, '{"type": "words_learned", "value": 500}'),
('vocab_master_1000', 'learning', '词汇大师', '学会1000个单词', '🏆', 'epic', 1000, '{"type": "words_learned", "value": 1000}'),
('streak_3', 'streak', '初心不改', '连续打卡3天', '🔥', 'common', 100, '{"type": "consecutive_days", "value": 3}'),
('streak_7', 'streak', '坚持一周', '连续打卡7天', '📅', 'common', 200, '{"type": "consecutive_days", "value": 7}'),
('streak_30', 'streak', '月度坚持', '连续打卡30天', '📆', 'rare', 500, '{"type": "consecutive_days", "value": 30}'),
('streak_100', 'streak', '百日坚持', '连续打卡100天', '💪', 'epic', 1000, '{"type": "consecutive_days", "value": 100}'),
('streak_365', 'streak', '年度学霸', '连续打卡365天', '🌟', 'legendary', 2000, '{"type": "consecutive_days", "value": 365}'),
('points_collector_1000', 'challenge', '积分新手', '累计获得1000积分', '💰', 'common', 100, '{"type": "total_points", "value": 1000}'),
('points_collector_5000', 'challenge', '积分达人', '累计获得5000积分', '💎', 'rare', 300, '{"type": "total_points", "value": 5000}'),
('points_collector_10000', 'challenge', '积分大师', '累计获得10000积分', '👑', 'epic', 500, '{"type": "total_points", "value": 10000}'),
('accuracy_master_90', 'challenge', '精准射手', '单次游戏正确率达到90%以上', '🎯', 'rare', 300, '{"type": "session_accuracy", "value": 90}'),
('accuracy_master_100', 'challenge', '完美表现', '单次游戏正确率达到100%', '⭐', 'epic', 500, '{"type": "session_accuracy", "value": 100}')
ON CONFLICT (id) DO NOTHING;

-- 插入学习主题数据
INSERT INTO learning_topics (name, name_en, category, difficulty_level, icon, description, description_en, display_order) VALUES
('动物世界', 'Animals', 'animals', 1, '🐾', '学习各种动物相关的英语词汇', 'Learn English vocabulary related to animals', 1),
('科技生活', 'Technology', 'technology', 2, '💻', '掌握现代科技相关的英语术语', 'Master English terms related to modern technology', 2),
('商务职场', 'Business', 'business', 3, '💼', '提升商务英语交流能力', 'Improve business English communication skills', 3),
('旅行探索', 'Travel', 'travel', 2, '✈️', '旅行必备英语词汇和表达', 'Essential English vocabulary and expressions for travel', 4),
('美食文化', 'Food & Culture', 'food', 2, '🍽️', '品味世界美食文化的英语表达', 'English expressions for world food and culture', 5),
('日常生活', 'Daily Life', 'daily', 1, '🏠', '日常生活中的常用英语词汇', 'Common English vocabulary in daily life', 6),
('健康医疗', 'Health & Medical', 'health', 3, '🏥', '健康和医疗相关的英语词汇', 'English vocabulary related to health and medical', 7),
('教育学习', 'Education', 'education', 2, '📚', '教育和学习相关的英语术语', 'English terms related to education and learning', 8),
('体育运动', 'Sports', 'sports', 2, '⚽', '各种体育运动的英语词汇', 'English vocabulary for various sports', 9),
('艺术娱乐', 'Arts & Entertainment', 'arts', 3, '🎨', '艺术和娱乐相关的英语表达', 'English expressions for arts and entertainment', 10)
ON CONFLICT DO NOTHING;

SELECT 'Step 14 完成: 默认数据插入成功' as result;

-- ==================== 第十五步：创建RLS策略 ====================
SELECT 'Step 15: 创建RLS(行级安全)策略...' as step;

-- 为所有用户相关表启用RLS
ALTER TABLE user_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_mastery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_topics ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can view own learning profile" ON user_learning_profiles;
DROP POLICY IF EXISTS "Users can update own learning profile" ON user_learning_profiles;
DROP POLICY IF EXISTS "Users can insert own learning profile" ON user_learning_profiles;
DROP POLICY IF EXISTS "Users can view own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can insert own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can view own word mastery" ON word_mastery_records;
DROP POLICY IF EXISTS "Users can manage own word mastery" ON word_mastery_records;
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
DROP POLICY IF EXISTS "Users can manage own points" ON user_points;
DROP POLICY IF EXISTS "Users can view own point transactions" ON points_transactions;
DROP POLICY IF EXISTS "Users can insert own point transactions" ON points_transactions;
DROP POLICY IF EXISTS "Users can view own check-in records" ON check_in_records;
DROP POLICY IF EXISTS "Users can manage own check-in records" ON check_in_records;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can manage own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own unlocks" ON user_unlocks;
DROP POLICY IF EXISTS "Users can manage own unlocks" ON user_unlocks;
DROP POLICY IF EXISTS "Users can view questions from own sessions" ON practice_questions;
DROP POLICY IF EXISTS "Users can insert questions for own sessions" ON practice_questions;
DROP POLICY IF EXISTS "Everyone can view achievements" ON achievements;
DROP POLICY IF EXISTS "Everyone can view active topics" ON learning_topics;

-- 创建新的RLS策略
CREATE POLICY "Users can view own learning profile" ON user_learning_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own learning profile" ON user_learning_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning profile" ON user_learning_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own game sessions" ON game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own word mastery" ON word_mastery_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own word mastery" ON word_mastery_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own points" ON user_points FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own point transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own point transactions" ON points_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own check-in records" ON check_in_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own check-in records" ON check_in_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own unlocks" ON user_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own unlocks" ON user_unlocks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view questions from own sessions" ON practice_questions FOR SELECT 
USING (EXISTS (SELECT 1 FROM game_sessions WHERE game_sessions.id = practice_questions.session_id AND game_sessions.user_id = auth.uid()));
CREATE POLICY "Users can insert questions for own sessions" ON practice_questions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM game_sessions WHERE game_sessions.id = practice_questions.session_id AND game_sessions.user_id = auth.uid()));

CREATE POLICY "Everyone can view achievements" ON achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view active topics" ON learning_topics FOR SELECT USING (is_active = true);

SELECT 'Step 15 完成: RLS策略创建成功' as result;

-- ==================== 第十六步：创建触发器 ====================
SELECT 'Step 16: 创建自动更新触发器...' as step;

-- 创建或替换更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 删除已存在的触发器（如果存在）
DROP TRIGGER IF EXISTS update_user_learning_profiles_updated_at ON user_learning_profiles;
DROP TRIGGER IF EXISTS update_word_mastery_records_updated_at ON word_mastery_records;
DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON user_achievements;

-- 创建新的触发器
CREATE TRIGGER update_user_learning_profiles_updated_at 
BEFORE UPDATE ON user_learning_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_word_mastery_records_updated_at 
BEFORE UPDATE ON word_mastery_records 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at 
BEFORE UPDATE ON user_points 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at 
BEFORE UPDATE ON user_achievements 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Step 16 完成: 触发器创建成功' as result;

-- ==================== 完成升级 ====================
SELECT 'Quiz与Matching游戏化功能数据库升级完成！' as final_message;
SELECT '请验证表是否创建成功，可运行: \dt' as verification_tip;

-- 提交事务
COMMIT;

-- 输出成功消息
SELECT 'SUCCESS: 数据库升级已完成，请开始下一阶段的开发工作！' as status; 