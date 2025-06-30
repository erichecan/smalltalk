import { supabase } from './supabase';
import type { Message } from '../types/chat';

interface SaveConversationParams {
  user_id: string;
  topic: string;
  messages: Message[];
}

export async function saveConversationHistory({ user_id, topic, messages }: SaveConversationParams) {
  return supabase.from('conversation_history').insert([
    { user_id, topic, messages }
  ]);
}

export async function getConversationHistory(user_id: string, page = 1, pageSize = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // 获取总数
  const { count } = await supabase
    .from('conversation_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id);

  // 获取分页数据
  const { data, error } = await supabase
    .from('conversation_history')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data, error, count };
}

export async function getConversationById(id: string) {
  return supabase
    .from('conversation_history')
    .select('*')
    .eq('id', id)
    .single();
}

export async function updateConversationHistory(id: string, messages: Message[]) {
  console.log('[DEBUG] updateConversationHistory called with:', id, messages);
  const res = await supabase
    .from('conversation_history')
    .update({ messages })
    .eq('id', id);
  console.log('[DEBUG] updateConversationHistory result:', res);
  return res;
}

export async function deleteConversationHistory(id: string) {
  return supabase
    .from('conversation_history')
    .delete()
    .eq('id', id);
}

export async function deleteMultipleConversations(ids: string[]) {
  return supabase
    .from('conversation_history')
    .delete()
    .in('id', ids);
} 