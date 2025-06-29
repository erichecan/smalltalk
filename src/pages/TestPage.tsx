import { Box, Typography, Container, Paper, Button } from '@mui/material';

const TestPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          测试页面
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            这是一个测试页面，用于验证路由和组件功能。
          </Typography>
          <Button variant="contained" href="/topic">
            返回首页
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default TestPage;