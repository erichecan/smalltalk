#!/usr/bin/env node

// 检查Supabase conversation_history表的数据分析脚本
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 从环境变量读取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少必要的环境变量：VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY');
  console.error('请确保 .env 文件中包含这些配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeConversationHistory() {
  console.log('🔍 开始检查 conversation_history 表...\n');

  try {
    // 1. 获取最近的10条记录，按创建时间倒序
    console.log('📊 查询最近的记录...');
    const { data: recentRecords, error: recentError } = await supabase
      .from('conversation_history')
      .select('id, user_id, topic, messages, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('❌ 查询最近记录失败:', recentError);
      return;
    }

    console.log(`\n📋 找到 ${recentRecords?.length || 0} 条最近记录:\n`);

    // 分析每条记录
    const recordAnalysis = [];
    recentRecords?.forEach((record, index) => {
      const messagesCount = Array.isArray(record.messages) ? record.messages.length : 0;
      const messagesLength = JSON.stringify(record.messages).length;
      const createdAt = new Date(record.created_at);
      
      const analysis = {
        index: index + 1,
        id: record.id,
        user_id: record.user_id,
        topic: record.topic,
        created_at: createdAt.toLocaleString('zh-CN', { 
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        messages_count: messagesCount,
        messages_length: messagesLength,
        messages_structure: getMessagesStructure(record.messages)
      };
      
      recordAnalysis.push(analysis);
      
      console.log(`🔹 记录 ${index + 1}:`);
      console.log(`   ID: ${record.id}`);
      console.log(`   用户ID: ${record.user_id}`);
      console.log(`   主题: ${record.topic}`);
      console.log(`   创建时间: ${analysis.created_at}`);
      console.log(`   消息数量: ${messagesCount}`);
      console.log(`   消息总长度: ${messagesLength} 字符`);
      console.log(`   消息结构: ${analysis.messages_structure}`);
      console.log('');
    });

    // 2. 查找相同topic的记录
    console.log('🔍 检查相同主题的重复记录...\n');
    
    const topicGroups = {};
    recentRecords?.forEach(record => {
      if (!topicGroups[record.topic]) {
        topicGroups[record.topic] = [];
      }
      topicGroups[record.topic].push(record);
    });

    let duplicatesFound = false;
    Object.entries(topicGroups).forEach(([topic, records]) => {
      if (records.length > 1) {
        duplicatesFound = true;
        console.log(`⚠️  发现相同主题的多条记录: "${topic}"`);
        console.log(`   共有 ${records.length} 条记录:`);
        
        records.forEach((record, index) => {
          const createdAt = new Date(record.created_at);
          const messagesCount = Array.isArray(record.messages) ? record.messages.length : 0;
          console.log(`   ${index + 1}. ID: ${record.id}, 创建时间: ${createdAt.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}, 消息数: ${messagesCount}`);
        });
        console.log('');
      }
    });

    if (!duplicatesFound) {
      console.log('✅ 在最近的记录中未发现相同主题的重复记录\n');
    }

    // 3. 按用户分组分析
    console.log('👥 按用户分组分析...\n');
    const userGroups = {};
    recentRecords?.forEach(record => {
      if (!userGroups[record.user_id]) {
        userGroups[record.user_id] = [];
      }
      userGroups[record.user_id].push(record);
    });

    Object.entries(userGroups).forEach(([userId, records]) => {
      console.log(`👤 用户 ${userId}:`);
      console.log(`   记录数量: ${records.length}`);
      
      // 检查时间间隔
      if (records.length > 1) {
        const sortedRecords = records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const timeGaps = [];
        for (let i = 0; i < sortedRecords.length - 1; i++) {
          const gap = new Date(sortedRecords[i].created_at) - new Date(sortedRecords[i + 1].created_at);
          timeGaps.push(Math.round(gap / 1000)); // 转换为秒
        }
        console.log(`   时间间隔: ${timeGaps.join(', ')} 秒`);
        
        // 检查是否有短时间内创建的记录（可能是重复创建）
        const shortGaps = timeGaps.filter(gap => gap < 60); // 小于60秒
        if (shortGaps.length > 0) {
          console.log(`   ⚠️  发现短时间间隔: ${shortGaps.join(', ')} 秒 - 可能存在重复创建`);
        }
      }
      console.log('');
    });

    // 4. 总体统计
    console.log('📈 总体统计:\n');
    const totalRecords = recentRecords?.length || 0;
    const uniqueUsers = Object.keys(userGroups).length;
    const uniqueTopics = Object.keys(topicGroups).length;
    const avgMessagesPerRecord = totalRecords > 0 
      ? (recordAnalysis.reduce((sum, r) => sum + r.messages_count, 0) / totalRecords).toFixed(1)
      : 0;

    console.log(`📊 记录总数: ${totalRecords}`);
    console.log(`👥 用户数量: ${uniqueUsers}`);
    console.log(`📝 主题数量: ${uniqueTopics}`);
    console.log(`💬 平均消息数: ${avgMessagesPerRecord}`);

    // 5. 检查具体的消息内容对比（针对相同主题的记录）
    if (duplicatesFound) {
      console.log('\n🔍 详细内容对比分析:\n');
      
      Object.entries(topicGroups).forEach(([topic, records]) => {
        if (records.length > 1) {
          console.log(`📋 主题 "${topic}" 的内容对比:`);
          
          records.forEach((record, index) => {
            console.log(`\n   记录 ${index + 1} (ID: ${record.id}):`);
            console.log(`   创建时间: ${new Date(record.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
            
            if (Array.isArray(record.messages)) {
              console.log(`   消息内容:`);
              record.messages.forEach((msg, msgIndex) => {
                const preview = JSON.stringify(msg).substring(0, 100) + (JSON.stringify(msg).length > 100 ? '...' : '');
                console.log(`     ${msgIndex + 1}. ${msg.role}: ${preview}`);
              });
            } else {
              console.log(`   消息内容: ${JSON.stringify(record.messages).substring(0, 200)}`);
            }
          });
          console.log('\n' + '='.repeat(80) + '\n');
        }
      });
    }

  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error);
  }
}

function getMessagesStructure(messages) {
  if (!Array.isArray(messages)) {
    return '非数组格式';
  }
  
  if (messages.length === 0) {
    return '空数组';
  }
  
  const roles = messages.map(msg => msg.role || '未知角色');
  const roleCount = {};
  roles.forEach(role => {
    roleCount[role] = (roleCount[role] || 0) + 1;
  });
  
  return Object.entries(roleCount)
    .map(([role, count]) => `${role}:${count}`)
    .join(', ');
}

// 运行分析
analyzeConversationHistory()
  .then(() => {
    console.log('✅ 分析完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 分析失败:', error);
    process.exit(1);
  });