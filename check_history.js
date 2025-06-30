// 检查用户历史记录的脚本
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUserHistory() {
  try {
    // 查询所有conversation_history记录
    const { data, error, count } = await supabase
      .from('conversation_history')
      .select('id, user_id, topic, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查询错误:', error);
      return;
    }

    console.log('📊 数据库历史记录状态:');
    console.log('总记录数:', count);
    
    if (data && data.length > 0) {
      console.log('\n📝 现有记录:');
      data.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id.substring(0, 8)}...`);
        console.log(`   用户ID: ${record.user_id.substring(0, 8)}...`);
        console.log(`   话题: ${record.topic}`);
        console.log(`   创建时间: ${new Date(record.created_at).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('✅ 数据库中没有任何历史记录');
    }

    // 按用户ID分组统计
    const userGroups = data?.reduce((acc, record) => {
      const userId = record.user_id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(record);
      return acc;
    }, {}) || {};

    console.log('👥 按用户分组统计:');
    Object.entries(userGroups).forEach(([userId, records]) => {
      console.log(`用户 ${userId.substring(0, 8)}...: ${records.length} 条记录`);
    });

  } catch (err) {
    console.error('检查失败:', err);
  }
}

checkUserHistory();