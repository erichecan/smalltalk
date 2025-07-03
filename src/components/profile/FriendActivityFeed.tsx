import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Alert,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useTranslation } from 'react-i18next';
import { useRealtime } from '../../hooks/useRealtime';
import type { FriendActivity } from '../../services/realtimeService';

interface FriendActivityFeedProps {}

function FriendActivityFeed({}: FriendActivityFeedProps) {
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const { friendActivities, clearFriendActivities, connectionStatus } = useRealtime();
  const [expanded, setExpanded] = useState(true);
  const [newActivitiesCount, setNewActivitiesCount] = useState(0);

  // 监听新活动
  useEffect(() => {
    if (friendActivities.length > 0 && !expanded) {
      setNewActivitiesCount(prev => prev + 1);
    }
  }, [friendActivities.length, expanded]);

  // 展开时重置计数
  useEffect(() => {
    if (expanded) {
      setNewActivitiesCount(0);
    }
  }, [expanded]);

  const getActivityIcon = (activityType: FriendActivity['activity_type']) => {
    switch (activityType) {
      case 'level_up':
        return <TrendingUpIcon sx={{ color: '#FF9800' }} />;
      case 'achievement_unlock':
        return <EmojiEventsIcon sx={{ color: '#FFD700' }} />;
      case 'points_earned':
        return <StarIcon sx={{ color: '#4CAF50' }} />;
      case 'new_post':
        return <PostAddIcon sx={{ color: '#2196F3' }} />;
      case 'friend_added':
        return <PersonAddIcon sx={{ color: '#E91E63' }} />;
      default:
        return <StarIcon sx={{ color: '#9E9E9E' }} />;
    }
  };

  const getActivityMessage = (activity: FriendActivity) => {
    const { activity_type, activity_data } = activity;
    const displayName = activity.user_profile?.display_name || 'A friend';

    switch (activity_type) {
      case 'level_up':
        return `${displayName} reached level ${activity_data.level}!`;
      case 'achievement_unlock':
        return `${displayName} unlocked "${activity_data.achievement_name}" achievement!`;
      case 'points_earned':
        return `${displayName} earned ${activity_data.points} points!`;
      case 'new_post':
        return `${displayName} shared a new post`;
      case 'friend_added':
        return `${displayName} made a new friend`;
      default:
        return `${displayName} has new activity`;
    }
  };

  const getActivityTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
        return '#FF9800';
      case 'disconnected':
        return '#9E9E9E';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <Paper sx={{ 
      borderRadius: 3, 
      border: '1px solid #e7f3e7',
      overflow: 'hidden'
    }}>
      {/* 头部 */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid #e7f3e7', 
          bgcolor: '#f8fcf8',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
              🔥 {t('profile.friends.activity', 'Friend Activity')}
            </Typography>
            
            {/* 连接状态指示器 */}
            <Chip
              size="small"
              label={getConnectionStatusText()}
              sx={{
                bgcolor: getConnectionStatusColor(),
                color: 'white',
                fontSize: '10px',
                height: '20px'
              }}
            />

            {/* 新活动计数 */}
            {newActivitiesCount > 0 && !expanded && (
              <Chip
                size="small"
                label={`+${newActivitiesCount}`}
                sx={{
                  bgcolor: '#FF5722',
                  color: 'white',
                  fontSize: '10px',
                  height: '20px'
                }}
              />
            )}
          </Stack>

          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </Box>

      {/* 活动列表 */}
      <Collapse in={expanded}>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {friendActivities.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {connectionStatus === 'connected' 
                  ? t('profile.friends.noActivity', 'No recent activity from friends')
                  : t('profile.friends.connecting', 'Connecting to real-time updates...')
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {friendActivities.slice(0, 20).map((activity, index) => (
                <ListItem
                  key={`${activity.id}-${index}`}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: index < Math.min(friendActivities.length, 20) - 1 
                      ? '1px solid #f0f0f0' 
                      : 'none',
                    '&:hover': {
                      bgcolor: 'rgba(76, 154, 76, 0.05)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'transparent' }}>
                      {getActivityIcon(activity.activity_type)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {getActivityMessage(activity)}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {getActivityTime(activity.created_at)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          {/* 清除按钮 */}
          {friendActivities.length > 0 && (
            <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#4c9a4c',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={clearFriendActivities}
              >
                {t('profile.friends.clearActivity', 'Clear Activity')}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* 连接错误提示 */}
      {connectionStatus === 'error' && (
        <Alert severity="warning" sx={{ m: 2 }}>
          <Typography variant="caption">
            {t('profile.friends.connectionError', 'Real-time updates unavailable. Some features may be limited.')}
          </Typography>
        </Alert>
      )}
    </Paper>
  );
}

export default FriendActivityFeed;