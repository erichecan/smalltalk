<<<<<<< HEAD
=======
import { useState, useRef, useEffect } from 'react';
>>>>>>> 5ee7aa6b6a3d1c88501f46082a340dc3d8514c43
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
<<<<<<< HEAD
  ListItemText,
  Divider 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Language as LanguageIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  BugReport as ReportIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useState } from 'react';
=======
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
>>>>>>> 5ee7aa6b6a3d1c88501f46082a340dc3d8514c43
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
<<<<<<< HEAD
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('navigation');
  const { logout } = useAuth();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
=======
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('auth');
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
>>>>>>> 5ee7aa6b6a3d1c88501f46082a340dc3d8514c43
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
<<<<<<< HEAD
  };

  const handleLanguageToggle = () => {
    const newLanguage = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLanguage);
    handleMenuClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
=======
    setLanguageMenuOpen(false);
  };

  const handleLanguageToggle = () => {
    setLanguageMenuOpen(!languageMenuOpen);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setLanguageMenuOpen(false);
>>>>>>> 5ee7aa6b6a3d1c88501f46082a340dc3d8514c43
    handleMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleMenuClose();
  };

<<<<<<< HEAD
  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        sx={{ 
          color: '#0d1b0d',
          '&:hover': { bgcolor: '#e7f3e7' }
        }}
      >
        <MenuIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #e7f3e7',
=======
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
>>>>>>> 5ee7aa6b6a3d1c88501f46082a340dc3d8514c43
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
      >
<<<<<<< HEAD
        <MenuItem onClick={handleLanguageToggle}>
          <ListItemIcon>
            <LanguageIcon sx={{ color: '#4c9a4c' }} />
          </ListItemIcon>
          <ListItemText>
            {i18n.language === 'en' ? '中文' : 'English'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => handleNavigate('/help')}>
          <ListItemIcon>
            <HelpIcon sx={{ color: '#4c9a4c' }} />
          </ListItemIcon>
          <ListItemText>{t('menu.help')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleNavigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon sx={{ color: '#4c9a4c' }} />
          </ListItemIcon>
          <ListItemText>{t('menu.settings')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleNavigate('/report-problem')}>
          <ListItemIcon>
            <ReportIcon sx={{ color: '#4c9a4c' }} />
          </ListItemIcon>
          <ListItemText>报告问题</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText sx={{ color: '#f44336' }}>{t('menu.logout')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
=======
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
>>>>>>> 5ee7aa6b6a3d1c88501f46082a340dc3d8514c43
  );
}