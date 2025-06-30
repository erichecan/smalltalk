import { Container, Box, Typography, Button, FormControlLabel, Radio, RadioGroup, TextField, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ReportProblem() {
  const navigate = useNavigate();
  const [problemType, setProblemType] = useState('technical');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // Handle form submission
    console.log('Report submitted:', { problemType, description, email });
    navigate(-1);
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0, fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(248,252,248,0.8)', backdropFilter: 'blur(8px)', px: 2, py: 1.5, display: 'flex', alignItems: 'center' }}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', color: '#0d1c0d', '&:hover': { bgcolor: '#e7f3e7' } }}>
          <CloseIcon />
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: '#0d1c0d', fontWeight: 'bold', pr: 5 }}>Report a Problem</Typography>
      </Box>

      {/* 主要内容 */}
      <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 问题类型选择 */}
        <Box>
          <Typography variant="h6" sx={{ color: '#0d1c0d', fontWeight: 600, mb: 1.5 }}>
            What type of problem are you reporting?
          </Typography>
          <RadioGroup value={problemType} onChange={(e) => setProblemType(e.target.value)}>
            <Paper 
              sx={{ 
                mb: 1.5, 
                border: '1px solid #cfe8cf', 
                borderRadius: 3, 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { 
                  borderColor: '#0fdb0f',
                  bgcolor: problemType === 'technical' ? '#e7f3e7' : 'inherit'
                },
                bgcolor: problemType === 'technical' ? '#e7f3e7' : 'white',
                borderColor: problemType === 'technical' ? '#0fdb0f' : '#cfe8cf'
              }}
              onClick={() => setProblemType('technical')}
            >
              <FormControlLabel 
                value="technical" 
                control={
                  <Radio 
                    sx={{
                      color: '#cfe8cf',
                      '&.Mui-checked': {
                        color: '#0fdb0f',
                      },
                    }}
                  />
                } 
                label="Technical Issue" 
                sx={{ 
                  width: '100%', 
                  m: 0,
                  '& .MuiFormControlLabel-label': {
                    color: '#0d1c0d',
                    fontWeight: 500,
                    fontSize: 16
                  }
                }}
              />
            </Paper>
            
            <Paper 
              sx={{ 
                mb: 1.5, 
                border: '1px solid #cfe8cf', 
                borderRadius: 3, 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { 
                  borderColor: '#0fdb0f',
                  bgcolor: problemType === 'content' ? '#e7f3e7' : 'inherit'
                },
                bgcolor: problemType === 'content' ? '#e7f3e7' : 'white',
                borderColor: problemType === 'content' ? '#0fdb0f' : '#cfe8cf'
              }}
              onClick={() => setProblemType('content')}
            >
              <FormControlLabel 
                value="content" 
                control={
                  <Radio 
                    sx={{
                      color: '#cfe8cf',
                      '&.Mui-checked': {
                        color: '#0fdb0f',
                      },
                    }}
                  />
                } 
                label="Content Issue" 
                sx={{ 
                  width: '100%', 
                  m: 0,
                  '& .MuiFormControlLabel-label': {
                    color: '#0d1c0d',
                    fontWeight: 500,
                    fontSize: 16
                  }
                }}
              />
            </Paper>

            <Paper 
              sx={{ 
                mb: 1.5, 
                border: '1px solid #cfe8cf', 
                borderRadius: 3, 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { 
                  borderColor: '#0fdb0f',
                  bgcolor: problemType === 'behavior' ? '#e7f3e7' : 'inherit'
                },
                bgcolor: problemType === 'behavior' ? '#e7f3e7' : 'white',
                borderColor: problemType === 'behavior' ? '#0fdb0f' : '#cfe8cf'
              }}
              onClick={() => setProblemType('behavior')}
            >
              <FormControlLabel 
                value="behavior" 
                control={
                  <Radio 
                    sx={{
                      color: '#cfe8cf',
                      '&.Mui-checked': {
                        color: '#0fdb0f',
                      },
                    }}
                  />
                } 
                label="User Behavior" 
                sx={{ 
                  width: '100%', 
                  m: 0,
                  '& .MuiFormControlLabel-label': {
                    color: '#0d1c0d',
                    fontWeight: 500,
                    fontSize: 16
                  }
                }}
              />
            </Paper>

            <Paper 
              sx={{ 
                mb: 1.5, 
                border: '1px solid #cfe8cf', 
                borderRadius: 3, 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { 
                  borderColor: '#0fdb0f',
                  bgcolor: problemType === 'feedback' ? '#e7f3e7' : 'inherit'
                },
                bgcolor: problemType === 'feedback' ? '#e7f3e7' : 'white',
                borderColor: problemType === 'feedback' ? '#0fdb0f' : '#cfe8cf'
              }}
              onClick={() => setProblemType('feedback')}
            >
              <FormControlLabel 
                value="feedback" 
                control={
                  <Radio 
                    sx={{
                      color: '#cfe8cf',
                      '&.Mui-checked': {
                        color: '#0fdb0f',
                      },
                    }}
                  />
                } 
                label="Feedback/Suggestions" 
                sx={{ 
                  width: '100%', 
                  m: 0,
                  '& .MuiFormControlLabel-label': {
                    color: '#0d1c0d',
                    fontWeight: 500,
                    fontSize: 16
                  }
                }}
              />
            </Paper>
          </RadioGroup>
        </Box>

        {/* 表单字段 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            multiline
            rows={6}
            placeholder="Describe the problem or feedback in detail"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#e7f3e7',
                borderRadius: 3,
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: '2px solid #0fdb0f',
                },
                '& input, & textarea': {
                  color: '#0d1c0d',
                  fontSize: 16,
                  fontWeight: 400,
                  '&::placeholder': {
                    color: '#4b9b4b',
                    opacity: 1,
                  },
                },
              },
            }}
          />

          <TextField
            type="email"
            placeholder="Email address (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#e7f3e7',
                borderRadius: 3,
                height: 56,
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: '2px solid #0fdb0f',
                },
                '& input': {
                  color: '#0d1c0d',
                  fontSize: 16,
                  fontWeight: 400,
                  '&::placeholder': {
                    color: '#4b9b4b',
                    opacity: 1,
                  },
                },
              },
            }}
          />

          {/* 文件上传区域 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              width: '100%',
              borderRadius: 3,
              border: '2px dashed #cfe8cf',
              bgcolor: 'rgba(231, 243, 231, 0.5)',
              p: 2,
              color: '#0d1c0d',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#0fdb0f',
              },
              transition: 'border-color 0.2s',
              minHeight: 56
            }}
          >
            <AttachFileIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              Attach Screenshot (Optional)
            </Typography>
            <input type="file" style={{ display: 'none' }} />
          </Box>
        </Box>

        {/* 提交按钮 */}
        <Button
          onClick={handleSubmit}
          sx={{
            width: '100%',
            minHeight: 48,
            borderRadius: 999,
            bgcolor: '#0fdb0f',
            color: '#0d1c0d',
            fontSize: 16,
            fontWeight: 'bold',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#0cb50c',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px #0fdb0f, 0 0 0 4px rgba(15, 219, 15, 0.2)',
            },
            transition: 'all 0.2s',
          }}
        >
          Submit Report
        </Button>
      </Box>
    </Container>
  );
} 