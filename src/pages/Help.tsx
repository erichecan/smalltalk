import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardActionArea,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Container
} from '@mui/material';
import {
  ArrowBackIosNew,
  Search,
  RocketLaunch,
  Settings,
  ChatBubbleOutline,
  BugReport,
  ExpandMore,
  Email,
  ContactSupport,
  ChevronRight
} from '@mui/icons-material';

const customStyles = {
  backgroundColor: '#F0FAF9',
  colors: {
    green50: '#F0FAF9',
    green100: '#D1FAE5',
    green200: '#A7F3D0',
    green500: '#10B981',
    green600: '#059669',
    green700: '#047857',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151'
  }
};

export default function Help() {
  const navigate = useNavigate();
  const { t } = useTranslation('help');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { icon: <RocketLaunch />, title: 'Getting Started', key: 'gettingStarted' },
    { icon: <Settings />, title: 'Account Settings', key: 'accountSettings' },
    { icon: <ChatBubbleOutline />, title: 'Conversations', key: 'conversations' },
    { icon: <BugReport />, title: 'Troubleshooting', key: 'troubleshooting' }
  ];

  const faqs = [
    {
      question: 'How do I start a new conversation?',
      answer: \"Simply tap the 'New Conversation' button on the home screen and choose a topic or scenario to begin practicing your English skills!\",
      key: 'startConversation'
    },
    {
      question: 'Can I change my account password?',
      answer: \"Yes, you can change your password in the 'Account Settings' section of your profile. Look for the 'Change Password' option and follow the instructions.\",
      key: 'changePassword'
    },
    {
      question: 'What if the app is not responding?',
      answer: 'Try closing and reopening the app. If the issue persists, check your internet connection or restart your device. For more detailed steps, please visit the \\'Troubleshooting\\' category or contact support.',
      key: 'appNotResponding'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: customStyles.colors.green50,
        color: customStyles.colors.gray700,
        fontFamily: 'Spline Sans, Noto Sans, sans-serif'
      }}
    >
      {/* Header */}
      <Box 
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: 'rgba(240, 250, 249, 0.8)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Card
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              color: customStyles.colors.green700,
              '&:hover': {
                backgroundColor: customStyles.colors.green100
              }
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIosNew />
          </Card>
          <Typography 
            variant=\"h6\" 
            sx={{ 
              flex: 1, 
              textAlign: 'center', 
              pr: 5,
              color: customStyles.colors.green700,
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}
          >
            {t('title', 'Help & FAQ')}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth=\"sm\" sx={{ px: 2.5, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Search Bar */}
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              placeholder={t('searchPlaceholder', 'Search FAQs...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position=\"start\">
                    <Search sx={{ color: customStyles.colors.green600 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                  backgroundColor: 'white',
                  border: `2px solid ${customStyles.colors.green200}`,
                  '&:hover': {
                    borderColor: customStyles.colors.green500,
                  },
                  '&.Mui-focused': {
                    borderColor: customStyles.colors.green500,
                    boxShadow: `0 0 0 2px rgba(16, 185, 129, 0.5)`
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '& .MuiInputBase-input': {
                  py: 1.75,
                  color: customStyles.colors.gray700,
                  '&::placeholder': {
                    color: customStyles.colors.gray400
                  }
                }
              }}
            />
          </Box>

          {/* Categories */}
          <Box>
            <Typography 
              variant=\"h6\" 
              sx={{ 
                color: customStyles.colors.green700,
                fontWeight: 600,
                mb: 2,
                fontSize: '1.125rem'
              }}
            >
              {t('categories', 'Categories')}
            </Typography>
            <Grid container spacing={2}>
              {categories.map((category, index) => (
                <Grid item xs={6} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: `1px solid ${customStyles.colors.green200}`,
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: customStyles.colors.green500,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardActionArea
                      sx={{
                        p: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box 
                        sx={{ 
                          color: customStyles.colors.green600,
                          '& svg': { fontSize: '2.5rem' }
                        }}
                      >
                        {category.icon}
                      </Box>
                      <Typography 
                        variant=\"body2\" 
                        sx={{ 
                          color: customStyles.colors.gray700,
                          fontWeight: 500,
                          textAlign: 'center',
                          fontSize: '0.875rem'
                        }}
                      >
                        {t(`category.${category.key}`, category.title)}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Common Questions */}
          <Box>
            <Typography 
              variant=\"h6\" 
              sx={{ 
                color: customStyles.colors.green700,
                fontWeight: 600,
                mb: 2,
                fontSize: '1.125rem'
              }}
            >
              {t('commonQuestions', 'Common Questions')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  sx={{
                    border: `1px solid ${customStyles.colors.green200}`,
                    backgroundColor: 'white',
                    borderRadius: '12px !important',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      backgroundColor: customStyles.colors.green100,
                      borderColor: customStyles.colors.green500
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMore 
                        sx={{ 
                          color: customStyles.colors.gray500,
                          '.Mui-expanded &': {
                            color: customStyles.colors.green600
                          }
                        }} 
                      />
                    }
                    sx={{
                      px: 2,
                      py: 1,
                      '& .MuiAccordionSummary-content': {
                        margin: 0
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: customStyles.colors.gray700
                      }}
                    >
                      {t(`faq.${faq.key}.question`, faq.question)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pb: 2, pt: 0.5 }}>
                    <Typography 
                      sx={{ 
                        fontSize: '0.75rem',
                        color: customStyles.colors.gray600,
                        lineHeight: 1.6
                      }}
                    >
                      {t(`faq.${faq.key}.answer`, faq.answer)}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>

          {/* Need More Help */}
          <Box sx={{ pt: 2, pb: 1 }}>
            <Typography 
              variant=\"h6\" 
              sx={{ 
                color: customStyles.colors.green700,
                fontWeight: 600,
                mb: 2,
                fontSize: '1.125rem'
              }}
            >
              {t('needMoreHelp', 'Need More Help?')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link
                href=\"mailto:support@englishbuddy.app\"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '12px',
                  border: `1px solid ${customStyles.colors.green200}`,
                  backgroundColor: 'white',
                  color: customStyles.colors.gray700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(209, 250, 229, 0.5)'
                  }
                }}
              >
                <Email sx={{ color: customStyles.colors.green600 }} />
                <Typography 
                  sx={{ 
                    flex: 1,
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {t('emailSupport', 'Email Support')}
                </Typography>
                <ChevronRight sx={{ color: customStyles.colors.gray400 }} />
              </Link>
              
              <Link
                href=\"#\"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '12px',
                  border: `1px solid ${customStyles.colors.green200}`,
                  backgroundColor: 'white',
                  color: customStyles.colors.gray700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(209, 250, 229, 0.5)'
                  }
                }}
              >
                <ContactSupport sx={{ color: customStyles.colors.green600 }} />
                <Typography 
                  sx={{ 
                    flex: 1,
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {t('visitHelpCenter', 'Visit Help Center Online')}
                </Typography>
                <ChevronRight sx={{ color: customStyles.colors.gray400 }} />
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}