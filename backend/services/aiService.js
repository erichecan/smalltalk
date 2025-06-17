// Ensure dotenv is configured, typically in server.js, to load .env variables
// require('dotenv').config(); // No need if already done in server.js

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// The specific model might change, consider making it configurable too if needed
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'; // Updated to gemini-1.5-flash as 2.0 isn't a known model.

/**
 * Gets an AI response from the Gemini API.
 * @param {Array<{sender: 'user' | 'ai', text: string}>} messages - The history of messages in the conversation.
 * @param {string} topic - The current topic of conversation.
 * @returns {Promise<string>} A promise that resolves to the AI's response text.
 * @throws Will throw an error if the API request fails or the response is invalid.
 */
async function getAIResponse(messages, topic) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here" || GEMINI_API_KEY === "PLACEHOLDER_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured or is using a placeholder. Returning a mock AI response.");
    // Provide a mock response for development if API key is not set
    return `This is a mock AI response about ${topic}. User said: "${messages.length > 0 ? messages[messages.length-1].text : ''}"`;
  }

  try {
    // Construct conversation history for Gemini API
    // The prompt structure might need adjustment based on Gemini's best practices.
    // This is a simplified version.
    const contents = [
      // System/Initial Prompt (if Gemini supports a 'system' role or similar for overall instructions)
      // For gemini-1.5-flash, the first message can set the context.
      {
        role: "user", // Or 'system' if supported and preferred for instructions
        parts: [{
          text: `You are a friendly and helpful English conversation partner.
The current topic of conversation is: "${topic}".
Your main goal is to help the user practice their English conversation skills.
Keep your responses natural, engaging, and directly related to the topic.
Use common English expressions, phrasings, and idioms where appropriate.
If the user makes grammatical mistakes or awkward phrasings, gently correct them or suggest a more natural way to say it,
but do so without disrupting the flow of conversation too much. Explain the correction briefly if it's a common mistake.
Focus on being encouraging and making the practice session enjoyable.
Do not break character. Do not mention you are an AI.
Do not use markdown in your responses.
Keep your responses concise, typically 1-3 sentences, unless more detail is needed to be engaging.`
        }]
      },
      // Add a "model" response to kickstart the conversation after the initial prompt
      {
        role: "model", // Or 'assistant'
        parts: [{ text: `Okay, I understand! Let's talk about ${topic}. What are your first thoughts on this?` }]
      },
      // Map existing messages
      ...messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model', // 'model' for AI's previous responses
        parts: [{ text: msg.text }]
      }))
    ];

    // Construct the full URL with the API key
    const fullUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }) // Correctly pass contents array
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Gemini API error: ${response.statusText}. Details: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response structure from Gemini API:', data);
      throw new Error('Invalid response from Gemini API: No text part found.');
    }
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error getting AI response from Gemini:', error);
    // Fallback or re-throw
    // For now, re-throwing to be handled by the route
    throw error;
  }
}

module.exports = { getAIResponse };
