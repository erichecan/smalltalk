import { Box, Typography, Container, Paper, Button, Grid } from '@mui/material';

export default function Practice() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          练习
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                对话练习
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                与AI进行实时对话练习，提升口语表达能力
              </Typography>
              <Button variant="contained" href="/topic">
                开始练习
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                词汇练习
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                通过游戏化方式学习新词汇
              </Typography>
              <Button variant="outlined" href="/vocabulary">
                查看词汇
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 