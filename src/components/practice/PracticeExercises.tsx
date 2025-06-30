import { Box, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import {
  Quiz as QuizIcon,
  Edit as EditIcon,
  Extension as ExtensionIcon,
  Mic as MicIcon,
  Build as BuildIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ExerciseType {
  id: string;
  icon: React.ComponentType;
  title: string;
  description: string;
  color: string;
}

export default function PracticeExercises() {
  const { t } = useTranslation('practice');

  const exerciseTypes: ExerciseType[] = [
    {
      id: 'quiz',
      icon: QuizIcon,
      title: t('exercises.quiz.title'),
      description: t('exercises.quiz.description'),
      color: '#10B981'
    },
    {
      id: 'fillBlanks',
      icon: EditIcon,
      title: t('exercises.fillBlanks.title'),
      description: t('exercises.fillBlanks.description'),
      color: '#10B981'
    },
    {
      id: 'matching',
      icon: ExtensionIcon,
      title: t('exercises.matching.title'),
      description: t('exercises.matching.description'),
      color: '#10B981'
    },
    {
      id: 'pronunciation',
      icon: MicIcon,
      title: t('exercises.pronunciation.title'),
      description: t('exercises.pronunciation.description'),
      color: '#10B981'
    },
    {
      id: 'sentenceConstruction',
      icon: BuildIcon,
      title: t('exercises.sentenceConstruction.title'),
      description: t('exercises.sentenceConstruction.description'),
      color: '#10B981'
    }
  ];

  const handleExerciseClick = (exerciseId: string) => {
    console.log(`Starting exercise: ${exerciseId}`);
    // TODO: Navigate to specific exercise
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ pt: 3, pb: 1 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#0d1b0d', 
            fontWeight: 'bold',
            mb: 2
          }}
        >
          {t('exercises.title')}
        </Typography>
      </Box>

      {/* Exercise Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {exerciseTypes.map((exercise) => {
          const IconComponent = exercise.icon;
          return (
            <Card
              key={exercise.id}
              sx={{
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleExerciseClick(exercise.id)}
                sx={{ p: 2 }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 0,
                  '&:last-child': { pb: 0 }
                }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: `${exercise.color}15`,
                      color: exercise.color,
                      flexShrink: 0,
                      '& svg': { fontSize: '28px' }
                    }}
                  >
                    <IconComponent />
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#0d1b0d',
                        fontWeight: 'medium',
                        mb: 0.5
                      }}
                    >
                      {exercise.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4b9b4b',
                        fontSize: '0.875rem',
                        lineHeight: 1.4
                      }}
                    >
                      {exercise.description}
                    </Typography>
                  </Box>

                  {/* Arrow */}
                  <ChevronRightIcon 
                    sx={{ 
                      color: '#9CA3AF',
                      fontSize: 20,
                      flexShrink: 0
                    }} 
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}