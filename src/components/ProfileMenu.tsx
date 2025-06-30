import { useState, useRef, useEffect } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box,
  Typography,
  Radio,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Language,
  Settings,
  Help,
  Report,
  Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('auth');
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setLanguageMenuOpen(false);
  };

  const handleLanguageToggle = () => {
    setLanguageMenuOpen(!languageMenuOpen);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setLanguageMenuOpen(false);
    handleMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <Box>
      <IconButton
        onClick={handleMenuClick}
        sx={{
          color: '#0d1b0d',
          '&:hover': {
            bgcolor: '#e7f3e7'
          }
        }}
        aria-label="profile menu"
      >
        <MenuIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* 语言切换 */}
        <MenuItem onClick={handleLanguageToggle}>
          <ListItemIcon>
            <Language sx={{ color: '#4c9a4c' }} />
          </ListItemIcon>
          <ListItemText 
            primary={t('profile.language')} 
            secondary={languageMenuOpen ? t('profile.selectLanguage') : (i18n.language === 'zh' ? '中文' : 'English')}
          />
        </MenuItem>

        {languageMenuOpen && (
          <Box sx={{ pl: 4, pr: 2, py: 1 }}>
            <FormControlLabel
              control={
                <Radio 
                  checked={i18n.language === 'en'}
                  onChange={() => handleLanguageChange('en')}
                  sx={{ color: '#4c9a4c', '&.Mui-checked': { color: '#4c9a4c' } }}
                />
              }
              label="English"
              sx={{ mb: 0.5, width: '100%' }}
            />
            <FormControlLabel
              control={
                <Radio 
                  checked={i18n.language === 'zh'}
                  onChange={() => handleLanguageChange('zh')}
                  sx={{ color: '#4c9a4c', '&.Mui-checked': { color: '#4c9a4c' } }}
                />
              }
              label="中文"
              sx={{ width: '100%' }}
            />
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        {/* 设置 */}
        <MenuItem onClick={() => handleNavigation('/settings')}>
          <ListItemIcon>
            <Settings sx={{ color: '#4c9a4c' }} />
          </ListItemIcon>
          <ListItemText primary={t('profile.settings')} />
        </MenuItem>

        {/* 帮助 */}
        <MenuItem onClick={() => handleNavigation('/help')}>
          <ListItemIcon>
            <Help sx={{ color: '#4c9a4c' }} />
          </ListItemIcon>
          <ListItemText primary={t('profile.help')} />
        </MenuItem>

        {/* 反馈问题 */}
        <MenuItem onClick={() => handleNavigation('/report-problem')}>
          <ListItemIcon>
            <Report sx={{ color: '#4c9a4c' }} />
          </ListItemIcon>
          <ListItemText primary={t('profile.reportProblem')} />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* 退出登录 */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography sx={{ color: '#f44336', fontWeight: 'medium' }}>
                {t('profile.logout')}
              </Typography>
            } 
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}