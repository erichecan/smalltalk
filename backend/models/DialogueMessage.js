const mongoose = require('mongoose');

const dialogueMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DialogueSession',
    required: true,
    index: true // Index for faster querying of messages by session
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional fields for future enhancements:
  // feedback: { type: String, enum: ['thumbs_up', 'thumbs_down', null], default: null },
  // correctedText: { type: String },
  // originalText: { type: String }, // If AI provides a correction
});

module.exports = mongoose.model('DialogueMessage', dialogueMessageSchema);
