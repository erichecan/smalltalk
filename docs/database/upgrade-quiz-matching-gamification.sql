-- Quiz与Matching游戏化学习功能数据库升级脚本
-- 创建时间：2025-01-30 09:00:00
-- 说明：支持游戏化学习、积分系统、成就系统、打卡系统等功能，不包含实时对战功能

-- 1. 升级现有vocabulary表，添加游戏化相关字段
-- 添加基础信息字段
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS chinese_translation TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS phonetic TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS part_of_speech TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS synonyms TEXT[];
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS antonyms TEXT[];
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner';
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS usage_notes TEXT;

-- 添加遗忘曲线相关字段
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS ease_factor DECIMAL(3,2) DEFAULT 2.5;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS interval INTEGER DEFAULT 0;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS next_review DATE;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS correct_reviews INTEGER DEFAULT 0;

-- 添加检查约束（如果字段不存在约束的话）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'vocabulary_difficulty_level_check'
    ) THEN
        ALTER TABLE vocabulary ADD CONSTRAINT vocabulary_difficulty_level_check 
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
    END IF;
END $$;

-- 2. 创建用户学习档案表
CREATE TABLE IF NOT EXISTS user_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_level INTEGER DEFAULT 1 CHECK (skill_level BETWEEN 1 AND 10),
  total_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0, -- 当前连续学习天数
  max_streak INTEGER DEFAULT 0, -- 历史最高连续天数
  preferred_game_mode TEXT DEFAULT 'quiz' CHECK (preferred_game_mode IN ('quiz', 'matching', 'mixed')),
  daily_goal INTEGER DEFAULT 20, -- 每日学习目标单词数
  learning_goals JSONB DEFAULT '{}', -- 学习目标设置
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. 创建游戏会话记录表
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('quiz', 'matching')),
  mode TEXT CHECK (mode IN ('classic', 'timed', 'challenge', 'theme')),
  theme TEXT, -- 主题模式的主题名称
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0, -- 正确率百分比
  time_spent INTEGER DEFAULT 0, -- 游戏耗时(秒)
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  streak_achieved INTEGER DEFAULT 0, -- 本次游戏达到的最高连击
  points_earned INTEGER DEFAULT 0, -- 本次游戏获得的积分
  perfect_score BOOLEAN DEFAULT FALSE, -- 是否满分
  session_data JSONB DEFAULT '{}', -- 详细游戏数据(题目、答案等)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建单词掌握记录表
CREATE TABLE IF NOT EXISTS word_mastery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  word TEXT NOT NULL, -- 冗余存储，便于查询
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 3), -- 0-3级掌握度
  review_count INTEGER DEFAULT 0,
  last_review TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  consecutive_correct INTEGER DEFAULT 0, -- 连续答对次数
  consecutive_incorrect INTEGER DEFAULT 0, -- 连续答错次数
  total_correct INTEGER DEFAULT 0,
  total_incorrect INTEGER DEFAULT 0,
  average_response_time DECIMAL(6,2) DEFAULT 0, -- 平均响应时间(秒)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- 5. 创建用户积分表
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  daily_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  yearly_points INTEGER DEFAULT 0,
  streak_bonus INTEGER DEFAULT 0, -- 连击奖励积分
  achievement_bonus INTEGER DEFAULT 0, -- 成就奖励积分
  last_daily_reset DATE DEFAULT CURRENT_DATE,
  last_weekly_reset DATE DEFAULT CURRENT_DATE,
  last_monthly_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. 创建积分交易记录表
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend')),
  points INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'quiz', 'matching', 'streak', 'achievement', 'daily_bonus', etc.
  source_id TEXT, -- 相关记录的ID
  description TEXT,
  metadata JSONB DEFAULT '{}', -- 额外信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 创建打卡记录表
CREATE TABLE IF NOT EXISTS check_in_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE DEFAULT CURRENT_DATE,
  consecutive_days INTEGER DEFAULT 1,
  quality_checkin BOOLEAN DEFAULT FALSE, -- 是否完成了质量打卡(达到每日目标)
  activities_completed INTEGER DEFAULT 0, -- 当日完成的学习活动数
  words_learned INTEGER DEFAULT 0, -- 当日学习的单词数
  bonus_points INTEGER DEFAULT 0, -- 打卡奖励积分
  activities JSONB DEFAULT '[]', -- 当日完成的学习活动详情
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, check_in_date)
);

-- 8. 创建成就定义表
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY, -- 使用文本ID便于代码引用
  category TEXT NOT NULL CHECK (category IN ('learning', 'social', 'streak', 'challenge')),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_reward INTEGER DEFAULT 0,
  requirements JSONB NOT NULL, -- 解锁条件
  rewards JSONB DEFAULT '{}', -- 解锁奖励
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 创建用户成就记录表
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  progress_value INTEGER DEFAULT 0, -- 当前进度值
  target_value INTEGER DEFAULT 0, -- 目标值
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  progress_data JSONB DEFAULT '{}', -- 进度详细数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 10. 创建学习主题表
CREATE TABLE IF NOT EXISTS learning_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL, -- 英文名称
  category TEXT NOT NULL, -- 'animals', 'technology', 'business', 'travel', etc.
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  word_count INTEGER DEFAULT 0,
  unlock_points INTEGER DEFAULT 0, -- 需要积分解锁
  icon TEXT,
  description TEXT,
  description_en TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 创建用户解锁记录表
CREATE TABLE IF NOT EXISTS user_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  unlock_type TEXT NOT NULL CHECK (unlock_type IN ('topic', 'achievement', 'avatar', 'theme')),
  unlock_id TEXT NOT NULL,
  points_spent INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, unlock_type, unlock_id)
);

-- 12. 创建练习题目记录表(用于记录生成的题目，便于复习和分析)
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  word_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('word-meaning', 'meaning-word', 'sentence-completion', 'synonym-match', 'context-usage')),
  question_text TEXT NOT NULL,
  options JSONB, -- 选择题选项
  correct_answer TEXT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN,
  response_time DECIMAL(6,2), -- 响应时间(秒)
  difficulty_rating INTEGER, -- 用户主观难度评分(1-5)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询性能
-- vocabulary表索引
-- 注意：vocabulary表需要确认是否有user_id字段，如果没有则需要调整索引
-- CREATE INDEX IF NOT EXISTS idx_vocabulary_user_next_review ON vocabulary(user_id, next_review);
-- CREATE INDEX IF NOT EXISTS idx_vocabulary_user_mastery ON vocabulary(user_id, mastery_level);
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

-- 插入默认成就数据
INSERT INTO achievements (id, category, name, description, icon, rarity, points_reward, requirements) VALUES
-- 学习类成就
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

-- 坚持类成就
('streak_3', 'streak', '初心不改', '连续打卡3天', '🔥', 'common', 100, '{"type": "consecutive_days", "value": 3}'),
('streak_7', 'streak', '坚持一周', '连续打卡7天', '📅', 'common', 200, '{"type": "consecutive_days", "value": 7}'),
('streak_30', 'streak', '月度坚持', '连续打卡30天', '📆', 'rare', 500, '{"type": "consecutive_days", "value": 30}'),
('streak_100', 'streak', '百日坚持', '连续打卡100天', '💪', 'epic', 1000, '{"type": "consecutive_days", "value": 100}'),
('streak_365', 'streak', '年度学霸', '连续打卡365天', '🌟', 'legendary', 2000, '{"type": "consecutive_days", "value": 365}'),

-- 挑战类成就
('points_collector_1000', 'challenge', '积分新手', '累计获得1000积分', '💰', 'common', 100, '{"type": "total_points", "value": 1000}'),
('points_collector_5000', 'challenge', '积分达人', '累计获得5000积分', '💎', 'rare', 300, '{"type": "total_points", "value": 5000}'),
('points_collector_10000', 'challenge', '积分大师', '累计获得10000积分', '👑', 'epic', 500, '{"type": "total_points", "value": 10000}'),
('accuracy_master_90', 'challenge', '精准射手', '单次游戏正确率达到90%以上', '🎯', 'rare', 300, '{"type": "session_accuracy", "value": 90}'),
('accuracy_master_100', 'challenge', '完美表现', '单次游戏正确率达到100%', '⭐', 'epic', 500, '{"type": "session_accuracy", "value": 100}')
ON CONFLICT (id) DO NOTHING;

-- 插入默认学习主题数据
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

-- 创建RLS(行级安全)策略
-- user_learning_profiles表策略
ALTER TABLE user_learning_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own learning profile" ON user_learning_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own learning profile" ON user_learning_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning profile" ON user_learning_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- game_sessions表策略
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own game sessions" ON game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- word_mastery_records表策略
ALTER TABLE word_mastery_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own word mastery" ON word_mastery_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own word mastery" ON word_mastery_records FOR ALL USING (auth.uid() = user_id);

-- user_points表策略
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own points" ON user_points FOR ALL USING (auth.uid() = user_id);

-- points_transactions表策略
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own point transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own point transactions" ON points_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- check_in_records表策略
ALTER TABLE check_in_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own check-in records" ON check_in_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own check-in records" ON check_in_records FOR ALL USING (auth.uid() = user_id);

-- user_achievements表策略
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- user_unlocks表策略
ALTER TABLE user_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own unlocks" ON user_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own unlocks" ON user_unlocks FOR ALL USING (auth.uid() = user_id);

-- practice_questions表策略
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view questions from own sessions" ON practice_questions FOR SELECT 
USING (EXISTS (SELECT 1 FROM game_sessions WHERE game_sessions.id = practice_questions.session_id AND game_sessions.user_id = auth.uid()));
CREATE POLICY "Users can insert questions for own sessions" ON practice_questions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM game_sessions WHERE game_sessions.id = practice_questions.session_id AND game_sessions.user_id = auth.uid()));

-- 公共表的只读策略
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view achievements" ON achievements FOR SELECT USING (is_active = true);

ALTER TABLE learning_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active topics" ON learning_topics FOR SELECT USING (is_active = true);

-- 创建自动更新updated_at字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建自动更新trigger
CREATE TRIGGER update_user_learning_profiles_updated_at BEFORE UPDATE ON user_learning_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_word_mastery_records_updated_at BEFORE UPDATE ON word_mastery_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON user_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 升级完成提示
SELECT 'Quiz与Matching游戏化功能数据库升级完成！' as message;
SELECT 'Please verify the tables were created successfully by running: \dt' as next_step; 