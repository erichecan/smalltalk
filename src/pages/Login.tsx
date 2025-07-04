import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Checkbox, Link, Alert, Snackbar, Divider, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';

// 迁移 original-html/Login.html 设计稿，使用 MUI 组件还原设计，并集成 Supabase Auth 登录功能 - 2025-01-30 14:25:30
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  // Google OAuth 登录处理 - 2025-01-30 14:25:30
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Initiating Google OAuth login...');
      await googleLogin();
      console.log('Google login successful, navigating to topic page');
      navigate('/topic');
    } catch (error) {
      console.error('Google login error:', error);
      // 提供更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`${t('login.errors.googleLoginFailed')}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/topic');
    } catch (err) {
      setError(err instanceof Error ? err.message : (mode === 'login' ? t('login.errors.loginFailed') : t('register.errors.registerFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#F9FBF9', p: 2, width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center', mt: 6 }}>
        {/* 顶部图标 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ bgcolor: '#CAECCA', p: 2, borderRadius: '50%' }}>
            <span className="material-symbols-outlined" style={{ color: '#111811', fontSize: 36 }}>chat_bubble</span>
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111811', mb: 4 }}>{mode === 'login' ? t('login.welcomeBack') : t('register.createAccount')}</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label={mode === 'login' ? t('login.emailLabel') : t('register.emailLabel')}
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label={mode === 'login' ? t('login.passwordLabel') : t('register.passwordLabel')}
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} sx={{ color: '#CAECCA' }} />
              <Typography variant="body2" sx={{ color: '#5D895D' }}>{t('login.rememberMe')}</Typography>
            </Box>
            <Link component={RouterLink} to="#" sx={{ color: '#5D895D', textDecoration: 'underline', fontWeight: 'medium' }}>{t('login.forgotPassword')}</Link>
          </Box>
          <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#CAECCA', color: '#111811', borderRadius: 28, py: 1.5, fontWeight: 'bold', mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={20} sx={{ color: '#4c9a4c', mr: 1 }} /> : null}
            {mode === 'login' ? t('login.loginButton') : t('register.registerButton')}
          </Button>
          <Box sx={{ my: 2, position: 'relative' }}>
            <Divider sx={{ borderColor: '#D0E0D0' }} />
            <Typography variant="body2" sx={{ bgcolor: '#F9FBF9', px: 2, color: '#708C70', position: 'absolute', left: '50%', top: -14, transform: 'translateX(-50%)' }}>{mode === 'login' ? t('login.orContinueWith') : t('register.orContinueWith')}</Typography>
          </Box>
          <Button 
            variant="outlined" 
            fullWidth 
            sx={{ 
              borderColor: '#dadce0', 
              color: '#3c4043', 
              borderRadius: 28, 
              py: 1.5, 
              mb: 2, 
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': { 
                bgcolor: '#f8f9fa',
                borderColor: '#dadce0',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)'
              },
              '&:disabled': {
                borderColor: '#dadce0',
                color: '#5f6368'
              }
            }} 
            onClick={handleGoogleLogin} 
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#4285f4' }} /> : <GoogleIcon sx={{ color: '#4285f4' }} />}
            disabled={loading}
          >
            {loading ? t('login.loggingIn') : t('login.googleButton')}
          </Button>
          <Button variant="text" fullWidth sx={{ color: '#111811', borderRadius: 28, py: 1.5, '&:hover': { bgcolor: '#EAF1EA' } }} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? t('login.switchToRegister') : t('register.switchToLogin')}
          </Button>
        </form>
      </Box>
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Snackbar>
      )}
    </Container>
  );
}

export default Login; 