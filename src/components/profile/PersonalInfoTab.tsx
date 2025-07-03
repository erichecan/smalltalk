import { 
  Box, 
  Paper, 
  Typography, 
  LinearProgress, 
  Chip, 
  Stack, 
  Grid,
  Card,
  CardContent
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTranslation } from 'react-i18next';

interface PersonalInfoTabProps {}

function PersonalInfoTab({}: PersonalInfoTabProps) {
  const { t } = useTranslation('auth');

  const learningStats = [
    {
      icon: <ChatIcon sx={{ color: '#12e712', fontSize: 32 }} />,
      title: t('profile.conversations', 'Conversations'),
      value: 35,
      target: 50,
      unit: t('profile.sessions', 'sessions')
    },
    {
      icon: <MenuBookIcon sx={{ color: '#2196F3', fontSize: 32 }} />,
      title: t('profile.vocabulary', 'Vocabulary'),
      value: 150,
      target: 200,
      unit: t('profile.words', 'words')
    },
    {
      icon: <QuizIcon sx={{ color: '#FF9800', fontSize: 32 }} />,
      title: t('profile.quizzes', 'Quizzes'),
      value: 28,
      target: 50,
      unit: t('profile.completed', 'completed')
    },
    {
      icon: <LocalFireDepartmentIcon sx={{ color: '#F44336', fontSize: 32 }} />,
      title: t('profile.streak', 'Learning Streak'),
      value: 7,
      target: 30,
      unit: t('profile.days', 'days')
    }
  ];

  const interests = [
    t('profile.interests.travel', 'Travel'),
    t('profile.interests.food', 'Food & Cooking'),
    t('profile.interests.culture', 'Culture'),
    t('profile.interests.technology', 'Technology'),
    t('profile.interests.sports', 'Sports'),
    t('profile.interests.music', 'Music')
  ];

  const recentActivity = [
    {
      date: '2025-01-31',
      type: 'conversation',
      description: t('profile.activity.completedConversation', 'Completed conversation about travel plans'),
      points: 10
    },
    {
      date: '2025-01-31',
      type: 'vocabulary',
      description: t('profile.activity.learnedWords', 'Learned 5 new words about business'),
      points: 25
    },
    {
      date: '2025-01-30',
      type: 'quiz',
      description: t('profile.activity.completedQuiz', 'Completed vocabulary quiz with 90% accuracy'),
      points: 18
    },
    {
      date: '2025-01-30',
      type: 'achievement',
      description: t('profile.activity.unlockedAchievement', 'Unlocked "Vocabulary Builder" achievement'),
      points: 50
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <ChatIcon sx={{ color: '#12e712', fontSize: 20 }} />;
      case 'vocabulary':
        return <MenuBookIcon sx={{ color: '#2196F3', fontSize: 20 }} />;
      case 'quiz':
        return <QuizIcon sx={{ color: '#FF9800', fontSize: 20 }} />;
      case 'achievement':
        return <LocalFireDepartmentIcon sx={{ color: '#F44336', fontSize: 20 }} />;
      default:
        return <CalendarTodayIcon sx={{ color: '#4c9a4c', fontSize: 20 }} />;
    }
  };

  return (
    <Box>
      {/* 学习统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {learningStats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card sx={{ 
              borderRadius: 3, 
              border: '1px solid #e7f3e7',
              boxShadow: '0 2px 8px rgba(76,154,76,0.1)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(76,154,76,0.15)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h5" sx={{ color: '#0d1b0d', fontWeight: 'bold', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  {stat.title}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(stat.value / stat.target) * 100} 
                  sx={{ 
                    bgcolor: '#e7f3e7', 
                    height: 6, 
                    borderRadius: 3,
                    '& .MuiLinearProgress-bar': { 
                      bgcolor: '#12e712' 
                    } 
                  }} 
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  {stat.value}/{stat.target} {stat.unit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 个人简介 */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        boxShadow: '0 2px 8px rgba(76,154,76,0.1)'
      }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold', mb: 2 }}>
          📝 {t('profile.aboutMe', 'About Me')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.6 }}>
          {t('profile.bio', 'Passionate language learner exploring the world through English conversations. I love discussing travel, culture, and technology. Always excited to learn new words and improve my speaking skills!')}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarTodayIcon sx={{ color: '#4c9a4c', fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('profile.memberSince', 'Member since')} {t('profile.joinDate', 'December 2024')}
          </Typography>
        </Stack>
      </Paper>

      {/* 兴趣标签 */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        boxShadow: '0 2px 8px rgba(76,154,76,0.1)'
      }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold', mb: 2 }}>
          🏷️ {t('profile.interests.title', 'Interests')}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {interests.map((interest, index) => (
            <Chip
              key={index}
              label={interest}
              sx={{
                bgcolor: '#e7f3e7',
                color: '#0d1b0d',
                fontWeight: 500,
                fontSize: 14,
                mb: 1,
                '&:hover': {
                  bgcolor: '#12e712',
                  color: '#0d1b0d'
                }
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* 最近活动 */}
      <Paper sx={{ 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        boxShadow: '0 2px 8px rgba(76,154,76,0.1)'
      }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e7f3e7', bgcolor: '#f8fcf8' }}>
          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
            📈 {t('profile.recentActivity', 'Recent Activity')}
          </Typography>
        </Box>
        
        <Box sx={{ p: 0 }}>
          {recentActivity.map((activity, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderBottom: index < recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none',
                '&:hover': {
                  bgcolor: 'rgba(76, 154, 76, 0.05)'
                }
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ mt: 0.5 }}>
                  {getActivityIcon(activity.type)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ color: 'text.primary', mb: 0.5 }}>
                    {activity.description}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {new Date(activity.date).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={`+${activity.points} ${t('profile.points', 'points')}`}
                      size="small"
                      sx={{
                        bgcolor: '#e7f3e7',
                        color: '#4c9a4c',
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default PersonalInfoTab;