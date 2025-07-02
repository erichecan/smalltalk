import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PageProvider } from './contexts/PageContext';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import TestPage from './pages/TestPage';

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
const Help = lazy(() => import('./pages/Help'));
const ReportProblem = lazy(() => import('./pages/ReportProblem'));

import { createTheme } from '@mui/material/styles';
const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PageProvider>
          <BrowserRouter future={{ v7_relativeSplatPath: true }}>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/test" element={<TestPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<Layout />}>
                  <Route index element={<TopicInput />} />
                  <Route path="/topic" element={<TopicInput />} />
                  <Route path="/dialogue" element={<Dialogue />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/vocabulary" element={<Vocabulary />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/report-problem" element={<ReportProblem />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;