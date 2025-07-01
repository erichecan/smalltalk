-- SmallTalk 对话收藏功能数据库升级脚本
-- 执行时间：2025-01-30
-- 说明：为 conversation_history 表添加收藏功能相关字段和索引

-- 1. 检查并添加 bookmarked 字段到 conversation_history 表
DO $$ 
BEGIN
    -- 检查字段是否已存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversation_history' 
        AND column_name='bookmarked'
    ) THEN
        -- 添加 bookmarked 字段，默认值为 false
        ALTER TABLE conversation_history 
        ADD COLUMN bookmarked BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Successfully added bookmarked column to conversation_history table';
    ELSE
        RAISE NOTICE 'Column bookmarked already exists in conversation_history table';
    END IF;
END $$;

-- 2. 为 bookmarked 字段创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_conversation_history_bookmarked 
ON conversation_history(bookmarked);

-- 3. 为组合查询创建复合索引（用户ID + 收藏状态）
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_bookmarked 
ON conversation_history(user_id, bookmarked);

-- 4. 验证字段是否添加成功
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversation_history' 
        AND column_name='bookmarked'
    ) THEN
        RAISE NOTICE '✅ Verification successful: bookmarked field exists in conversation_history table';
    ELSE
        RAISE EXCEPTION '❌ Verification failed: bookmarked field was not added to conversation_history table';
    END IF;
END $$;

-- 5. 可选：更新现有数据，将所有现有对话的收藏状态设为false（已通过DEFAULT值处理）
-- UPDATE conversation_history SET bookmarked = false WHERE bookmarked IS NULL;

-- 6. 添加注释说明
COMMENT ON COLUMN conversation_history.bookmarked IS '对话收藏状态: true=已收藏, false=未收藏';

-- 执行完毕提示
SELECT 'SmallTalk conversation bookmark feature database upgrade completed successfully! 🎉' as result; 