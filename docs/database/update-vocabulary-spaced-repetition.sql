-- 数据库迁移脚本：为现有词汇表添加遗忘曲线字段
-- 执行时间: 2025-01-30 23:10:00
-- 目的: 为已有用户的词汇数据添加遗忘曲线功能支持

-- 1. 首先检查表是否存在，如果不存在则创建
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
  synonyms TEXT,
  antonyms TEXT,
  difficulty_level TEXT,
  usage_notes TEXT,
  last_reviewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 安全地添加遗忘曲线相关字段（如果不存在）
DO $$
BEGIN
  -- 添加 ease_factor 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='vocabulary' AND column_name='ease_factor') THEN
    ALTER TABLE vocabulary ADD COLUMN ease_factor DECIMAL(3,2) DEFAULT 2.5;
    RAISE NOTICE 'Added ease_factor column';
  END IF;

  -- 添加 interval 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='vocabulary' AND column_name='interval') THEN
    ALTER TABLE vocabulary ADD COLUMN interval INTEGER DEFAULT 0;
    RAISE NOTICE 'Added interval column';
  END IF;

  -- 添加 repetitions 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='vocabulary' AND column_name='repetitions') THEN
    ALTER TABLE vocabulary ADD COLUMN repetitions INTEGER DEFAULT 0;
    RAISE NOTICE 'Added repetitions column';
  END IF;

  -- 添加 next_review 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='vocabulary' AND column_name='next_review') THEN
    ALTER TABLE vocabulary ADD COLUMN next_review DATE;
    RAISE NOTICE 'Added next_review column';
  END IF;

  -- 添加 total_reviews 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='vocabulary' AND column_name='total_reviews') THEN
    ALTER TABLE vocabulary ADD COLUMN total_reviews INTEGER DEFAULT 0;
    RAISE NOTICE 'Added total_reviews column';
  END IF;

  -- 添加 correct_reviews 字段
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='vocabulary' AND column_name='correct_reviews') THEN
    ALTER TABLE vocabulary ADD COLUMN correct_reviews INTEGER DEFAULT 0;
    RAISE NOTICE 'Added correct_reviews column';
  END IF;
END $$;

-- 3. 创建练习记录表（如果不存在）
CREATE TABLE IF NOT EXISTS practice_records (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  vocabulary_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time DECIMAL(10,3) NOT NULL,
  difficulty_rating INTEGER,
  performance_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 创建学习统计表（如果不存在）
CREATE TABLE IF NOT EXISTS learning_stats (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  total_vocabulary INTEGER DEFAULT 0,
  mastered_vocabulary INTEGER DEFAULT 0,
  learning_vocabulary INTEGER DEFAULT 0,
  daily_reviews INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,4) DEFAULT 0,
  average_response_time DECIMAL(10,3) DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 为现有词汇初始化遗忘曲线数据
UPDATE vocabulary 
SET 
  ease_factor = COALESCE(ease_factor, 2.5),
  interval = COALESCE(interval, 0),
  repetitions = COALESCE(repetitions, 0),
  total_reviews = COALESCE(total_reviews, 0),
  correct_reviews = COALESCE(correct_reviews, 0)
WHERE ease_factor IS NULL OR interval IS NULL OR repetitions IS NULL 
   OR total_reviews IS NULL OR correct_reviews IS NULL;

-- 6. 添加索引优化查询性能（如果不存在）
DO $$
BEGIN
  -- 为新字段创建索引
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vocabulary_next_review') THEN
    CREATE INDEX idx_vocabulary_next_review ON vocabulary(next_review);
    RAISE NOTICE 'Created index idx_vocabulary_next_review';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vocabulary_ease_factor') THEN
    CREATE INDEX idx_vocabulary_ease_factor ON vocabulary(ease_factor);
    RAISE NOTICE 'Created index idx_vocabulary_ease_factor';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vocabulary_user_next_review') THEN
    CREATE INDEX idx_vocabulary_user_next_review ON vocabulary(user_id, next_review);
    RAISE NOTICE 'Created index idx_vocabulary_user_next_review';
  END IF;

  -- 为练习记录表创建索引
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_practice_records_user_id') THEN
    CREATE INDEX idx_practice_records_user_id ON practice_records(user_id);
    RAISE NOTICE 'Created index idx_practice_records_user_id';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_practice_records_vocabulary_id') THEN
    CREATE INDEX idx_practice_records_vocabulary_id ON practice_records(vocabulary_id);
    RAISE NOTICE 'Created index idx_practice_records_vocabulary_id';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_practice_records_created_at') THEN
    CREATE INDEX idx_practice_records_created_at ON practice_records(created_at DESC);
    RAISE NOTICE 'Created index idx_practice_records_created_at';
  END IF;

  -- 为学习统计表创建索引
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_learning_stats_user_id') THEN
    CREATE INDEX idx_learning_stats_user_id ON learning_stats(user_id);
    RAISE NOTICE 'Created index idx_learning_stats_user_id';
  END IF;
END $$;

-- 7. 添加约束确保数据完整性（如果不存在）
DO $$ 
BEGIN
  -- ease_factor 约束
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ease_factor') THEN
    ALTER TABLE vocabulary ADD CONSTRAINT chk_ease_factor 
    CHECK (ease_factor >= 1.3 AND ease_factor <= 3.0);
    RAISE NOTICE 'Added ease_factor constraint';
  END IF;

  -- interval 约束
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_interval') THEN
    ALTER TABLE vocabulary ADD CONSTRAINT chk_interval 
    CHECK (interval >= 0 AND interval <= 365);
    RAISE NOTICE 'Added interval constraint';
  END IF;

  -- practice_records 约束
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_difficulty_rating') THEN
    ALTER TABLE practice_records ADD CONSTRAINT chk_difficulty_rating 
    CHECK (difficulty_rating >= 0 AND difficulty_rating <= 5);
    RAISE NOTICE 'Added difficulty_rating constraint';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_performance_rating') THEN
    ALTER TABLE practice_records ADD CONSTRAINT chk_performance_rating 
    CHECK (performance_rating >= 0 AND performance_rating <= 5);
    RAISE NOTICE 'Added performance_rating constraint';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_response_time') THEN
    ALTER TABLE practice_records ADD CONSTRAINT chk_response_time 
    CHECK (response_time >= 0 AND response_time <= 300);
    RAISE NOTICE 'Added response_time constraint';
  END IF;

  -- learning_stats 约束
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_accuracy_rate') THEN
    ALTER TABLE learning_stats ADD CONSTRAINT chk_accuracy_rate 
    CHECK (accuracy_rate >= 0 AND accuracy_rate <= 1);
    RAISE NOTICE 'Added accuracy_rate constraint';
  END IF;
END $$;

-- 8. 创建自动更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_vocabulary_modtime') THEN
        CREATE TRIGGER update_vocabulary_modtime BEFORE UPDATE ON vocabulary
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
        RAISE NOTICE 'Created vocabulary update trigger';
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_learning_stats_modtime') THEN
        CREATE TRIGGER update_learning_stats_modtime BEFORE UPDATE ON learning_stats
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
        RAISE NOTICE 'Created learning_stats update trigger';
    END IF;
END$$;

-- 9. 添加表注释
COMMENT ON TABLE vocabulary IS '用户词汇表 - 支持遗忘曲线算法';
COMMENT ON COLUMN vocabulary.ease_factor IS '遗忘曲线难度因子 (1.3-3.0)';
COMMENT ON COLUMN vocabulary.interval IS '当前复习间隔天数';
COMMENT ON COLUMN vocabulary.repetitions IS '成功复习次数';
COMMENT ON COLUMN vocabulary.next_review IS '下次计划复习日期';
COMMENT ON COLUMN vocabulary.total_reviews IS '总复习次数';
COMMENT ON COLUMN vocabulary.correct_reviews IS '正确复习次数';

COMMENT ON TABLE practice_records IS '练习记录表 - 记录所有练习活动';
COMMENT ON COLUMN practice_records.exercise_type IS '练习题型: word-meaning-match, sentence-completion等';
COMMENT ON COLUMN practice_records.response_time IS '响应时间(秒)';
COMMENT ON COLUMN practice_records.difficulty_rating IS '用户主观难度评分 0-5';
COMMENT ON COLUMN practice_records.performance_rating IS '算法计算的表现评分 0-5';

COMMENT ON TABLE learning_stats IS '学习统计表 - 用户学习数据汇总';
COMMENT ON COLUMN learning_stats.accuracy_rate IS '整体准确率 0-1';
COMMENT ON COLUMN learning_stats.streak_days IS '连续学习天数';

-- 迁移完成提示
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '数据库迁移完成！';
  RAISE NOTICE '已为现有词汇表添加遗忘曲线功能支持';
  RAISE NOTICE '已创建练习记录表和学习统计表';
  RAISE NOTICE '已为现有词汇数据初始化遗忘曲线参数';
  RAISE NOTICE '已添加相关索引和约束优化性能';
  RAISE NOTICE '==============================================';
END $$; 