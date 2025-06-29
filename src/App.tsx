import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import TestPage from './pages/TestPage';

// 懒加载页面组件，后续迁移设计稿
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TopicInput = lazy(() => import('./pages/TopicInput'));
const Dialogue = lazy(() => import('./pages/Dialogue'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const History = lazy(() => import('./pages/History'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Practice = lazy(() => import('./pages/Practice'));
const Vocabulary = lazy(() => import('./pages/Vocabulary'));
const My = lazy(() => import('./pages/My'));

// 后续实现 MUI 主题，这里先使用默认主题
import { createTheme } from '@mui/material/styles';
const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* 测试路由 - 完全独立的基本路由 */}
              <Route path="/test" element={<TestPage />} />
              {/* 不需要布局的路由 */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* 需要布局的路由 */}
              <Route element={<Layout />}>
                <Route 
                  index 
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <TopicInput />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/topic" 
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <TopicInput />
                    </Suspense>
                  } 
                />
                <Route path="/dialogue" element={<Dialogue />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/vocabulary" element={<Vocabulary />} />
                <Route path="/my" element={<My />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/history" element={<History />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;