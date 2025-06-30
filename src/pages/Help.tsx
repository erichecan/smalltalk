import { Container, Box, Typography, Button, TextField, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  const handleFaqChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const categories = [
    { icon: <RocketLaunchIcon sx={{ fontSize: 32 }} />, title: 'Getting Started' },
    { icon: <SettingsIcon sx={{ fontSize: 32 }} />, title: 'Account Settings' },
    { icon: <ChatBubbleOutlineIcon sx={{ fontSize: 32 }} />, title: 'Conversations' },
    { icon: <BugReportIcon sx={{ fontSize: 32 }} />, title: 'Troubleshooting' },
  ];

  const faqs = [
    {
      id: 'faq1',
      question: 'How do I start a new conversation?',
      answer: "Simply tap the 'New Conversation' button on the home screen and choose a topic or scenario to begin practicing your English skills!"
    },
    {
      id: 'faq2',
      question: 'Can I change my account password?',
      answer: "Yes, you can change your password in the 'Account Settings' section of your profile. Look for the 'Change Password' option and follow the instructions."
    },
    {
      id: 'faq3',
      question: 'What if the app is not responding?',
      answer: "Try closing and reopening the app. If the issue persists, check your internet connection or restart your device. For more detailed steps, please visit the 'Troubleshooting' category or contact support."
    }
  ];

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#F0FAF9', p: 0, fontFamily: 'Spline Sans, Noto Sans, sans-serif', color: '#374151' }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: 'rgba(240,250,249,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', color: '#047857', '&:hover': { bgcolor: '#D1FAE5' } }}>
            <ArrowBackIcon />
          </Button>
          <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: '#047857', fontWeight: 'bold', pr: 5 }}>Help & FAQ</Typography>
        </Box>
      </Box>

      {/* 主要内容 */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2.5, py: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* 搜索框 */}
        <Box sx={{ position: 'relative' }}>
          <SearchIcon sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#059669', fontSize: 24 }} />
          <TextField
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                bgcolor: 'white',
                border: '2px solid #A7F3D0',
                pl: 5,
                pr: 2,
                py: 1.5,
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  borderColor: '#10B981',
                },
                '&.Mui-focused': {
                  borderColor: '#10B981',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.5)',
                },
                '& input': {
                  color: '#374151',
                  fontSize: 16,
                  '&::placeholder': {
                    color: '#9CA3AF',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        </Box>

        {/* 分类 */}
        <Box>
          <Typography variant="h6" sx={{ color: '#047857', fontWeight: 600, mb: 2 }}>
            Categories
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {categories.map((category, index) => (
              <Paper
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  borderRadius: 3,
                  border: '1px solid #A7F3D0',
                  bgcolor: 'white',
                  p: 2.5,
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#10B981',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                  '&:focus': {
                    outline: 'none',
                    boxShadow: '0 0 0 2px #10B981, 0 0 0 4px rgba(16, 185, 129, 0.5)',
                  }
                }}
              >
                <Box sx={{ color: '#059669' }}>
                  {category.icon}
                </Box>
                <Typography sx={{ color: '#374151', fontSize: 14, fontWeight: 500 }}>
                  {category.title}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* 常见问题 */}
        <Box>
          <Typography variant="h6" sx={{ color: '#047857', fontWeight: 600, mb: 2 }}>
            Common Questions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {faqs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expandedFaq === faq.id}
                onChange={handleFaqChange(faq.id)}
                sx={{
                  borderRadius: 3,
                  border: '1px solid #A7F3D0',
                  bgcolor: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  '&.Mui-expanded': {
                    bgcolor: '#D1FAE5',
                    borderColor: '#10B981',
                  },
                  '&:before': {
                    display: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon 
                      sx={{ 
                        color: expandedFaq === faq.id ? '#059669' : '#6B7280',
                        transition: 'all 0.2s ease-in-out'
                      }} 
                    />
                  }
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      my: 1,
                    },
                  }}
                >
                  <Typography sx={{ color: '#374151', fontSize: 14, fontWeight: 500 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0.5, pb: 2 }}>
                  <Typography sx={{ color: '#4B5563', fontSize: 12, lineHeight: 1.6 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* 需要更多帮助 */}
        <Box sx={{ pt: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ color: '#047857', fontWeight: 600, mb: 2 }}>
            Need More Help?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper
              component="a"
              href="mailto:support@englishbuddy.app"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 3,
                border: '1px solid #A7F3D0',
                bgcolor: 'white',
                p: 2,
                color: '#374151',
                textDecoration: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(209, 250, 229, 0.5)',
                },
                '&:focus': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px #10B981, 0 0 0 4px rgba(16, 185, 129, 0.5)',
                }
              }}
            >
              <EmailIcon sx={{ color: '#059669' }} />
              <Typography sx={{ fontSize: 14, fontWeight: 500, flexGrow: 1 }}>
                Email Support
              </Typography>
              <ChevronRightIcon sx={{ color: '#9CA3AF' }} />
            </Paper>

            <Paper
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 3,
                border: '1px solid #A7F3D0',
                bgcolor: 'white',
                p: 2,
                color: '#374151',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(209, 250, 229, 0.5)',
                },
                '&:focus': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px #10B981, 0 0 0 4px rgba(16, 185, 129, 0.5)',
                }
              }}
            >
              <ContactSupportIcon sx={{ color: '#059669' }} />
              <Typography sx={{ fontSize: 14, fontWeight: 500, flexGrow: 1 }}>
                Visit Help Center Online
              </Typography>
              <ChevronRightIcon sx={{ color: '#9CA3AF' }} />
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 