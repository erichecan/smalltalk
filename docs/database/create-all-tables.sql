-- SmallTalk 应用完整数据库表结构
-- 创建所有必需的表

-- 1. 词汇表 (vocabulary) - 2025-01-30 22:45:00 增加遗忘曲线字段
CREATE TABLE IF NOT EXISTS vocabulary (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  definition TEXT,
  example TEXT,
  pronunciation TEXT,
  source TEXT DEFAULT 'manual',
  mastery_level INTEGER DEFAULT 0,
  bookmarked BOOLEAN DEFAULT false,
  chinese_translation TEXT,
  phonetic TEXT,
  part_of_speech TEXT,
  synonyms TEXT, -- JSON字符串格式
  antonyms TEXT, -- JSON字符串格式
  difficulty_level TEXT,
  usage_notes TEXT,
  -- 遗忘曲线相关字段 - 2025-01-30 22:45:00
  ease_factor DECIMAL(3,2) DEFAULT 2.5, -- 难度因子
  interval INTEGER DEFAULT 0, -- 当前间隔天数
  repetitions INTEGER DEFAULT 0, -- 复习次数
  next_review DATE, -- 下次复习时间
  total_reviews INTEGER DEFAULT 0, -- 总复习次数
  correct_reviews INTEGER DEFAULT 0, -- 正确复习次数
  last_reviewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 短语表 (phrases)
CREATE TABLE IF NOT EXISTS phrases (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  phrase TEXT NOT NULL,
  translation TEXT,
  category TEXT,
  usage_example TEXT,
  bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 语法进度表 (grammar_progress)
CREATE TABLE IF NOT EXISTS grammar_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  grammar_topic TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  last_practiced TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 对话历史表 (conversation_history)
CREATE TABLE IF NOT EXISTS conversation_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic TEXT,
  conversation_data JSONB, -- 存储完整的对话数据
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 练习记录表 (practice_records) - 2025-01-30 22:45:00 新增
CREATE TABLE IF NOT EXISTS practice_records (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL, -- 练习题型
  question TEXT NOT NULL, -- 题目内容
  user_answer TEXT NOT NULL, -- 用户答案
  correct_answer TEXT NOT NULL, -- 正确答案
  is_correct BOOLEAN NOT NULL, -- 是否正确
  response_time DECIMAL(10,3) NOT NULL, -- 响应时间(秒)
  difficulty_rating INTEGER, -- 用户主观难度评分 0-5
  performance_rating DECIMAL(3,2), -- 算法计算的表现评分 0-5
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. 学习统计表 (learning_stats) - 2025-01-30 22:45:00 新增
CREATE TABLE IF NOT EXISTS learning_stats (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  total_vocabulary INTEGER DEFAULT 0,
  mastered_vocabulary INTEGER DEFAULT 0,
  learning_vocabulary INTEGER DEFAULT 0,
  daily_reviews INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,4) DEFAULT 0, -- 准确率 0-1
  average_response_time DECIMAL(10,3) DEFAULT 0, -- 平均响应时间
  last_practice_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引优化查询性能
-- vocabulary表索引
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery_level ON vocabulary(mastery_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_bookmarked ON vocabulary(bookmarked);
CREATE INDEX IF NOT EXISTS idx_vocabulary_created_at ON vocabulary(created_at DESC);
-- 遗忘曲线相关索引 - 2025-01-30 22:45:00
CREATE INDEX IF NOT EXISTS idx_vocabulary_next_review ON vocabulary(next_review);
CREATE INDEX IF NOT EXISTS idx_vocabulary_ease_factor ON vocabulary(ease_factor);
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_next_review ON vocabulary(user_id, next_review);

-- phrases表索引
CREATE INDEX IF NOT EXISTS idx_phrases_user_id ON phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_phrases_category ON phrases(category);
CREATE INDEX IF NOT EXISTS idx_phrases_bookmarked ON phrases(bookmarked);
CREATE INDEX IF NOT EXISTS idx_phrases_created_at ON phrases(created_at DESC);

-- grammar_progress表索引
CREATE INDEX IF NOT EXISTS idx_grammar_progress_user_id ON grammar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_grammar_progress_topic ON grammar_progress(grammar_topic);

-- conversation_history表索引
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON conversation_history(created_at DESC);

-- practice_records表索引 - 2025-01-30 22:45:00
CREATE INDEX IF NOT EXISTS idx_practice_records_user_id ON practice_records(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_records_vocabulary_id ON practice_records(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_practice_records_created_at ON practice_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_records_exercise_type ON practice_records(exercise_type);

-- learning_stats表索引 - 2025-01-30 22:45:00
CREATE INDEX IF NOT EXISTS idx_learning_stats_user_id ON learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_stats_last_practice ON learning_stats(last_practice_date);

-- 为了数据完整性，添加一些约束
-- vocabulary表约束
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_mastery_level') THEN
    ALTER TABLE vocabulary ADD CONSTRAINT chk_mastery_level 
    CHECK (mastery_level >= 0 AND mastery_level <= 2);
  END IF;
END $$;

-- 遗忘曲线字段约束 - 2025-01-30 22:45:00
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ease_factor') THEN
    ALTER TABLE vocabulary ADD CONSTRAINT chk_ease_factor 
    CHECK (ease_factor >= 1.3 AND ease_factor <= 3.0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_interval') THEN
    ALTER TABLE vocabulary ADD CONSTRAINT chk_interval 
    CHECK (interval >= 0 AND interval <= 365);
  END IF;
END $$;

-- grammar_progress表约束
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_progress_percentage') THEN
    ALTER TABLE grammar_progress ADD CONSTRAINT chk_progress_percentage 
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
  END IF;
END $$;

-- practice_records表约束 - 2025-01-30 22:45:00
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_difficulty_rating') THEN
    ALTER TABLE practice_records ADD CONSTRAINT chk_difficulty_rating 
    CHECK (difficulty_rating >= 0 AND difficulty_rating <= 5);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_performance_rating') THEN
    ALTER TABLE practice_records ADD CONSTRAINT chk_performance_rating 
    CHECK (performance_rating >= 0 AND performance_rating <= 5);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_response_time') THEN
    ALTER TABLE practice_records ADD CONSTRAINT chk_response_time 
    CHECK (response_time >= 0 AND response_time <= 300);
  END IF;
END $$;

-- learning_stats表约束 - 2025-01-30 22:45:00
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_accuracy_rate') THEN
    ALTER TABLE learning_stats ADD CONSTRAINT chk_accuracy_rate 
    CHECK (accuracy_rate >= 0 AND accuracy_rate <= 1);
  END IF;
END $$;

-- 创建唯一约束避免重复数据
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unq_vocabulary_user_word') THEN
    ALTER TABLE vocabulary ADD CONSTRAINT unq_vocabulary_user_word 
    UNIQUE (user_id, word);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unq_grammar_progress_user_topic') THEN
    ALTER TABLE grammar_progress ADD CONSTRAINT unq_grammar_progress_user_topic 
    UNIQUE (user_id, grammar_topic);
  END IF;
END $$;

-- 注释说明
COMMENT ON TABLE vocabulary IS '用户词汇表 - 支持遗忘曲线算法';
COMMENT ON COLUMN vocabulary.mastery_level IS '掌握程度: 0=未学, 1=学习中, 2=已掌握';
COMMENT ON COLUMN vocabulary.synonyms IS 'JSON字符串格式的同义词数组';
COMMENT ON COLUMN vocabulary.antonyms IS 'JSON字符串格式的反义词数组';
COMMENT ON COLUMN vocabulary.ease_factor IS '遗忘曲线难度因子 (1.3-3.0)';
COMMENT ON COLUMN vocabulary.interval IS '当前复习间隔天数';
COMMENT ON COLUMN vocabulary.repetitions IS '成功复习次数';
COMMENT ON COLUMN vocabulary.next_review IS '下次计划复习日期';

COMMENT ON TABLE phrases IS '用户短语表';
COMMENT ON TABLE grammar_progress IS '语法学习进度表';
COMMENT ON TABLE conversation_history IS '对话历史记录表';
COMMENT ON COLUMN conversation_history.conversation_data IS 'JSONB格式存储完整对话内容';

COMMENT ON TABLE practice_records IS '练习记录表 - 记录所有练习活动';
COMMENT ON COLUMN practice_records.exercise_type IS '练习题型: word-meaning-match, sentence-completion等';
COMMENT ON COLUMN practice_records.response_time IS '响应时间(秒)';
COMMENT ON COLUMN practice_records.difficulty_rating IS '用户主观难度评分 0-5';
COMMENT ON COLUMN practice_records.performance_rating IS '算法计算的表现评分 0-5';

COMMENT ON TABLE learning_stats IS '学习统计表 - 用户学习数据汇总';
COMMENT ON COLUMN learning_stats.accuracy_rate IS '整体准确率 0-1';
COMMENT ON COLUMN learning_stats.streak_days IS '连续学习天数';

-- 创建触发器自动更新 updated_at 字段 - 2025-01-30 22:45:00
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_vocabulary_modtime') THEN
        CREATE TRIGGER update_vocabulary_modtime BEFORE UPDATE ON vocabulary
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_learning_stats_modtime') THEN
        CREATE TRIGGER update_learning_stats_modtime BEFORE UPDATE ON learning_stats
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END$$;