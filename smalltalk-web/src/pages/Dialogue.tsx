import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { callGemini } from '../services/ai_service'; // (假设 callGemini 函数在 ai_service 中实现，传入 topic 或 full context 并返回 AI 回复)
import BottomNav from '../components/BottomNav';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';

const Dialogue: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const [context, setContext] = React.useState<string>("");

  useEffect(() => {
    // 页面加载时，从 localStorage 读取当前话题，并调用 Gemini 生成回复
    const currentTopic = localStorage.getItem('currentTopic');
    if (currentTopic) {
      setTopic(currentTopic);
      callGemini(currentTopic).then((reply) => {
        setMessages([{ text: reply, isUser: false }]);
      }).catch((err) => { console.error('AI reply error:', err); });
    } else {
      // 若未找到话题，可跳转回 TopicInput 页面
      navigate('/topic');
    }
  }, [navigate]);

  const handleSendMessage = async (text: string) => {
    const newContext = context + (context ? "\n" : "") + "User: " + text;
    setContext(newContext);
    setMessages((prev) => [...prev, { text, sender: "user" }]);
    try {
      const aiReply = await callGemini(newContext);
      setMessages((prev) => [...prev, { text: aiReply, sender: "ai" }]);
    } catch (e) { console.error("AI reply error:", e); }
  };

  return (
    <div>
      <div style={{ paddingBottom: '60px' }}>
        {messages.map((msg, i) => ( < ChatBubble key={i} message={msg} / > )) }
      </div>
      < ChatInput onSendMessage={handleSendMessage} / >
      < BottomNav / >
    </div>
  );
};

export default Dialogue; 