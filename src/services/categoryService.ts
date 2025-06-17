// Defines the structure of Category data based on the backend model
export interface CategoryData {
  _id: string; // MongoDB default ID field
  name: string;
  description: string;
  imageUrl?: string;
  iconName?: string; // For MUI icon names or similar
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  tags: string[];
  createdAt?: string; // Dates are typically strings in JSON
}

// Use Vite's import.meta.env for environment variables, with a fallback for other environments
const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL)
                     || 'http://localhost:5001/api';

/**
 * Fetches all categories from the backend.
 * @returns A promise that resolves to an array of CategoryData.
 * @throws An error if the fetch operation fails or the server returns a non-ok response.
 */
export async function getCategories(): Promise<CategoryData[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      errorData = { message: response.statusText };
    }
    console.error('Failed to fetch categories:', errorData);
    throw new Error(errorData?.message || `Failed to fetch categories. Status: ${response.status}`);
  }
  return response.json();
}
