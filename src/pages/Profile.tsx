import { Container, Box, Typography, Avatar, Paper, LinearProgress, Chip, Stack, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import ProfileMenu from '../components/ProfileMenu';

function Profile() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const { t } = useTranslation('auth');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0, fontFamily: 'Spline Sans, Noto Sans, sans-serif', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(248,252,248,0.8)', backdropFilter: 'blur(8px)', px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 0 }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>{t('profile.friendProfile')}</Typography>
        <ProfileMenu />
      </Box>
      {/* 头像与基本信息 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mt: 4, mb: 4 }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAUlM595gAeu9o-MOXqq7X7X_XPJqfSTzI9V87nVofFzdjVAABvvEvsfNRwufat3zaKjbiIL2EbWqo0bdye0-XVogo4hY1r63XxQTvDNojuHGC3a6dbrH-1YG-lPCYm-5-aQPyxDXL20Z8IYRvAjCQyNi1FP64dluz1gmYpfcoYO1zKbmVm4nzlGeW6asXp9ipjU0QCsUDtwvdofFa3_2FYnSuRXX9zsG8yxGKRK6ayyjIyDSqgYGQzK6ny78wG5vAYDv0zaDC23s" sx={{ width: 128, height: 128, boxShadow: 3 }} />
          <Box sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#12e712', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2 }}>
            <PlayArrowIcon sx={{ color: '#0d1b0d', fontSize: 28 }} />
          </Box>
        </Box>
        <Typography variant="h5" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>Sophia</Typography>
        <Typography variant="subtitle1" sx={{ color: '#4c9a4c', fontWeight: 500 }}>{t('profile.levelAchiever')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          "{t('profile.userQuote')}"
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1 }}>{t('profile.joinedTime')}</Typography>
      </Box>
      {/* 学习进度 */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#0d1b0d', fontWeight: 600, mb: 2 }}>{t('profile.learningProgress')}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>{t('profile.pointsEarned')}</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>1200</Typography>
            <LinearProgress variant="determinate" value={75} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>{t('profile.conversations')}</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>35</Typography>
            <LinearProgress variant="determinate" value={50} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>{t('profile.topicsCovered')}</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>15</Typography>
            <LinearProgress variant="determinate" value={60} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
        </Stack>
      </Box>
      {/* 兴趣标签 */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#0d1b0d', fontWeight: 600, mb: 2 }}>{t('profile.sharedInterests')}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={t('profile.interests.travel')} sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 500, fontSize: 16, mb: 1 }} />
          <Chip label={t('profile.interests.food')} sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 500, fontSize: 16, mb: 1 }} />
          <Chip label={t('profile.interests.culture')} sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 500, fontSize: 16, mb: 1 }} />
        </Stack>
      </Box>
      {/* 底部按钮 */}
      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'rgba(248,252,248,0.8)', borderTop: '1px solid #e7f3e7', pt: 2, pb: 3, px: 2, display: 'flex', gap: 2, justifyContent: 'center', zIndex: 10 }}>
        <Button variant="contained" startIcon={<ChatIcon />} sx={{ bgcolor: '#12e712', color: '#0d1b0d', fontWeight: 'bold', borderRadius: 999, px: 4, boxShadow: 1, flex: 1, minWidth: 120, '&:hover': { bgcolor: '#4c9a4c' } }}>
          {t('profile.message')}
        </Button>
        <Button variant="contained" startIcon={<PlayArrowIcon />} sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 'bold', borderRadius: 999, px: 4, boxShadow: 1, flex: 1, minWidth: 120, '&:hover': { bgcolor: '#cfe7cf' } }}>
          {t('profile.startConversation')}
        </Button>
        {isAuthenticated && (
          <Button variant="outlined" color="error" onClick={handleLogout} sx={{ ml: 2, borderRadius: 999, minWidth: 120, fontWeight: 'bold' }}>
            {t('profile.logout')}
          </Button>
        )}
      </Box>
    </Container>
  );
}

export default Profile; 