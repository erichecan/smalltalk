import { Box, Typography, Container, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function My() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          我的
        </Typography>
        <Paper sx={{ p: 3 }}>
          {isAuthenticated ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                欢迎，{user?.name || user?.email}
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="个人资料" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="学习设置" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="帮助与反馈" />
                </ListItem>
              </List>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                请先登录
              </Typography>
              <Button variant="contained" href="/login">
                去登录
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 