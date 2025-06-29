import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  useTheme,
  Box,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// 不显示返回箭头的路由
const noBackButtonPaths = ['/', '/dialogue', '/history', '/profile', '/settings'];

const TopNav = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // 判断是否显示返回按钮
  const showBackButton = !noBackButtonPaths.includes(location.pathname);

  // 处理返回按钮点击
  const handleBack = () => {
    navigate(-1);
  };

  // 处理头像点击
  const handleAvatarClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '56px' }}>
        {/* 左侧区域：返回按钮 */}
        <Box sx={{ width: '40px' }}>
          {showBackButton && (
            <IconButton
              edge="start"
              onClick={handleBack}
              aria-label="返回"
              sx={{ color: theme.palette.text.primary }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
        </Box>

        {/* 中间区域：可以根据需要添加标题或其他内容 */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          {/* 预留给标题或其他内容 */}
        </Box>

        {/* 右侧区域：头像 */}
        <Box sx={{ width: '40px' }}>
          <IconButton
            edge="end"
            onClick={handleAvatarClick}
            sx={{ p: 0 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: isAuthenticated ? 'primary.main' : 'grey.300',
              }}
              src={user?.avatar ? user.avatar : undefined}
            >
              {/* 如果没有头像，显示默认人型图标 */}
              {isAuthenticated
                ? (user?.avatar ? null : user?.name?.[0])
                : <PersonIcon sx={{ color: '#888' }} />}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;