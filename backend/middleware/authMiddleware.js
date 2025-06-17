const admin = require('../firebaseAdmin'); // Adjust path if your file structure is different

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided or incorrect format.');
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Check if Firebase Admin SDK initialized properly, especially if using placeholder credentials
    if (!admin.apps.length || !admin.auth) {
        // This check is important if firebaseAdmin.js might not initialize admin due to placeholder keys
        console.error('Firebase Admin SDK not initialized properly. Cannot verify token.');
        // If using placeholders, this path will likely be taken.
        // For a real app, strict failure is better. For this setup, we might simulate a user.
        if (process.env.FIREBASE_PROJECT_ID === "PLACEHOLDER_FIREBASE_PROJECT_ID") {
            console.warn("Auth Middleware: Using placeholder user due to placeholder Firebase credentials.");
            req.user = { uid: "placeholder_user_id", email: "user@example.com", name: "Placeholder User" };
            return next();
        }
        return res.status(500).send('Server Error: Firebase Admin SDK not available for authentication.');
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Add Firebase user object (decoded token) to request
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    // Specific error handling based on Firebase error codes can be more granular
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).send('Unauthorized: Token expired');
    }
    if (error.code === 'auth/argument-error') {
        // This can happen if the token is malformed or if SDK didn't init due to bad cert
         console.error('Auth Middleware: Firebase token verification failed. This might be due to placeholder credentials or an invalid token.', error.message);
         // If we are in placeholder mode, allow passage with a mock user
         if (process.env.FIREBASE_PROJECT_ID === "PLACEHOLDER_FIREBASE_PROJECT_ID") {
            console.warn("Auth Middleware: Using placeholder user due to Firebase token verification error with placeholder credentials.");
            req.user = { uid: "placeholder_user_id_on_error", email: "user_error@example.com", name: "Placeholder User (on error)" };
            return next();
         }
    }
    return res.status(403).send('Unauthorized: Invalid token');
  }
};
