const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const DialogueSession = require('../models/DialogueSession');
const DialogueMessage = require('../models/DialogueMessage');
const { getAIResponse } = require('../services/aiService'); // Assuming aiService.js is in services directory

// POST /api/dialogue/start - Start a new dialogue session
router.post('/start', authMiddleware, async (req, res) => {
  const { topic } = req.body;
  const userId = req.user.uid; // From authMiddleware

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required.' });
  }

  try {
    // Create new session
    const newSession = new DialogueSession({
      userId,
      topic,
      status: 'active',
    });
    await newSession.save();

    // Generate initial AI welcome message
    // For a more dynamic welcome, could use: await getAIResponse([], topic);
    // However, the prompt in aiService is now structured to take this into account.
    // We can send a very minimal first "user" message to seed the AI's actual first response.
    // Or, craft a specific welcome message here.
    // Let's use getAIResponse with an empty history to get the AI's initial message based on the system prompt.

    const initialAiMessageText = await getAIResponse([], topic);

    const aiWelcomeMessage = new DialogueMessage({
      sessionId: newSession._id,
      sender: 'ai',
      text: initialAiMessageText,
    });
    await aiWelcomeMessage.save();

    res.status(201).json({
      sessionId: newSession._id,
      topic: newSession.topic,
      startTime: newSession.startTime,
      initialMessage: {
        _id: aiWelcomeMessage._id,
        text: aiWelcomeMessage.text,
        sender: aiWelcomeMessage.sender,
        timestamp: aiWelcomeMessage.timestamp,
      },
    });
  } catch (error) {
    console.error('Error starting dialogue session:', error);
    if (error.message.includes("Gemini API error")) {
        return res.status(502).json({ message: 'Failed to get initial AI response.', error: error.message });
    }
    res.status(500).json({ message: 'Failed to start dialogue session.', error: error.message });
  }
});

// POST /api/dialogue/:sessionId/message - Post a new message to a session
router.post('/:sessionId/message', authMiddleware, async (req, res) => {
  const { text } = req.body;
  const { sessionId } = req.params;
  const userId = req.user.uid;

  if (!text) {
    return res.status(400).json({ message: 'Message text is required.' });
  }

  try {
    // Verify session exists and belongs to the user
    const session = await DialogueSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Dialogue session not found or access denied.' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ message: `Session is not active (status: ${session.status}). Cannot post new messages.` });
    }

    // Save user's message
    const userMessage = new DialogueMessage({
      sessionId,
      sender: 'user',
      text,
    });
    await userMessage.save();

    // Fetch recent message history for AI context (e.g., last 10 messages)
    // The AI service prompt is now structured to handle the initial system message and topic.
    // We should send only the actual conversation turn history.
    const messageHistoryFromDb = await DialogueMessage.find({ sessionId })
      .sort({ timestamp: 1 }) // Fetch in chronological order
      .select('sender text -_id') // Select only relevant fields
      .lean(); // Use .lean() for plain JS objects if not modifying

    // Map to the { sender, text } format expected by getAIResponse
    const historyForAI = messageHistoryFromDb.map(msg => ({
        sender: msg.sender, // 'user' or 'ai'
        text: msg.text
    }));


    // Call AI service to get a response
    const aiReplyText = await getAIResponse(historyForAI, session.topic);

    // Save AI's message
    const aiMessage = new DialogueMessage({
      sessionId,
      sender: 'ai',
      text: aiReplyText,
    });
    await aiMessage.save();

    // Update session's lastActivityTime (handled by pre-save hook, but explicit save is fine)
    session.lastActivityTime = Date.now();
    await session.save();

    res.status(201).json({
      _id: aiMessage._id,
      text: aiMessage.text,
      sender: aiMessage.sender,
      timestamp: aiMessage.timestamp,
    });
  } catch (error) {
    console.error('Error posting message:', error);
     if (error.message.includes("Gemini API error")) {
        return res.status(502).json({ message: 'Failed to get AI response.', error: error.message });
    }
    res.status(500).json({ message: 'Failed to post message.', error: error.message });
  }
});

// GET /api/dialogue/:sessionId/history - Get message history for a session
router.get('/:sessionId/history', authMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.uid;

  try {
    // Verify session exists and belongs to the user
    const session = await DialogueSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Dialogue session not found or access denied.' });
    }

    const messages = await DialogueMessage.find({ sessionId })
      .sort({ timestamp: 'asc' })
      .select('_id sender text timestamp'); // Include _id

    res.json(messages);
  } catch (error) {
    console.error('Error fetching dialogue history:', error);
    res.status(500).json({ message: 'Failed to fetch dialogue history.', error: error.message });
  }
});

// GET all dialogue sessions for the current user
// Path: /api/dialogue/sessions/me
router.get('/sessions/me', authMiddleware, async (req, res) => {
  try {
    const sessions = await DialogueSession.find({ userId: req.user.uid })
      .sort({ lastActivityTime: -1 }) // Most recent first
      .select('_id topic startTime lastActivityTime status') // Select specific fields
      .lean(); // Use .lean() for plain JS objects, good for read-only ops

    // If no sessions, return empty array, not an error
    res.json(sessions);

  } catch (error) {
    console.error('Error fetching user dialogue sessions:', error);
    res.status(500).json({ message: 'Error fetching user dialogue sessions', error: error.message });
  }
});

module.exports = router;
