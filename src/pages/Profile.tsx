import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Container, Box, Typography, Avatar, Paper, LinearProgress, Chip, Stack, Button, CircularProgress, Alert, Modal, TextField, Snackbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import ChatIcon from '@mui/icons-material/Chat'; // No longer used for Edit button
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, UserProfileData, saveUserProfile } from '../services/profileService';

export default function Profile() {
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null); // For main page errors
  const [loading, setLoading] = useState(true); // For initial page load
  const [profileNotFound, setProfileNotFound] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<UserProfileData>>({});
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");


  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        setProfileNotFound(false);
        const token = await getIdToken();
        if (token) {
          try {
            const profileData = await getUserProfile(token);
            setUserProfile(profileData);
          } catch (err: any) {
            if (err.message && err.message.toLowerCase().includes('not found')) {
              setProfileNotFound(true);
              setUserProfile(null); // Ensure no old profile data is shown
              setError('Profile not found. You can create or update it.'); // Informative message
            } else {
              setError(err.message || 'Failed to load profile.');
            }
            console.error("Error fetching profile:", err);
          } finally {
            setLoading(false);
          }
        } else {
          setError("Unable to retrieve authentication token. Please try logging in again.");
          setLoading(false);
        }
      } else {
        // No user logged in
        setUserProfile(null);
        setError(null); // Clear main page error
        setLoading(false);
        setProfileNotFound(false); // Reset profile not found state
      }
    };

    fetchProfile();
  }, [user, getIdToken]);

  const handleOpenModal = () => {
    setError(null); // Clear main page error before opening modal
    setModalError(null); // Clear any previous modal errors
    if (userProfile && !profileNotFound) {
      setEditFormData({
        nativeLanguage: userProfile.nativeLanguage || '',
        // Convert arrays to comma-separated strings for TextField display
        learningGoals: userProfile.learningGoals?.join(', ') || '',
        interests: userProfile.interests?.join(', ') || '',
      });
    } else {
      // For new profile or if profile was not found
      setEditFormData({ nativeLanguage: '', learningGoals: '', interests: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setModalError("User not authenticated. Please login again.");
      return;
    }
    const token = await getIdToken();
    if (!token) {
      setModalError("Authentication token not available. Please login again.");
      return;
    }

    setIsSaving(true);
    setModalError(null);

    // Prepare data for backend: convert comma-separated strings to arrays
    const dataToSend: Partial<UserProfileData> = {
      ...editFormData,
      learningGoals: typeof editFormData.learningGoals === 'string'
        ? editFormData.learningGoals.split(',').map(s => s.trim()).filter(s => s)
        : [],
      interests: typeof editFormData.interests === 'string'
        ? editFormData.interests.split(',').map(s => s.trim()).filter(s => s)
        : [],
    };
    // Remove userId if it's part of editFormData, backend gets it from token
    delete dataToSend.userId;


    try {
      const savedProfile = await saveUserProfile(token, dataToSend);
      setUserProfile(savedProfile);
      setProfileNotFound(false); // Profile now exists/is updated
      setIsModalOpen(false);
      setSnackbarMessage("Profile saved successfully!");
      setSnackbarOpen(true);
    } catch (err: any) {
      setModalError(err.message || "Failed to save profile. Please try again.");
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !userProfile) { // Show loading spinner only if no profile yet, to avoid flicker on refresh
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Determine joined date string
  const getJoinedDateString = () => {
    if (user?.metadata.creationTime) {
      const creationDate = new Date(user.metadata.creationTime);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - creationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 30) return `Joined ${diffDays} days ago`;
      const diffMonths = Math.floor(diffDays / 30);
      return `Joined ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    return "Joined recently";
  };

  const displayName = user?.displayName || userProfile?.userId || "User";
  const avatarUrl = user?.photoURL || "https://via.placeholder.com/128"; // Default placeholder

  return (
    <Container sx={{ minHeight: '100vh', bgcolor: '#f8fcf8', p: 0, fontFamily: 'Spline Sans, Noto Sans, sans-serif', pb: '100px' /* padding for sticky footer */ }}>
      {/* 顶部栏 */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(248,252,248,0.8)', backdropFilter: 'blur(8px)', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: 0 }}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', color: '#0d1b0d', '&:hover': { bgcolor: '#e7f3e7' } }}>
          <ArrowBackIcon />
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', color: '#0d1b0d', fontWeight: 'bold', pr: 5 }}>My Profile</Typography>
      </Box>

      {error && !profileNotFound && ( // Only show generic error if not a 'profile not found' case that's handled inline
        <Box sx={{ px:2, py:1}}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {profileNotFound && (
         <Box sx={{ px:2, py:1}}>
            <Alert severity="info">{error}</Alert> {/* Error state contains the "Profile not found..." message */}
         </Box>
      )}


      {/* 头像与基本信息 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mt: 4, mb: 4 }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar src={avatarUrl} sx={{ width: 128, height: 128, boxShadow: 3 }} />
          {/* Play icon can be conditional, e.g., if user is active or has some interactive element */}
          <Box sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#12e712', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2 }}>
            <PlayArrowIcon sx={{ color: '#0d1b0d', fontSize: 28 }} />
          </Box>
        </Box>
        <Typography variant="h5" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>{displayName}</Typography>
        {/* Placeholder for Level - to be dynamic if added to profile */}
        <Typography variant="subtitle1" sx={{ color: '#4c9a4c', fontWeight: 500 }}>Level 5 Achiever</Typography>
        {/* Placeholder for Bio - to be dynamic if added to profile */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          {userProfile?.nativeLanguage ? `Native Language: ${userProfile.nativeLanguage}` : "Bio not set."}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1 }}>{getJoinedDateString()}</Typography>
      </Box>

      {/* 学习进度 - Placeholder data, to be dynamic if added to profile */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#0d1b0d', fontWeight: 600, mb: 2 }}>Learning Progress (Placeholder)</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>Points Earned</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>1200</Typography>
            <LinearProgress variant="determinate" value={75} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
          {/* ... other placeholder progress items ... */}
           <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>Conversations</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>35</Typography>
            <LinearProgress variant="determinate" value={50} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #e7f3e7', boxShadow: 1 }}>
            <Typography variant="body2" sx={{ color: '#4c9a4c', fontWeight: 500 }}>Topics Covered</Typography>
            <Typography variant="h4" sx={{ color: '#0d1b0d', fontWeight: 'bold' }}>15</Typography>
            <LinearProgress variant="determinate" value={60} sx={{ bgcolor: '#e7f3e7', height: 8, borderRadius: 4, mt: 1, '& .MuiLinearProgress-bar': { bgcolor: '#12e712' } }} />
          </Paper>
        </Stack>
      </Box>

      {/* 兴趣标签 */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#0d1b0d', fontWeight: 600, mb: 2 }}>
          {userProfile?.interests && userProfile.interests.length > 0 ? "Shared Interests" : "Interests (Not set)"}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {userProfile?.interests && userProfile.interests.length > 0 ? (
            userProfile.interests.map((interest, index) => (
              <Chip key={index} label={interest} sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 500, fontSize: 16, mb: 1 }} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              {profileNotFound ? "Update your profile to add interests." : "No interests specified."}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Learning Goals */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#0d1b0d', fontWeight: 600, mb: 2 }}>
          {userProfile?.learningGoals && userProfile.learningGoals.length > 0 ? "Learning Goals" : "Learning Goals (Not set)"}
        </Typography>
        <Stack direction="column" spacing={1} flexWrap="wrap">
          {userProfile?.learningGoals && userProfile.learningGoals.length > 0 ? (
            userProfile.learningGoals.map((goal, index) => (
              <Chip key={index} label={goal} variant="outlined" sx={{ borderColor: '#e7f3e7', color: '#0d1b0d', fontWeight: 500, fontSize: 16, mb: 1, justifyContent: 'flex-start' }} />
            ))
          ) : (
             <Typography variant="body2" color="text.secondary">
              {profileNotFound ? "Update your profile to add learning goals." : "No learning goals specified."}
            </Typography>
          )}
        </Stack>
      </Box>


      {/* 底部按钮 - Functionality to be added: Edit Profile */}
      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'rgba(248,252,248,0.8)', borderTop: '1px solid #e7f3e7', pt: 2, pb: 3, px: 2, display: 'flex', gap: 2, justifyContent: 'center', zIndex: 10 }}>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          disabled={loading || !user} // Disable if initial load in progress or no user
          sx={{ bgcolor: '#12e712', color: '#0d1b0d', fontWeight: 'bold', borderRadius: 999, px: 4, boxShadow: 1, flex: 1, minWidth: 120, '&:hover': { bgcolor: '#4c9a4c' } }}
        >
          {profileNotFound && !userProfile ? "Create Profile" : "Edit Profile"}
        </Button>
        <Button variant="contained" startIcon={<PlayArrowIcon />} sx={{ bgcolor: '#e7f3e7', color: '#0d1b0d', fontWeight: 'bold', borderRadius: 999, px: 4, boxShadow: 1, flex: 1, minWidth: 120, '&:hover': { bgcolor: '#cfe7cf' } }}>
          Practice Now
        </Button>
      </Box>

      {/* Edit Profile Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="edit-profile-modal-title"
        aria-describedby="edit-profile-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          border: '1px solid #ddd',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography id="edit-profile-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            {userProfile && !profileNotFound ? "Edit Your Profile" : "Create Your Profile"}
          </Typography>
          <Box component="form" onSubmit={handleFormSubmit} noValidate>
            <TextField
              margin="normal"
              fullWidth
              id="nativeLanguage"
              label="Native Language"
              name="nativeLanguage"
              value={editFormData.nativeLanguage || ''}
              onChange={handleFormChange}
              helperText="Your primary language."
            />
            <TextField
              margin="normal"
              fullWidth
              id="learningGoals"
              label="Learning Goals"
              name="learningGoals"
              value={editFormData.learningGoals || ''}
              onChange={handleFormChange}
              helperText="Separate goals with commas (e.g., fluency, travel, business)."
              multiline
            />
            <TextField
              margin="normal"
              fullWidth
              id="interests"
              label="Interests"
              name="interests"
              value={editFormData.interests || ''}
              onChange={handleFormChange}
              helperText="Separate interests with commas (e.g., food, travel, movies)."
              multiline
            />
            {modalError && (
              <Alert severity="error" sx={{ mt: 2, mb:1 }}>{modalError}</Alert>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button onClick={handleCloseModal} color="secondary" variant="outlined" disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSaving}>
                {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save Profile"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}