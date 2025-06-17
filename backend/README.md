# SpeakFlow Backend

This directory contains the Node.js Express backend for the SpeakFlow application. It handles user profiles and potentially other future API services.

## Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install Dependencies:**
    If you haven't already, or if dependencies have changed:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   Edit the `.env` file and provide the necessary values for:
        *   `MONGODB_URI`: Your MongoDB connection string.
        *   `FIREBASE_PROJECT_ID`: Your Firebase Project ID.
        *   `FIREBASE_CLIENT_EMAIL`: Your Firebase service account client email.
        *   `FIREBASE_PRIVATE_KEY`: Your Firebase service account private key. Ensure newlines are properly escaped (e.g., `\n`) or the key is a single line if your `.env` parser supports it. The application currently expects `\n` literals to be replaced with actual newlines.
        *   `PORT`: The port on which the server should run (defaults to 5001).

    *Note: For development with placeholder Firebase credentials, the authentication middleware will use a mock user. Full Firebase authentication will not work without valid credentials.*

4.  **Start the Server:**
    ```bash
    npm start
    ```
    The server should now be running on the port specified in your `.env` file (e.g., http://localhost:5001).

## API Endpoints

*   **User Profile:** `/api/profile`
    *   `GET /`: Fetches the profile of the authenticated user.
    *   `POST /`: Creates or updates the profile of the authenticated user.

## Project Structure

*   `server.js`: Main Express application file, initializes server, DB connection, and middleware.
*   `firebaseAdmin.js`: Initializes the Firebase Admin SDK.
*   `models/`: Contains Mongoose schema definitions.
    *   `UserProfile.js`: Schema for user profiles.
*   `middleware/`: Contains custom middleware.
    *   `authMiddleware.js`: Verifies Firebase ID tokens for authenticating requests.
*   `routes/`: Contains route definitions for different API resources.
    *   `profileRoutes.js`: Routes for user profile CRUD operations.
*   `.env`: Environment variable configuration (gitignored).
*   `.env.example`: Example environment file.
*   `package.json`: Project dependencies and scripts.
*   `README.md`: This file.
