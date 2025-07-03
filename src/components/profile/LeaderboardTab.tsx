import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Stack, 
  Chip, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import { useTranslation } from 'react-i18next';
import { pointsService } from '../../services/pointsService';
import type { LeaderboardEntry } from '../../services/pointsService';
import { useAuth } from '../../contexts/AuthContext';

interface LeaderboardTabProps {}

function LeaderboardTab({}: LeaderboardTabProps) {
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboardData();
  }, [activeTab]);

  const loadLeaderboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // 根据标签页加载不同时间范围的排行榜
      const timeframe = activeTab === 0 ? 'all' : activeTab === 1 ? 'week' : 'month';
      const [leaderboardData, userRankData] = await Promise.all([
        pointsService.getLeaderboard(50, timeframe),
        pointsService.getUserRank(user.id)
      ]);

      setLeaderboard(leaderboardData);
      setUserRank(userRankData);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 24 }} />;
      case 2:
        return <EmojiEventsIcon sx={{ color: '#C0C0C0', fontSize: 24 }} />;
      case 3:
        return <EmojiEventsIcon sx={{ color: '#CD7F32', fontSize: 24 }} />;
      default:
        return (
          <Box sx={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            bgcolor: '#e7f3e7', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#4c9a4c'
          }}>
            {rank}
          </Box>
        );
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return '#FFD700';
    if (rank <= 10) return '#4c9a4c';
    return '#666';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#4c9a4c' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mx: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* 用户排名卡片 */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        background: 'linear-gradient(135deg, #12e712 0%, #4c9a4c 100%)',
        color: 'white'
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ textAlign: 'center' }}>
            {getRankIcon(userRank)}
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
              #{userRank}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {t('profile.leaderboard.yourRank', 'Your Rank')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {userRank <= 10 
                ? t('profile.leaderboard.topTen', 'You\'re in the top 10!')
                : t('profile.leaderboard.keepGoing', 'Keep learning to climb higher!')
              }
            </Typography>
          </Box>
          <TrendingUpIcon sx={{ fontSize: 32, opacity: 0.8 }} />
        </Stack>
      </Paper>

      {/* 排行榜类型选择 */}
      <Paper sx={{ 
        mb: 3, 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        overflow: 'hidden'
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#12e712',
              height: 3
            },
            '& .MuiTab-root': {
              flex: 1,
              color: '#4c9a4c',
              fontWeight: 500,
              '&.Mui-selected': {
                color: '#0d1b0d',
                fontWeight: 600
              }
            }
          }}
        >
          <Tab 
            label={t('profile.leaderboard.allTime', 'All Time')} 
            icon={<StarIcon />}
            iconPosition="start"
          />
          <Tab 
            label={t('profile.leaderboard.thisWeek', 'This Week')} 
            icon={<TrendingUpIcon />}
            iconPosition="start"
          />
          <Tab 
            label={t('profile.leaderboard.thisMonth', 'This Month')} 
            icon={<EmojiEventsIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* 排行榜列表 */}
      <Paper sx={{ 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        overflow: 'hidden'
      }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e7f3e7', bgcolor: '#f8fcf8' }}>
          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
            🏆 {t('profile.leaderboard.topLearners', 'Top Learners')}
          </Typography>
        </Box>
        
        <List sx={{ p: 0 }}>
          {leaderboard.map((entry, index) => (
            <ListItem
              key={entry.user_id}
              sx={{
                py: 2,
                px: 3,
                borderBottom: index < leaderboard.length - 1 ? '1px solid #f0f0f0' : 'none',
                bgcolor: entry.user_id === user?.id ? 'rgba(18, 231, 18, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: entry.user_id === user?.id 
                    ? 'rgba(18, 231, 18, 0.15)' 
                    : 'rgba(76, 154, 76, 0.05)'
                }
              }}
            >
              <ListItemAvatar>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {getRankIcon(entry.rank)}
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {entry.display_name?.charAt(0) || 'U'}
                  </Avatar>
                </Stack>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: entry.user_id === user?.id ? 'bold' : 'medium',
                        color: entry.user_id === user?.id ? '#0d1b0d' : 'text.primary'
                      }}
                    >
                      {entry.display_name || 'Anonymous User'}
                    </Typography>
                    {entry.user_id === user?.id && (
                      <Chip 
                        label="You" 
                        size="small" 
                        sx={{ 
                          bgcolor: '#12e712', 
                          color: '#0d1b0d', 
                          fontWeight: 'bold',
                          fontSize: '10px'
                        }} 
                      />
                    )}
                  </Stack>
                }
                secondary={
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getRankColor(entry.rank),
                        fontWeight: 'medium' 
                      }}
                    >
                      {entry.total_points.toLocaleString()} {t('profile.points', 'points')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Level {entry.level}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>

        {leaderboard.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {t('profile.leaderboard.noData', 'No leaderboard data available')}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default LeaderboardTab;