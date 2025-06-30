import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Grid, 
  Card, 
  CardContent, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Button,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Search as SearchIcon,
  RocketLaunch as RocketLaunchIcon,
  Settings as SettingsIcon,
  ChatBubbleOutline as ChatIcon,
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  ContactSupport as ContactSupportIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const { t } = useTranslation('help');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = [
    { icon: RocketLaunchIcon, title: t('categories.gettingStarted'), key: 'gettingStarted' },
    { icon: SettingsIcon, title: t('categories.accountSettings'), key: 'accountSettings' },
    { icon: ChatIcon, title: t('categories.conversations'), key: 'conversations' },
    { icon: BugReportIcon, title: t('categories.troubleshooting'), key: 'troubleshooting' }
  ];

  const faqs = [
    {
      question: t('faqs.newConversation.question'),
      answer: t('faqs.newConversation.answer')
    },
    {
      question: t('faqs.changePassword.question'),
      answer: t('faqs.changePassword.answer')
    },
    {
      question: t('faqs.appNotResponding.question'),
      answer: t('faqs.appNotResponding.answer')
    }
  ];

  const handleCategoryClick = (categoryKey: string) => {
    // Handle category selection logic here
    console.log('Selected category:', categoryKey);
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 20, 
        bgcolor: 'rgba(248, 252, 248, 0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(202, 236, 202, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              color: '#047857',
              width: 40,
              height: 40,
              '&:hover': { bgcolor: 'rgba(202, 236, 202, 0.3)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#047857', 
              fontWeight: 'bold', 
              flex: 1, 
              textAlign: 'center',
              pr: 5
            }}
          >
            {t('title')}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3, pb: 8 }}>
        {/* Search Bar */}
        <Paper sx={{ mb: 4, borderRadius: 3, border: '2px solid #A7F3D0' }}>
          <TextField
            fullWidth
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#059669' }} />
                </InputAdornment>
              ),
              sx: {
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                borderRadius: 3,
                bgcolor: 'white',
                py: 1
              }
            }}
          />
        </Paper>

        {/* Categories */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ color: '#047857', fontWeight: 'semibold', mb: 2 }}
          >
            {t('categoriesTitle')}
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Grid item xs={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: '1px solid #A7F3D0',
                      borderRadius: 3,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderColor: '#10B981'
                      }
                    }}
                    onClick={() => handleCategoryClick(category.key)}
                  >
                    <CardContent sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      textAlign: 'center',
                      p: 3
                    }}>
                      <IconComponent sx={{ fontSize: 48, color: '#059669', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 'medium' }}>
                        {category.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Common Questions */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ color: '#047857', fontWeight: 'semibold', mb: 2 }}
          >
            {t('commonQuestionsTitle')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {faqs.map((faq, index) => (
              <Accordion 
                key={index}
                sx={{ 
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    bgcolor: '#D1FAE5',
                    borderColor: '#10B981'
                  }
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon sx={{ color: '#6B7280' }} />}
                  sx={{ 
                    '& .MuiAccordionSummary-content': { 
                      margin: '12px 0' 
                    },
                    '&.Mui-expanded .MuiSvgIcon-root': {
                      color: '#059669',
                      transform: 'rotate(180deg)'
                    }
                  }}
                >
                  <Typography sx={{ color: '#374151', fontWeight: 'medium', fontSize: '0.875rem' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography sx={{ color: '#4B5563', fontSize: '0.75rem', lineHeight: 1.6 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Need More Help */}
        <Box>
          <Typography 
            variant="h6" 
            sx={{ color: '#047857', fontWeight: 'semibold', mb: 2 }}
          >
            {t('needMoreHelpTitle')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EmailIcon sx={{ color: '#059669' }} />}
              endIcon={<ChevronRightIcon sx={{ color: '#9CA3AF' }} />}
              sx={{
                justifyContent: 'space-between',
                border: '1px solid #A7F3D0',
                borderRadius: 3,
                bgcolor: 'white',
                color: '#374151',
                p: 2,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: 'rgba(202, 236, 202, 0.25)',
                  borderColor: '#A7F3D0'
                }
              }}
              onClick={() => window.location.href = 'mailto:support@englishbuddy.app'}
            >
              {t('needMoreHelp.emailSupport')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContactSupportIcon sx={{ color: '#059669' }} />}
              endIcon={<ChevronRightIcon sx={{ color: '#9CA3AF' }} />}
              sx={{
                justifyContent: 'space-between',
                border: '1px solid #A7F3D0',
                borderRadius: 3,
                bgcolor: 'white',
                color: '#374151',
                p: 2,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: 'rgba(202, 236, 202, 0.25)',
                  borderColor: '#A7F3D0'
                }
              }}
              onClick={() => window.open('#', '_blank')}
            >
              {t('needMoreHelp.visitHelpCenter')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}