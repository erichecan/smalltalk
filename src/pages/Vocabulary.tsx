import { Container, Box, Typography, Paper, IconButton, Button, InputBase } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
  isBookmarked: boolean;
  isCompleted: boolean;
}

export default function Vocabulary() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([
    {
      word: 'Joy',
      definition: 'A feeling of great pleasure and happiness.',
      example: '"Her eyes sparkled with joy."',
      isBookmarked: false,
      isCompleted: false
    },
    {
      word: 'Compliment',
      definition: 'To express admiration or approval.',
      example: '"He paid her a lovely compliment on her dress."',
      isBookmarked: false,
      isCompleted: false
    },
    {
      word: 'Cheer up',
      definition: 'To make someone feel less sad or disappointed.',
      example: '"I tried to cheer him up after he lost the game."',
      isBookmarked: false,
      isCompleted: false
    },
    {
      word: 'Get along',
      definition: 'To have a friendly relationship with someone.',
      example: '"Do you and your sister get along?"',
      isBookmarked: true,
      isCompleted: false
    },
    {
      word: 'Struggle',
      definition: 'To be in a difficult situation.',
      example: '"She struggled to understand the complex theory."',
      isBookmarked: false,
      isCompleted: true
    },
    {
      word: 'Astonished',
      definition: 'To be very surprised or shocked.',
      example: '"I was astonished by the news."',
      isBookmarked: false,
      isCompleted: false
    },
    {
      word: 'Thrilled',
      definition: 'To be very happy and excited.',
      example: '"She was thrilled with her exam results."',
      isBookmarked: false,
      isCompleted: false
    }
  ]);

  const handleBookmark = (index: number) => {
    const newItems = [...vocabularyItems];
    newItems[index].isBookmarked = !newItems[index].isBookmarked;
    setVocabularyItems(newItems);
  };

  const handleComplete = (index: number) => {
    const newItems = [...vocabularyItems];
    newItems[index].isCompleted = !newItems[index].isCompleted;
    setVocabularyItems(newItems);
  };

  const handlePlayAudio = (word: string) => {
    // 这里可以添加语音播放功能
    console.log(`Playing audio for: ${word}`);
  };

  const filteredItems = vocabularyItems.filter(item =>
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcfa', p: 0, fontFamily: 'Inter, Noto Sans, sans-serif' }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(248,252,250,0.8)', backdropFilter: 'blur(4px)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
          <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', color: '#0d1b14', '&:hover': { bgcolor: 'rgba(156, 163, 175, 0.2)' } }}>
            <ArrowBackIcon />
          </Button>
          <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: '#0d1b14', fontWeight: 'bold', pr: 5 }}>
            Vocabulary & Phrases
          </Typography>
        </Box>
        {/* 搜索框 */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Box sx={{ position: 'relative' }}>
            <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 20 }} />
            <InputBase
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: '100%',
                borderRadius: '999px',
                border: '1px solid #d1d5db',
                bgcolor: 'white',
                py: 1.25,
                pl: 5,
                pr: 2,
                fontSize: 14,
                color: '#0d1b14',
                '& .MuiInputBase-input::placeholder': {
                  color: '#9ca3af',
                  opacity: 1
                },
                '&:focus-within': {
                  borderColor: '#10cf70',
                  boxShadow: '0 0 0 1px #10cf70'
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 主要内容 */}
      <Box sx={{ px: 2 }}>
        <Typography variant="h6" sx={{ color: '#0d1b14', fontWeight: 600, pb: 1, pt: 1.5 }}>
          From your conversations
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
          {filteredItems.map((item, index) => (
            <Paper
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                bgcolor: 'white',
                p: 1.5,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                },
                transition: 'box-shadow 0.2s',
                opacity: item.isCompleted ? 0.7 : 1
              }}
            >
              {/* 发音按钮 */}
              <IconButton
                onClick={() => handlePlayAudio(item.word)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#e7f3ed',
                  color: '#10cf70',
                  '&:hover': {
                    bgcolor: '#d0e9e0'
                  },
                  flexShrink: 0
                }}
              >
                <VolumeUpIcon sx={{ fontSize: 24 }} />
              </IconButton>

              {/* 词汇内容 */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#0d1b14',
                    fontWeight: 500,
                    fontSize: 16,
                    textDecoration: item.isCompleted ? 'line-through' : 'none'
                  }}
                >
                  {item.word}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    fontSize: 14,
                    lineHeight: 1.4
                  }}
                >
                  {item.definition}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#6b7280',
                    fontSize: 12,
                    fontStyle: 'italic',
                    mt: 0.5,
                    display: 'block'
                  }}
                >
                  {item.example}
                </Typography>
              </Box>

              {/* 操作按钮 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  onClick={() => handleBookmark(index)}
                  sx={{
                    color: item.isBookmarked ? '#10cf70' : '#9ca3af',
                    p: 0.75,
                    borderRadius: '50%',
                    '&:hover': {
                      color: '#10cf70'
                    }
                  }}
                >
                  {item.isBookmarked ? <BookmarkIcon sx={{ fontSize: 20 }} /> : <BookmarkBorderIcon sx={{ fontSize: 20 }} />}
                </IconButton>
                <IconButton
                  onClick={() => handleComplete(index)}
                  sx={{
                    color: item.isCompleted ? '#10cf70' : '#9ca3af',
                    p: 0.75,
                    borderRadius: '50%',
                    '&:hover': {
                      color: '#10cf70'
                    }
                  }}
                >
                  {item.isCompleted ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
} 