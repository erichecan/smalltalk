import type { Message } from '../types/chat'; // Assuming this type is compatible

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export interface StartDialogueResponse {
  sessionId: string;
  topic: string;
  startTime: string;
  initialMessage: Message;
}

export interface PostMessageResponse extends Message {
  // Backend might return the full message object including _id, timestamp
}

// Interface for the Dialogue Session data from the backend
export interface DialogueSessionData {
  _id: string;
  topic: string;
  startTime: string; // Dates are typically strings from JSON
  lastActivityTime: string; // Dates are typically strings from JSON
  status: 'active' | 'completed' | 'abandoned';
  // Add other fields if you included them in the backend response,
  // e.g., messageCount, lastMessageText
}

/**
 * Starts a new dialogue session with the backend.
 * @param idToken Firebase ID token for authorization.
 * @param topic The topic for the new dialogue session.
 * @returns A promise that resolves to the session ID and the initial AI message.
 */
export async function startDialogue(idToken: string, topic: string): Promise<StartDialogueResponse> {
  const response = await fetch(`${API_BASE_URL}/dialogue/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to start dialogue. Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches all dialogue sessions for the current authenticated user.
 * @param idToken Firebase ID token for authorization.
 * @returns A promise that resolves to an array of dialogue session data.
 * @throws An error if the fetch operation fails or the server returns a non-ok response.
 */
export async function getMyDialogueSessions(idToken: string): Promise<DialogueSessionData[]> {
  const response = await fetch(`${API_BASE_URL}/dialogue/sessions/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('Failed to fetch dialogue sessions:', errorData);
    throw new Error(errorData?.message || `Failed to fetch dialogue sessions. Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Posts a user's message to an ongoing dialogue session.
 * @param idToken Firebase ID token for authorization.
 * @param sessionId The ID of the current dialogue session.
 * @param text The text of the user's message.
 * @returns A promise that resolves to the AI's reply message.
 */
export async function postMessage(idToken: string, sessionId: string, text: string): Promise<PostMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/dialogue/${sessionId}/message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to post message. Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Retrieves the full conversation history for a given dialogue session.
 * @param idToken Firebase ID token for authorization.
 * @param sessionId The ID of the dialogue session.
 * @returns A promise that resolves to an array of messages.
 */
export async function getConversationHistory(idToken: string, sessionId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/dialogue/${sessionId}/history`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to fetch conversation history. Status: ${response.status}`);
  }
  return response.json();
}
