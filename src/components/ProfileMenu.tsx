import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('navigation');
  const { logout } = useAuth();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageToggle = () => {
    const newLanguage = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLanguage);
    handleMenuClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleMenuClose();
  };

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
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
      >
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
  );
}