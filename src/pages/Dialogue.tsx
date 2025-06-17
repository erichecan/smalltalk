import { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Paper, Stack, Alert, CircularProgress, IconButton, Modal, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material'; // Added Modal, List components
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Added MoreVertIcon
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import TuneIcon from '@mui/icons-material/Tune'; // For "Adjust AI Difficulty"
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'; // For "Access Tips"
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'; // For "Report Issue"
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'; // For "End Conversation"
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Message } from '../types/chat';
// Removed: import { getAIResponse } from '../services/ai';
import { useAuth } from '../contexts/AuthContext'; // Added
import { startDialogue, postMessage, getConversationHistory } from '../services/dialogueService'; // Added getConversationHistory

export default function Dialogue() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth(); // Added

  // Access route state for topic, sessionId, and mode
  const routeState = location.state as { topic?: string; topicId?: string; sessionId?: string; mode?: 'resume' | string } | null;
  const topicFromState = routeState?.topic;
  // const topicIdFromState = routeState?.topicId; // Not directly used in this logic path, but good to acknowledge
  const sessionIdFromState = routeState?.sessionId;
  const modeFromState = routeState?.mode;

  const [topic, setTopic] = useState<string>(topicFromState || 'Conversation'); // Default topic if none provided
  const [sessionId, setSessionId] = useState<string | null>(sessionIdFromState || null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For message sending
  const [isInitializing, setIsInitializing] = useState(true); // For session start

  // State for Conversation Options Modal
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  useEffect(() => {
    const initializeOrResumeSession = async () => {
      if (!user) {
        setIsInitializing(false);
        // setError("User not authenticated."); // ProtectedRoute should handle this
        return;
      }

      setIsInitializing(true);
      setError(null);
      const token = await getIdToken();
      if (!token) {
        setError("Authentication failed. Please login again.");
        setIsInitializing(false);
        return;
      }

      if (modeFromState === 'resume' && sessionIdFromState) {
        // Attempt to resume an existing session
        try {
          console.log(`Resuming session: ${sessionIdFromState} for topic: ${topicFromState}`);
          const history = await getConversationHistory(token, sessionIdFromState);
          setMessages(history);
          setSessionId(sessionIdFromState); // Ensure session ID state is set
          if (topicFromState) setTopic(topicFromState); // Set topic from state if available
          else if (history.length > 0) {
            // Potentially derive topic from session if backend provided it, or use a generic title
            // For now, if topicFromState is missing on resume, header might be "Conversation"
          }
        } catch (err) {
          console.error("Error resuming dialogue session:", err);
          setError(err instanceof Error ? err.message : 'Failed to load conversation history.');
          // Fallback: Could attempt to start a new session with topicFromState if history load fails
          // For now, just show error. Or redirect to /topics
          navigate('/topics', { replace: true, state: { error: "Failed to resume session." } });
        }
      } else if (topicFromState) {
        // Start a new session
        try {
          console.log(`Starting new session for topic: ${topicFromState}`);
          const response = await startDialogue(token, topicFromState);
          setSessionId(response.sessionId);
          setMessages(response.initialMessage ? [response.initialMessage] : []);
          setTopic(topicFromState); // Ensure topic state is set from current action
        } catch (err) {
          console.error("Error starting new dialogue session:", err);
          setError(err instanceof Error ? err.message : 'Failed to start new dialogue session.');
        }
      } else {
        // No topic provided, and not resuming a session
        setError("No topic selected. Please choose a topic to begin.");
        // Potentially navigate away or show a more prominent message
        navigate('/topics', { replace: true }); // Redirect if no valid state
      }
      setIsInitializing(false);
    };

    initializeOrResumeSession();
  }, [modeFromState, sessionIdFromState, topicFromState, user, getIdToken, navigate]);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !sessionId || !user) return;

    // Create a temporary ID for the user message for UI update
    // Backend will assign a proper _id
    const tempUserMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: tempUserMessageId, // Temporary ID for local rendering
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(), // Add timestamp for immediate display
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setError("Authentication failed. Please login again.");
        setMessages(prev => prev.filter(msg => msg.id !== tempUserMessageId)); // Remove optimistic message
        setIsLoading(false);
        return;
      }
      // The backend now returns the AI message object which should have id, sender, text, timestamp
      const aiResponse = await postMessage(token, sessionId, currentInput);
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message or get AI response.');
      // Optionally remove the optimistically added user message if send failed critically
      // For now, leave it to allow retry or show it was attempted.
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ml: 2}}>Starting session...</Typography>
      </Container>
    );
  }

  if (!topic || error && !messages.length) { // If error occurred before any messages loaded
    return <Container sx={{pt: 2}}><Alert severity="warning">{error || "No topic provided. Please go back and select a topic."}</Alert></Container>;
  }

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f9fbfa', p: 0, position: 'relative' }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: '#f9fbfa', // Or use a slight variant like '#f9fbfacc' for transparency with backdropFilter if needed
        // backdropFilter: 'blur(10px)', // Optional: if you want blur effect
        py: 1,
        px: 1, // Adjusted padding for IconButton spacing
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0', // slate-200 equivalent
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#111814' }} aria-label="back">
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#111814', fontWeight: 'semibold', flexGrow: 1, textAlign: 'center', ml: 2 /* Adjust to center title properly with three icons */ }}>
          {topic}
        </Typography>
        <IconButton sx={{ color: '#111814' }} aria-label="bookmark">
          <BookmarkBorderIcon />
        </IconButton>
        <IconButton sx={{ color: '#111814' }} aria-label="more options" onClick={() => setIsOptionsModalOpen(true)}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Conversation Options Modal */}
      <Modal
        open={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        aria-labelledby="conversation-options-title"
        sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} // For bottom sheet style
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 'sm', // Limit width on larger screens
            bgcolor: 'background.paper',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2,
            pb: 3, // Extra padding at bottom for safe area / aesthetics
            boxShadow: 24
          }}
        >
          <Box sx={{ width: 36, height: 4, bgcolor: 'grey.400', borderRadius: '2px', margin: 'auto', mb: 2 }} /> {/* Draggable-like handle */}
          <Typography id="conversation-options-title" variant="h6" component="h2" sx={{ textAlign: 'center', mb: 2 }}>
            Conversation Options
          </Typography>
          <List>
            <ListItemButton onClick={() => { console.log("Adjust AI Difficulty clicked"); setIsOptionsModalOpen(false); }}>
              <ListItemIcon><TuneIcon /></ListItemIcon>
              <ListItemText primary="Adjust AI Difficulty" />
              <ChevronRightIcon />
            </ListItemButton>
            <ListItemButton onClick={() => { console.log("Access Tips clicked"); setIsOptionsModalOpen(false); }}>
              <ListItemIcon><LightbulbOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Access Tips" />
              <ChevronRightIcon />
            </ListItemButton>
            <ListItemButton onClick={() => { console.log("Report Issue clicked"); setIsOptionsModalOpen(false); }}>
              <ListItemIcon><FlagOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Report Issue" />
              <ChevronRightIcon />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            <ListItemButton
              onClick={() => {
                console.log("End Conversation clicked");
                setIsOptionsModalOpen(false);
                navigate('/topics'); // Or navigate('/')
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><CloseFullscreenIcon sx={{ color: 'error.main' }} /></ListItemIcon>
              <ListItemText primary="End Conversation" />
              {/* No chevron for this one as it's a direct action */}
            </ListItemButton>
          </List>
        </Box>
      </Modal>

      {/* 消息列表 */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 3, mt: '60px', mb: '70px' /* Approximate header/footer heights - adjust as needed */ }}>
        <Stack spacing={2}>
          {messages.map((msg, index) => ( // Use index as key if msg.id is not guaranteed unique temporarily (e.g. before backend assigns one)
            <Box key={msg.id || `msg-${index}`} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <Paper sx={{
                px: 2, py: 1,
                maxWidth: {xs: '90%', sm: '80%', md: '70%'}, // Responsive max width
                bgcolor: msg.sender === 'user' ? '#c7e9d8' : '#eaf0ed', // Matching dialogue.html
                color: '#111814', // Matching dialogue.html text color
                borderRadius: msg.sender === 'user' ? '0.75rem 0.75rem 0 0.75rem' : '0.75rem 0.75rem 0.75rem 0', // chat-bubble-user/ai
                boxShadow: 1,
              }}>
                <Typography variant="body1">{msg.text}</Typography>
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Paper sx={{
                px: 2, py: 1,
                bgcolor: '#eaf0ed', // Matching AI bubble
                color: '#111814',   // Matching AI text color
                borderRadius: '0.75rem 0.75rem 0.75rem 0', // chat-bubble-ai
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CircularProgress size={16} sx={{ color: '#4c9a4c' }} />
                <Typography variant="body2" sx={{ color: '#5D895D' }}>AI is typing...</Typography>
              </Paper>
            </Box>
          )}
        </Stack>
      </Box>
      {/* 错误提示 */}
      {error && (
        <Box sx={{ px: 2, py: 1 }}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Box>
      )}
      {/* 底部输入栏 */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          px: 2, // Adjusted from dialogue.html's px-4 to better fit MUI components
          py: 1.5, // Adjusted from dialogue.html's py-3
          borderTop: '1px solid #e0e0e0', // slate-200 equivalent
          bgcolor: '#f9fbfa', // Or use a slight variant like '#f9fbfaee' for transparency
          // backdropFilter: 'blur(10px)', // Optional
          display: 'flex',
          alignItems: 'center',
          gap: 1, // Spacing between items
        }}
      >
        <IconButton sx={{ color: '#111814' }}>
          <MicIcon />
        </IconButton>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          variant="outlined"
          size="small"
          disabled={isLoading || isInitializing || !sessionId}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px', // Rounded like in dialogue.html
              bgcolor: '#fff', // Assuming a white background for the input itself
            },
          }}
        />
        <IconButton
          type="submit"
          disabled={isLoading || isInitializing || !input.trim() || !sessionId}
          sx={{ 
            color: '#111814',
            bgcolor: '#c7e9d8', // User message bubble color for send
            '&:hover': {
              bgcolor: '#b3d8c7', // Darker shade for hover
            },
            '&.Mui-disabled': {
              bgcolor: '#e0e0e0', // slate-200 for disabled
              color: '#9e9e9e',   // slate-400 for disabled text
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Container>
  );
}