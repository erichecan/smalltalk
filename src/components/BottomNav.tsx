import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme
} from '@mui/material';
import {
  School,
  FitnessCenter,
  ChatBubbleOutline,
  PersonOutline,
} from '@mui/icons-material';
import type { ReactElement } from 'react';
import type { IconProps } from '@mui/material/Icon';

// 导航项类型定义
export interface NavItem {
  label: string;
  icon: ReactElement<IconProps>;
  path: string;
}

// 只保留4个主入口
export const navigationItems: NavItem[] = [
  {
    label: '历史',
    icon: <School />,
    path: '/history',
  },
  {
    label: '练习',
    icon: <FitnessCenter />,
    path: '/practice',
  },
  {
    label: '词汇',
    icon: <ChatBubbleOutline />,
    path: '/vocabulary',
  },
  {
    label: '我的',
    icon: <PersonOutline />,
    path: '/my',
  },
];

// 不显示底部导航的路由
const hideOnPaths = ['/login', '/register', '/', '/topic', '/dialogue', '/settings'];

const BottomNav = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // 根据当前路径更新选中状态
  useEffect(() => {
    const currentIndex = navigationItems.findIndex(
      item => item.path === location.pathname
    );
    if (currentIndex !== -1) {
      setValue(currentIndex);
    }
  }, [location]);

  // 判断是否显示导航栏
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: theme.zIndex.appBar,
        borderTop: '1px solid #f1f5f9',
        bgcolor: 'white',
        boxShadow: '0 -1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={value}
        onChange={(_event, newValue) => {
          if (newValue !== null) {
            setValue(newValue);
            navigate(navigationItems[newValue].path);
          }
        }}
        showLabels
        sx={{
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: '#6b7280',
            '&.Mui-selected': {
              color: '#0ecd6a',
              bgcolor: 'rgba(14, 205, 106, 0.1)',
            },
            '&:hover': {
              bgcolor: 'rgba(156, 163, 175, 0.1)',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: '0.025em',
          },
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            sx={{
              minWidth: 'auto',
              padding: '8px 0',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;