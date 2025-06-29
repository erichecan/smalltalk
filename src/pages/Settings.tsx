import { Container, Box, Typography, Avatar, Paper, Switch, ListItem, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import MicIcon from '@mui/icons-material/Mic';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import EditIcon from '@mui/icons-material/Edit';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const settingsItems = [
    {
      icon: <NotificationsIcon />,
      title: 'Notifications',
      type: 'switch',
      value: true
    },
    {
      icon: <LanguageIcon />,
      title: 'Display Language',
      type: 'select',
      value: 'English'
    },
    {
      icon: <MicIcon />,
      title: 'Voice Settings',
      type: 'arrow'
    },
    {
      icon: <SecurityIcon />,
      title: 'Privacy Options',
      type: 'arrow'
    }
  ];

  const accountItems = [
    {
      icon: <LockIcon />,
      title: 'Change Password',
      type: 'arrow'
    },
    {
      icon: <CreditCardIcon />,
      title: 'Manage Subscription',
      type: 'arrow'
    },
    {
      icon: <DeleteIcon />,
      title: 'Delete Account',
      type: 'arrow',
      isDestructive: true
    }
  ];

  const supportItems = [
    {
      icon: <HelpIcon />,
      title: 'FAQs',
      type: 'arrow'
    },
    {
      icon: <MenuBookIcon />,
      title: 'Help Documentation',
      type: 'arrow'
    },
    {
      icon: <DescriptionIcon />,
      title: 'Terms of Service',
      type: 'arrow'
    },
    {
      icon: <GavelIcon />,
      title: 'Privacy Policy',
      type: 'arrow'
    }
  ];

  const renderItem = (item: any, index: number) => (
    <ListItem
      key={index}
      sx={{
        gap: 2,
        bgcolor: item.isDestructive ? 'red.50' : 'slate.50',
        p: 2,
        borderRadius: 3,
        minHeight: 56,
        justifyContent: 'space-between',
        border: `1px solid ${item.isDestructive ? 'red.100' : 'slate.100'}`,
        '&:hover': {
          bgcolor: item.isDestructive ? 'red.100' : 'slate.100'
        },
        cursor: 'pointer',
        transition: 'colors 0.2s'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: 40,
            height: 40,
            bgcolor: item.isDestructive ? 'red.100' : 'slate.200',
            color: item.isDestructive ? 'red.600' : 'slate.700',
            '&:hover': {
              bgcolor: item.isDestructive ? 'red.500' : '#0ecd6a',
              color: 'white'
            },
            transition: 'colors 0.2s'
          }}
        >
          {item.icon}
        </Box>
        <Typography
          sx={{
            color: item.isDestructive ? 'red.600' : 'slate.700',
            fontWeight: 500,
            fontSize: 16,
            '&:hover': {
              color: item.isDestructive ? 'red.700' : 'slate.900'
            },
            transition: 'colors 0.2s'
          }}
        >
          {item.title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {item.type === 'switch' && (
          <Switch
            checked={item.value}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#0ecd6a',
                '&:hover': {
                  backgroundColor: 'rgba(14, 205, 106, 0.08)'
                }
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#0ecd6a'
              }
            }}
          />
        )}
        {item.type === 'select' && (
          <>
            <Typography
              sx={{
                color: 'slate.500',
                fontSize: 14,
                '&:hover': {
                  color: 'slate.700'
                },
                transition: 'colors 0.2s'
              }}
            >
              {item.value}
            </Typography>
            <ChevronRightIcon sx={{ color: 'slate.400', fontSize: 20 }} />
          </>
        )}
        {item.type === 'arrow' && (
          <ChevronRightIcon sx={{ color: item.isDestructive ? 'red.400' : 'slate.400', fontSize: 20 }} />
        )}
      </Box>
    </ListItem>
  );

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: 'white', p: 0, fontFamily: 'Inter, Noto Sans, sans-serif' }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', color: 'slate.700', '&:hover': { bgcolor: 'slate.100' } }}>
          <ArrowBackIcon />
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: 'slate.900', fontWeight: 600, pr: 5 }}>Settings</Typography>
      </Box>

      {/* 用户资料 */}
      <Box sx={{ px: 2, pt: 3, pb: 1 }}>
        <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
          Profile
        </Typography>
        <Paper sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white', p: 2, borderRadius: 3, boxShadow: 1, border: '1px solid #f1f5f9' }}>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7gtNV8yzaBZCjJ4nG50QXGjItgqh2OxCjLiQ15OQLBWv1Vf7Cn9nrpBmbs_ZXuPj_DmrBfK8ubX43TDz17nWzM0Jvd9pm3pOsszHlZvdB-zmhAsQrECb5VNBm_GpBBKkyEwG_OrPwlzrvTWWbHqSf37UU-zNX9DsJDQWzUaqBWhs6KTWUk82VSdX9366Fv4o-JMmWloLSffkFyvstPeQVFGVytBIJsL7O9_WNDztSRrECLVTwO8UgZsBfBPSh6lSfkwYkEDHswWM"
            sx={{ width: 64, height: 64, border: '2px solid white', boxShadow: 2 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'slate.800', fontWeight: 600 }}>
              {user?.name || 'Ethan Carter'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0ecd6a', fontWeight: 500 }}>
              Beginner
            </Typography>
          </Box>
          <Button sx={{ color: 'slate.500', '&:hover': { color: '#0ecd6a' }, minWidth: 0, p: 1 }}>
            <EditIcon />
          </Button>
        </Paper>
      </Box>

      {/* 应用设置 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block', pt: 1 }}>
          App Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {settingsItems.map((item, index) => renderItem(item, index))}
        </Box>
      </Box>

      {/* 账户管理 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block', pt: 1 }}>
          Account Management
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {accountItems.map((item, index) => renderItem(item, index))}
        </Box>
      </Box>

      {/* 支持与信息 */}
      <Box sx={{ px: 2, py: 1, pb: 4 }}>
        <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block', pt: 1 }}>
          Support & Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {supportItems.map((item, index) => renderItem(item, index))}
        </Box>
      </Box>
    </Container>
  );
} 