import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link, Alert, Snackbar } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// 迁移 original-html/Registration.html 设计稿，使用 MUI 组件还原设计，并集成 Firebase Auth 注册功能
export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('register.errors.passwordMismatch'));
      return;
    }
    try {
      await register(email, password);
      // 注册成功后跳转至 /topic
      navigate('/topic');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('register.errors.registerFailed'));
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fcf8', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 'md', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0d1b0d', mb: 4, letterSpacing: '-0.015em' }}>{t('register.createAccount')}</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label={t('register.usernameLabel')}
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label={t('register.emailLabel')}
            variant="outlined"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label={t('register.passwordLabel')}
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label={t('register.confirmPasswordLabel')}
            variant="outlined"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Typography variant="caption" sx={{ color: '#4c9a4c', display: 'block', mb: 2 }}>{t('register.passwordHint')}</Typography>
          <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#CAECCA', color: '#111811', borderRadius: 28, py: 1.5, fontWeight: 'bold', mb: 2 }}>{t('register.registerButton')}</Button>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#5D895D' }}>{t('register.alreadyHaveAccount')} <Link component={RouterLink} to="/login" sx={{ color: '#5D895D', textDecoration: 'underline', fontWeight: 'medium' }}>{t('register.loginLink')}</Link></Typography>
          </Box>
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