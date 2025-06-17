export interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
} 