import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import BottomNav from './BottomNav';
import TopNav from './TopNav';

// 不显示底部导航的路由
const hideOnPaths = ['/login', '/register'];

// 不显示顶部导航的路由
const hideTopNavPaths = ['/login', '/register'];

// 路径到导航配置的映射
const pathToNavConfig: Record<string, string | string[]> = {
  // 默认使用 'default' 配置
  '/dialogue': 'default',
  '/history': 'default',
  '/profile': 'default',
  '/settings': 'default',
  
  // 特定页面使用自定义配置
  '/home': 'social',
  '/search': 'social',
  '/notifications': 'social',
  '/create': 'social',
  
  '/favorites': 'content',
  
  // 也可以直接指定导航项
  '/custom': ['dialogue', 'favorites', 'profile', 'settings'],
};

const Layout = () => {
  const location = useLocation();
  const showBottomNav = !hideOnPaths.includes(location.pathname);
  const showTopNav = !hideTopNavPaths.includes(location.pathname);
  
  // 确定当前路径的导航配置
  const navConfig = pathToNavConfig[location.pathname] || 'default';

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部导航 */}
      {showTopNav && <TopNav />}
      
      {/* 主要内容 */}
      <Box sx={{ 
        flex: 1,
        minHeight: 'calc(100vh - 112px)', // 确保最小高度
        mt: showTopNav ? '56px' : 0, // 为顶部导航留出空间
        pb: showBottomNav ? '56px' : 0, // 为底部导航留出空间
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Outlet />
      </Box>
      
      {/* 底部导航 - 传递当前路径对应的导航配置 */}
      {showBottomNav && <BottomNav config={navConfig} />}
    </Box>
  );
};

export default Layout;