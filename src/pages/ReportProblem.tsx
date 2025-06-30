import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Button,
  Card,
  CardActionArea,
  Container
} from '@mui/material';
import {
  Close,
  PhotoCamera
} from '@mui/icons-material';

const customColors = {
  background: '#f8fcf8',
  primary: '#0d1c0d',
  green: '#0fdb0f',
  greenHover: '#0cb50c',
  greenLight: '#e7f3e7',
  greenBorder: '#cfe8cf',
  greenSecondary: '#4b9b4b'
};

export default function ReportProblem() {
  const navigate = useNavigate();
  const { t } = useTranslation('reportProblem');
  const [problemType, setProblemType] = useState('technical');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const problemTypes = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'content', label: 'Content Issue' },
    { value: 'behavior', label: 'User Behavior' },
    { value: 'feedback', label: 'Feedback/Suggestions' }
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Report submitted successfully!');
      setIsSubmitting(false);
      navigate(-1);
    }, 1000);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: customColors.background,
        fontFamily: 'Spline Sans, Noto Sans, sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box 
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'rgba(248, 252, 248, 0.8)',
          backdropFilter: 'blur(4px)',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Card
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              color: customColors.primary,
              transition: 'background-color 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: customColors.greenLight
              }
            }}
            onClick={() => navigate(-1)}
          >
            <Close />
          </Card>
          <Typography 
            variant=\"h6\" 
            sx={{ 
              flex: 1, 
              textAlign: 'center', 
              pr: 5,
              color: customColors.primary,
              fontWeight: 'bold',
              fontSize: '1.25rem',
              letterSpacing: '-0.015em'
            }}
          >
            {t('title', 'Report a Problem')}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Container 
        component=\"main\" 
        sx={{ 
          flexGrow: 1, 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          maxWidth: 'sm'
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Problem Type Selection */}
          <Box>
            <Typography 
              variant=\"h6\" 
              sx={{ 
                color: customColors.primary,
                fontWeight: 600,
                fontSize: '1.125rem',
                letterSpacing: '-0.015em',
                mb: 1.5
              }}
            >
              {t('problemTypeQuestion', 'What type of problem are you reporting?')}
            </Typography>
            <FormControl component=\"fieldset\" sx={{ width: '100%' }}>
              <RadioGroup
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
                sx={{ gap: 1.5 }}
              >
                {problemTypes.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={
                      <Radio 
                        sx={{
                          color: customColors.greenBorder,
                          '&.Mui-checked': {
                            color: customColors.green
                          },
                          '& .MuiSvgIcon-root': {
                            fontSize: 20
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ 
                        color: customColors.primary,
                        fontWeight: 500,
                        fontSize: '1rem'
                      }}>
                        {t(`problemType.${type.value}`, type.label)}
                      </Typography>
                    }
                    sx={{
                      m: 0,
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${customColors.greenBorder}`,
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: customColors.green
                      },
                      '&:has(.Mui-checked)': {
                        borderColor: customColors.green,
                        backgroundColor: customColors.greenLight
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Description */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              multiline
              rows={6}
              placeholder={t('descriptionPlaceholder', 'Describe the problem or feedback in detail')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: customColors.greenLight,
                  border: 'none',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  },
                  '&.Mui-focused': {
                    outline: `2px solid ${customColors.green}`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '& .MuiInputBase-input': {
                  color: customColors.primary,
                  fontSize: '1rem',
                  fontWeight: 400,
                  '&::placeholder': {
                    color: customColors.greenSecondary,
                    opacity: 1
                  }
                }
              }}
            />

            {/* Email */}
            <TextField
              type=\"email\"
              placeholder={t('emailPlaceholder', 'Email address (optional)')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: customColors.greenLight,
                  border: 'none',
                  height: 56,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  },
                  '&.Mui-focused': {
                    outline: `2px solid ${customColors.green}`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '& .MuiInputBase-input': {
                  color: customColors.primary,
                  fontSize: '1rem',
                  fontWeight: 400,
                  '&::placeholder': {
                    color: customColors.greenSecondary,
                    opacity: 1
                  }
                }
              }}
            />

            {/* File Upload */}
            <Box>
              <input
                type=\"file\"
                accept=\"image/*\"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id=\"file-upload\"
              />
              <label htmlFor=\"file-upload\">
                <Card
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    p: 2,
                    borderRadius: '12px',
                    border: `2px dashed ${customColors.greenBorder}`,
                    backgroundColor: 'rgba(231, 243, 231, 0.5)',
                    color: customColors.primary,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: customColors.green
                    }
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {file ? file.name : t('attachScreenshot', 'Attach Screenshot (Optional)')}
                  </Typography>
                </Card>
              </label>
            </Box>
          </Box>

          {/* Submit Button */}
          <Button
            type=\"submit\"
            disabled={isSubmitting || !description.trim()}
            sx={{
              width: '100%',
              height: 48,
              borderRadius: '24px',
              backgroundColor: customColors.green,
              color: customColors.primary,
              fontSize: '1rem',
              fontWeight: 'bold',
              letterSpacing: '0.015em',
              textTransform: 'none',
              transition: 'background-color 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: customColors.greenHover
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: '#666'
              },
              '&:focus': {
                outline: `2px solid ${customColors.green}`,
                outlineOffset: 2
              }
            }}
          >
            {isSubmitting ? t('submitting', 'Submitting...') : t('submitButton', 'Submit Report')}
          </Button>
        </form>
      </Container>
    </Box>
  );
}