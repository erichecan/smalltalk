import React, { useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';

// React hooks测试页面 - 2025-01-30 16:40:22
function TestPage() {
  const [count, setCount] = useState(0);

  console.log('TestPage rendering, useState working:', { count });

  return (
    <Container>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          React Hooks Test
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Count: {count}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setCount(prev => prev + 1)}
          sx={{ mr: 2 }}
        >
          Increment
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => setCount(0)}
        >
          Reset
        </Button>
      </Box>
    </Container>
  );
}

export default TestPage;