import { useState } from 'react';
import { Container, Box, Typography, Tab, Tabs, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PracticeExercises from './PracticeExercises';
import LearningPlan from './LearningPlan';
import LearningHistory from './LearningHistory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function PracticeLayout() {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation('practice');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0 }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'rgba(248, 252, 248, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(231, 243, 231, 0.5)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              color: '#0d1b0d',
              width: 40,
              height: 40,
              '&:hover': { bgcolor: '#e7f3e7' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#0d1b0d', 
              fontWeight: 'bold', 
              flex: 1, 
              textAlign: 'center',
              pr: 5
            }}
          >
            {t('title')}
          </Typography>
        </Box>

        {/* Tab Navigation */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            px: 2,
            borderBottom: '1px solid #e7f3e7',
            '& .MuiTab-root': {
              color: '#6B7280',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              minHeight: 48,
              '&.Mui-selected': {
                color: '#10B981',
                fontWeight: 600,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#10B981',
              height: 2,
            }
          }}
        >
          <Tab label={t('tabs.exercises')} />
          <Tab label={t('tabs.plan')} />
          <Tab label={t('tabs.history')} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ pb: 10 }}>
        <TabPanel value={tabValue} index={0}>
          <PracticeExercises />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <LearningPlan />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <LearningHistory />
        </TabPanel>
      </Box>
    </Container>
  );
}