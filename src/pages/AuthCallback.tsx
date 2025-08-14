// 认证回调处理页面 - 处理OAuth登录后的回调 - 2025-01-14 00:10:00
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { supabase } from '../services/supabase';
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
        console.log('🔄 处理认证回调...');
        
        // 检查URL中的认证参数
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('📋 认证参数:', { accessToken: !!accessToken, refreshToken: !!refreshToken, error, errorDescription });

        if (error) {
          console.error('❌ OAuth错误:', error, errorDescription);
          setErrorMessage(`认证失败: ${errorDescription || error}`);
          setStatus('error');
          return;
        }

        if (accessToken) {
          console.log('✅ 检测到访问令牌，正在设置会话...');
          
          // 设置Supabase会话
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('❌ 设置会话失败:', sessionError);
            setErrorMessage(`会话设置失败: ${sessionError.message}`);
            setStatus('error');
            return;
          }

          console.log('✅ 会话设置成功');
          setStatus('success');
          
          // 等待一下让认证状态同步
          setTimeout(() => {
            navigate('/topic', { replace: true });
          }, 1000);
          
        } else {
          console.log('🔄 没有访问令牌，检查当前认证状态...');
          
          // 检查当前用户状态
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('❌ 获取用户信息失败:', userError);
            setErrorMessage(`获取用户信息失败: ${userError.message}`);
            setStatus('error');
            return;
          }

          if (currentUser) {
            console.log('✅ 用户已认证:', currentUser.email);
            setStatus('success');
            
            // 等待一下让认证状态同步
            setTimeout(() => {
              navigate('/topic', { replace: true });
            }, 1000);
            
          } else {
            console.log('⚠️ 用户未认证，重定向到登录页面');
            navigate('/login', { replace: true });
          }
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
          正在处理认证...
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
            认证失败
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
            3. 联系技术支持
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
          认证成功！
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
