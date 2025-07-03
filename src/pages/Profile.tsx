import { Container, Box, Typography, Avatar, Paper, Tabs, Tab, Stack, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { usePageContext } from '../contexts/PageContext';
import ProfileMenu from '../components/ProfileMenu';

// 标签页组件（待实现）
import PersonalInfoTab from '../components/profile/PersonalInfoTab';
import LeaderboardTab from '../components/profile/LeaderboardTab';
import AchievementsTab from '../components/profile/AchievementsTab';
import FriendsTab from '../components/profile/FriendsTab';
import CommunityTab from '../components/profile/CommunityTab';
import RealtimeTestPanel from '../components/profile/RealtimeTestPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

function Profile() {
  const { t } = useTranslation('auth');
  const { setPageState } = usePageContext();
  const [activeTab, setActiveTab] = useState(0);

  // 初始化页面状态
  useEffect(() => {
    setPageState({
      page: '/profile'
    });
  }, [setPageState]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fcf8', 
      p: 0, 
      fontFamily: 'Spline Sans, Noto Sans, sans-serif', 
      width: '100%', 
      maxWidth: '100vw', 
      overflowX: 'hidden' 
    }}>
      {/* 顶部栏 */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        bgcolor: 'rgba(248,252,248,0.95)', 
        backdropFilter: 'blur(8px)', 
        px: 2, 
        py: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottom: '1px solid #e7f3e7' 
      }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
          {t('profile.title', 'Profile')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small" 
            sx={{ color: '#4c9a4c' }}
            // TODO: 实现设置功能
          >
            <SettingsIcon />
          </IconButton>
          <ProfileMenu />
        </Stack>
      </Box>

      {/* Real-time Testing Panel (Development Only) */}
      <Box sx={{ px: 2, pt: 1 }}>
        <RealtimeTestPanel />
      </Box>

      {/* 用户基本信息卡片 */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3, 
          border: '1px solid #e7f3e7', 
          boxShadow: '0 2px 12px rgba(76,154,76,0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%)'
        }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAUlM595gAeu9o-MOXqq7X7X_XPJqfSTzI9V87nVofFzdjVAABvvEvsfNRwufat3zaKjbiIL2EbWqo0bdye0-XVogo4hY1r63XxQTvDNojuHGC3a6dbrH-1YG-lPCYm-5-aQPyxDXL20Z8IYRvAjCQyNi1FP64dluz1gmYpfcoYO1zKbmVm4nzlGeW6asXp9ipjU0QCsUDtwvdofFa3_2FYnSuRXX9zsG8yxGKRK6ayyjIyDSqgYGQzK6ny78wG5vAYDv0zaDC23s" 
                sx={{ width: 80, height: 80, boxShadow: 3 }} 
              />
              <Box sx={{ 
                position: 'absolute', 
                bottom: -2, 
                right: -2, 
                bgcolor: '#12e712', 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                border: '2px solid white',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#0d1b0d'
              }}>
                15
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: '#0d1b0d', fontWeight: 'bold', mb: 0.5 }}>
                Sophia
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#4c9a4c', fontWeight: 500, mb: 1 }}>
                Level 15 • 1,250 {t('profile.points', 'points')}
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>35</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('profile.conversations', 'Conversations')}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>8</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('profile.friends', 'Friends')}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>12</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('profile.achievements', 'Achievements')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* 标签页导航 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Paper sx={{ 
          borderRadius: 3, 
          border: '1px solid #e7f3e7',
          overflow: 'hidden'
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#12e712',
                height: 3,
                borderRadius: 2
              },
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2,
                py: 1.5,
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
              icon={<PersonIcon />} 
              label={t('profile.tabs.personal', 'Personal')} 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<LeaderboardIcon />} 
              label={t('profile.tabs.leaderboard', 'Leaderboard')} 
              iconPosition="start"
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<EmojiEventsIcon />} 
              label={t('profile.tabs.achievements', 'Achievements')} 
              iconPosition="start"
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<PeopleIcon />} 
              label={t('profile.tabs.friends', 'Friends')} 
              iconPosition="start"
              {...a11yProps(3)} 
            />
            <Tab 
              icon={<ForumIcon />} 
              label={t('profile.tabs.community', 'Community')} 
              iconPosition="start"
              {...a11yProps(4)} 
            />
          </Tabs>
        </Paper>
      </Box>

      {/* 标签页内容 */}
      <Box sx={{ px: 2, pb: 3 }}>
        <TabPanel value={activeTab} index={0}>
          <PersonalInfoTab />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <LeaderboardTab />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <AchievementsTab />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <FriendsTab />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <CommunityTab />
        </TabPanel>
      </Box>
    </Container>
  );
}

export default Profile;