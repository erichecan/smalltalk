// Matching游戏组件 - 单词与释义匹配游戏
// 2025-01-30 11:00:00

import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Bolt as BoltIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { gameEngine } from '../../services/gameEngine';
import type { 
  GameSession, 
  VocabularyItem, 
  GameResult,
  GameMode 
} from '../../types/learning';

interface MatchingGameProps {
  onGameComplete: (result: GameResult) => void;
  onBack: () => void;
  mode?: GameMode;
  theme?: string;
}

interface MatchingItem {
  id: string;
  content: string;
  type: 'word' | 'definition';
  matched: boolean;
  selected: boolean;
  originalIndex: number;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({
  onGameComplete,
  onBack,
  mode = 'classic',
  theme
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // 游戏状态
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [matchingItems, setMatchingItems] = useState<MatchingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MatchingItem[]>([]);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'completed'>('loading');
  const [score, setScore] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // 初始化游戏
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    if (!user) return;

    try {
      setGameState('loading');

      // 创建游戏会话
      const session = await gameEngine.createGameSession(
        user.id,
        'matching',
        'classic', // 固定使用classic模式
        theme
      );
      setGameSession(session);

      // 生成匹配对
      const { left, right } = await gameEngine.generateMatchingPairs(
        session.id,
        8, // 8对匹配
        theme
      );

      if (left.length === 0) {
        throw new Error('No vocabulary available');
      }

      // 创建匹配项
      const items: MatchingItem[] = [
        ...left.map((vocab, index) => ({
          id: `word-${index}`,
          content: vocab.word,
          type: 'word' as const,
          matched: false,
          selected: false,
          originalIndex: index
        })),
        ...right.map((def, index) => ({
          id: `def-${index}`,
          content: def,
          type: 'definition' as const,
          matched: false,
          selected: false,
          originalIndex: index
        }))
      ];

      // 随机排序
      const shuffledItems = items.sort(() => Math.random() - 0.5);
      setMatchingItems(shuffledItems);
      setTotalMatches(left.length);
      setGameState('playing');
    } catch (error) {
      console.error('Error initializing game:', error);
      setGameState('loading');
    }
  };

  const handleItemClick = (item: MatchingItem) => {
    if (gameState !== 'playing' || item.matched || item.selected) return;

    const newSelectedItems = [...selectedItems, item];
    setSelectedItems(newSelectedItems);

    // 更新选中状态
    setMatchingItems(prev => 
      prev.map(i => 
        i.id === item.id ? { ...i, selected: true } : i
      )
    );

    // 检查是否形成匹配
    if (newSelectedItems.length === 2) {
      const [item1, item2] = newSelectedItems;
      
      // 检查是否匹配（一个单词，一个释义，且索引相同）
      const isMatch = item1.type !== item2.type && item1.originalIndex === item2.originalIndex;

      setTimeout(() => {
        if (isMatch) {
          // 匹配成功
          handleMatchSuccess(item1, item2);
        } else {
          // 匹配失败
          handleMatchFailure(item1, item2);
        }
      }, 500);
    }
  };

  const handleMatchSuccess = (item1: MatchingItem, item2: MatchingItem) => {
    // 更新匹配状态
    setMatchingItems(prev => 
      prev.map(i => 
        i.id === item1.id || i.id === item2.id 
          ? { ...i, matched: true, selected: false }
          : i
      )
    );

    // 更新分数和连击
    const newCorrectMatches = correctMatches + 1;
    const newStreak = streak + 1;
    const newScore = score + 10 + (newStreak >= 3 ? 5 : 0); // 基础10分 + 连击奖励

    setCorrectMatches(newCorrectMatches);
    setStreak(newStreak);
    setScore(newScore);
    setSelectedItems([]);

    // 检查游戏是否完成
    if (newCorrectMatches === totalMatches) {
      completeGame();
    }
  };

  const handleMatchFailure = (item1: MatchingItem, item2: MatchingItem) => {
    // 重置选中状态
    setMatchingItems(prev => 
      prev.map(i => 
        i.id === item1.id || i.id === item2.id 
          ? { ...i, selected: false }
          : i
      )
    );

    // 重置连击
    setStreak(0);
    setSelectedItems([]);
  };

  const completeGame = async () => {
    if (!gameSession || !user) return;

    try {
      setGameState('completed');
      
      // 计算游戏时间（固定为2分钟或基于实际开始时间）
      const timeSpent = 120; // 固定2分钟
      const accuracy = totalMatches > 0 ? correctMatches / totalMatches : 0;
      const pointsEarned = gameEngine.calculateMatchingPoints(
        correctMatches,
        totalMatches,
        timeSpent
      );
      const perfectScore = correctMatches === totalMatches;

      // 记录游戏结果
      const result = await gameEngine.recordGameResult(
        gameSession.id,
        user.id,
        'matching',
        score,
        accuracy,
        timeSpent,
        totalMatches,
        correctMatches,
        streak,
        pointsEarned,
        perfectScore
      );

      setGameResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return totalMatches > 0 ? (correctMatches / totalMatches) * 100 : 0;
  };

  const renderMatchingItem = (item: MatchingItem) => {
    const isSelected = item.selected;
    const isMatched = item.matched;
    const isClickable = !isMatched && !isSelected && gameState === 'playing';

    return (
      <Card
        key={item.id}
        sx={{
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
          opacity: isMatched ? 0.6 : 1,
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          backgroundColor: isMatched 
            ? 'success.light' 
            : isSelected 
              ? 'primary.light' 
              : 'background.paper',
          '&:hover': isClickable ? {
            transform: 'scale(1.02)',
            boxShadow: 2
          } : {}
        }}
        onClick={() => handleItemClick(item)}
      >
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: item.type === 'word' ? 'bold' : 'normal',
              color: isMatched ? 'success.contrastText' : 'text.primary'
            }}
          >
            {item.content}
          </Typography>
          {isMatched && (
            <CheckCircleIcon 
              sx={{ 
                color: 'success.main', 
                fontSize: 20, 
                mt: 1 
              }} 
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const renderGameResult = () => {
    if (!gameResult) return null;

    return (
      <Dialog open={showResult} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            {gameResult.perfect_score ? (
              <TrophyIcon sx={{ color: 'warning.main', fontSize: 32 }} />
            ) : (
              <StarIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            )}
            <Typography variant="h5">
              {gameResult.perfect_score ? t('practice.perfectScore') : t('practice.gameComplete')}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {gameResult.final_score}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {t('practice.points')}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {gameResult.correct_answers}/{gameResult.questions_answered}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('practice.correctMatches')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="info.main">
                    {Math.round(gameResult.accuracy * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('practice.accuracy')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {formatTime(gameResult.time_spent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('practice.timeSpent')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="secondary.main">
                    {gameResult.points_earned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('practice.pointsEarned')}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {gameResult.achievements_unlocked.length > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {t('practice.achievementsUnlocked', { count: gameResult.achievements_unlocked.length })}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onBack} variant="outlined">
            {t('common.back')}
          </Button>
          <Button 
            onClick={() => {
              setShowResult(false);
              initializeGame();
            }} 
            variant="contained"
            startIcon={<RefreshIcon />}
          >
            {t('practice.playAgain')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (gameState === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* 游戏头部信息 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {t('game.matchingGame', { ns: 'practice' })}
          </Typography>
          <IconButton onClick={onBack}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 游戏状态栏 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<StarIcon />} 
              label={score}
              color="primary"
            />
            <Chip 
              icon={<TrendingUpIcon />} 
              label={`${correctMatches}/${totalMatches}`}
              color="success"
            />
            {streak >= 3 && (
              <Chip 
                icon={<BoltIcon />} 
                label={`${streak} ${t('practice.streak')}`}
                color="warning"
              />
            )}
          </Box>
        </Box>

        {/* 进度条 */}
        <LinearProgress 
          variant="determinate" 
          value={getProgressPercentage()} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* 游戏区域 */}
      <Grid container spacing={2}>
        {/* 左侧：单词 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
            {t('game.words', { ns: 'practice' })}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {matchingItems
              .filter(item => item.type === 'word')
              .map(renderMatchingItem)}
          </Box>
        </Grid>

        {/* 右侧：释义 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
            {t('game.definitions', { ns: 'practice' })}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {matchingItems
              .filter(item => item.type === 'definition')
              .map(renderMatchingItem)}
          </Box>
        </Grid>
      </Grid>

      {/* 游戏结果对话框 */}
      {renderGameResult()}
    </Box>
  );
}; 