// 认证回调处理页面 - 直接Google OAuth集成 - 2025-01-30 17:02:00
// 处理Google OAuth登录后的回调，不再依赖Supabase
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { googleAuthService } from '../services/googleAuth';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 处理直接Google OAuth回调...');
        
        // 检查URL中的认证参数
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('📋 认证参数:', { 
          code: !!code, 
          state: !!state,
          error, 
          errorDescription 
        });

        if (error) {
          console.error('❌ Google OAuth错误:', error, errorDescription);
          setErrorMessage(`Google认证失败: ${errorDescription || error}`);
          setStatus('error');
          return;
        }

        // 检查是否有必要的OAuth参数
        if (!code || !state) {
          console.error('❌ 缺少必要的OAuth参数');
          setErrorMessage('缺少必要的认证参数，请重新登录');
          setStatus('error');
          return;
        }

        // 使用新的Google OAuth服务处理回调
        try {
          console.log('✅ 检测到授权码，正在处理OAuth回调...');
          
          const googleUser = await googleAuthService.handleCallback();
          
          if (googleUser) {
            console.log('✅ Google OAuth认证成功:', googleUser.email);
            setStatus('success');
            
            // 等待认证状态同步
            setTimeout(() => {
              navigate('/topic', { replace: true });
            }, 1500);
            
          } else {
            console.error('❌ Google用户信息无效');
            setErrorMessage('Google用户信息无效');
            setStatus('error');
          }
          
        } catch (oauthError) {
          console.error('❌ Google OAuth处理失败:', oauthError);
          
          // 特殊处理常见错误
          if (oauthError instanceof Error) {
            if (oauthError.message.includes('state验证失败')) {
              setErrorMessage('OAuth安全验证失败，请重新登录');
            } else if (oauthError.message.includes('令牌交换失败')) {
              setErrorMessage('认证令牌交换失败，请重新登录');
            } else {
              setErrorMessage(`OAuth处理失败: ${oauthError.message}`);
            }
          } else {
            setErrorMessage('OAuth处理失败，请重新登录');
          }
          
          setStatus('error');
        }
        
      } catch (error) {
        console.error('❌ 认证回调处理失败:', error);
        setErrorMessage(`认证回调处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          正在处理Google认证...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          请稍候，正在完成登录流程
        </Typography>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          gap: 2,
          p: 3
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Google认证失败
          </Typography>
          <Typography variant="body2">
            {errorMessage}
          </Typography>
        </Alert>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            您可以尝试：
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. 重新登录
          </Typography>
          <Typography variant="body2" color="text.secondary">
            2. 检查网络连接
          </Typography>
          <Typography variant="body2" color="text.secondary">
            3. 清除浏览器缓存和Cookie
          </Typography>
          <Typography variant="body2" color="text.secondary">
            4. 联系技术支持
          </Typography>
          
          {errorMessage.includes('state验证失败') && (
            <Alert severity="info" sx={{ mt: 2, maxWidth: 600 }}>
              <Typography variant="body2">
                <strong>OAuth安全验证错误说明：</strong><br/>
                这通常是因为OAuth流程中断或超时导致的。请重新尝试Google登录。
              </Typography>
            </Alert>
          )}
          
          {errorMessage.includes('令牌交换失败') && (
            <Alert severity="info" sx={{ mt: 2, maxWidth: 600 }}>
              <Typography variant="body2">
                <strong>令牌交换错误说明：</strong><br/>
                这通常是因为网络问题或Google服务暂时不可用导致的。请稍后重试。
              </Typography>
            </Alert>
          )}
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            如果问题持续存在，请：
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. 检查Google Cloud Console配置
          </Typography>
          <Typography variant="body2" color="text.secondary">
            2. 确认重定向URI配置正确
          </Typography>
          <Typography variant="body2" color="text.secondary">
            3. 等待几分钟让配置生效
          </Typography>
        </Box>
      </Box>
    );
  }

  if (status === 'success') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} color="success" />
        <Typography variant="h6" color="success.main">
          Google认证成功！
        </Typography>
        <Typography variant="body2" color="text.secondary">
          正在跳转到应用...
        </Typography>
      </Box>
    );
  }

  return null;
};

export default AuthCallback;
