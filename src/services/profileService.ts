// Define the UserProfileData interface based on the backend model
export interface UserProfileData {
  userId: string; // Firebase User ID
  nativeLanguage?: string;
  learningGoals?: string[];
  interests?: string[];
  createdAt?: string; // Date as string from JSON
  updatedAt?: string; // Date as string from JSON
  _id?: string; // MongoDB typically adds an _id field
  __v?: number; // Mongoose version key
}

// Use Vite's import.meta.env for environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

/**
 * Fetches the user profile from the backend.
 * @param idToken Firebase ID token for authorization.
 * @returns A promise that resolves to the user's profile data.
 * @throws An error if the fetch operation fails or the server returns a non-ok response.
 */
export async function getUserProfile(idToken: string): Promise<UserProfileData> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      errorData = { message: response.statusText };
    }
    throw new Error(errorData.message || `Failed to fetch user profile. Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Saves (creates or updates) the user profile on the backend.
 * @param idToken Firebase ID token for authorization.
 * @param profileData Partial user profile data to be saved.
 * @returns A promise that resolves to the saved (and possibly updated by backend) profile data.
 * @throws An error if the save operation fails or the server returns a non-ok response.
 */
export async function saveUserProfile(idToken: string, profileData: Partial<UserProfileData>): Promise<UserProfileData> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData.message || `Failed to save user profile. Status: ${response.status}`);
  }
  return response.json();
}
