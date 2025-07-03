import React from 'react';
import { Button } from '@mui/material';
import { useNotificationContext } from '../notifications/NotificationProvider';
import type { Achievement } from '../../services/achievementService';

interface AchievementTestButtonProps {}

// 测试成就数据
const testAchievement: Achievement = {
  id: 'test-achievement',
  category: 'learning',
  name: 'First Steps',
  description: 'Complete your first conversation practice',
  icon: '🎯',
  rarity: 'common',
  points_reward: 25,
  requirements: { conversations: 1 },
  is_active: true,
  created_at: new Date().toISOString()
};

const epicTestAchievement: Achievement = {
  id: 'test-achievement-epic',
  category: 'streak',
  name: 'Dedication Master',
  description: 'Maintain a 30-day learning streak',
  icon: '🔥',
  rarity: 'epic',
  points_reward: 500,
  requirements: { streak_days: 30 },
  is_active: true,
  created_at: new Date().toISOString()
};

function AchievementTestButton({}: AchievementTestButtonProps) {
  const { showAchievementNotification } = useNotificationContext();

  const handleTestCommonAchievement = () => {
    showAchievementNotification(testAchievement);
  };

  const handleTestEpicAchievement = () => {
    showAchievementNotification(epicTestAchievement);
  };

  return (
    <>
      <Button 
        variant="outlined" 
        onClick={handleTestCommonAchievement}
        sx={{ mr: 2 }}
      >
        Test Common Achievement
      </Button>
      <Button 
        variant="outlined" 
        color="secondary"
        onClick={handleTestEpicAchievement}
      >
        Test Epic Achievement
      </Button>
    </>
  );
}

export default AchievementTestButton;