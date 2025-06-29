import { Box, Typography, Container, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';

export default function Vocabulary() {
  const sampleWords = [
    { word: 'Greeting', meaning: '问候', difficulty: 'Easy' },
    { word: 'Conversation', meaning: '对话', difficulty: 'Medium' },
    { word: 'Expression', meaning: '表达', difficulty: 'Medium' },
    { word: 'Pronunciation', meaning: '发音', difficulty: 'Hard' },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          词汇库
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            今日推荐词汇
          </Typography>
          <List>
            {sampleWords.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={item.word}
                  secondary={item.meaning}
                />
                <Chip 
                  label={item.difficulty} 
                  color={item.difficulty === 'Easy' ? 'success' : item.difficulty === 'Medium' ? 'warning' : 'error'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
} 