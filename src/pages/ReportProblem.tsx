import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Paper,
  IconButton,
  Input
} from '@mui/material';
import { 
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReportProblem() {
  const { t } = useTranslation('reportProblem');
  const navigate = useNavigate();
  const [problemType, setProblemType] = useState('technical');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const problemTypes = [
    { value: 'technical', label: t('problemTypes.technical') },
    { value: 'content', label: t('problemTypes.content') },
    { value: 'behavior', label: t('problemTypes.behavior') },
    { value: 'feedback', label: t('problemTypes.feedback') }
  ];

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log({
      problemType,
      description,
      email,
      file
    });
    // Show success message or navigate
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          bgcolor: 'rgba(248, 252, 248, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(231, 243, 231, 0.5)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                color: '#0d1c0d',
                width: 40,
                height: 40,
                '&:hover': { bgcolor: '#e7f3e7' }
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#0d1c0d', 
                fontWeight: 'bold', 
                flex: 1, 
                textAlign: 'center',
                pr: 5
              }}
            >
              {t('title')}
            </Typography>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, p: 2, pb: 4 }}>
          {/* Problem Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ color: '#0d1c0d', fontWeight: 'semibold', mb: 1.5 }}
            >
              {t('problemTypeQuestion')}
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
              >
                {problemTypes.map((type) => (
                  <Paper
                    key={type.value}
                    sx={{
                      mb: 1.5,
                      border: '1px solid #cfe8cf',
                      borderRadius: 3,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: '#0fdb0f'
                      },
                      ...(problemType === type.value && {
                        borderColor: '#0fdb0f',
                        bgcolor: '#e7f3e7'
                      })
                    }}
                  >
                    <FormControlLabel
                      value={type.value}
                      control={
                        <Radio
                          sx={{
                            color: '#cfe8cf',
                            '&.Mui-checked': {
                              color: '#0fdb0f'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ color: '#0d1c0d', fontWeight: 'medium' }}>
                          {type.label}
                        </Typography>
                      }
                      sx={{ 
                        width: '100%', 
                        m: 0, 
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row-reverse'
                      }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Description */}
            <TextField
              multiline
              rows={6}
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  border: 'none',
                  bgcolor: '#e7f3e7',
                  borderRadius: 3,
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' },
                  '&.Mui-focused': {
                    outline: '2px solid #0fdb0f'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#0d1c0d'
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#4b9b4b',
                  opacity: 1
                }
              }}
            />

            {/* Email */}
            <TextField
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  border: 'none',
                  bgcolor: '#e7f3e7',
                  borderRadius: 3,
                  height: 56,
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' },
                  '&.Mui-focused': {
                    outline: '2px solid #0fdb0f'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#0d1c0d'
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#4b9b4b',
                  opacity: 1
                }
              }}
            />

            {/* File Upload */}
            <Paper
              sx={{
                border: '2px dashed #cfe8cf',
                borderRadius: 3,
                bgcolor: 'rgba(231, 243, 231, 0.5)',
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#0fdb0f'
                }
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CloudUploadIcon sx={{ color: '#0d1c0d', fontSize: 20 }} />
                <Typography sx={{ color: '#0d1c0d', fontWeight: 'medium', fontSize: '0.875rem' }}>
                  {file ? file.name : t('attachScreenshot')}
                </Typography>
              </Box>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                sx={{ display: 'none' }}
                inputProps={{ accept: 'image/*' }}
              />
            </Paper>

            {/* Submit Button */}
            <Button
              fullWidth
              onClick={handleSubmit}
              sx={{
                bgcolor: '#0fdb0f',
                color: '#0d1c0d',
                borderRadius: 6,
                height: 48,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#0cb50c'
                },
                '&:focus': {
                  outline: '2px solid #0fdb0f',
                  outlineOffset: 2
                }
              }}
            >
              {t('submitReport')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}