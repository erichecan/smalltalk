import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Avatar,
  Switch,
  Card,
  CardActionArea,
  Container,
  IconButton
} from '@mui/material';
import {
  ArrowBackIosNew,
  Edit,
  Notifications,
  Language,
  Mic,
  Shield,
  Lock,
  CreditCard,
  Delete,
  HelpOutline,
  MenuBook,
  Description,
  Gavel,
  ArrowForwardIos
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const slateColors = {
  slate50: 'rgba(248, 250, 252, 0.5)',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  green: '#0ecd6a',
  red50: '#fef2f2',
  red100: '#fee2e2',
  red400: '#f87171',
  red500: '#ef4444',
  red600: '#dc2626',
  red700: '#b91c1c'
};

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useTranslation('settings');
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const settingsSections = [
    {
      title: 'App Settings',
      items: [
        {
          icon: <Notifications />,
          title: 'Notifications',
          type: 'toggle',
          value: notifications,
          onChange: setNotifications
        },
        {
          icon: <Language />,
          title: 'Display Language',
          type: 'navigation',
          value: 'English',
          onClick: () => {}
        },
        {
          icon: <Mic />,
          title: 'Voice Settings',
          type: 'navigation',
          onClick: () => {}
        },
        {
          icon: <Shield />,
          title: 'Privacy Options',
          type: 'navigation',
          onClick: () => {}
        }
      ]
    },
    {
      title: 'Account Management',
      items: [
        {
          icon: <Lock />,
          title: 'Change Password',
          type: 'navigation',
          onClick: () => {}
        },
        {
          icon: <CreditCard />,
          title: 'Manage Subscription',
          type: 'navigation',
          onClick: () => {}
        },
        {
          icon: <Delete />,
          title: 'Delete Account',
          type: 'navigation',
          danger: true,
          onClick: () => {}
        }
      ]
    },
    {
      title: 'Support & Information',
      items: [
        {
          icon: <HelpOutline />,
          title: 'FAQs',
          type: 'navigation',
          onClick: () => navigate('/help')
        },
        {
          icon: <MenuBook />,
          title: 'Help Documentation',
          type: 'navigation',
          onClick: () => navigate('/help')
        },
        {
          icon: <Description />,
          title: 'Terms of Service',
          type: 'navigation',
          onClick: () => {}
        },
        {
          icon: <Gavel />,
          title: 'Privacy Policy',
          type: 'navigation',
          onClick: () => {}
        }
      ]
    }
  ];

  const renderSettingItem = (item: any, sectionIndex: number, itemIndex: number) => {
    const isDanger = item.danger;
    const cardStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      borderRadius: '12px',
      minHeight: 56,
      justifyContent: 'space-between',
      border: `1px solid ${isDanger ? slateColors.red100 : slateColors.slate100}`,
      backgroundColor: isDanger ? slateColors.red50 : slateColors.slate50,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: isDanger ? slateColors.red100 : slateColors.slate100
      }
    };

    const iconStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      width: 40,
      height: 40,
      backgroundColor: isDanger ? slateColors.red100 : slateColors.slate200,
      color: isDanger ? slateColors.red600 : slateColors.slate700,
      transition: 'all 0.2s ease-in-out',
      '.MuiCard-root:hover &': {
        backgroundColor: isDanger ? slateColors.red500 : slateColors.green,
        color: 'white'
      }
    };

    return (
      <Card key={`${sectionIndex}-${itemIndex}`} sx={cardStyles}>
        <CardActionArea
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 0,
            width: '100%',
            justifyContent: 'space-between'
          }}
          onClick={item.onClick}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={iconStyles}>
              {item.icon}
            </Box>
            <Typography
              sx={{
                color: isDanger ? slateColors.red600 : slateColors.slate700,
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'color 0.2s ease-in-out',
                '.MuiCard-root:hover &': {
                  color: isDanger ? slateColors.red700 : slateColors.slate900
                }
              }}
            >
              {t(`settings.${item.title.toLowerCase().replace(/ /g, '')}`, item.title)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {item.type === 'toggle' && (
              <Switch
                checked={item.value}
                onChange={(e) => item.onChange(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: slateColors.green
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: slateColors.green
                  }
                }}
              />
            )}
            {item.type === 'navigation' && (
              <>
                {item.value && (
                  <Typography
                    sx={{
                      color: slateColors.slate500,
                      fontSize: '0.875rem',
                      transition: 'color 0.2s ease-in-out',
                      '.MuiCard-root:hover &': {
                        color: slateColors.slate700
                      }
                    }}
                  >
                    {item.value}
                  </Typography>
                )}
                <ArrowForwardIos
                  sx={{
                    color: isDanger ? slateColors.red400 : slateColors.slate400,
                    fontSize: 16,
                    transition: 'color 0.2s ease-in-out',
                    '.MuiCard-root:hover &': {
                      color: isDanger ? slateColors.red600 : slateColors.slate600
                    }
                  }}
                />
              </>
            )}
          </Box>
        </CardActionArea>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'white',
        fontFamily: 'Inter, "Noto Sans", sans-serif'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ color: slateColors.slate700 }}
        >
          <ArrowBackIosNew />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            textAlign: 'center',
            pr: 5,
            color: slateColors.slate900,
            fontSize: '1.25rem',
            fontWeight: 600
          }}
        >
          {t('title', 'Settings')}
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, pt: 3, pb: 1 }}>
        {/* Profile Section */}
        <Box sx={{ mb: 1 }}>
          <Typography
            sx={{
              color: slateColors.slate500,
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              mb: 1
            }}
          >
            Profile
          </Typography>
          <Card
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${slateColors.slate100}`,
              backgroundColor: 'white'
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                border: '2px solid white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {user?.email?.[0]?.toUpperCase() || 'E'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: slateColors.slate800,
                  fontSize: '1.125rem',
                  fontWeight: 600
                }}
              >
                {user?.name || user?.email?.split('@')[0] || 'Ethan Carter'}
              </Typography>
              <Typography
                sx={{
                  color: slateColors.green,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Beginner
              </Typography>
            </Box>
            <IconButton
              sx={{
                color: slateColors.slate500,
                transition: 'color 0.2s ease-in-out',
                '&:hover': {
                  color: slateColors.green
                }
              }}
            >
              <Edit />
            </IconButton>
          </Card>
        </Box>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ px: 0, py: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              sx={{
                color: slateColors.slate500,
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                mb: 1,
                pt: 1.5
              }}
            >
              {t(`section.${section.title.toLowerCase().replace(/ /g, '')}`, section.title)}
            </Typography>
            {section.items.map((item, itemIndex) => renderSettingItem(item, sectionIndex, itemIndex))}
          </Box>
        ))}
      </Container>
    </Box>
  );
} 