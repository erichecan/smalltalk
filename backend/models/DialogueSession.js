const mongoose = require('mongoose');

const dialogueSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  }, // Firebase User ID
  topic: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  lastActivityTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  // Optional: Add other fields like AI model, difficulty level, etc.
});

// Middleware to update lastActivityTime on each save
dialogueSessionSchema.pre('save', function(next) {
  this.lastActivityTime = Date.now();
  next();
});

module.exports = mongoose.model('DialogueSession', dialogueSessionSchema);
