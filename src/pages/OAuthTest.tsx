// OAuth测试页面 - 测试和调试OAuth配置 - 2025-01-13 23:52:00
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Alert, Divider } from '@mui/material';
import { OAUTH_CONFIG } from '../config/oauth';

const OAuthTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');

  const runOAuthTest = async () => {
    setTestResult('🚀 开始OAuth测试...\n');
    
    try {
      // 测试环境检测
      setTestResult(prev => prev + `📍 当前环境: ${OAUTH_CONFIG.ENVIRONMENT.IS_LOCAL ? '本地开发' : '生产环境'}\n`);
      setTestResult(prev => prev + `🌐 当前域名: ${window.location.hostname}\n`);
      setTestResult(prev => prev + `🔗 当前URL: ${window.location.href}\n`);
      
      // 显示配置信息
      setTestResult(prev => prev + '\n📋 OAuth配置信息:\n');
      setTestResult(prev => prev + `🔑 Google Client ID: ${OAUTH_CONFIG.GOOGLE.CLIENT_ID}\n`);
      setTestResult(prev => prev + `🌐 Supabase URL: ${OAUTH_CONFIG.SUPABASE.URL}\n`);
      
      // 显示Google Cloud Console配置要求
      setTestResult(prev => prev + '\n🔧 Google Cloud Console配置要求:\n');
      setTestResult(prev => prev + '1. 在"Authorized JavaScript origins"中添加:\n');
      OAUTH_CONFIG.GOOGLE.GOOGLE_CLOUD_CONFIG.JAVASCRIPT_ORIGINS.forEach(origin => {
        setTestResult(prev => prev + `   - ${origin}\n`);
      });
      
      setTestResult(prev => prev + '\n2. 在"Authorized redirect URLs"中添加:\n');
      setTestResult(prev => prev + `   - ${OAUTH_CONFIG.GOOGLE.GOOGLE_CLOUD_CONFIG.REDIRECT_URL}\n`);
      setTestResult(prev => prev + '   - http://localhost:5173/auth/callback\n');
      setTestResult(prev => prev + '   - https://smalltalking.netlify.app/auth/callback\n');
      
      setTestResult(prev => prev + '\n⚠️ 重要提醒:\n');
      setTestResult(prev => prev + '• 必须添加所有3个重定向URL，否则会出现redirect_uri_mismatch错误\n');
      setTestResult(prev => prev + '• 确保URL完全一致，包括协议(http/https)和路径\n');
      setTestResult(prev => prev + '• 添加后可能需要几分钟才能生效\n');
      
      setTestResult(prev => prev + '\n✅ OAuth测试完成！\n');
      setTestResult(prev => prev + '📝 请确保Google Cloud Console中的配置与上述信息一致\n');
      
    } catch (error) {
      setTestResult(prev => prev + `❌ OAuth测试失败: ${error}\n`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 OAuth配置测试页面
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          配置说明
        </Typography>
        <Typography paragraph>
          根据Supabase官方文档，Google OAuth需要正确的配置才能工作。
          这个页面会显示所有必要的配置信息。
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={runOAuthTest}
          sx={{ mb: 2 }}
        >
          🚀 运行OAuth测试
        </Button>
        
        {testResult && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              测试结果
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {testResult}
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 重要提醒
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          1. 确保Google Cloud Console中的Client ID与代码中的一致
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          2. 在"Authorized redirect URLs"中必须添加<strong>所有3个URL</strong>：
        </Typography>
        <Box sx={{ ml: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" component="div">
            • https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            • http://localhost:5173/auth-callback
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            • https://smalltalking.netlify.app/auth-callback
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          3. 如果出现"redirect_uri_mismatch"错误，说明重定向URL配置不正确
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          4. 不要在代码中自定义重定向URL，让Supabase处理完整的OAuth流程
        </Typography>
      </Paper>
    </Box>
  );
};

export default OAuthTest;
