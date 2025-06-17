const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // Adjust path as necessary

// GET all categories
// Path: /api/categories/
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Sort by name alphabetically
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET a single category by ID
// Path: /api/categories/:categoryId
router.get('/:categoryId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    // Handle potential CastError if categoryId is not a valid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid category ID format.' });
    }
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

// POST / - Create a new category (Example of an admin-only route, not fully implemented for auth yet)
// For now, this route is open for seeding purposes if direct DB access is complex.
// In a production app, this MUST be protected by an admin authentication/authorization middleware.
router.post('/', async (req, res) => {
  // Basic validation
  const { name, description, imageUrl, iconName, difficultyLevel, tags } = req.body;
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required.' });
  }

  try {
    const newCategory = new Category({
      name,
      description,
      imageUrl,
      iconName,
      difficultyLevel,
      tags
    });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    // Handle duplicate key error for 'name'
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(409).json({ message: `Category with name "${name}" already exists.` });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});


module.exports = router;
