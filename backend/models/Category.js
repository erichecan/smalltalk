const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true // Added trim for name
  },
  description: {
    type: String,
    required: true,
    trim: true // Added trim for description
  },
  imageUrl: {
    type: String
  },
  iconName: { // Storing icon name from MUI or similar library if imageUrl is not provided
    type: String
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'], // Added 'all' as a possible level
    default: 'intermediate'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// Optional: Add an index on tags for faster searching if needed in the future
// categorySchema.index({ tags: 1 });

module.exports = mongoose.model('Category', categorySchema);
