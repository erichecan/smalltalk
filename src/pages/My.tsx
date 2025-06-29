import { Container, Box, Typography, Avatar, Paper, LinearProgress, Chip, Stack, Button, List, ListItem, Switch } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function My() {
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0, fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold', mb: 2 }}>
            请先登录
          </Typography>
          <Button variant="contained" href="/login" sx={{ bgcolor: '#12e712', color: '#0d1b0d', fontWeight: 'bold', borderRadius: 999, px: 4 }}>
            去登录
          </Button>
        </Box>
      </Container>
    );
  }

  const settingsItems = [
    {
      icon: <NotificationsIcon />,
      title: '通知设置',
      type: 'switch',
      value: true
    },
    {
      icon: <LanguageIcon />,
      title: '语言设置',
      type: 'select',
      value: '中文'
    },
    {
      icon: <SecurityIcon />,
      title: '隐私设置',
      type: 'arrow'
    }
  ];

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0, fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(248,252,248,0.8)', backdropFilter: 'blur(8px)', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: 0 }}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', color: '#0d1b0d', '&:hover': { bgcolor: '#e7f3e7' } }}>
          <ArrowBackIcon />
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: '#0d1b0d', fontWeight: 'bold', pr: 5 }}>我的</Typography>
      </Box>
      
      {/* 头像与基本信息 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mt: 4, mb: 4 }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAUlM595gAeu9o-MOXqq7X7X_XPJqfSTzI9V87nVofFzdjVAABvvEvsfNRwufat3zaKjbiIL2EbWqo0bdye0-XVogo4hY1r63XxQTvDNojuHGC3a6dbrH-1YG-lPCYm-5-aQPyxDXL20Z8IYRvAjCQyNi1FP64dluz1gmYpfcoYO1zKbmVm4nzlGeW6asXp9ipjU0QCsUDtwvdofFa3_2FYnSuRXX9zsG8yxGKRK6ayyjIyDSqgYGQzK6ny78wG5vAYDv0zaDC23s" sx={{ width: 128, height: 128, boxShadow: 3 }} />
          <Box sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#12e712', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2 }}>
            <PlayArrowIcon sx={{ color: '#0d1b0d', fontSize: 28 }} />
          </Box>
        </Box>
        <Typography variant="h5" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>{user?.name || 'User'}</Typography>
        <Typography variant="subtitle1" sx={{ color: '#4c9a4c', fontWeight: 500 }}>Level 5 Achiever</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          "Always learning, always growing! Let's chat about travel and food."
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1 }}>Joined 2 months ago</Typography>
      </Box>
      
      {/* 学习进度 */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#0d1b0d', fontWeight: 600, mb: 2 }}>学习进度</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>积分</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>1200</Typography>
            <LinearProgress variant="determinate" value={75} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>对话次数</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>35</Typography>
            <LinearProgress variant="determinate" value={50} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>话题覆盖</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>15</Typography>
            <LinearProgress variant="determinate" value={60} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
        </Stack>
      </Box>
      
      {/* 兴趣标签 */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#0d1b0d', fontWeight: 600, mb: 2 }}>我的兴趣</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="旅行" sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 500, fontSize: 16, mb: 1 }} />
          <Chip label="美食" sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 500, fontSize: 16, mb: 1 }} />
          <Chip label="文化" sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 500, fontSize: 16, mb: 1 }} />
        </Stack>
      </Box>

      {/* 设置选项 */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#0d1b0d', fontWeight: 600, mb: 2 }}>应用设置</Typography>
        <Paper sx={{ borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1, overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {settingsItems.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 2,
                  px: 2,
                  borderBottom: index < settingsItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                  '&:hover': {
                    bgcolor: '#f8fcf8'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    bgcolor: '#e7f3e7',
                    color: '#4c9a4c',
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </Box>
                <Typography sx={{ flex: 1, color: '#0d1b0d', fontWeight: 500 }}>
                  {item.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.type === 'switch' && (
                    <Switch
                      checked={item.value}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#12e712',
                          '&:hover': {
                            backgroundColor: 'rgba(18, 231, 18, 0.08)'
                          }
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#12e712'
                        }
                      }}
                    />
                  )}
                  {item.type === 'select' && (
                    <>
                      <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
                        {item.value}
                      </Typography>
                      <ChevronRightIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                    </>
                  )}
                  {item.type === 'arrow' && (
                    <ChevronRightIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
      
      {/* 底部按钮 */}
      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'rgba(248,252,248,0.8)', borderTop: '1px solid #e7f3e7', pt: 2, pb: 3, px: 2, display: 'flex', gap: 2, justifyContent: 'center', zIndex: 10 }}>
        <Button variant="contained" startIcon={<ChatIcon />} onClick={() => navigate('/topic')} sx={{ bgcolor: '#12e712', color: '#0d1b0d', fontWeight: 'bold', borderRadius: 999, px: 4, boxShadow: 1, flex: 1, minWidth: 120, '&:hover': { bgcolor: '#4c9a4c' } }}>
          开始对话
        </Button>
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => navigate('/practice')} sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 'bold', borderRadius: 999, px: 4, boxShadow: 1, flex: 1, minWidth: 120, '&:hover': { bgcolor: '#cfe7cf' } }}>
          开始练习
        </Button>
        <Button variant="outlined" color="error" onClick={handleLogout} sx={{ ml: 2, borderRadius: 999, minWidth: 120, fontWeight: 'bold' }}>
          退出登录
        </Button>
      </Box>
    </Container>
  );
} 