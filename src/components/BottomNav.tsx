import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme
} from '@mui/material';
import {
  Chat as ChatIcon,
  School as PracticeIcon,
  MenuBook as VocabularyIcon,
  Person as PersonIcon,
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
    label: '对话',
    icon: <ChatIcon />,
    path: '/dialogue',
  },
  {
    label: '练习',
    icon: <PracticeIcon />,
    path: '/practice',
  },
  {
    label: '词汇',
    icon: <VocabularyIcon />,
    path: '/vocabulary',
  },
  {
    label: '我的',
    icon: <PersonIcon />,
    path: '/my',
  },
];

// 不显示底部导航的路由
const hideOnPaths = ['/login', '/register', '/', '/topic'];

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
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          navigate(navigationItems[newValue].path);
        }}
        showLabels
        sx={{
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            sx={{
              minWidth: 'auto',
              padding: '6px 0',
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