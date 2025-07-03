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
  Slide,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTranslation } from 'react-i18next';
import { useRealtime } from '../../hooks/useRealtime';
import type { LeaderboardUpdate } from '../../services/realtimeService';

interface LeaderboardUpdatesProps {}

function LeaderboardUpdates({}: LeaderboardUpdatesProps) {
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const { leaderboardUpdates, clearLeaderboardUpdates } = useRealtime();
  const [expanded, setExpanded] = useState(false);
  const [recentUpdate, setRecentUpdate] = useState<LeaderboardUpdate | null>(null);
  const [showRecentUpdate, setShowRecentUpdate] = useState(false);

  // 显示最新更新的浮动通知
  useEffect(() => {
    if (leaderboardUpdates.length > 0) {
      const latest = leaderboardUpdates[0];
      setRecentUpdate(latest);
      setShowRecentUpdate(true);

      // 3秒后自动隐藏
      const timer = setTimeout(() => {
        setShowRecentUpdate(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [leaderboardUpdates.length]);

  const getRankChangeIcon = (update: LeaderboardUpdate) => {
    if (!update.old_rank) {
      return <StarIcon sx={{ color: '#4CAF50' }} />; // 新用户
    }
    
    if (update.new_rank < update.old_rank) {
      return <TrendingUpIcon sx={{ color: '#4CAF50' }} />; // 排名上升
    } else if (update.new_rank > update.old_rank) {
      return <TrendingDownIcon sx={{ color: '#FF5722' }} />; // 排名下降
    } else {
      return <StarIcon sx={{ color: '#FF9800' }} />; // 排名相同但有活动
    }
  };

  const getRankChangeMessage = (update: LeaderboardUpdate) => {
    const displayName = update.display_name || 'Someone';
    
    if (!update.old_rank) {
      return `${displayName} joined the leaderboard at #${update.new_rank}`;
    }
    
    if (update.new_rank < update.old_rank) {
      const change = update.old_rank - update.new_rank;
      return `${displayName} climbed ${change} ${change === 1 ? 'spot' : 'spots'} to #${update.new_rank}`;
    } else if (update.new_rank > update.old_rank) {
      const change = update.new_rank - update.old_rank;
      return `${displayName} dropped ${change} ${change === 1 ? 'spot' : 'spots'} to #${update.new_rank}`;
    } else {
      return `${displayName} earned ${update.total_points.toLocaleString()} points`;
    }
  };

  const getRankChangeColor = (update: LeaderboardUpdate) => {
    if (!update.old_rank) return '#4CAF50';
    if (update.new_rank < update.old_rank) return '#4CAF50';
    if (update.new_rank > update.old_rank) return '#FF5722';
    return '#FF9800';
  };

  return (
    <Box>
      {/* 浮动的最新更新通知 */}
      <Slide direction="left" in={showRecentUpdate && !expanded}>
        <Paper
          sx={{
            position: 'fixed',
            top: 100,
            right: 20,
            zIndex: 1000,
            p: 2,
            background: 'linear-gradient(135deg, #12e712 0%, #4c9a4c 100%)',
            color: 'white',
            borderRadius: 2,
            maxWidth: 300,
            cursor: 'pointer'
          }}
          onClick={() => {
            setExpanded(true);
            setShowRecentUpdate(false);
          }}
        >
          {recentUpdate && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                {getRankChangeIcon(recentUpdate)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Leaderboard Update
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {getRankChangeMessage(recentUpdate)}
                </Typography>
              </Box>
            </Stack>
          )}
        </Paper>
      </Slide>

      {/* 排行榜更新列表 */}
      <Paper sx={{ 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        overflow: 'hidden',
        mt: 1
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
                📊 {t('profile.leaderboard.liveUpdates', 'Live Updates')}
              </Typography>
              
              {leaderboardUpdates.length > 0 && (
                <Chip
                  size="small"
                  label={leaderboardUpdates.length}
                  sx={{
                    bgcolor: '#4c9a4c',
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

        {/* 更新列表 */}
        <Collapse in={expanded}>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {leaderboardUpdates.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('profile.leaderboard.noUpdates', 'No recent leaderboard changes')}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {leaderboardUpdates.slice(0, 15).map((update, index) => (
                  <ListItem
                    key={`${update.user_id}-${index}`}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderBottom: index < Math.min(leaderboardUpdates.length, 15) - 1 
                        ? '1px solid #f0f0f0' 
                        : 'none',
                      bgcolor: index === 0 ? 'rgba(76, 154, 76, 0.05)' : 'transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        width: 36, 
                        height: 36, 
                        bgcolor: 'transparent',
                        border: `2px solid ${getRankChangeColor(update)}`
                      }}>
                        {getRankChangeIcon(update)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {getRankChangeMessage(update)}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={`Level ${update.level}`}
                            sx={{
                              bgcolor: '#e7f3e7',
                              color: '#4c9a4c',
                              fontSize: '10px',
                              height: '18px'
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {update.total_points.toLocaleString()} pts
                          </Typography>
                        </Stack>
                      }
                    />

                    {/* 排名变化指示器 */}
                    {update.old_rank && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: getRankChangeColor(update),
                            fontWeight: 'bold'
                          }}
                        >
                          #{update.old_rank} → #{update.new_rank}
                        </Typography>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            )}

            {/* 清除按钮 */}
            {leaderboardUpdates.length > 0 && (
              <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#4c9a4c',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={clearLeaderboardUpdates}
                >
                  {t('profile.leaderboard.clearUpdates', 'Clear Updates')}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}

export default LeaderboardUpdates;