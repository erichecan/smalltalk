import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  LinearProgress,
  Grid,
  Chip,
  IconButton,
  Fade,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Tooltip,
  TextField,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  Close as CloseIcon,
  Quiz as QuizIcon,
  CompareArrows as MatchIcon,
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { usePageContext } from '../../contexts/PageContext';
import { spacedRepetitionEngine } from '../../services/spacedRepetition';
import { practiceEngine } from '../../services/practiceEngine';
import type { 
  DailyPractice, 
  LearningStats,
  ExerciseQuestion,
  PracticeSession,
  VocabularyItem
} from '../../types/learning';

// 题型定义 - 只保留Quizzes和Matching
const EXERCISE_TYPES = [
  {
    id: 'quiz',
    name: 'quiz',
    description: 'quizDescription',
    icon: QuizIcon,
    color: '#0ecd6a'
  },
  {
    id: 'matching',
    name: 'matching',
    description: 'matchingDescription',
    icon: MatchIcon,
    color: '#0ecd6a'
  }
];

// 练习会话组件
const ExerciseSession: React.FC<{
  exerciseType: string;
  onBack: () => void;
  onComplete: (stats: any) => void;
}> = ({ exerciseType, onBack, onComplete }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<ExerciseQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    if (!user) return;
    
    try {
      // 获取今日需要复习的词汇
      const todayReviews = await spacedRepetitionEngine.getTodayReviews(user.id);
      if (todayReviews.length === 0) {
        console.log('No vocabulary to review today');
        return;
      }
      
      // 随机选择一个词汇生成题目
      const randomVocabulary = todayReviews[Math.floor(Math.random() * todayReviews.length)];
      const question = await practiceEngine.generateQuestion(randomVocabulary, 0.7);
      setCurrentQuestion(question);
      setUserAnswer('');
      setIsCorrect(null);
      setShowFeedback(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to generate exercise:', error);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !user) return;

    const responseTime = Date.now() - startTime;
    const correct = userAnswer.toLowerCase().trim() === currentQuestion.correct_answer.toLowerCase().trim();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
    
    setQuestionCount(prev => prev + 1);

    // 记录练习结果并更新遗忘曲线
    try {
      // 计算表现评分
      const performanceRating = spacedRepetitionEngine.calculatePerformanceRating(
        correct,
        responseTime / 1000, // 转换为秒
        10, // 目标响应时间
        undefined // 用户难度评分
      );

      // 更新遗忘曲线数据
      const result = spacedRepetitionEngine.calculateNextReview(
        currentQuestion.vocabulary,
        performanceRating
      );
      
      await spacedRepetitionEngine.updateVocabularySpacing(
        currentQuestion.vocabulary.id,
        result
      );

      // 记录练习记录
      await practiceEngine.recordPracticeResult(
        `session-${Date.now()}`,
        currentQuestion.id,
        userAnswer,
        currentQuestion.correct_answer,
        responseTime / 1000,
        undefined
      );
    } catch (error) {
      console.error('Failed to record practice result:', error);
    }
  };

  const handleNext = () => {
    if (questionCount >= 10) {
      // 完成练习
      const accuracy = (correctCount / 10) * 100;
      onComplete({
        totalQuestions: 10,
        correctAnswers: correctCount,
        accuracy,
        exerciseType
      });
    } else {
      loadNextQuestion();
    }
  };

  if (!currentQuestion) {
    return (
      <Box sx={{ bgcolor: 'white', minHeight: '100vh', pt: 8 }}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="#64748b">
            {t('loading')}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', pt: 8 }}>
      {/* 主要内容 */}
      <Box sx={{ px: 2, pt: 3 }}>
        {/* 进度条 */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500 }}>
              {t('progress')}: {questionCount}/10
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500 }}>
              {t('accuracy')}: {correctCount}/{questionCount}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(questionCount / 10) * 100} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#0ecd6a',
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* 题目内容 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ 
            mb: 3, 
            fontWeight: 600,
            color: '#1e293b',
            lineHeight: 1.4
          }}>
            {currentQuestion.question}
          </Typography>
          
          {exerciseType === 'quiz' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentQuestion.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswer === option ? "contained" : "outlined"}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textAlign: 'left',
                    borderRadius: 3,
                    py: 2,
                    px: 3,
                    borderColor: userAnswer === option ? '#0ecd6a' : '#e2e8f0',
                    color: userAnswer === option ? 'white' : '#1e293b',
                    bgcolor: userAnswer === option ? '#0ecd6a' : 'transparent',
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#0ecd6a',
                      bgcolor: userAnswer === option ? '#0bb85a' : '#f8fafc'
                    },
                    '&:disabled': {
                      borderColor: userAnswer === option ? '#0ecd6a' : '#e2e8f0',
                      color: userAnswer === option ? 'white' : '#94a3b8',
                      bgcolor: userAnswer === option ? '#0ecd6a' : 'transparent'
                    }
                  }}
                  onClick={() => setUserAnswer(option)}
                  disabled={showFeedback}
                >
                  {option}
                </Button>
              ))}
            </Box>
          )}
          
          {exerciseType === 'matching' && (
            <Box>
              <TextField
                fullWidth
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t('enterAnswer')}
                variant="outlined"
                disabled={showFeedback}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontSize: '1rem',
                    '& fieldset': {
                      borderColor: '#e2e8f0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#0ecd6a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0ecd6a',
                    },
                    '& input': {
                      py: 2,
                      px: 3,
                    }
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* 反馈 */}
        {showFeedback && (
          <Box sx={{ 
            mb: 4, 
            p: 3,
            borderRadius: 3,
            bgcolor: isCorrect ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {isCorrect ? (
                <CheckCircleIcon sx={{ color: '#16a34a', mr: 1.5, fontSize: 28 }} />
              ) : (
                <HelpIcon sx={{ color: '#dc2626', mr: 1.5, fontSize: 28 }} />
              )}
              <Typography variant="h6" sx={{ 
                color: isCorrect ? '#16a34a' : '#dc2626',
                fontWeight: 600
              }}>
                {isCorrect ? t('correct') : t('incorrect')}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ 
              color: '#1e293b',
              fontWeight: 500,
              mb: 1
            }}>
              {t('correctAnswer')}: {currentQuestion.correct_answer}
            </Typography>
            {currentQuestion.explanation && (
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                lineHeight: 1.5
              }}>
                {currentQuestion.explanation}
              </Typography>
            )}
          </Box>
        )}

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 2, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{
              borderRadius: 3,
              borderColor: '#e2e8f0',
              color: '#64748b',
              py: 1.5,
              px: 3,
              fontWeight: 500,
              '&:hover': {
                borderColor: '#0ecd6a',
                color: '#0ecd6a',
                bgcolor: '#f8fafc'
              }
            }}
          >
            {t('back')}
          </Button>
          
          {!showFeedback ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              sx={{ 
                flex: 1,
                borderRadius: 3,
                bgcolor: '#0ecd6a',
                py: 1.5,
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#0bb85a'
                },
                '&:disabled': {
                  bgcolor: '#e2e8f0',
                  color: '#94a3b8'
                }
              }}
            >
              {t('submit')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ 
                flex: 1,
                borderRadius: 3,
                bgcolor: '#0ecd6a',
                py: 1.5,
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#0bb85a'
                }
              }}
            >
              {questionCount >= 10 ? t('finish') : t('next')}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// 主练习页面组件
const PracticeExercises: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pageState, setPageState, pushInternalState } = usePageContext();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPractice | null>(null);
  const [showSession, setShowSession] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // 简化页面状态初始化 - 只设置基础状态，不影响导航历史
  useEffect(() => {
    setPageState({
      page: '/practice'
    });
  }, [setPageState]);

  // 监听页面状态变化
  useEffect(() => {
    const handlePageStateBack = (event: any) => {
      const newState = event.detail;
      if (newState.page === '/practice' && !newState.subPage) {
        // 返回到练习选择页面
        setShowSession(false);
        setSelectedExercise(null);
      }
    };

    window.addEventListener('pageStateBack', handlePageStateBack);
    return () => {
      window.removeEventListener('pageStateBack', handlePageStateBack);
    };
  }, []);

  const loadData = async () => {
    try {
      if (!user?.id) return;

      const [stats, plan] = await Promise.all([
        spacedRepetitionEngine.getUserLearningStats(user.id),
        spacedRepetitionEngine.getDailyPractice(user.id)
      ]);

      setLearningStats(stats);
      setDailyPlan(plan);
    } catch (error) {
      console.error('Failed to load practice data:', error);
    }
  };

  const handleExerciseSelect = (exerciseType: string) => {
    setSelectedExercise(exerciseType);
    setShowSession(true);
    // 使用内部导航状态管理，而不是页面状态
    pushInternalState({
      page: '/practice',
      subPage: 'exercise',
      exerciseType: exerciseType
    });
  };

  const handleSessionComplete = async (stats: any) => {
    setSessionStats(stats);
    setShowSession(false);
    setSelectedExercise(null);
    
    // 重新加载数据
    await loadData();
    // 不需要手动设置页面状态，会通过goBack自动处理
  };

  const handleSessionBack = () => {
    setShowSession(false);
    setSelectedExercise(null);
    // 不需要手动设置页面状态，会通过goBack自动处理
  };

  if (!user) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('auth.pleaseLogin')}
        </Typography>
      </Box>
    );
  }

  if (showSession && selectedExercise) {
    return (
      <ExerciseSession
        exerciseType={selectedExercise}
        onBack={handleSessionBack}
        onComplete={handleSessionComplete}
      />
    );
  }

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      {/* 主要内容 */}
      <Box sx={{ px: 2, pt: 3, pb: 2 }}>
        <Typography variant="h4" sx={{ 
          mb: 3, 
          fontWeight: 700, 
          color: '#1e293b',
          fontSize: '1.875rem',
          lineHeight: '2.25rem'
        }}>
          {t('chooseExercise')}
        </Typography>
      </Box>

      {/* 题型选择列表 */}
      <Box sx={{ 
        borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9'
      }}>
        {EXERCISE_TYPES.map((exercise) => {
          const IconComponent = exercise.icon;
          return (
            <Box key={exercise.id}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#f8fafc'
                  },
                  '&:active': {
                    bgcolor: '#f1f5f9'
                  }
                }}
                onClick={() => handleExerciseSelect(exercise.id)}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: `${exercise.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: exercise.color,
                    flexShrink: 0
                  }}
                >
                  <IconComponent sx={{ fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 500, 
                    color: '#1e293b',
                    mb: 0.5
                  }}>
                    {t(exercise.name)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#64748b',
                    lineHeight: 1.5
                  }}>
                    {t(exercise.description)}
                  </Typography>
                </Box>
                <Box sx={{ color: '#94a3b8' }}>
                  <ChevronRightIcon />
                </Box>
              </Box>
              <Divider sx={{ borderColor: '#f1f5f9' }} />
            </Box>
          );
        })}
      </Box>

      {/* 练习完成统计 */}
      {sessionStats && (
        <Dialog 
          open={!!sessionStats} 
          onClose={() => setSessionStats(null)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxWidth: 400,
              width: '90%'
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            fontWeight: 600,
            color: '#1e293b'
          }}>
            {t('sessionComplete')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ 
                mb: 2, 
                color: '#0ecd6a',
                fontWeight: 700
              }}>
                {sessionStats.accuracy.toFixed(1)}%
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: '#64748b' }}>
                {t('correctAnswers')}: {sessionStats.correctAnswers}/{sessionStats.totalQuestions}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                {t('exerciseType')}: {t(sessionStats.exerciseType)}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              onClick={() => setSessionStats(null)}
              sx={{
                borderRadius: 2,
                bgcolor: '#0ecd6a',
                color: 'white',
                '&:hover': {
                  bgcolor: '#0bb85a'
                }
              }}
            >
              {t('close')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PracticeExercises;