import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme
} from '@mui/material';
import {
  History,
  Book,
  Person,
} from '@mui/icons-material';
import type { ReactElement } from 'react';
import type { IconProps } from '@mui/material/Icon';

// 导航项类型定义
export interface NavItem {
  label: string;
  icon: ReactElement<IconProps>;
  path: string;
}

// 不显示底部导航的路由
const hideOnPaths = ['/login', '/register', '/', '/topic'];

const BottomNav = () => {
  const { t } = useTranslation('navigation');
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // 获取导航项配置（使用翻译）
  const navigationItems: NavItem[] = [
    {
      label: t('bottomNav.history'),
      icon: <History />,
      path: '/history',
    },
    {
      label: t('bottomNav.practice'),
      icon: <Book />,
      path: '/practice',
    },
    {
      label: t('bottomNav.vocabulary'),
      icon: <Book />,
      path: '/vocabulary',
    },
    {
      label: t('bottomNav.my'),
      icon: <Person />,
      path: '/my',
    },
  ];

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
        onChange={(_event, newValue) => {
          if (newValue !== null) {
            setValue(newValue);
            navigate(navigationItems[newValue].path);
          }
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
            // 2025-01-30 17:05:15: 为词汇按钮添加ID，用于飞行动画目标定位
            id={item.path === '/vocabulary' ? 'vocabulary-nav-button' : undefined}
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