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
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  TextField,
  Fab,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useTranslation } from 'react-i18next';

interface CommunityPost {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  content: string;
  post_type: 'general' | 'achievement' | 'question' | 'tip';
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  achievement_data?: {
    name: string;
    icon: string;
  };
}

interface CommunityTabProps {}

function CommunityTab({}: CommunityTabProps) {
  const { t } = useTranslation('auth');
  const [activeTab, setActiveTab] = useState(0);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  // 模拟社区帖子数据
  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      user_id: '1',
      display_name: 'Alex Chen',
      content: 'Just completed my 50th conversation! 🎉 Feeling more confident about speaking English every day. The AI conversations really help with natural flow.',
      post_type: 'general',
      likes_count: 12,
      comments_count: 3,
      is_liked: false,
      created_at: '2025-01-31T10:30:00Z'
    },
    {
      id: '2',
      user_id: '2',
      display_name: 'Maria Garcia',
      content: 'Unlocked the Word Master achievement! 🏆',
      post_type: 'achievement',
      likes_count: 25,
      comments_count: 8,
      is_liked: true,
      created_at: '2025-01-31T09:15:00Z',
      achievement_data: {
        name: 'Word Master',
        icon: '🏆'
      }
    },
    {
      id: '3',
      user_id: '3',
      display_name: 'John Smith',
      content: 'Can anyone recommend good topics for business English practice? I have an important presentation next week.',
      post_type: 'question',
      likes_count: 5,
      comments_count: 12,
      is_liked: false,
      created_at: '2025-01-31T08:45:00Z'
    },
    {
      id: '4',
      user_id: '4',
      display_name: 'Emma Wilson',
      content: 'Pro tip: Try to use new vocabulary words in conversations within 24 hours of learning them. It really helps with retention! 💡',
      post_type: 'tip',
      likes_count: 18,
      comments_count: 6,
      is_liked: true,
      created_at: '2025-01-30T16:20:00Z'
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getFilteredPosts = () => {
    switch (activeTab) {
      case 0: // All Posts
        return mockPosts;
      case 1: // My Posts
        return mockPosts.filter(p => p.user_id === 'current_user_id'); // 应该是当前用户ID
      case 2: // Achievements
        return mockPosts.filter(p => p.post_type === 'achievement');
      case 3: // Questions
        return mockPosts.filter(p => p.post_type === 'question');
      case 4: // Tips
        return mockPosts.filter(p => p.post_type === 'tip');
      default:
        return mockPosts;
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 20 }} />;
      case 'question':
        return <QuestionAnswerIcon sx={{ color: '#2196F3', fontSize: 20 }} />;
      case 'tip':
        return <TipsAndUpdatesIcon sx={{ color: '#FF9800', fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return '#FFD700';
      case 'question':
        return '#2196F3';
      case 'tip':
        return '#FF9800';
      default:
        return '#4c9a4c';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return t('profile.community.justNow', 'Just now');
    } else if (diffHours < 24) {
      return t('profile.community.hoursAgo', '{{hours}}h ago', { hours: diffHours });
    } else {
      return t('profile.community.daysAgo', '{{days}}d ago', { days: diffDays });
    }
  };

  const handleNewPost = () => {
    if (newPostContent.trim()) {
      // TODO: 实现发帖功能
      console.log('New post:', newPostContent);
      setNewPostContent('');
      setShowNewPostForm(false);
    }
  };

  const filteredPosts = getFilteredPosts();

  return (
    <Box>
      {/* 社区统计 */}
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
              25
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t('profile.community.myPosts', 'My Posts')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('profile.community.engagement', 'Community Engagement')}
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {t('profile.community.totalLikes', 'Total Likes')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  156
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {t('profile.community.comments', 'Comments')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  89
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewPostForm(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {t('profile.community.newPost', 'New Post')}
          </Button>
        </Stack>
      </Paper>

      {/* 新帖子表单 */}
      {showNewPostForm && (
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          border: '1px solid #e7f3e7'
        }}>
          <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold', mb: 2 }}>
            {t('profile.community.createPost', 'Create New Post')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={t('profile.community.postPlaceholder', 'Share your learning experience, ask questions, or give tips...')}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            sx={{
              mb: 2,
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
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setShowNewPostForm(false)}
              sx={{
                color: '#4c9a4c',
                borderColor: '#4c9a4c',
                '&:hover': {
                  borderColor: '#12e712',
                  bgcolor: 'rgba(18, 231, 18, 0.1)'
                }
              }}
            >
              {t('profile.community.cancel', 'Cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleNewPost}
              disabled={!newPostContent.trim()}
              sx={{
                bgcolor: '#12e712',
                color: '#0d1b0d',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#4c9a4c'
                }
              }}
            >
              {t('profile.community.post', 'Post')}
            </Button>
          </Stack>
        </Paper>
      )}

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
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#12e712',
              height: 3
            },
            '& .MuiTab-root': {
              color: '#4c9a4c',
              fontWeight: 500,
              '&.Mui-selected': {
                color: '#0d1b0d',
                fontWeight: 600
              }
            }
          }}
        >
          <Tab label={t('profile.community.allPosts', 'All Posts')} />
          <Tab label={t('profile.community.myPosts', 'My Posts')} />
          <Tab label={t('profile.community.achievements', 'Achievements')} />
          <Tab label={t('profile.community.questions', 'Questions')} />
          <Tab label={t('profile.community.tips', 'Tips')} />
        </Tabs>
      </Paper>

      {/* 帖子列表 */}
      <Stack spacing={2}>
        {filteredPosts.map((post) => (
          <Card key={post.id} sx={{ 
            borderRadius: 3, 
            border: '1px solid #e7f3e7',
            boxShadow: '0 2px 8px rgba(76,154,76,0.1)',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(76,154,76,0.15)',
              transform: 'translateY(-1px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              {/* 帖子头部 */}
              <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {post.display_name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {post.display_name}
                    </Typography>
                    {getPostTypeIcon(post.post_type)}
                    <Chip
                      label={post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
                      size="small"
                      sx={{
                        bgcolor: getPostTypeColor(post.post_type),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {getTimeAgo(post.created_at)}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: '#4c9a4c' }}>
                  <MoreVertIcon />
                </IconButton>
              </Stack>

              {/* 成就帖子特殊显示 */}
              {post.post_type === 'achievement' && post.achievement_data && (
                <Paper sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h4">
                      {post.achievement_data.icon}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                        {t('profile.community.achievementUnlocked', 'Achievement Unlocked!')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {post.achievement_data.name}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {/* 帖子内容 */}
              <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                {post.content}
              </Typography>
            </CardContent>

            <Divider />

            {/* 帖子操作 */}
            <CardActions sx={{ px: 3, py: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                <IconButton
                  size="small"
                  sx={{ color: post.is_liked ? '#f44336' : '#4c9a4c' }}
                  // TODO: 实现点赞功能
                >
                  {post.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {post.likes_count}
                </Typography>

                <IconButton
                  size="small"
                  sx={{ color: '#4c9a4c', ml: 2 }}
                  // TODO: 实现评论功能
                >
                  <ChatBubbleOutlineIcon />
                </IconButton>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {post.comments_count}
                </Typography>

                <Box sx={{ flex: 1 }} />

                <IconButton
                  size="small"
                  sx={{ color: '#4c9a4c' }}
                  // TODO: 实现分享功能
                >
                  <ShareIcon />
                </IconButton>
              </Stack>
            </CardActions>
          </Card>
        ))}
      </Stack>

      {filteredPosts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            {t('profile.community.noPosts', 'No posts found')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewPostForm(true)}
            sx={{
              bgcolor: '#12e712',
              color: '#0d1b0d',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#4c9a4c'
              }
            }}
          >
            {t('profile.community.createFirstPost', 'Create Your First Post')}
          </Button>
        </Box>
      )}

      {/* 浮动新建按钮 */}
      {!showNewPostForm && (
        <Fab
          color="primary"
          aria-label="add post"
          onClick={() => setShowNewPostForm(true)}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: '#12e712',
            color: '#0d1b0d',
            '&:hover': {
              bgcolor: '#4c9a4c'
            }
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}

export default CommunityTab;