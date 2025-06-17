import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { lazy, Suspense } from 'react';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

// 懒加载页面组件，后续迁移设计稿
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TopicInput = lazy(() => import('./pages/TopicInput'));
const Dialogue = lazy(() => import('./pages/Dialogue'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const History = lazy(() => import('./pages/History'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage')); // Import CategoriesPage
const NotFound = lazy(() => import('./pages/NotFound'));

// 后续实现 MUI 主题，这里先使用默认主题
import { createTheme } from '@mui/material/styles';
const theme = createTheme();

// Renamed AppContentWithAuth to AppContent for simplicity and removed the old one.
const AppContent: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth(); // Get user state from useAuth

  const pathsWithBottomNav = ['/topic', '/dialogue', '/profile', '/settings', '/history'];
  // Show BottomNav if the current path is in pathsWithBottomNav AND user is authenticated
  const showBottomNav = pathsWithBottomNav.includes(location.pathname) && !!user;

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected Routes */}
          <Route path="/topic" element={<ProtectedRoute element={<TopicInput />} />} />
          <Route path="/dialogue" element={<ProtectedRoute element={<Dialogue />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
          <Route path="/history" element={<ProtectedRoute element={<History />} />} />
          <Route path="/topics" element={<ProtectedRoute element={<CategoriesPage />} />} /> {/* Add CategoriesPage route */}
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {showBottomNav && <BottomNav />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
