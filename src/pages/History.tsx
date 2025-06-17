import { Container, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const mockHistory = [
  { id: 1, topic: 'Travel', lastMessage: 'Where is your favorite place you have visited?' },
  { id: 2, topic: 'Food', lastMessage: 'What is your favorite dish?' },
  { id: 3, topic: 'Hobbies', lastMessage: 'Do you play any sports?' },
];

export default function History() {
  const navigate = useNavigate();
  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0 }}>
      {/* 顶部标题栏 */}
      <Box sx={{ bgcolor: '#CAECCA', py: 2, px: 3, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>Conversation History</Typography>
      </Box>
      {/* 历史对话列表 */}
      <Box sx={{ px: 2, py: 3 }}>
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1 }}>
          <List>
            {mockHistory.map((item) => (
              <ListItem key={item.id} onClick={() => navigate('/dialogue', { state: { topic: item.topic } })} component="button">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#CAECCA', color: '#0d1b0d' }}>{item.topic[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>{item.topic}</Typography>}
                  secondary={<Typography variant="body2" sx={{ color: '#5D895D' }}>{item.lastMessage}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
} 