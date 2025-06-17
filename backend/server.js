require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (from Step 4, including it here for structure)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/speakflow', {
  // useNewUrlParser: true, // Deprecated in new Mongoose versions
  // useUnifiedTopology: true, // Deprecated in new Mongoose versions
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
  res.send('SpeakFlow backend server is running!');
});

// Profile Routes
const profileRoutes = require('./routes/profileRoutes'); // Ensure path is correct
app.use('/api/profile', profileRoutes);

// Dialogue Routes
const dialogueRoutes = require('./routes/dialogueRoutes'); // Ensure path is correct
app.use('/api/dialogue', dialogueRoutes);

// Category Routes
const categoryRoutes = require('./routes/categoryRoutes'); // Ensure path is correct
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For potential testing or modular use
