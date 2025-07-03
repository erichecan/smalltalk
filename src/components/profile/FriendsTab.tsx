import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Stack, 
  Chip, 
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatIcon from '@mui/icons-material/Chat';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import FriendActivityFeed from './FriendActivityFeed';

interface Friend {
  id: string;
  display_name: string;
  avatar_url?: string;
  level: number;
  total_points: number;
  last_active: string;
  is_online: boolean;
  status: 'friends' | 'pending_sent' | 'pending_received';
}

interface FriendsTabProps {}

function FriendsTab({}: FriendsTabProps) {
  const { t } = useTranslation('auth');
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟好友数据
  const mockFriends: Friend[] = [
    {
      id: '1',
      display_name: 'Alex Chen',
      level: 12,
      total_points: 1450,
      last_active: '2025-01-31T10:30:00Z',
      is_online: true,
      status: 'friends'
    },
    {
      id: '2',
      display_name: 'Maria Garcia',
      level: 18,
      total_points: 2150,
      last_active: '2025-01-31T09:15:00Z',
      is_online: false,
      status: 'friends'
    },
    {
      id: '3',
      display_name: 'John Smith',
      level: 8,
      total_points: 850,
      last_active: '2025-01-30T16:20:00Z',
      is_online: false,
      status: 'friends'
    },
    {
      id: '4',
      display_name: 'Emma Wilson',
      level: 22,
      total_points: 3200,
      last_active: '2025-01-31T11:00:00Z',
      is_online: true,
      status: 'pending_received'
    },
    {
      id: '5',
      display_name: 'David Kim',
      level: 15,
      total_points: 1800,
      last_active: '2025-01-30T14:45:00Z',
      is_online: false,
      status: 'pending_sent'
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getFilteredFriends = () => {
    let filtered = mockFriends;

    switch (activeTab) {
      case 0: // All Friends
        filtered = mockFriends.filter(f => f.status === 'friends');
        break;
      case 1: // Friend Requests
        filtered = mockFriends.filter(f => f.status === 'pending_received');
        break;
      case 2: // Sent Requests
        filtered = mockFriends.filter(f => f.status === 'pending_sent');
        break;
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(f => 
        f.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getLastActiveText = (lastActive: string) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return t('profile.friends.justNow', 'Just now');
    } else if (diffHours < 24) {
      return t('profile.friends.hoursAgo', '{{hours}}h ago', { hours: diffHours });
    } else {
      return t('profile.friends.daysAgo', '{{days}}d ago', { days: diffDays });
    }
  };

  const filteredFriends = getFilteredFriends();
  const friendsCount = mockFriends.filter(f => f.status === 'friends').length;
  const pendingRequestsCount = mockFriends.filter(f => f.status === 'pending_received').length;
  const sentRequestsCount = mockFriends.filter(f => f.status === 'pending_sent').length;

  return (
    <Box>
      {/* 好友统计 */}
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
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {friendsCount}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t('profile.friends.title', 'Friends')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('profile.friends.socialStats', 'Social Learning')}
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {t('profile.friends.onlineNow', 'Online Now')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {mockFriends.filter(f => f.is_online && f.status === 'friends').length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {t('profile.friends.studyingSince', 'Learning Together')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t('profile.friends.monthsCount', '{{count}} months', { count: 3 })}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {t('profile.friends.addFriend', 'Add Friend')}
          </Button>
        </Stack>
      </Paper>

      {/* 好友动态 */}
      <FriendActivityFeed />

      {/* 搜索框 */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 3, 
        border: '1px solid #e7f3e7'
      }}>
        <TextField
          fullWidth
          placeholder={t('profile.friends.searchPlaceholder', 'Search friends...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#4c9a4c' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: '#e7f3e7',
              },
              '&:hover fieldset': {
                borderColor: '#4c9a4c',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#12e712',
              },
            },
          }}
        />
      </Paper>

      {/* 标签页导航 */}
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
          <Tab label={`${t('profile.friends.myFriends', 'My Friends')} (${friendsCount})`} />
          <Tab label={`${t('profile.friends.requests', 'Requests')} (${pendingRequestsCount})`} />
          <Tab label={`${t('profile.friends.sent', 'Sent')} (${sentRequestsCount})`} />
        </Tabs>
      </Paper>

      {/* 好友列表 */}
      <Paper sx={{ 
        borderRadius: 3, 
        border: '1px solid #e7f3e7',
        overflow: 'hidden'
      }}>
        <List sx={{ p: 0 }}>
          {filteredFriends.map((friend, index) => (
            <Box key={friend.id}>
              <ListItem sx={{ 
                py: 2, 
                px: 3,
                '&:hover': {
                  bgcolor: 'rgba(76, 154, 76, 0.05)'
                }
              }}>
                <ListItemAvatar>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {friend.display_name.charAt(0)}
                    </Avatar>
                    {friend.is_online && (
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 14,
                        height: 14,
                        bgcolor: '#4CAF50',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }} />
                    )}
                  </Box>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {friend.display_name}
                      </Typography>
                      <Chip
                        label={`Lv.${friend.level}`}
                        size="small"
                        sx={{
                          bgcolor: '#e7f3e7',
                          color: '#4c9a4c',
                          fontWeight: 'bold',
                          fontSize: '10px'
                        }}
                      />
                      {friend.is_online && (
                        <Chip
                          label={t('profile.friends.online', 'Online')}
                          size="small"
                          sx={{
                            bgcolor: '#4CAF50',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '10px'
                          }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {friend.total_points.toLocaleString()} {t('profile.points', 'points')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {getLastActiveText(friend.last_active)}
                      </Typography>
                    </Stack>
                  }
                />

                {/* 操作按钮 */}
                <Stack direction="row" spacing={1}>
                  {friend.status === 'friends' && (
                    <>
                      <IconButton
                        size="small"
                        sx={{ color: '#4c9a4c' }}
                        // TODO: 实现聊天功能
                      >
                        <ChatIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: '#4c9a4c' }}
                        // TODO: 实现更多操作
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </>
                  )}
                  
                  {friend.status === 'pending_received' && (
                    <>
                      <IconButton
                        size="small"
                        sx={{ 
                          color: 'white',
                          bgcolor: '#4CAF50',
                          '&:hover': { bgcolor: '#45a049' }
                        }}
                        // TODO: 实现接受好友请求
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ 
                          color: 'white',
                          bgcolor: '#f44336',
                          '&:hover': { bgcolor: '#d32f2f' }
                        }}
                        // TODO: 实现拒绝好友请求
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                  
                  {friend.status === 'pending_sent' && (
                    <Chip
                      label={t('profile.friends.pending', 'Pending')}
                      size="small"
                      sx={{
                        bgcolor: '#FFB74D',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}
                    />
                  )}
                </Stack>
              </ListItem>
              {index < filteredFriends.length - 1 && <Divider />}
            </Box>
          ))}
        </List>

        {filteredFriends.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              {activeTab === 0 && t('profile.friends.noFriends', 'No friends yet')}
              {activeTab === 1 && t('profile.friends.noRequests', 'No friend requests')}
              {activeTab === 2 && t('profile.friends.noSentRequests', 'No sent requests')}
            </Typography>
            {activeTab === 0 && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{
                  bgcolor: '#12e712',
                  color: '#0d1b0d',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#4c9a4c'
                  }
                }}
              >
                {t('profile.friends.findFriends', 'Find Friends')}
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default FriendsTab;