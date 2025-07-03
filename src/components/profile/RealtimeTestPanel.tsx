import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeContext } from '../RealtimeProvider';
import { realtimeService } from '../../services/realtimeService';

interface RealtimeTestPanelProps {}

function RealtimeTestPanel({}: RealtimeTestPanelProps) {
  const { user } = useAuth();
  const { connectionStatus, isSubscribed, friendActivities, leaderboardUpdates } = useRealtimeContext();

  const simulateFriendActivity = async (type: 'level_up' | 'achievement_unlock' | 'points_earned') => {
    if (!user) return;

    const activityData = {
      level_up: {
        level: Math.floor(Math.random() * 20) + 1,
        bonus_points: 50
      },
      achievement_unlock: {
        achievement_id: 'test-achievement',
        achievement_name: 'Test Achievement',
        achievement_icon: '🏆',
        points_reward: 100,
        rarity: 'epic'
      },
      points_earned: {
        source: 'quiz',
        points: Math.floor(Math.random() * 100) + 10,
        score: 85
      }
    };

    await realtimeService.broadcastFriendActivity(user.id, type, activityData[type]);
  };

  const simulateLeaderboardUpdate = () => {
    // 模拟排行榜更新事件
    const event = new CustomEvent('leaderboardUpdate', {
      detail: {
        user_id: user?.id || 'test-user',
        old_rank: Math.floor(Math.random() * 50) + 10,
        new_rank: Math.floor(Math.random() * 10) + 1,
        total_points: Math.floor(Math.random() * 10000) + 1000,
        level: Math.floor(Math.random() * 20) + 1,
        display_name: 'Test User'
      }
    });
    window.dispatchEvent(event);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#9E9E9E';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd', border: '1px solid #2196F3' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#1976D2' }}>
        🧪 Real-time Testing Panel
      </Typography>

      {/* 连接状态 */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2">Connection Status:</Typography>
        <Chip
          label={connectionStatus}
          size="small"
          sx={{
            bgcolor: getConnectionStatusColor(),
            color: 'white',
            fontWeight: 'bold'
          }}
        />
        <Chip
          label={isSubscribed ? 'Subscribed' : 'Not Subscribed'}
          size="small"
          variant={isSubscribed ? 'filled' : 'outlined'}
          color={isSubscribed ? 'success' : 'default'}
        />
      </Stack>

      {/* 活动计数 */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip
          label={`Friend Activities: ${friendActivities.length}`}
          size="small"
          variant="outlined"
          color="primary"
        />
        <Chip
          label={`Leaderboard Updates: ${leaderboardUpdates.length}`}
          size="small"
          variant="outlined"
          color="secondary"
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* 测试按钮 */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
        Simulate Activities:
      </Typography>
      
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => simulateFriendActivity('level_up')}
          disabled={!user}
        >
          Level Up
        </Button>
        
        <Button
          size="small"
          variant="outlined"
          onClick={() => simulateFriendActivity('achievement_unlock')}
          disabled={!user}
        >
          Achievement
        </Button>
        
        <Button
          size="small"
          variant="outlined"
          onClick={() => simulateFriendActivity('points_earned')}
          disabled={!user}
        >
          Points Earned
        </Button>
        
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={simulateLeaderboardUpdate}
        >
          Leaderboard Update
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
        Note: These are test functions for development. Real activities will be triggered by actual user actions.
      </Typography>
    </Paper>
  );
}

export default RealtimeTestPanel;