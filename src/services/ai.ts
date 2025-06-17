import type { Message } from '../types/chat';

// 使用 Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function getAIResponse(messages: Message[], topic: string): Promise<string> {
  try {
    // 构造 Gemini 对话历史
    const contents = [
      {
        parts: [{
          text: `You are a friendly English conversation partner. The current topic is: ${topic}.
Your goal is to help the user practice English conversation.
Keep your responses natural, engaging, and focused on the topic.
Use appropriate English expressions and idioms.
If the user makes any mistakes, gently correct them while maintaining the conversation flow.`
        }]
      },
      ...messages.map(msg => ({
        parts: [{ text: (msg.sender === 'user' ? 'User: ' : 'Assistant: ') + msg.text }]
      }))
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
} 