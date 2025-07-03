-- 添加实时功能所需的数据库表和触发器
-- 2025-01-31 Real-time Features Implementation

-- 创建好友活动表
CREATE TABLE IF NOT EXISTS friend_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('level_up', 'achievement_unlock', 'points_earned', 'new_post', 'friend_added')),
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_friend_activities_user_id ON friend_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_activities_friend_user_id ON friend_activities(friend_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_activities_created_at ON friend_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_activities_type ON friend_activities(activity_type);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_friend_activities_user_created ON friend_activities(user_id, created_at DESC);

-- 启用 RLS
ALTER TABLE friend_activities ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view friend activities" ON friend_activities
    FOR SELECT USING (
        user_id = auth.uid() OR 
        friend_user_id = auth.uid()
    );

CREATE POLICY "Users can insert friend activities" ON friend_activities
    FOR INSERT WITH CHECK (
        friend_user_id = auth.uid()
    );

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_friend_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friend_activities_updated_at
    BEFORE UPDATE ON friend_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_friend_activities_updated_at();

-- 创建清理旧活动的函数（保留最近30天）
CREATE OR REPLACE FUNCTION cleanup_old_friend_activities()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM friend_activities 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE friend_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_learning_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;

-- 为实时功能优化索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- 为社区帖子实时更新优化
CREATE INDEX IF NOT EXISTS idx_community_posts_public_created ON community_posts(is_public, created_at DESC) WHERE is_public = true;

-- 创建好友活动汇总视图（可选，用于性能优化）
CREATE OR REPLACE VIEW friend_activity_summary AS
SELECT 
    fa.user_id,
    fa.friend_user_id,
    fa.activity_type,
    fa.activity_data,
    fa.created_at,
    up.display_name as friend_display_name,
    up.avatar_url as friend_avatar_url
FROM friend_activities fa
LEFT JOIN user_profiles up ON fa.friend_user_id = up.user_id
WHERE fa.created_at > NOW() - INTERVAL '7 days'
ORDER BY fa.created_at DESC;

-- 启用视图的 RLS
ALTER VIEW friend_activity_summary SET (security_barrier = true);

-- 创建通知，提示用户实时功能已启用
INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
    id as user_id,
    'system' as type,
    '🚀 Real-time Features Enabled!' as title,
    'You can now see live updates from friends and leaderboard changes in real-time!' as message,
    '{"feature": "realtime", "version": "1.0"}' as data
FROM auth.users
WHERE id NOT IN (
    SELECT user_id FROM notifications 
    WHERE type = 'system' AND data->>'feature' = 'realtime'
)
LIMIT 100; -- 限制数量避免大量通知

-- 创建定期清理任务的调度（需要 pg_cron 扩展，可选）
-- SELECT cron.schedule('cleanup-friend-activities', '0 2 * * *', 'SELECT cleanup_old_friend_activities();');

COMMIT;