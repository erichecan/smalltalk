const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const UserProfile = require('../models/UserProfile');

// GET current user's profile
// Path: /api/profile/
router.get('/', authMiddleware, async (req, res) => {
  try {
    // req.user is populated by authMiddleware
    if (!req.user || !req.user.uid) {
      return res.status(400).json({ message: 'User ID not found in request. Ensure auth token is valid.' });
    }
    const profile = await UserProfile.findOne({ userId: req.user.uid });
    if (!profile) {
      // Return 404 if profile doesn't exist; client can decide to prompt creation.
      return res.status(404).json({ message: 'Profile not found. You can create one.' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// POST - Create or Update current user's profile
// Path: /api/profile/
router.post('/', authMiddleware, async (req, res) => {
  const { nativeLanguage, learningGoals, interests } = req.body;
  // req.user is populated by authMiddleware
  if (!req.user || !req.user.uid) {
    return res.status(400).json({ message: 'User ID not found in request. Ensure auth token is valid.' });
  }
  const userId = req.user.uid;

  try {
    let profile = await UserProfile.findOne({ userId });

    if (profile) {
      // Update existing profile
      // Only update fields that are provided in the request body
      if (nativeLanguage !== undefined) profile.nativeLanguage = nativeLanguage;
      if (learningGoals !== undefined) profile.learningGoals = learningGoals;
      if (interests !== undefined) profile.interests = interests;
      // profile.updatedAt is handled by schema's pre-save middleware
    } else {
      // Create new profile
      profile = new UserProfile({
        userId,
        nativeLanguage,
        learningGoals,
        interests
        // createdAt and updatedAt are handled by schema defaults/middleware
      });
    }
    await profile.save();
    // Send 201 for creation, 200 for update.
    // For simplicity here, 200 if it existed before, 201 if new.
    // However, a common pattern is to always return 200 on successful POST for create/update,
    // or 201 for create and 200 for update.
    // To strictly follow that, we'd need to know if it was an update or create.
    // The current logic just saves, so let's assume 200 if it existed, 201 if new.
    // For this, we'll use a flag.
    const statusCode = profile.isNew ? 201 : 200;
    // Or more simply, if we found 'profile' initially, it's an update.
    // Let's re-evaluate: the 'profile' variable is reassigned if new.
    // A simple check: if (await UserProfile.countDocuments({ userId }) > 1 after save, something is wrong)
    // Let's check if it was an update by seeing if `profile.createdAt` is significantly different from `profile.updatedAt`
    // Or, more simply, if we found a profile initially.
    // For now, let's use 201 for successful save, as upsert can be seen as creation if not present.
    // Or, check if it was an update.
    // To be more precise:
    let wasNew = true;
    if (profile.createdAt.getTime() !== profile.updatedAt.getTime() && profile.updatedAt.getTime() - profile.createdAt.getTime() > 1000 /*ms*/) { // Check if updatedAt is different and not just init
        wasNew = false;
    }
    // The above logic for wasNew is a bit convoluted. Let's simplify.
    // If we found 'profile' via findOne and it wasn't null, it was an update.
    // The current structure re-uses 'profile' variable.
    // The simplest is to return 200 OK for successful update, 201 Created for new.
    // We need to know if it was an insert or update.
    // `profile.isNew` is a Mongoose property that is true if the document was just created in this session.

    // The code `let profile = await UserProfile.findOne({ userId }); if (profile) { ... } else { profile = new UserProfile ...}`
    // means `profile.isNew` will be false for updates and true for new profiles after `new UserProfile`.
    // So, we can rely on `profile.isNew` before save, but after save, it's always false.
    // Let's determine status code before save.

    let finalProfile;
    let httpStatus;

    const existingProfile = await UserProfile.findOne({ userId });
    if (existingProfile) {
      existingProfile.nativeLanguage = nativeLanguage !== undefined ? nativeLanguage : existingProfile.nativeLanguage;
      existingProfile.learningGoals = learningGoals !== undefined ? learningGoals : existingProfile.learningGoals;
      existingProfile.interests = interests !== undefined ? interests : existingProfile.interests;
      // updatedAt will be handled by pre-save hook
      finalProfile = await existingProfile.save();
      httpStatus = 200; // OK for update
    } else {
      const newProfile = new UserProfile({
        userId,
        nativeLanguage,
        learningGoals,
        interests
      });
      finalProfile = await newProfile.save();
      httpStatus = 201; // Created for new profile
    }
    res.status(httpStatus).json(finalProfile);

  } catch (error) {
    console.error('Error saving profile:', error);
    // Check for duplicate key error (if somehow userId uniqueness is violated despite findOne)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Conflict: A profile with this userId already exists.', error: error.message });
    }
    res.status(500).json({ message: 'Error saving profile', error: error.message });
  }
});

module.exports = router;
