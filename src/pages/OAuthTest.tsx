// OAuth测试页面 - 帮助调试和验证OAuth配置 - 2025-01-13 23:52:00
import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Box, Alert } from '@mui/material';
import { OAUTH_CONFIG, getCurrentRedirectUrl, validateOAuthConfig, buildGoogleOAuthUrl } from '../config/oauth';

const OAuthTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runOAuthTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addTestResult('🧪 开始OAuth配置测试...');
      
      // 测试1: 环境检测
      addTestResult(`📍 当前环境: ${JSON.stringify(OAUTH_CONFIG.ENVIRONMENT)}`);
      
      // 测试2: 配置验证
      const isValid = validateOAuthConfig();
      addTestResult(`✅ 配置验证: ${isValid ? '通过' : '失败'}`);
      
      // 测试3: 重定向URL
      const redirectUrl = getCurrentRedirectUrl();
      addTestResult(`🔄 重定向URL: ${redirectUrl}`);
      
      // 测试4: Google OAuth URL构建
      const googleOAuthUrl = buildGoogleOAuthUrl();
      addTestResult(`🔗 Google OAuth URL: ${googleOAuthUrl}`);
      
      // 测试5: 检查localhost:3000问题
      const hasLocalhost3000 = googleOAuthUrl.includes('localhost:3000');
      addTestResult(`🚨 localhost:3000检测: ${hasLocalhost3000 ? '发现' : '未发现'}`);
      
      // 测试6: 端口检测
      const currentPort = window.location.port || '5173';
      addTestResult(`🔌 当前端口: ${currentPort}`);
      
      // 测试7: 域名检测
      const currentHostname = window.location.hostname;
      addTestResult(`🌐 当前域名: ${currentHostname}`);
      
      addTestResult('🎉 OAuth配置测试完成！');
      
    } catch (error) {
      addTestResult(`❌ 测试过程中发生错误: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleOAuth = () => {
    addTestResult('🚀 测试Google OAuth登录...');
    try {
      const redirectUrl = getCurrentRedirectUrl();
      const googleOAuthUrl = buildGoogleOAuthUrl(redirectUrl);
      
      addTestResult(`🔗 即将重定向到: ${googleOAuthUrl}`);
      
      // 延迟重定向，让用户看到日志
      setTimeout(() => {
        window.location.href = googleOAuthUrl;
      }, 2000);
      
    } catch (error) {
      addTestResult(`❌ Google OAuth测试失败: ${error}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 OAuth配置测试页面
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        此页面用于测试和调试OAuth配置，帮助解决localhost:3000 fallback问题
      </Alert>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            测试操作
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="contained" 
              onClick={runOAuthTests}
              disabled={isLoading}
            >
              {isLoading ? '测试中...' : '🧪 运行配置测试'}
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={testGoogleOAuth}
              disabled={isLoading}
            >
              🚀 测试Google OAuth
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            点击"运行配置测试"来验证OAuth配置，点击"测试Google OAuth"来测试实际的登录流程
          </Typography>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            测试结果
          </Typography>
          
          {testResults.length === 0 ? (
            <Typography color="text.secondary">
              还没有运行测试，点击上方按钮开始测试
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {testResults.map((result, index) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    mb: 1,
                    color: result.includes('❌') ? 'error.main' : 
                           result.includes('🚨') ? 'warning.main' : 
                           result.includes('✅') ? 'success.main' : 'text.primary'
                  }}
                >
                  {result}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>当前配置信息:</strong><br/>
          • Google Client ID: {OAUTH_CONFIG.GOOGLE.CLIENT_ID}<br/>
          • 当前环境: {OAUTH_CONFIG.ENVIRONMENT.IS_LOCAL ? '本地开发' : '生产环境'}<br/>
          • 当前端口: {OAUTH_CONFIG.ENVIRONMENT.CURRENT_PORT}<br/>
          • 重定向URL: {getCurrentRedirectUrl()}
        </Typography>
      </Box>
    </Box>
  );
};

export default OAuthTest;
