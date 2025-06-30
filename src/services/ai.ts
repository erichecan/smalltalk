import type { Message } from '../types/chat';
import { GEMINI_API_KEY } from '../env';

// 使用统一的环境变量适配器
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
    // 2025-01-29 20:07:15 修复多轮对话提示词逻辑
    // 问题：多轮对话时完全改变了系统提示词，导致失去原始话题上下文
    // 修复：保持原始的话题上下文，只在多轮时添加"只返回一句回复"的指令
    let systemPrompt = '';
    const basePrompt = `You are a friendly English conversation partner helping with daily small talk. The current topic is: ${topic}.`;
    
    if (messages.length === 0) {
      // 首次：生成5轮对话
      systemPrompt = `${basePrompt}
\nYour task is to generate 5 natural conversation pairs (question and response) related to this topic, suitable for casual daily interactions between friends or colleagues. Each conversation should feel like it's happening in common social situations like:\n- Waiting for the elevator\n- Standing in line at a coffee shop\n- Morning greetings at work\n- Casual lunch break chat\n- After-work social time\n\nRequirements:\n1. Generate exactly 5 different question-response pairs\n2. Use a conversational, friendly tone (not too formal, not too casual)\n3. Make responses sound natural, like real people talking\n4. Include some common expressions and light idioms where appropriate\n5. Each pair should explore a different aspect of the topic\n6. Keep responses concise and engaging\n\nFormat your response in this exact structure:\n[CONV1]\nQ: (first question)\nA: (natural response)\n\n[CONV2]\nQ: (second question)\nA: (natural response)\n\n[CONV3]\nQ: (third question)\nA: (natural response)\n\n[CONV4]\nQ: (fourth question)\nA: (natural response)\n\n[CONV5]\nQ: (fifth question)\nA: (natural response)\n\nRemember: The goal is to help users practice natural English conversation and feel confident in everyday small talk situations.`;
    } else {
      // 多轮：继续当前话题，只返回一句回复
      systemPrompt = `${basePrompt}
\nYou are continuing a conversation about this topic. Reply to the user's latest message in a natural, friendly, and concise way, as if you are having a real conversation with a friend or colleague. 

Important instructions:
- Only return ONE conversational reply (not multiple pairs)
- Stay focused on the current topic: ${topic}
- Keep the conversation natural and engaging
- Do not repeat previous content
- Respond as if you're genuinely interested in the conversation`;
    }

    // 构建请求体
    const requestBody: {
      contents: Array<{
        role: string;
        parts: Array<{ text: string }>;
      }>;
      generationConfig: {
        temperature: number;
        topK: number;
        topP: number;
        maxOutputTokens: number;
      };
    } = {
      contents: [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000
      }
    };

    // 2025-01-29 20:07:30 优化多轮对话的上下文构建
    // 对于多轮对话，我们需要提供完整的对话历史给AI，让它理解上下文
    if (messages.length === 0) {
      // 首次调用：只发送系统提示
      requestBody.contents.push({
        role: "user",
        parts: [{ text: systemPrompt }]
      });
    } else {
      // 多轮调用：先发送系统提示，然后发送完整的对话历史
      requestBody.contents.push({
        role: "user",
        parts: [{ text: systemPrompt }]
      });
      
      // 添加对话历史，让AI理解上下文
      messages.forEach(msg => {
        requestBody.contents.push({
          role: msg.sender === 'user' ? "user" : "model",
          parts: [{ text: msg.text }]
        });
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
      console.error(`API responded with status: ${(error as any).status}`);
      try {
        const errorText = await (error as Response).text();
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