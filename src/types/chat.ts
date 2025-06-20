export interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  bubbleColor?: string; // 可选属性，用于存储AI消息气泡的背景颜色
} 