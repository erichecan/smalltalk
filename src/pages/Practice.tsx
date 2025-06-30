import { Container, Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpIcon from '@mui/icons-material/Help';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ExtensionIcon from '@mui/icons-material/Extension';
import MicIcon from '@mui/icons-material/Mic';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';

interface ExerciseItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Practice() {
  const navigate = useNavigate();

  const exerciseItems: ExerciseItem[] = [
    {
      icon: <HelpIcon />,
      title: 'Quizzes',
      description: 'Test your understanding with multiple-choice or true/false questions.'
    },
    {
      icon: <TextFieldsIcon />,
      title: 'Fill-in-the-Blanks',
      description: 'Complete sentences with missing words or phrases.'
    },
    {
      icon: <ExtensionIcon />,
      title: 'Matching',
      description: 'Match vocabulary/phrases with their definitions or examples.'
    },
    {
      icon: <MicIcon />,
      title: 'Pronunciation Practice',
      description: 'Practice speaking and receive feedback on your pronunciation.'
    },
    {
      icon: <FormatSizeIcon />,
      title: 'Sentence Construction',
      description: 'Build sentences using provided words or phrases.'
    }
  ];

  const handleExerciseClick = (exercise: ExerciseItem) => {
    // 这里可以添加导航到具体练习页面的逻辑
    console.log(`Starting exercise: ${exercise.title}`);
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: 'white', p: 0, fontFamily: 'Inter, Noto Sans, sans-serif' }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', color: 'slate.700', '&:hover': { bgcolor: 'slate.100' } }}>
          <ArrowBackIcon />
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: 'slate.900', fontWeight: 600, pr: 5 }}>
          Practice Exercises
        </Typography>
      </Box>

      {/* 标题 */}
      <Box sx={{ px: 2, pt: 3, pb: 1 }}>
        <Typography variant="h4" sx={{ color: 'slate.800', fontWeight: 'bold', lineHeight: 1.2 }}>
          Choose an Exercise
        </Typography>
      </Box>

      {/* 练习列表 */}
      <Box sx={{ borderTop: '1px solid #f1f5f9' }}>
        {exerciseItems.map((exercise, index) => (
          <Box
            key={index}
            onClick={() => handleExerciseClick(exercise)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderBottom: '1px solid #f1f5f9',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'slate.50'
              },
              '&:active': {
                bgcolor: 'slate.100'
              },
              transition: 'background-color 0.2s'
            }}
          >
            {/* 图标 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                width: 48,
                height: 48,
                bgcolor: 'rgba(14, 205, 106, 0.1)',
                color: '#0ecd6a',
                flexShrink: 0
              }}
            >
              {exercise.icon}
            </Box>

            {/* 内容 */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  color: 'slate.800',
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: 1.4
                }}
              >
                {exercise.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'slate.600',
                  fontSize: 14,
                  lineHeight: 1.4,
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {exercise.description}
              </Typography>
            </Box>

            {/* 箭头 */}
            <ChevronRightIcon sx={{ color: 'slate.400', fontSize: 20, flexShrink: 0 }} />
          </Box>
        ))}
      </Box>
    </Container>
  );
} 