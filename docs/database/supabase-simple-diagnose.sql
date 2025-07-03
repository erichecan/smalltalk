-- SmallTalk 数据库简单诊断脚本
-- 创建时间: 2025-01-31 11:50:00
-- 用途: 简单诊断，避免复杂语法

-- ============================================
-- 第一步：检查现有表
-- ============================================

-- 检查 user_points 表是否存在
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points') 
    THEN 'user_points table EXISTS'
    ELSE 'user_points table DOES NOT EXIST'
  END as table_status;

-- ============================================
-- 第二步：如果表存在，显示列结构
-- ============================================

-- 显示 user_points 表的所有列
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_points'
ORDER BY ordinal_position;

-- ============================================
-- 第三步：创建表 (如果不存在)
-- ============================================

-- 创建用户积分表
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  user_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 第四步：验证表创建
-- ============================================

-- 再次检查表是否存在
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points') 
    THEN 'user_points table CREATED SUCCESSFULLY'
    ELSE 'user_points table CREATION FAILED'
  END as creation_status;

-- 显示新创建表的列结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_points'
ORDER BY ordinal_position;

-- ============================================
-- 第五步：检查 user_level 列
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
-- 第六步：尝试创建索引
-- ============================================

-- 创建基本索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
SELECT 'user_id index created' as status;

CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
SELECT 'total_points index created' as status;

-- 尝试创建 user_level 索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_level ON user_points(user_level DESC);
SELECT 'user_level index created' as status;

-- ============================================
-- 第七步：显示所有相关表
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
SELECT 'Simple database diagnosis completed' as status;
