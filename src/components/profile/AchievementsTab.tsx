import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import AchievementTestButton from './AchievementTestButton';

interface Achievement {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points_reward: number;
  requirements: Record<string, any>;
  is_unlocked?: boolean;
  progress_value?: number;
  target_value?: number;
  unlocked_at?: string;
}

interface AchievementsTabProps {}

function AchievementsTab({}: AchievementsTabProps) {
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 模拟成就数据 - 实际应该从achievementService获取
      const mockAchievements: Achievement[] = [
        {
          id: 'first_conversation',
          category: 'learning',
          name: 'First Steps',
          description: 'Complete your first AI conversation',
          icon: '💬',
          rarity: 'common',
          points_reward: 10,
          requirements: { conversations: 1 },
          is_unlocked: true,
          progress_value: 1,
          target_value: 1,
          unlocked_at: '2025-01-30T10:00:00Z'
        },
        {
          id: 'vocabulary_builder',
          category: 'learning',
          name: 'Vocabulary Builder',
          description: 'Learn your first 10 words',
          icon: '📚',
          rarity: 'common',
          points_reward: 20,
          requirements: { words_learned: 10 },
          is_unlocked: true,
          progress_value: 15,
          target_value: 10,
          unlocked_at: '2025-01-31T08:30:00Z'
        },
        {
          id: 'quiz_master',
          category: 'learning',
          name: 'Quiz Master',
          description: 'Complete 5 quiz sessions',
          icon: '🎯',
          rarity: 'rare',
          points_reward: 15,
          requirements: { quiz_sessions: 5 },
          is_unlocked: false,
          progress_value: 3,
          target_value: 5
        },
        {
          id: 'social_butterfly',
          category: 'social',
          name: 'Social Butterfly',
          description: 'Make your first friend',
          icon: '👥',
          rarity: 'common',
          points_reward: 25,
          requirements: { friends: 1 },
          is_unlocked: false,
          progress_value: 0,
          target_value: 1
        },
        {
          id: 'streak_starter',
          category: 'streak',
          name: 'Streak Starter',
          description: 'Maintain a 3-day learning streak',
          icon: '🔥',
          rarity: 'rare',
          points_reward: 30,
          requirements: { streak_days: 3 },
          is_unlocked: false,
          progress_value: 2,
          target_value: 3
        },
        {
          id: 'word_master',
          category: 'learning',
          name: 'Word Master',
          description: 'Master 50 words',
          icon: '🏆',
          rarity: 'epic',
          points_reward: 100,
          requirements: { mastered_words: 50 },
          is_unlocked: false,
          progress_value: 8,
          target_value: 50
        },
        {
          id: 'conversation_legend',
          category: 'learning',
          name: 'Conversation Legend',
          description: 'Complete 100 conversations',
          icon: '⭐',
          rarity: 'legendary',
          points_reward: 500,
          requirements: { conversations: 100 },
          is_unlocked: false,
          progress_value: 35,
          target_value: 100
        }
      ];

      setAchievements(mockAchievements);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#4CAF50';
      case 'rare':
        return '#2196F3';
      case 'epic':
        return '#9C27B0';
      case 'legendary':
        return '#FF9800';
      default:
        return '#4c9a4c';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)';
      case 'rare':
        return 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)';
      case 'epic':
        return 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)';
      case 'legendary':
        return 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
      default:
        return 'linear-gradient(135deg, #4c9a4c 0%, #6bb66b 100%)';
    }
  };

  const getFilteredAchievements = () => {
    switch (activeTab) {
      case 0: // All
        return achievements;
      case 1: // Unlocked
        return achievements.filter(a => a.is_unlocked);
      case 2: // In Progress
        return achievements.filter(a => !a.is_unlocked && (a.progress_value || 0) > 0);
      case 3: // Locked
        return achievements.filter(a => !a.is_unlocked && (a.progress_value || 0) === 0);
      default:
        return achievements;
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (achievement.is_unlocked) return 100;
    if (!achievement.progress_value || !achievement.target_value) return 0;
    return Math.min((achievement.progress_value / achievement.target_value) * 100, 100);
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

  const filteredAchievements = getFilteredAchievements();
  const unlockedCount = achievements.filter(a => a.is_unlocked).length;
  const totalPoints = achievements.filter(a => a.is_unlocked).reduce((sum, a) => sum + a.points_reward, 0);

  return (
    <Box>
      {/* Test Buttons (Development Only) */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff3cd', border: '1px solid #ffeaa7' }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#856404' }}>
          Development Testing:
        </Typography>
        <AchievementTestButton />
      </Paper>

      {/* 统计概览 */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        background: 'linear-gradient(135deg, #12e712 0%, #4c9a4c 100%)',
        color: 'white'
      }}>
        <Stack direction="row" spacing={4} alignItems="center">
          <Box sx={{ textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {unlockedCount}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t('profile.achievements.unlocked', 'Unlocked')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('profile.achievements.progress', 'Achievement Progress')}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(unlockedCount / achievements.length) * 100}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.3)', 
                height: 8, 
                borderRadius: 4,
                '& .MuiLinearProgress-bar': { 
                  bgcolor: 'rgba(255,255,255,0.9)' 
                } 
              }} 
            />
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {unlockedCount} of {achievements.length} achievements • {totalPoints} points earned
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* 筛选标签 */}
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
          <Tab label={`${t('profile.achievements.all', 'All')} (${achievements.length})`} />
          <Tab label={`${t('profile.achievements.unlocked', 'Unlocked')} (${unlockedCount})`} />
          <Tab label={`${t('profile.achievements.inProgress', 'In Progress')} (${achievements.filter(a => !a.is_unlocked && (a.progress_value || 0) > 0).length})`} />
          <Tab label={`${t('profile.achievements.locked', 'Locked')} (${achievements.filter(a => !a.is_unlocked && (a.progress_value || 0) === 0).length})`} />
        </Tabs>
      </Paper>

      {/* 成就网格 */}
      <Grid container spacing={2}>
        {filteredAchievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <Card sx={{ 
              borderRadius: 3, 
              border: '1px solid #e7f3e7',
              boxShadow: achievement.is_unlocked 
                ? '0 4px 16px rgba(18, 231, 18, 0.2)' 
                : '0 2px 8px rgba(76,154,76,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: achievement.is_unlocked 
                  ? '0 6px 20px rgba(18, 231, 18, 0.3)' 
                  : '0 4px 16px rgba(76,154,76,0.15)',
                transition: 'all 0.3s ease'
              }
            }}>
              {/* 稀有度装饰条 */}
              <Box sx={{ 
                height: 4, 
                background: getRarityGradient(achievement.rarity) 
              }} />
              
              <CardContent sx={{ p: 2, position: 'relative' }}>
                {/* 解锁状态图标 */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8 
                }}>
                  {achievement.is_unlocked ? (
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                  ) : (
                    <LockIcon sx={{ color: '#ccc', fontSize: 20 }} />
                  )}
                </Box>

                {/* 成就图标 */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 1,
                  opacity: achievement.is_unlocked ? 1 : 0.6,
                  filter: achievement.is_unlocked ? 'none' : 'grayscale(100%)'
                }}>
                  <Typography variant="h2" component="div">
                    {achievement.icon}
                  </Typography>
                </Box>

                {/* 成就信息 */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: achievement.is_unlocked ? '#0d1b0d' : '#666',
                    fontWeight: 'bold', 
                    mb: 0.5,
                    textAlign: 'center'
                  }}
                >
                  {achievement.name}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary', 
                    mb: 1,
                    textAlign: 'center',
                    lineHeight: 1.4
                  }}
                >
                  {achievement.description}
                </Typography>

                {/* 稀有度和奖励 */}
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1 }}>
                  <Chip
                    label={achievement.rarity.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getRarityColor(achievement.rarity),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}
                  />
                  <Chip
                    label={`+${achievement.points_reward} pts`}
                    size="small"
                    sx={{
                      bgcolor: '#e7f3e7',
                      color: '#4c9a4c',
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}
                  />
                </Stack>

                {/* 进度条 */}
                {!achievement.is_unlocked && achievement.target_value && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProgressPercentage(achievement)}
                      sx={{ 
                        bgcolor: '#e7f3e7', 
                        height: 6, 
                        borderRadius: 3,
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: getRarityColor(achievement.rarity)
                        } 
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', textAlign: 'center' }}>
                      {achievement.progress_value || 0} / {achievement.target_value}
                    </Typography>
                  </Box>
                )}

                {/* 解锁时间 */}
                {achievement.is_unlocked && achievement.unlocked_at && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block', mt: 1 }}>
                    {t('profile.achievements.unlockedOn', 'Unlocked on')} {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAchievements.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('profile.achievements.noAchievements', 'No achievements found in this category')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default AchievementsTab;