// Google OAuth测试页面 - 直接集成测试 - 2025-01-30 17:05:00
// 用于测试和调试新的Google OAuth直接集成
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import { googleAuthService } from '../services/googleAuth';
import { OAUTH_CONFIG, validateOAuthConfig, getCurrentRedirectUri } from '../config/oauth';

const GoogleOAuthTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    configValidation: boolean;
    googleAuthStatus: boolean;
    redirectUri: string;
    currentUser: any;
  }>({
    configValidation: false,
    googleAuthStatus: false,
    redirectUri: '',
    currentUser: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化测试状态
  useEffect(() => {
    runConfigTest();
    checkGoogleAuthStatus();
  }, []);

  // 运行配置测试
  const runConfigTest = () => {
    try {
      console.log('🧪 运行Google OAuth配置测试...');
      
      const configValid = validateOAuthConfig();
      const redirectUri = getCurrentRedirectUri();
      
      setTestResults(prev => ({
        ...prev,
        configValidation: configValid,
        redirectUri
      }));
      
      console.log('✅ 配置测试完成:', { configValid, redirectUri });
      
    } catch (error) {
      console.error('❌ 配置测试失败:', error);
      setError(`配置测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 检查Google认证状态
  const checkGoogleAuthStatus = () => {
    try {
      const currentUser = googleAuthService.getCurrentUser();
      const isAuthenticated = googleAuthService.isAuthenticated();
      
      setTestResults(prev => ({
        ...prev,
        googleAuthStatus: isAuthenticated,
        currentUser
      }));
      
      console.log('✅ Google认证状态检查完成:', { isAuthenticated, currentUser });
      
    } catch (error) {
      console.error('❌ Google认证状态检查失败:', error);
      setError(`认证状态检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 测试Google OAuth登录
  const testGoogleOAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 测试Google OAuth登录...');
      
      // 启动Google OAuth流程
      await googleAuthService.signIn();
      
      console.log('✅ Google OAuth测试启动成功');
      
    } catch (error) {
      console.error('❌ Google OAuth测试失败:', error);
      setError(`Google OAuth测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 测试Google OAuth登出
  const testGoogleOAuthLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚪 测试Google OAuth登出...');
      
      await googleAuthService.signOut();
      
      // 重新检查状态
      checkGoogleAuthStatus();
      
      console.log('✅ Google OAuth登出测试成功');
      
    } catch (error) {
      console.error('❌ Google OAuth登出测试失败:', error);
      setError(`Google OAuth登出测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新测试状态
  const refreshTestStatus = () => {
    runConfigTest();
    checkGoogleAuthStatus();
    setError(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Google OAuth 直接集成测试
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        此页面用于测试和调试新的Google OAuth直接集成，绕过Supabase认证系统。
      </Typography>

      {/* 测试控制按钮 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={refreshTestStatus}
          disabled={isLoading}
        >
          🔄 刷新测试状态
        </Button>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={testGoogleOAuth}
          disabled={isLoading || testResults.googleAuthStatus}
        >
          {isLoading ? <CircularProgress size={20} /> : '🚀 测试Google OAuth登录'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={testGoogleOAuthLogout}
          disabled={isLoading || !testResults.googleAuthStatus}
        >
          🚪 测试Google OAuth登出
        </Button>
      </Box>

      {/* 错误显示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 测试结果 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 测试结果
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="配置验证"
              secondary="OAuth配置文件验证结果"
            />
            <Chip 
              label={testResults.configValidation ? '通过' : '失败'} 
              color={testResults.configValidation ? 'success' : 'error'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Google认证状态"
              secondary="当前Google OAuth认证状态"
            />
            <Chip 
              label={testResults.googleAuthStatus ? '已认证' : '未认证'} 
              color={testResults.googleAuthStatus ? 'success' : 'default'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="重定向URI"
              secondary="当前环境的重定向URI"
            />
            <Chip 
              label={testResults.redirectUri} 
              variant="outlined"
            />
          </ListItem>
        </List>
      </Paper>

      {/* 当前用户信息 */}
      {testResults.currentUser && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            👤 当前用户信息
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="用户ID"
                secondary={testResults.currentUser.id}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="邮箱"
                secondary={testResults.currentUser.email}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="姓名"
                secondary={testResults.currentUser.name}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="头像"
                secondary={testResults.currentUser.picture}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="邮箱验证状态"
                secondary={testResults.currentUser.verified_email ? '已验证' : '未验证'}
              />
            </ListItem>
          </List>
        </Paper>
      )}

      {/* 配置信息 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ⚙️ OAuth配置信息
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Google Client ID"
              secondary={OAUTH_CONFIG.GOOGLE.CLIENT_ID}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="授权范围"
              secondary={OAUTH_CONFIG.GOOGLE.SCOPES.join(', ')}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="访问类型"
              secondary={OAUTH_CONFIG.GOOGLE.ACCESS_TYPE}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="提示类型"
              secondary={OAUTH_CONFIG.GOOGLE.PROMPT}
            />
          </ListItem>
        </List>
      </Paper>

      {/* 环境信息 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🌍 环境信息
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="当前域名"
              secondary={OAUTH_CONFIG.ENVIRONMENT.CURRENT_ORIGIN}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="当前端口"
              secondary={OAUTH_CONFIG.ENVIRONMENT.CURRENT_PORT}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="是否本地环境"
              secondary={OAUTH_CONFIG.ENVIRONMENT.IS_LOCAL ? '是' : '否'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="是否生产环境"
              secondary={OAUTH_CONFIG.ENVIRONMENT.IS_PRODUCTION ? '是' : '否'}
            />
          </ListItem>
        </List>
      </Paper>

      {/* 使用说明 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          📖 使用说明
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>1. 配置测试：</strong> 点击"刷新测试状态"按钮检查OAuth配置是否正确。
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>2. 登录测试：</strong> 点击"测试Google OAuth登录"按钮启动Google认证流程。
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>3. 登出测试：</strong> 点击"测试Google OAuth登出"按钮测试登出功能。
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>4. 状态监控：</strong> 实时查看认证状态和用户信息。
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Alert severity="info">
          <Typography variant="body2">
            <strong>注意：</strong> 此测试页面仅用于开发和调试目的。在生产环境中，请确保移除或保护此页面。
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default GoogleOAuthTest;
