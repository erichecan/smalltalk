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
  Link,
  IconButton
} from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const customStyles = {
  colors: {
    primary500: '#0FDB0F',
    gray100: '#F5F5F5',
    gray200: '#E0E0E0',
    gray400: '#9E9E9E',
    gray600: '#757575',
    gray800: '#424242',
    text900: '#0D1C0D'
  }
};

function Help() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const helpData = [
    {
      category: 'Getting Started',
      items: [
        {
          question: 'How do I create my first conversation?',
          answer: 'Simply go to the Topic Input page, enter a topic you\'d like to discuss, and start chatting with our AI!'
        },
        {
          question: 'What languages are supported?',
          answer: 'Currently we support English and Chinese, with more languages coming soon.'
        }
      ]
    },
    {
      category: 'Vocabulary Learning',
      items: [
        {
          question: 'How do I add words to my vocabulary?',
          answer: 'You can add words by selecting text in conversations or manually adding them in the Vocabulary section.'
        },
        {
          question: 'How does the mastery system work?',
          answer: 'Words have different mastery levels. Practice regularly to improve your mastery and track your progress.'
        }
      ]
    },
    {
      category: 'Account & Settings',
      items: [
        {
          question: 'How do I change my password?',
          answer: 'Go to Settings > Account > Change Password to update your password.'
        },
        {
          question: 'Can I use the app without an account?',
          answer: 'Yes! You can try limited features as a guest, but creating an account unlocks full functionality.'
        }
      ]
    }
  ];

  const filteredData = helpData.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#F8FCF8',
      pt: 3
    }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: customStyles.colors.text900,
              fontWeight: 'bold',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Help Center
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: customStyles.colors.gray600,
              textAlign: 'center',
              mb: 4
            }}
          >
            Find answers to common questions and learn how to make the most of SmallTalk
          </Typography>

          <TextField
            fullWidth
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'white'
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          {filteredData.map((category, categoryIndex) => (
            <Box key={categoryIndex} sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: customStyles.colors.text900,
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                {category.category}
              </Typography>
              
              {category.items.map((item, itemIndex) => (
                <Accordion 
                  key={itemIndex}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: customStyles.colors.primary500 }} />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        my: 2
                      }
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: customStyles.colors.text900,
                        fontWeight: 'medium'
                      }}
                    >
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: customStyles.colors.gray600,
                        lineHeight: 1.6
                      }}
                    >
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Box>

        <Box sx={{ 
          p: 4, 
          bgcolor: 'white', 
          borderRadius: 3,
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: customStyles.colors.text900,
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Still need help?
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: customStyles.colors.gray600,
              mb: 3
            }}
          >
            Can't find what you're looking for? Contact our support team.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Link 
              href="/report-problem"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                bgcolor: customStyles.colors.primary500,
                color: 'white',
                borderRadius: 2,
                textDecoration: 'none',
                fontWeight: 'medium',
                '&:hover': {
                  bgcolor: '#0CBF0C'
                }
              }}
            >
              <Typography variant="body2">
                Report a Problem
              </Typography>
              <ChevronRight sx={{ color: 'white' }} />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Help;