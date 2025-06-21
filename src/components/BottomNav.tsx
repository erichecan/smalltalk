import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme
} from '@mui/material';
import type { IconProps } from '@mui/material/Icon';
import {
  Chat as ChatIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { ReactElement } from 'react';

// 导航项类型定义
export interface NavItem {
  label: string;
  icon: ReactElement<IconProps>;
  path: string;
}

// 所有可能的导航项
export const allNavigationItems: Record<string, NavItem> = {
  dialogue: {
    label: '对话',
    icon: <ChatIcon />,
    path: '/dialogue',
  },
  history: {
    label: '历史',
    icon: <HistoryIcon />,
    path: '/history',
  },
  profile: {
    label: '我的',
    icon: <PersonIcon />,
    path: '/profile',
  },
  settings: {
    label: '设置',
    icon: <SettingsIcon />,
    path: '/settings',
  },
  home: {
    label: '首页',
    icon: <HomeIcon />,
    path: '/home',
  },
  favorites: {
    label: '收藏',
    icon: <FavoriteIcon />,
    path: '/favorites',
  },
  search: {
    label: '搜索',
    icon: <SearchIcon />,
    path: '/search',
  },
  notifications: {
    label: '通知',
    icon: <NotificationsIcon />,
    path: '/notifications',
  },
  create: {
    label: '创建',
    icon: <AddIcon />,
    path: '/create',
  },
};

// 预定义的导航配置
export const navigationConfigs: Record<string, string[]> = {
  // 默认配置
  default: ['dialogue', 'history', 'profile', 'settings'],
  
  // 社交媒体风格配置
  social: ['home', 'search', 'create', 'notifications', 'profile'],
  
  // 内容消费配置
  content: ['home', 'search', 'favorites', 'history', 'profile'],
};

// 不显示底部导航的路由
const hideOnPaths = ['/login', '/register', '/', '/topic'];

interface BottomNavProps {
  // 可以传入预定义配置的名称或自定义导航项ID数组
  config?: string | string[];
}

const BottomNav = ({ config = 'default' }: BottomNavProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);
  
  // 确定要显示的导航项
  const navItemKeys = typeof config === 'string' 
    ? navigationConfigs[config] || navigationConfigs.default
    : config;
    
  // 根据配置获取导航项
  const navigationItems = navItemKeys
    .map(key => allNavigationItems[key])
    .filter(Boolean);

  // 根据当前路径更新选中状态
  useEffect(() => {
    const currentIndex = navigationItems.findIndex(
      item => item.path === location.pathname
    );
    if (currentIndex !== -1) {
      setValue(currentIndex);
    }
  }, [location, navigationItems]);

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
        // 添加安全区域边距
        paddingBottom: 'env(safe-area-inset-bottom)',
        // 确保导航栏在其他内容之上
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
        {navigationItems.map((item, index) => (
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