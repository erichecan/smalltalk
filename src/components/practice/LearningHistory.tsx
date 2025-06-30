import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  CardActionArea
} from '@mui/material';
import {
  ChatBubbleOutline as ChatIcon,
  BookmarkBorder as BookmarkIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ConversationItem {
  id: string;
  title: string;
  topic: string;
  timeAgo: string;
}

interface SavedItem {
  id: string;
  title: string;
  category: string;
  count: number;
  color: string;
}

export default function LearningHistory() {
  const { t } = useTranslation('practice');

  const conversationHistory: ConversationItem[] = [
    {
      id: '1',
      title: t('history.conversations.items.travel.title'),
      topic: t('history.conversations.items.travel.topic'),
      timeAgo: t('history.conversations.items.travel.timeAgo')
    },
    {
      id: '2',
      title: t('history.conversations.items.business.title'),
      topic: t('history.conversations.items.business.topic'),
      timeAgo: t('history.conversations.items.business.timeAgo')
    }
  ];

  const savedItems: SavedItem[] = [
    {
      id: '1',
      title: t('history.saved.items.phrases.title'),
      category: t('history.saved.items.phrases.category'),
      count: 15,
      color: '#FB923C'
    },
    {
      id: '2',
      title: t('history.saved.items.vocabulary.title'),
      category: t('history.saved.items.vocabulary.category'),
      count: 20,
      color: '#FB923C'
    }
  ];

  const weeklyData = [
    { week: 'W1', height: 40, isActive: false },
    { week: 'W2', height: 25, isActive: false },
    { week: 'W3', height: 35, isActive: false },
    { week: 'W4', height: 55, isActive: true }
  ];

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      {/* Conversation History */}
      <Box sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#0d1b0d', 
              fontWeight: 'semibold'
            }}
          >
            {t('history.conversations.title')}
          </Typography>
          <Button 
            sx={{ 
              color: '#10B981', 
              fontSize: '0.875rem',
              fontWeight: 'medium',
              textTransform: 'none',
              '&:hover': { color: '#059669' }
            }}
          >
            {t('history.seeAll')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
          {conversationHistory.map((item) => (
            <Card key={item.id} sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardActionArea>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#10B981',
                      color: 'white'
                    }}
                  >
                    <ChatIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: '#0d1b0d',
                        fontWeight: 'medium',
                        fontSize: '1rem',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#4b9b4b',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.topic}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ color: '#4b9b4b', fontSize: '0.75rem', mb: 0.5 }}>
                      {item.timeAgo}
                    </Typography>
                    <ChevronRightIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Progress Statistics */}
      <Box sx={{ pt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#0d1b0d', 
              fontWeight: 'semibold'
            }}
          >
            {t('history.progress.title')}
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography sx={{ color: '#0d1b0d', fontWeight: 'medium', fontSize: '1rem' }}>
                {t('history.progress.learningTime')}
              </Typography>
              <Typography sx={{ color: '#4b9b4b', fontSize: '0.875rem' }}>
                {t('history.progress.last30Days')}
              </Typography>
            </Box>
            <Typography sx={{ color: '#0d1b0d', fontSize: '2rem', fontWeight: 'bold' }}>
              30 <Box component="span" sx={{ fontSize: '1.125rem', fontWeight: 'medium', color: '#4b9b4b' }}>hours</Box>
            </Typography>
          </Box>

          {/* Chart */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 1.5, 
            alignItems: 'end', 
            justifyItems: 'center',
            pt: 3,
            pb: 1,
            minHeight: 140
          }}>
            {weeklyData.map((data, index) => (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: `${data.height}px`,
                    bgcolor: data.isActive ? '#10B981' : '#CAECCA',
                    borderRadius: '4px 4px 0 0'
                  }}
                />
                <Typography sx={{ color: '#4b9b4b', fontSize: '0.75rem', fontWeight: 'medium', mt: 0.5 }}>
                  {data.week}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* Saved Items */}
      <Box sx={{ pt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#0d1b0d', 
              fontWeight: 'semibold'
            }}
          >
            {t('history.saved.title')}
          </Typography>
          <Button 
            sx={{ 
              color: '#10B981', 
              fontSize: '0.875rem',
              fontWeight: 'medium',
              textTransform: 'none',
              '&:hover': { color: '#059669' }
            }}
          >
            {t('history.seeAll')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {savedItems.map((item) => (
            <Card key={item.id} sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardActionArea>
                <CardContent sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: item.color,
                      color: 'white'
                    }}
                  >
                    <BookmarkIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: '#0d1b0d',
                        fontWeight: 'medium',
                        fontSize: '1rem',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#4b9b4b',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.category}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ color: '#0d1b0d', fontWeight: 'medium', fontSize: '1rem', mb: 0.5 }}>
                      {item.count}
                    </Typography>
                    <ChevronRightIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}