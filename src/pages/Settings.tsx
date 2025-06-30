import { Container, Box, Typography, Avatar, Paper, Button } from '@mui/material';
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
    <Box
      key={index}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: item.isDestructive ? '#fef2f2' : '#f8fafc',
        p: 2,
        borderRadius: 3,
        minHeight: 56,
        justifyContent: 'space-between',
        border: `1px solid ${item.isDestructive ? '#fecaca' : '#f1f5f9'}`,
        '&:hover': {
          bgcolor: item.isDestructive ? '#fee2e2' : '#f1f5f9'
        },
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        mb: 1.5
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
            bgcolor: item.isDestructive ? '#fecaca' : '#e2e8f0',
            color: item.isDestructive ? '#dc2626' : '#475569',
            flexShrink: 0,
            '&:hover': {
              bgcolor: item.isDestructive ? '#dc2626' : '#0ecd6a',
              color: 'white'
            },
            transition: 'all 0.2s'
          }}
        >
          {item.icon}
        </Box>
        <Typography
          sx={{
            color: item.isDestructive ? '#dc2626' : '#475569',
            fontWeight: 500,
            fontSize: 16,
            '&:hover': {
              color: item.isDestructive ? '#b91c1c' : '#1e293b'
            },
            transition: 'color 0.2s'
          }}
        >
          {item.title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {item.type === 'switch' && (
          <Box
            sx={{
              position: 'relative',
              width: 48,
              height: 28,
              bgcolor: item.value ? '#0ecd6a' : '#cbd5e1',
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: item.value ? 'flex-end' : 'flex-start',
              px: 0.25
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                bgcolor: 'white',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease-in-out'
              }}
            />
          </Box>
        )}
        {item.type === 'select' && (
          <>
            <Typography
              sx={{
                color: '#64748b',
                fontSize: 14,
                '&:hover': {
                  color: '#475569'
                },
                transition: 'color 0.2s'
              }}
            >
              {item.value}
            </Typography>
            <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
          </>
        )}
        {item.type === 'arrow' && (
          <ChevronRightIcon sx={{ color: item.isDestructive ? '#f87171' : '#94a3b8', fontSize: 20 }} />
        )}
      </Box>
    </Box>
  );

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: 'white', p: 0, fontFamily: 'Inter, Noto Sans, sans-serif' }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}>
          <ArrowBackIcon />
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: '#1e293b', fontWeight: 600, pr: 5 }}>Settings</Typography>
      </Box>

      {/* 用户资料 */}
      <Box sx={{ px: 2, pt: 3, pb: 1 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
          Profile
        </Typography>
        <Paper sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white', p: 2, borderRadius: 3, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7gtNV8yzaBZCjJ4nG50QXGjItgqh2OxCjLiQ15OQLBWv1Vf7Cn9nrpBmbs_ZXuPj_DmrBfK8ubX43TDz17nWzM0Jvd9pm3pOsszHlZvdB-zmhAsQrECb5VNBm_GpBBKkyEwG_OrPwlzrvTWWbHqSf37UU-zNX9DsJDQWzUaqBWhs6KTWUk82VSdX9366Fv4o-JMmWloLSffkFyvstPeQVFGVytBIJsL7O9_WNDztSRrECLVTwO8UgZsBfBPSh6lSfkwYkEDHswWM"
            sx={{ width: 64, height: 64, border: '2px solid white', boxShadow: 2 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
              {user?.name || 'Ethan Carter'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#0ecd6a', fontWeight: 500 }}>
              Beginner
            </Typography>
          </Box>
          <Button sx={{ color: '#64748b', '&:hover': { color: '#0ecd6a' }, minWidth: 0, p: 1 }}>
            <EditIcon />
          </Button>
        </Paper>
      </Box>

      {/* 应用设置 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block', pt: 1 }}>
          App Settings
        </Typography>
        <Box>
          {settingsItems.map((item, index) => renderItem(item, index))}
        </Box>
      </Box>

      {/* 账户管理 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block', pt: 1 }}>
          Account Management
        </Typography>
        <Box>
          {accountItems.map((item, index) => renderItem(item, index))}
        </Box>
      </Box>

      {/* 支持与信息 */}
      <Box sx={{ px: 2, py: 1, pb: 8 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block', pt: 1 }}>
          Support & Information
        </Typography>
        <Box>
          {supportItems.map((item, index) => renderItem(item, index))}
        </Box>
      </Box>
    </Container>
  );
} 