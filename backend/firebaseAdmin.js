const admin = require('firebase-admin');

// IMPORTANT: In a real environment, the service account key would be securely managed.
// For this subtask, we'll use environment variables for project ID, client email, and private key.
// Ensure these (PLACEHOLDER_*) are defined in a .env file or passed directly.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "PLACEHOLDER_FIREBASE_PROJECT_ID",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "PLACEHOLDER_FIREBASE_CLIENT_EMAIL",
  // The private key needs newlines to be correctly interpreted.
  // When stored in .env, it's often a single line with '\n' literals.
  // Here, we ensure those literals are converted to actual newline characters.
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "PLACEHOLDER_FIREBASE_PRIVATE_KEY").replace(/\\n/g, '\n'),
};

try {
  if (serviceAccount.projectId === "PLACEHOLDER_FIREBASE_PROJECT_ID") {
    console.warn("Firebase Admin SDK is using PLACEHOLDER credentials. Real functionality will be limited.");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
  // In a real app, you might want to exit if Firebase Admin fails to initialize,
  // especially if Firebase is critical for core functionality like auth.
  // For this setup, we'll log the error and continue, as some parts of the backend
  // (e.g., basic CRUD without auth) might still be testable.
}

module.exports = admin;
