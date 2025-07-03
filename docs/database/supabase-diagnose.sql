-- SmallTalk 数据库诊断脚本
-- 创建时间: 2025-01-31 11:40:00
-- 用途: 诊断现有数据库结构，找出问题所在

-- ============================================
-- 第一步：检查现有表结构
-- ============================================

-- 检查是否存在 user_points 表
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points') 
    THEN 'user_points table EXISTS'
    ELSE 'user_points table DOES NOT EXIST'
  END as table_status;

-- 如果表存在，检查其列结构
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points') THEN
    RAISE NOTICE 'user_points table columns:';
    FOR col IN 
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_points'
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE '  %: % (nullable: %, default: %)', 
        col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
  ELSE
    RAISE NOTICE 'user_points table does not exist';
  END IF;
END $$;

-- ============================================
-- 第二步：尝试创建表 (如果不存在)
-- ============================================

-- 创建用户积分表 (简化版)
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  user_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 验证表创建
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points') 
    THEN 'user_points table CREATED SUCCESSFULLY'
    ELSE 'user_points table CREATION FAILED'
  END as creation_status;

-- ============================================
-- 第三步：检查列是否存在
-- ============================================

-- 检查 user_level 列是否存在
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_points' AND column_name = 'user_level'
    ) 
    THEN 'user_level column EXISTS'
    ELSE 'user_level column DOES NOT EXIST'
  END as column_status;

-- ============================================
-- 第四步：尝试创建索引 (如果列存在)
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_points' AND column_name = 'user_level'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_user_points_user_level ON user_points(user_level DESC);
    RAISE NOTICE 'user_level index created successfully';
  ELSE
    RAISE NOTICE 'Cannot create user_level index - column does not exist';
  END IF;
END $$;

-- ============================================
-- 第五步：显示所有相关表
-- ============================================

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name LIKE '%point%' 
   OR table_name LIKE '%achievement%'
   OR table_name LIKE '%social%'
   OR table_name LIKE '%user%'
ORDER BY table_name;

-- ============================================
-- 诊断完成
-- ============================================
SELECT 'Database diagnosis completed' as status;
