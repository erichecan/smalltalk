-- SmallTalk 数据库架构一致性修复脚本
-- 创建时间: 2024-03-21 15:45:00

-- =============================================
-- 第一步：修复数据类型不一致问题
-- =============================================

-- 1.1 修改 user_points 表的 user_id 类型
ALTER TABLE public.user_points 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
  ALTER COLUMN created_at TYPE timestamp with time zone,
  ALTER COLUMN updated_at TYPE timestamp with time zone;

-- 1.2 修改 vocabulary 表的时间戳和用户ID
ALTER TABLE public.vocabulary 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
  ALTER COLUMN created_at TYPE timestamp with time zone,
  ALTER COLUMN updated_at TYPE timestamp with time zone,
  ALTER COLUMN last_reviewed TYPE timestamp with time zone;

-- 1.3 修改 phrases 表
ALTER TABLE public.phrases 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
  ALTER COLUMN created_at TYPE timestamp with time zone,
  ALTER COLUMN updated_at TYPE timestamp with time zone;

-- 1.4 修改 grammar_progress 表
ALTER TABLE public.grammar_progress 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
  ALTER COLUMN created_at TYPE timestamp with time zone,
  ALTER COLUMN updated_at TYPE timestamp with time zone,
  ALTER COLUMN last_practiced TYPE timestamp with time zone;

-- 1.5 修改 learning_stats 表
ALTER TABLE public.learning_stats 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
  ALTER COLUMN created_at TYPE timestamp with time zone,
  ALTER COLUMN updated_at TYPE timestamp with time zone;

-- =============================================
-- 第二步：添加缺失的外键约束
-- =============================================

-- 2.1 添加 user_points 的外键约束
ALTER TABLE public.user_points
  ADD CONSTRAINT user_points_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 2.2 添加 vocabulary 的外键约束
ALTER TABLE public.vocabulary
  ADD CONSTRAINT vocabulary_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 2.3 添加 phrases 的外键约束
ALTER TABLE public.phrases
  ADD CONSTRAINT phrases_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 2.4 添加 grammar_progress 的外键约束
ALTER TABLE public.grammar_progress
  ADD CONSTRAINT grammar_progress_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 2.5 添加 learning_stats 的外键约束
ALTER TABLE public.learning_stats
  ADD CONSTRAINT learning_stats_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- =============================================
-- 第三步：添加缺失的索引
-- =============================================

-- 3.1 为 points_transactions 添加索引
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id_created 
  ON public.points_transactions(user_id, created_at DESC);

-- 3.2 为 vocabulary 添加复合索引
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_mastery 
  ON public.vocabulary(user_id, mastery_level);

-- 3.3 为 word_mastery_records 添加性能索引
CREATE INDEX IF NOT EXISTS idx_word_mastery_user_word 
  ON public.word_mastery_records(user_id, word_id);

-- =============================================
-- 第四步：添加触发器确保数据一致性
-- =============================================

-- 4.1 创建更新用户总积分的触发器
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_points 
    SET total_points = total_points + 
      CASE 
        WHEN NEW.transaction_type = 'earn' THEN NEW.points 
        ELSE -NEW.points 
      END
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_points
  AFTER INSERT ON public.points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_points();

-- 4.2 创建更新单词掌握度的触发器
CREATE OR REPLACE FUNCTION sync_word_mastery()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    UPDATE public.vocabulary 
    SET mastery_level = NEW.mastery_level
    WHERE id = NEW.word_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_word_mastery
  AFTER UPDATE OF mastery_level ON public.word_mastery_records
  FOR EACH ROW
  EXECUTE FUNCTION sync_word_mastery();

-- =============================================
-- 第五步：添加约束确保数据有效性
-- =============================================

-- 5.1 为积分添加非负约束
ALTER TABLE public.user_points
  ADD CONSTRAINT check_points_non_negative 
  CHECK (total_points >= 0);

-- 5.2 为等级添加有效范围约束
ALTER TABLE public.user_points
  ADD CONSTRAINT check_level_range 
  CHECK (level >= 1 AND level <= 100);

-- =============================================
-- 完成信息
-- =============================================
SELECT 'Database schema consistency fix completed.' as status; 