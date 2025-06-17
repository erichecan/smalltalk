import { Container, Box, Typography, List, ListItem, ListItemText, Switch, Paper } from '@mui/material';

const mockSettings = [
  { id: 1, label: 'Enable Notifications', checked: true },
  { id: 2, label: 'Dark Mode', checked: false },
  { id: 3, label: 'Privacy Mode', checked: false },
];

export default function Settings() {
  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0 }}>
      {/* 顶部标题栏 */}
      <Box sx={{ bgcolor: '#CAECCA', py: 2, px: 3, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>Settings</Typography>
      </Box>
      {/* 设置项列表 */}
      <Box sx={{ px: 2, py: 3 }}>
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1 }}>
          <List>
            {mockSettings.map((item) => (
              <ListItem key={item.id} secondaryAction={<Switch edge="end" checked={item.checked} /> }>
                <ListItemText primary={<Typography sx={{ fontWeight: 'bold', color: '#0d1b0d' }}>{item.label}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
} 