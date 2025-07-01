import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const customStyles = {
  colors: {
    primary500: '#0FDB0F',
    gray100: '#F5F5F5',
    gray600: '#757575',
    text900: '#0D1C0D'
  }
};

function ReportProblem() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ category: '', subject: '', description: '', email: '' });
    }, 2000);
  };

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#F8FCF8',
      pt: 3
    }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: customStyles.colors.text900,
              fontWeight: 'bold',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Report a Problem
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: customStyles.colors.gray600,
              textAlign: 'center',
              mb: 4
            }}
          >
            Help us improve SmallTalk by reporting any issues you encounter
          </Typography>
        </Box>

        {submitSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSubmitSuccess(false)}
          >
            Thank you for your report! We'll look into this issue.
          </Alert>
        )}

        <Box sx={{ 
          p: 4, 
          bgcolor: 'white', 
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Problem Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleChange('category')}
                required
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="login">Login Issues</MenuItem>
                <MenuItem value="conversation">Conversation Problems</MenuItem>
                <MenuItem value="vocabulary">Vocabulary Features</MenuItem>
                <MenuItem value="performance">Performance Issues</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={handleChange('subject')}
              required
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={6}
              required
              placeholder="Please describe the problem in detail, including steps to reproduce it..."
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <TextField
              fullWidth
              label="Email (optional)"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="Enter your email if you'd like us to follow up"
              sx={{ 
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{
                bgcolor: customStyles.colors.primary500,
                color: 'white',
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#0CBF0C'
                },
                '&:disabled': {
                  bgcolor: customStyles.colors.gray100
                }
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
}

export default ReportProblem;