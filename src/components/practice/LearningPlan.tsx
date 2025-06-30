import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  Button,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  RecordVoiceOver as VoiceIcon,
  AddCircleOutline as AddIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function LearningPlan() {
  const { t } = useTranslation('practice');
  const [learningObjective, setLearningObjective] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('');
  const [timeGoal, setTimeGoal] = useState('');

  // Calendar state
  const [currentMonth] = useState('January 2025');
  const today = 3; // Current day highlighted

  const progressData = [
    {
      title: t('plan.progress.conversations'),
      current: 6,
      target: 10,
      percentage: 60
    },
    {
      title: t('plan.progress.timeWeekly'),
      current: 135,
      target: 300,
      percentage: 45,
      unit: 'mins'
    },
    {
      title: t('plan.progress.vocabulary'),
      current: 75,
      target: 200,
      percentage: 37.5
    }
  ];

  const scheduledSessions = [
    {
      title: t('plan.sessions.conversation'),
      time: '10:00 AM - 10:30 AM',
      icon: VoiceIcon
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Goals Section */}
      <Box sx={{ py: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#0d1b0d', 
            fontWeight: 'bold',
            mb: 2
          }}
        >
          {t('plan.goals.title')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Learning Objective */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#4b9b4b', fontSize: '0.875rem' }}>
              {t('plan.goals.objective')}
            </InputLabel>
            <Select
              value={learningObjective}
              onChange={(e) => setLearningObjective(e.target.value)}
              sx={{
                borderRadius: 3,
                bgcolor: '#e7f3e7',
                height: 56,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                  border: '2px solid #10B981' 
                },
                '& .MuiSelect-select': {
                  color: '#0d1b0d',
                  fontSize: '1rem'
                }
              }}
            >
              <MenuItem value="travel">{t('plan.goals.options.travel')}</MenuItem>
              <MenuItem value="business">{t('plan.goals.options.business')}</MenuItem>
              <MenuItem value="daily">{t('plan.goals.options.daily')}</MenuItem>
            </Select>
          </FormControl>

          {/* Proficiency Level */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#4b9b4b', fontSize: '0.875rem' }}>
              {t('plan.goals.level')}
            </InputLabel>
            <Select
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value)}
              sx={{
                borderRadius: 3,
                bgcolor: '#e7f3e7',
                height: 56,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                  border: '2px solid #10B981' 
                },
                '& .MuiSelect-select': {
                  color: '#0d1b0d',
                  fontSize: '1rem'
                }
              }}
            >
              <MenuItem value="beginner">{t('plan.goals.levels.beginner')}</MenuItem>
              <MenuItem value="intermediate">{t('plan.goals.levels.intermediate')}</MenuItem>
              <MenuItem value="advanced">{t('plan.goals.levels.advanced')}</MenuItem>
            </Select>
          </FormControl>

          {/* Time Goal */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#4b9b4b', fontSize: '0.875rem' }}>
              {t('plan.goals.timeGoal')}
            </InputLabel>
            <Select
              value={timeGoal}
              onChange={(e) => setTimeGoal(e.target.value)}
              sx={{
                borderRadius: 3,
                bgcolor: '#e7f3e7',
                height: 56,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                  border: '2px solid #10B981' 
                },
                '& .MuiSelect-select': {
                  color: '#0d1b0d',
                  fontSize: '1rem'
                }
              }}
            >
              <MenuItem value="1month">{t('plan.goals.timeOptions.1month')}</MenuItem>
              <MenuItem value="3months">{t('plan.goals.timeOptions.3months')}</MenuItem>
              <MenuItem value="6months">{t('plan.goals.timeOptions.6months')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Schedule Section */}
      <Box sx={{ py: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#0d1b0d', 
            fontWeight: 'bold',
            mb: 2
          }}
        >
          {t('plan.schedule.title')}
        </Typography>

        {/* Calendar */}
        <Card sx={{ borderRadius: 3, boxShadow: 1, mb: 2 }}>
          <CardContent>
            {/* Month Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <IconButton sx={{ color: '#0d1b0d', '&:hover': { bgcolor: '#e7f3e7' } }}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography sx={{ color: '#0d1b0d', fontSize: '1.125rem', fontWeight: 'semibold' }}>
                {currentMonth}
              </Typography>
              <IconButton sx={{ color: '#0d1b0d', '&:hover': { bgcolor: '#e7f3e7' } }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Calendar Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center' }}>
              {/* Week headers */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Typography 
                  key={index}
                  sx={{ 
                    color: '#4b9b4b', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {day}
                </Typography>
              ))}
              
              {/* Calendar days */}
              {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                <Box 
                  key={day}
                  sx={{ 
                    height: 40,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'medium',
                      cursor: 'pointer',
                      ...(day === today && {
                        bgcolor: '#10B981',
                        color: 'white',
                        boxShadow: 2
                      }),
                      ...(day !== today && {
                        color: '#0d1b0d',
                        '&:hover': { bgcolor: '#e7f3e7' }
                      })
                    }}
                  >
                    {day}
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Scheduled Sessions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {scheduledSessions.map((session, index) => {
            const IconComponent = session.icon;
            return (
              <Card key={index} sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  p: 1.5,
                  '&:last-child': { pb: 1.5 }
                }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#e7f3e7',
                      color: '#10B981'
                    }}
                  >
                    <IconComponent sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#0d1b0d', fontWeight: 'semibold', fontSize: '1rem' }}>
                      {session.title}
                    </Typography>
                    <Typography sx={{ color: '#4b9b4b', fontSize: '0.875rem' }}>
                      {session.time}
                    </Typography>
                  </Box>
                  <IconButton sx={{ color: '#4b9b4b', '&:hover': { color: '#10B981' } }}>
                    <MoreVertIcon />
                  </IconButton>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Add Session Button */}
          <Button
            startIcon={<AddIcon />}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: '#10B981',
              bgcolor: '#e7f3e7',
              fontWeight: 'semibold',
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              '&:hover': { bgcolor: '#CAECCA' }
            }}
          >
            {t('plan.schedule.addSession')}
          </Button>
        </Box>
      </Box>

      {/* Progress Section */}
      <Box sx={{ py: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#0d1b0d', 
            fontWeight: 'bold',
            mb: 2
          }}
        >
          {t('plan.progress.title')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {progressData.map((item, index) => (
            <Paper key={index} sx={{ p: 2, borderRadius: 3, boxShadow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ color: '#0d1b0d', fontWeight: 'semibold', fontSize: '1rem' }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: '#4b9b4b', fontSize: '0.875rem', fontWeight: 'medium' }}>
                  {item.current}/{item.target}{item.unit && ` ${item.unit}`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={item.percentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: '#e7f3e7',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#10B981',
                    borderRadius: 5
                  }
                }}
              />
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}