import { useEffect, useState } from 'react';
import { Container, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, CircularProgress, Alert, Chip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyDialogueSessions, DialogueSessionData } from '../services/dialogueService';
import TopicIcon from '@mui/icons-material/QuestionAnswer'; // Generic topic icon

// Helper function to format date and time
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

// Helper function to get chip color based on status
const getStatusChipColor = (status: DialogueSessionData['status']) => {
  switch (status) {
    case 'active': return 'primary';
    case 'completed': return 'success';
    case 'abandoned': return 'default';
    default: return 'default';
  }
};


export default function History() {
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth();
  const [sessions, setSessions] = useState<DialogueSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          const token = await getIdToken();
          if (!token) {
            setError("Authentication failed. Please login again.");
            setLoading(false);
            return;
          }
          const fetchedSessions = await getMyDialogueSessions(token);
          setSessions(fetchedSessions);
        } catch (err) {
          console.error("Error fetching sessions:", err);
          setError(err instanceof Error ? err.message : 'Failed to load conversation history.');
        } finally {
          setLoading(false);
        }
      } else {
        // No user logged in, or user logged out
        setSessions([]); // Clear any existing sessions
        setLoading(false);
        // Optionally, set an error or a message indicating user needs to log in
        // setError("Please login to view your history.");
      }
    };

    fetchSessions();
  }, [user, getIdToken]);

  const handleSessionClick = (session: DialogueSessionData) => {
    // For now, just log. Task 4 will handle navigation to re-load the session.
    console.log("Clicked session:", session._id, "Topic:", session.topic);
    // Example navigation for future:
    // navigate(`/dialogue/${session._id}`, { state: { topic: session.topic, sessionId: session._id } });
    // Or if Dialogue.tsx is adapted to fetch history:
    navigate('/dialogue', { state: { topic: session.topic, sessionId: session._id, mode: 'resume' } });

  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', py: 2 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#f8fcf8', p: 0, pb: 2 /* Add padding at bottom */ }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#f0f0f0', py: 2, px: 3, borderBottom: '1px solid #ddd', boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 5px 0 rgba(0,0,0,0.06), 0 1px 10px 0 rgba(0,0,0,0.04)' }}>
        <Typography variant="h6" sx={{ color: '#333', fontWeight: '600' }}>Conversation History</Typography>
      </Box>

      {error && (
        <Box sx={{ px: 2, py: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {!loading && !error && sessions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, px:2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            No conversation history yet. Start a new conversation from the Topics page!
          </Typography>
        </Box>
      )}

      {sessions.length > 0 && (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            <List disablePadding>
              {sessions.map((session, index) => (
                <React.Fragment key={session._id}>
                  <ListItem
                    button
                    onClick={() => handleSessionClick(session)}
                    sx={{
                      py: 1.5,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#CAECCA', color: '#0d1b0d' }}>
                        <TopicIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: '500', color: 'text.primary' }}>
                          {session.topic}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            Last active: {formatDateTime(session.lastActivityTime)}
                          </Typography>
                          <Chip
                            label={session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            size="small"
                            color={getStatusChipColor(session.status)}
                            sx={{ ml: { xs: 0, sm: 1 }, mt: { xs: 0.5, sm: 0 }, display: { xs: 'block', sm: 'inline-flex' }, height: 'auto', fontSize: '0.75rem', py: 0.25 }}
                          />
                        </>
                      }
                      secondaryTypographyProps={{component: 'div'}}
                    />
                  </ListItem>
                  {index < sessions.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Container>
  );
}
// Add React to imports if not already there (it's usually implicit with JSX)
import React from 'react';