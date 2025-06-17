require('dotenv').config({ path: require('path').resolve(__dirname, '.env') }); // Ensure .env in backend is loaded
const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/speakflow';

const categoriesToSeed = [
  {
    name: "Everyday Basics",
    description: "Practice common daily interactions and essential phrases.",
    imageUrl: "", // Placeholder, can be URL
    iconName: "MdChatBubbleOutline", // Example MUI icon name
    difficultyLevel: "beginner",
    tags: ["social", "daily life", "greetings"]
  },
  {
    name: "Ordering Food",
    description: "Learn how to order at restaurants, cafes, and food stalls.",
    imageUrl: "",
    iconName: "MdRestaurant",
    difficultyLevel: "beginner",
    tags: ["food", "restaurant", "ordering"]
  },
  {
    name: "Travel & Directions",
    description: "Discuss planning trips, asking for directions, and navigating new places.",
    imageUrl: "",
    iconName: "MdFlightTakeoff",
    difficultyLevel: "intermediate",
    tags: ["travel", "adventure", "directions", "navigation"]
  },
  {
    name: "Workplace Communication",
    description: "Practice professional communication for the office environment.",
    imageUrl: "",
    iconName: "MdWork",
    difficultyLevel: "intermediate",
    tags: ["work", "professional", "career", "office"]
  },
  {
    name: "Hobbies & Interests",
    description: "Talk about your favorite pastimes, sports, and leisure activities.",
    imageUrl: "",
    iconName: "MdSportsEsports",
    difficultyLevel: "all",
    tags: ["leisure", "sports", "personal"]
  },
  {
    name: "Shopping Scenarios",
    description: "Practice conversations related to shopping for clothes, groceries, etc.",
    imageUrl: "",
    iconName: "MdShoppingCart",
    difficultyLevel: "beginner",
    tags: ["shopping", "daily life"]
  },
  {
    name: "Current Events",
    description: "Discuss recent news and important happenings around the world.",
    imageUrl: "",
    iconName: "MdArticle",
    difficultyLevel: "advanced",
    tags: ["news", "discussion", "world affairs"]
  }
];

async function seedDB() {
  try {
    console.log(`Attempting to connect to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding categories.');

    // Optional: Clear existing categories first if you want to start fresh each time
    // console.log('Clearing existing categories...');
    // await Category.deleteMany({});
    // console.log('Existing categories cleared.');

    console.log(`Attempting to seed ${categoriesToSeed.length} categories...`);

    // Using a loop with try-catch to avoid stopping on duplicate key errors if not clearing
    let seededCount = 0;
    let skippedCount = 0;
    for (const categoryData of categoriesToSeed) {
      try {
        // Check if category with the same name already exists
        const existingCategory = await Category.findOne({ name: categoryData.name });
        if (existingCategory) {
          console.log(`Category "${categoryData.name}" already exists. Skipping.`);
          skippedCount++;
        } else {
          await Category.create(categoryData);
          console.log(`Category "${categoryData.name}" seeded.`);
          seededCount++;
        }
      } catch (err) {
        if (err.code === 11000) { // Duplicate key error
          console.warn(`Warning: Category "${categoryData.name}" already exists (caught duplicate key error). Skipping.`);
          skippedCount++;
        } else {
          throw err; // Re-throw other errors
        }
      }
    }

    console.log(`Seeding complete. ${seededCount} categories added, ${skippedCount} categories skipped (already existed).`);

  } catch (error) {
    console.error("Error during category seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected after seeding.');
  }
}

seedDB();
