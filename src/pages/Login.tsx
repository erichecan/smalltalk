import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Checkbox, Link, Alert, Snackbar } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../contexts/AuthContext';

// 迁移 original-html/Login.html 设计稿，使用 MUI 组件还原设计，并集成 Firebase Auth 登录功能
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  // Determine the 'from' path for redirection, default to '/topic'
  const from = location.state?.from?.pathname || '/topic';


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      await login(email, password);
      // 登录成功后跳转至 'from' (original page) or default '/topic'
      navigate(from, { replace: true }); // Use replace to avoid login page in history
    } catch (err) {
      // 处理错误，例如显示 Snackbar 或 Alert
      setError(err instanceof Error ? err.message : 'An error occurred during login.');
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#F9FBF9', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 'md', textAlign: 'center' }}>
        {/* 欢迎图标（后续替换为你的图标资源） */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ bgcolor: '#CAECCA', p: 1.5, borderRadius: '50%' }}>
            <Typography variant="h4" sx={{ color: '#111811' }}>chat_bubble</Typography>
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111811', mb: 4 }}>Welcome back!</Typography>
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
            <Link component={RouterLink} to="/forgot-password" sx={{ color: '#5D895D', textDecoration: 'underline', fontWeight: 'medium' }}>Forgot password?</Link>
          </Box>
          <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#CAECCA', color: '#111811', borderRadius: 28, py: 1.5, fontWeight: 'bold', mb: 2 }}>Log In</Button>
          <Box sx={{ my: 2, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: 1, borderColor: '#D0E0D0' }} />
            <Typography variant="body2" sx={{ bgcolor: '#F9FBF9', px: 2, color: '#708C70', position: 'relative', display: 'inline-block' }}>Or continue with</Typography>
          </Box>
          <Button variant="outlined" fullWidth sx={{ borderColor: '#D0E0D0', color: '#111811', borderRadius: 28, py: 1.5, mb: 2, '&:hover': { bgcolor: 'grey.50' } }}>Sign in with Google</Button>
          <Button component={RouterLink} to="/register" variant="text" fullWidth sx={{ color: '#111811', borderRadius: 28, py: 1.5, '&:hover': { bgcolor: '#EAF1EA' } }}>New User? Sign Up</Button>
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