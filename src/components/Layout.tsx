import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import BottomNav from './BottomNav';
import TopNav from './TopNav';

// 不显示底部导航的路由
const hideOnPaths = ['/login', '/register'];

// 不显示顶部导航的路由
const hideTopNavPaths = ['/login', '/register'];

const Layout = () => {
  const location = useLocation();
  const showBottomNav = !hideOnPaths.includes(location.pathname);
  const showTopNav = !hideTopNavPaths.includes(location.pathname);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
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
      
      {/* 底部导航 */}
      {showBottomNav && <BottomNav />}
    </Box>
  );
};

export default Layout;