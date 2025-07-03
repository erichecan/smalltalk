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
  Divider,
  Stack,
  Avatar
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
  ChevronRight as ChevronRightIcon,
  EmojiEvents as TrophyIcon,
  Bolt as BoltIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { usePageContext } from '../../contexts/PageContext';
import { spacedRepetitionEngine } from '../../services/spacedRepetition';
import { practiceEngine } from '../../services/practiceEngine';
import { gameEngine } from '../../services/gameEngine';
import { MatchingGame } from './MatchingGame';
import type { 
  DailyPractice, 
  LearningStats,
  ExerciseQuestion,
  PracticeSession,
  VocabularyItem,
  GameResult,
  GameType,
  GameMode
} from '../../types/learning';

// 题型定义 - 游戏化版本 - 2025-01-30 11:15:00
const EXERCISE_TYPES = [
  {
    id: 'quiz',
    name: 'quiz',
    description: 'quizDescription',
    icon: QuizIcon,
    color: '#3b82f6',
    modes: [
      { id: 'classic', name: 'classicMode' }
    ]
  },
  {
    id: 'matching',
    name: 'matching',
    description: 'matchingDescription',
    icon: MatchIcon,
    color: '#10b981',
    modes: [
      { id: 'classic', name: 'classicMode' }
    ]
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
  const [session, setSession] = useState<PracticeSession | null>(null); // 当前练习会话 - 2025-07-02 15:05:00
  const [currentQuestion, setCurrentQuestion] = useState<ExerciseQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // 初始化会话：从 PracticeEngine 获取推荐词汇并调用 createPracticeSession（使用 AI）
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const vocabList = await practiceEngine.getRecommendedPractice(user.id, 10);
        if (vocabList.length === 0) {
          console.warn('No vocabulary available to start a practice session');
          return;
        }

        const newSession = await practiceEngine.createPracticeSession(
          user.id,
          vocabList,
          'daily-review',
          true // useAI
        );

        setSession(newSession);
        setCurrentQuestion(newSession.questions[0]);
        setQuestionIndex(0);
        setUserAnswer('');
        setCorrectCount(0);
        setStartTime(Date.now());
      } catch (err) {
        console.error('Failed to start practice session:', err);
      }
    })();
  }, [user]);

  const loadNextQuestion = () => {
    if (!session) return;
    const nextIdx = questionIndex + 1;
    if (nextIdx >= session.questions.length) return;

    setCurrentQuestion(session.questions[nextIdx]);
    setQuestionIndex(nextIdx);
    setUserAnswer('');
    setStartTime(Date.now());
  };

  const handleNext = async () => {
    if (!currentQuestion || !user || !session) return;

    const responseTime = Date.now() - startTime;
    const correct = userAnswer.toLowerCase().trim() === currentQuestion.correct_answer.toLowerCase().trim();
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
    
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
        session.id,
        currentQuestion.id,
        userAnswer,
        currentQuestion.correct_answer,
        responseTime / 1000,
        undefined
      );
    } catch (error) {
      console.error('Failed to record practice result:', error);
    }

    // 更新已完成数量（questionIndex 已在 loadNextQuestion 中更新）
    if (questionIndex >= session.questions.length - 1) {
      // 完成练习
      const total = session.questions.length;
      const accuracy = ((correctCount + (correct ? 1 : 0)) / total) * 100;
      onComplete({
        totalQuestions: total,
        correctAnswers: correctCount + (correct ? 1 : 0),
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
      {/* AI 题目指示 - 2025-07-02 15:35:00 */}
      {session?.generated_by_ai && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Chip label="AI" color="secondary" size="small" />
        </Box>
      )}
      {/* 主要内容 */}
      <Box sx={{ px: 2, pt: 2 }}>
        {/* 进度条 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {t('progress')}: {questionIndex}/{session?.questions.length || 0}
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {t('accuracy')}: {correctCount}/{questionIndex}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={session ? (questionIndex / session.questions.length) * 100 : 0} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#0ecd6a',
                borderRadius: 3
              }
            }}
          />
        </Box>

        {/* 题目内容 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            fontWeight: 600,
            color: '#1e293b',
            lineHeight: 1.3,
            fontSize: '1.125rem'
          }}>
            {currentQuestion.question}
          </Typography>
          
          {exerciseType === 'quiz' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {currentQuestion.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswer === option ? "contained" : "outlined"}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textAlign: 'left',
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    borderColor: userAnswer === option ? '#0ecd6a' : '#e2e8f0',
                    color: userAnswer === option ? 'white' : '#1e293b',
                    bgcolor: userAnswer === option ? '#0ecd6a' : 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#0ecd6a',
                      bgcolor: userAnswer === option ? '#0bb85a' : '#f8fafc'
                    }
                  }}
                  onClick={() => setUserAnswer(option)}
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
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>
          )}
        </Box>

        {/* 操作按钮 */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 'auto',
          pt: 2
        }}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{ 
              flex: 1,
              borderRadius: 2,
              py: 1.5,
              fontSize: '0.875rem'
            }}
          >
            {t('back')}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!userAnswer.trim()}
            sx={{ 
              flex: 1,
              borderRadius: 2,
              py: 1.5,
              bgcolor: '#0ecd6a',
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: '#0bb85a'
              },
              '&:disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {session && questionIndex >= session.questions.length - 1 ? t('finish') : t('next')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// 主练习页面组件 - 游戏化版本 - 2025-01-30 11:20:00
const PracticeExercises: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pageState, setPageState, pushInternalState } = usePageContext();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPractice | null>(null);
  const [showSession, setShowSession] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [gameStats, setGameStats] = useState<{
    totalGames: number;
    quizGames: number;
    matchingGames: number;
    totalPoints: number;
    bestScore: number;
    perfectGames: number;
    currentStreak: number;
  } | null>(null);

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

      console.log('Loading practice data for user:', user.id);

      const [stats, plan, gameStats] = await Promise.all([
        spacedRepetitionEngine.getLearningStats(user.id),
        spacedRepetitionEngine.generateDailyPractice(user.id),
        gameEngine.getUserGameStats(user.id)
      ]);

      console.log('Loaded game stats:', gameStats);

      setLearningStats(stats);
      setDailyPlan(plan);
      setGameStats(gameStats);
    } catch (error) {
      console.error('Failed to load practice data:', error);
      // 设置默认的游戏统计
      setGameStats({
        totalGames: 0,
        quizGames: 0,
        matchingGames: 0,
        totalPoints: 0,
        bestScore: 0,
        perfectGames: 0,
        currentStreak: 0
      });
    }
  };

  const handleExerciseSelect = (exerciseType: string) => {
    setSelectedExercise(exerciseType);
    
    if (exerciseType === 'matching') {
      setShowMatching(true);
    } else {
      setShowSession(true);
    }
    
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
    setShowMatching(false);
    setSelectedExercise(null);
    // 不需要手动设置页面状态，会通过goBack自动处理
  };

  const handleMatchingComplete = async (result: GameResult) => {
    // 不要将GameResult设置给gameStats，gameStats应该是用户统计信息
    setShowMatching(false);
    setSelectedExercise(null);
    
    // 重新加载数据以更新游戏统计
    await loadData();
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

  if (showMatching && selectedExercise) {
    return (
      <MatchingGame
        onGameComplete={handleMatchingComplete}
        onBack={handleSessionBack}
        mode={selectedMode}
      />
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

        {/* 游戏统计信息 */}
        {gameStats && (
          <Box sx={{ mb: 3 }}>
            <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {gameStats.totalGames || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('stats.totalGames', { ns: 'practice' })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {gameStats.totalPoints || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('stats.totalPoints', { ns: 'practice' })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main">
                      {gameStats.bestScore || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('stats.bestScore', { ns: 'practice' })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main">
                      {gameStats.currentStreak || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('stats.currentStreak', { ns: 'practice' })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
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
                    lineHeight: 1.5,
                    mb: 1
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