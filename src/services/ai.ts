import type { Message } from '../types/chat';

// 使用 Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// 使用更稳定的 gemini-1.5-flash 模型
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// 添加重试逻辑的辅助函数
async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 429 && response.status !== 500 && response.status !== 503) {
        // 如果不是限流或服务器错误，直接返回
        return response;
      }
      // 如果是限流或服务器错误，等待后重试
      const retryAfter = response.headers.get('retry-after');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : (i + 1) * 1000;
      console.log(`Retrying after ${waitTime}ms due to status ${response.status}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
      lastError = error as Error;
      if (i < maxRetries - 1) {
        // 等待一段时间后重试
        const waitTime = (i + 1) * 1000;
        console.log(`Retrying after ${waitTime}ms due to network error`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Maximum retries reached');
}

export async function getAIResponse(messages: Message[], topic: string): Promise<string> {
  console.log(`Getting AI response for ${messages.length} messages on topic: "${topic}"`);
  const startTime = Date.now();
  try {
    // 构造 Gemini 对话历史
    const systemPrompt = `You are a friendly English conversation partner helping with daily small talk. The current topic is: ${topic}.

Your task is to generate 5 natural conversation pairs (question and response) related to this topic, suitable for casual daily interactions between friends or colleagues. Each conversation should feel like it's happening in common social situations like:
- Waiting for the elevator
- Standing in line at a coffee shop
- Morning greetings at work
- Casual lunch break chat
- After-work social time

Requirements:
1. Generate exactly 5 different question-response pairs
2. Use a conversational, friendly tone (not too formal, not too casual)
3. Make responses sound natural, like real people talking
4. Include some common expressions and light idioms where appropriate
5. Each pair should explore a different aspect of the topic
6. Keep responses concise and engaging

Format your response in this exact structure:
[CONV1]
Q: (first question)
A: (natural response)

[CONV2]
Q: (second question)
A: (natural response)

[CONV3]
Q: (third question)
A: (natural response)

[CONV4]
Q: (fourth question)
A: (natural response)

[CONV5]
Q: (fifth question)
A: (natural response)

Remember: The goal is to help users practice natural English conversation and feel confident in everyday small talk situations.`;

    // 构建请求体
      const requestBody = {
        contents: [],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000
        }
      };

    // 使用系统提示和用户第一条消息来构建初始对话
    // 这种方式更符合 Gemini API 的预期格式
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    
    if (firstUserMessage) {
      // 如果有用户消息，将系统提示与第一条用户消息合并
      requestBody.contents.push({
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser's message: ${firstUserMessage.text}` }]
      });
      
      // 过滤掉已处理的第一条用户消息
      const remainingMessages = messages.filter(msg => msg !== firstUserMessage);
      
      // 添加剩余的对话历史
      remainingMessages.forEach(msg => {
        requestBody.contents.push({
          role: msg.sender === 'user' ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    } else {
      // 如果没有用户消息，只添加系统提示
      requestBody.contents.push({
        role: "user",
        parts: [{ text: systemPrompt }]
      });
    }

    console.log('Sending request to Gemini API:', JSON.stringify(requestBody, null, 2));
    console.log('Gemini API Key:', GEMINI_API_KEY);
    console.log('Gemini API URL:', GEMINI_API_URL);

    // 使用重试机制发送请求
    console.log('Sending request to Gemini API with retry mechanism');
    const response = await fetchWithRetry(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorMessage = `Gemini API error (${response.status})`;
      try {
        const errorData = await response.json();
        console.error('Gemini API error response:', JSON.stringify(errorData, null, 2));
        
        // 提取详细错误信息
        if (errorData.error) {
          errorMessage += `: ${errorData.error.message || 'Unknown error'}`;
          if (errorData.error.details) {
            errorMessage += ` (${JSON.stringify(errorData.error.details)})`;
          }
        }
      } catch (e) {
        // 如果无法解析为 JSON，则尝试获取文本
        const errorText = await response.text();
        console.error('Gemini API error text:', errorText);
        errorMessage += `: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }
    const result = data.candidates[0].content.parts[0].text.trim();
    const endTime = Date.now();
    console.log(`AI response generated successfully in ${endTime - startTime}ms`);
    console.log('Raw API response:', result);
    return result;
  } catch (error) {
    const endTime = Date.now();
    console.error(`Error getting AI response after ${endTime - startTime}ms:`, error);
    
    // 记录更详细的错误信息
    if (error instanceof Response || (error && typeof error === 'object' && 'status' in error)) {
      console.error(`API responded with status: ${error.status}`);
      try {
        const errorText = await error.text();
        console.error('Error response body:', errorText);
      } catch (e) {
        console.error('Could not read error response body');
      }
    }
    
    // 降级策略：如果 API 调用失败，返回一个友好的错误消息
    // 这样应用程序可以继续运行，而不是完全崩溃
    if (messages.length > 0) {
      return "I'm sorry, I'm having trouble connecting to my language service right now. Could you please try again in a moment? In the meantime, let's continue our conversation.";
    } else {
      throw error; // 如果是初始消息，仍然抛出错误，因为我们需要一个有效的响应来开始对话
    }
  }
} 