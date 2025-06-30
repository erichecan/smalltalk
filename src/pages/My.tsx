import { Container, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, ListItemButton, Divider, Button } from '@mui/material';
import { Person, Settings, HelpOutline, Logout, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function My() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0 }}>
      {/* 顶部标题栏 */}
      <Box sx={{ bgcolor: '#CAECCA', py: 2, px: 3, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>{t('profile.my')}</Typography>
      </Box>

      {/* 内容区域 */}
      <Box sx={{ px: 2, py: 3 }}>
        {isAuthenticated ? (
          <>
            {/* 用户信息卡片 */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: '#CAECCA', 
                    color: '#0d1b0d',
                    mr: 2,
                    fontSize: '1.5rem'
                  }}
                >
                  {(user?.email?.[0] || 'U').toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5D895D' }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* 菜单列表 */}
            <Paper sx={{ borderRadius: 3, boxShadow: 1 }}>
              <List sx={{ py: 0 }}>
                <ListItemButton onClick={() => navigate('/profile')} sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#E8F5E9', color: '#4c9a4c', width: 40, height: 40 }}>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>
                        {t('profile.title')}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: '#708C70', fontSize: '0.9rem' }}>
                        {t('profile.viewProfile')}
                      </Typography>
                    }
                  />
                </ListItemButton>
                
                <Divider sx={{ mx: 2 }} />
                
                <ListItemButton onClick={() => navigate('/settings')} sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#E8F5E9', color: '#4c9a4c', width: 40, height: 40 }}>
                      <Settings />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>
                        {t('profile.settings')}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: '#708C70', fontSize: '0.9rem' }}>
                        {t('profile.settingsDesc')}
                      </Typography>
                    }
                  />
                </ListItemButton>
                
                <Divider sx={{ mx: 2 }} />
                
                <ListItemButton sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#E8F5E9', color: '#4c9a4c', width: 40, height: 40 }}>
                      <HelpOutline />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>
                        {t('profile.help')}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: '#708C70', fontSize: '0.9rem' }}>
                        {t('profile.helpDesc')}
                      </Typography>
                    }
                  />
                </ListItemButton>
                
                <Divider sx={{ mx: 2 }} />
                
                <ListItemButton onClick={handleLogout} sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#ffebee', color: '#f44336', width: 40, height: 40 }}>
                      <Logout />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography sx={{ fontWeight: 'bold', color: '#f44336' }}>
                        {t('profile.logout')}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: '#999', fontSize: '0.9rem' }}>
                        {t('profile.logoutDesc')}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </List>
            </Paper>
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: 1 }}>
            <Avatar sx={{ bgcolor: '#CAECCA', color: '#0d1b0d', width: 80, height: 80, mx: 'auto', mb: 2 }}>
              <Login sx={{ fontSize: '2rem' }} />
            </Avatar>
            <Typography variant="h6" sx={{ color: '#0d1b0d', mb: 1, fontWeight: 'bold' }}>
              {t('profile.loginRequired')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#708C70', mb: 3 }}>
              {t('profile.loginDesc')}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              sx={{ 
                bgcolor: '#CAECCA', 
                color: '#111811', 
                borderRadius: 20, 
                px: 4,
                fontWeight: 'bold'
              }}
            >
              {t('profile.goLogin')}
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
} 