import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Checkbox, Link, Alert, Snackbar, Divider, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';

// 迁移 original-html/Login.html 设计稿，使用 MUI 组件还原设计，并集成 Firebase Auth 登录功能
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Google 登录（假设 useAuth 里有 googleLogin 方法）
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleLogin();
      navigate('/topic');
    } catch (err) {
      setError('Google 登录失败');
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
      setError(err instanceof Error ? err.message : '登录/注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#F9FBF9', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center', mt: 6 }}>
        {/* 顶部图标 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ bgcolor: '#CAECCA', p: 2, borderRadius: '50%' }}>
            <span className="material-symbols-outlined" style={{ color: '#111811', fontSize: 36 }}>chat_bubble</span>
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111811', mb: 4 }}>{mode === 'login' ? 'Welcome back!' : 'Create your account'}</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email address or username"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Password"
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
              <Typography variant="body2" sx={{ color: '#5D895D' }}>Remember me</Typography>
            </Box>
            <Link component={RouterLink} to="#" sx={{ color: '#5D895D', textDecoration: 'underline', fontWeight: 'medium' }}>Forgot password?</Link>
          </Box>
          <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#CAECCA', color: '#111811', borderRadius: 28, py: 1.5, fontWeight: 'bold', mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={20} sx={{ color: '#4c9a4c', mr: 1 }} /> : null}
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
          <Box sx={{ my: 2, position: 'relative' }}>
            <Divider sx={{ borderColor: '#D0E0D0' }} />
            <Typography variant="body2" sx={{ bgcolor: '#F9FBF9', px: 2, color: '#708C70', position: 'absolute', left: '50%', top: -14, transform: 'translateX(-50%)' }}>Or continue with</Typography>
          </Box>
          <Button variant="outlined" fullWidth sx={{ borderColor: '#D0E0D0', color: '#111811', borderRadius: 28, py: 1.5, mb: 2, '&:hover': { bgcolor: 'grey.50' } }} onClick={handleGoogleLogin} startIcon={<GoogleIcon />}>Sign in with Google</Button>
          <Button variant="text" fullWidth sx={{ color: '#111811', borderRadius: 28, py: 1.5, '&:hover': { bgcolor: '#EAF1EA' } }} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'New User? Sign Up' : 'Already have an account? Log In'}
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