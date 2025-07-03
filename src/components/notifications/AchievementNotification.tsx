import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slide,
  Stack,
  useTheme,
  keyframes
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { Achievement } from '../../services/achievementService';

interface AchievementNotificationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

// 成就解锁动画
const unlockAnimation = keyframes`
  0% {
    transform: scale(0.8) rotate(-10deg);
    opacity: 0;
  }
  25% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.95) rotate(-2deg);
    opacity: 1;
  }
  75% {
    transform: scale(1.05) rotate(1deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6);
  }
`;

const sparkleAnimation = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

function AchievementNotification({ 
  achievement, 
  isVisible, 
  onClose, 
  duration = 5000 
}: AchievementNotificationProps) {
  const theme = useTheme();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      
      // 自动关闭
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // 等待动画完成
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FF6B35';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      case 'common': 
      default: return '#2ECC71';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary': 
        return 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD700 100%)';
      case 'epic': 
        return 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 50%, #E74C3C 100%)';
      case 'rare': 
        return 'linear-gradient(135deg, #3498DB 0%, #2980B9 50%, #1ABC9C 100%)';
      case 'common':
      default: 
        return 'linear-gradient(135deg, #2ECC71 0%, #27AE60 50%, #16A085 100%)';
    }
  };

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 400,
        minWidth: 320
      }}
    >
      <Slide direction="left" in={show} timeout={300}>
        <Paper
          elevation={8}
          sx={{
            p: 3,
            background: getRarityGradient(achievement.rarity),
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            animation: `${unlockAnimation} 0.8s ease-out, ${glowAnimation} 2s ease-in-out infinite`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.1)',
              opacity: 0,
              animation: `${sparkleAnimation} 1.5s ease-in-out infinite`
            }
          }}
        >
          {/* 关闭按钮 */}
          <IconButton
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              opacity: 0.8,
              '&:hover': {
                opacity: 1,
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* 主要内容 */}
          <Stack direction="row" spacing={3} alignItems="center">
            {/* 成就图标 */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  animation: `${unlockAnimation} 1s ease-out 0.2s both`
                }}
              >
                {achievement.icon || <EmojiEventsIcon sx={{ fontSize: 28 }} />}
              </Box>

              {/* 稀有度指示器 */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: getRarityColor(achievement.rarity),
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {achievement.rarity.charAt(0).toUpperCase()}
              </Box>
            </Box>

            {/* 成就信息 */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  mb: 0.5,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  animation: `${unlockAnimation} 0.8s ease-out 0.1s both`
                }}
              >
                🎉 Achievement Unlocked!
              </Typography>
              
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  animation: `${unlockAnimation} 0.8s ease-out 0.2s both`
                }}
              >
                {achievement.name}
              </Typography>
              
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  animation: `${unlockAnimation} 0.8s ease-out 0.3s both`
                }}
              >
                {achievement.description}
              </Typography>

              {/* 积分奖励 */}
              {achievement.points_reward > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.2)',
                    animation: `${unlockAnimation} 0.8s ease-out 0.4s both`
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    +{achievement.points_reward} points earned!
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>

          {/* 装饰性粒子效果 */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                top: `${20 + i * 10}%`,
                left: `${10 + i * 15}%`,
                animation: `${sparkleAnimation} ${1 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </Paper>
      </Slide>
    </Box>
  );
}

export default AchievementNotification;