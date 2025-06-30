import { Container, Box, Typography, List, ListItem, ListItemText, Switch, Paper, Select, MenuItem, FormControl, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function Settings() {
  const { t, i18n } = useTranslation('settings');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleLanguageChange = (event: any) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0 }}>
      {/* 顶部标题栏 */}
      <Box sx={{ bgcolor: '#CAECCA', py: 2, px: 3, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>{t('title')}</Typography>
      </Box>
      
      {/* 设置项列表 */}
      <Box sx={{ px: 2, py: 3 }}>
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1 }}>
          <List>
            {/* 语言设置 */}
            <ListItem>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>{t('language.title')}</Typography>}
                secondary={<Typography sx={{ color: '#666', fontSize: '0.9rem' }}>{t('language.description')}</Typography>}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CAECCA',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CAECCA',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CAECCA',
                    },
                  }}
                >
                  <MenuItem value="en">{t('language.options.en')}</MenuItem>
                  <MenuItem value="zh">{t('language.options.zh')}</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            {/* 外观设置 */}
            <ListItem>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>{t('appearance.title')}</Typography>}
              />
            </ListItem>
            <ListItem secondaryAction={<Switch edge="end" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}>
              <ListItemText 
                primary={<Typography sx={{ color: '#0d1b0d', pl: 2 }}>{t('appearance.darkMode')}</Typography>} 
              />
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            {/* 通知设置 */}
            <ListItem>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>{t('notifications.title')}</Typography>}
              />
            </ListItem>
            <ListItem secondaryAction={<Switch edge="end" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}>
              <ListItemText 
                primary={<Typography sx={{ color: '#0d1b0d', pl: 2 }}>{notifications ? t('notifications.enabled') : t('notifications.disabled')}</Typography>} 
              />
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            {/* 隐私设置 */}
            <ListItem secondaryAction={<Switch edge="end" checked={privacyMode} onChange={(e) => setPrivacyMode(e.target.checked)} />}>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>Privacy Mode</Typography>} 
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Container>
  );
} 