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
        const code = searchParams.get('code');

        console.log('📋 认证参数:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          code: !!code,
          error, 
          errorDescription 
        });

        if (error) {
          console.error('❌ OAuth错误:', error, errorDescription);
          setErrorMessage(`认证失败: ${errorDescription || error}`);
          setStatus('error');
          return;
        }

        // Supabase OAuth流程：检查是否有授权码
        if (code) {
          console.log('✅ 检测到授权码，正在处理OAuth回调...');
          
          try {
            // 修复流程状态问题：先尝试获取当前会话
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (currentSession) {
              console.log('✅ 检测到现有会话，用户已认证');
              setStatus('success');
              setTimeout(() => {
                navigate('/topic', { replace: true });
              }, 1000);
              return;
            }
            
            // 使用授权码交换访问令牌
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('❌ 授权码交换失败:', exchangeError);
              
              // 特殊处理流程状态错误
              if (exchangeError.message.includes('invalid flow state') || 
                  exchangeError.message.includes('no valid flow state')) {
                console.log('🔄 检测到流程状态错误，尝试重新初始化认证...');
                
                // 清除可能的无效状态
                await supabase.auth.signOut();
                
                // 重定向到登录页面重新开始
                setTimeout(() => {
                  navigate('/login', { replace: true });
                }, 2000);
                
                setErrorMessage('OAuth流程状态已过期，请重新登录');
                setStatus('error');
                return;
              }
              
              setErrorMessage(`授权码交换失败: ${exchangeError.message}`);
              setStatus('error');
              return;
            }

            if (data.session && data.user) {
              console.log('✅ OAuth认证成功:', data.user.email);
              setStatus('success');
              
              // 等待认证状态同步
              setTimeout(() => {
                navigate('/topic', { replace: true });
              }, 1500);
              
            } else {
              console.error('❌ 会话数据无效');
              setErrorMessage('会话数据无效');
              setStatus('error');
            }
            
          } catch (exchangeError) {
            console.error('❌ 授权码交换异常:', exchangeError);
            setErrorMessage(`授权码交换异常: ${exchangeError instanceof Error ? exchangeError.message : '未知错误'}`);
            setStatus('error');
          }
          
        } else if (accessToken && refreshToken) {
          // 直接令牌方式（备用方案）
          console.log('✅ 检测到直接令牌，正在设置会话...');
          
          try {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('❌ 设置会话失败:', sessionError);
              setErrorMessage(`会话设置失败: ${sessionError.message}`);
              setStatus('error');
              return;
            }

            if (data.session && data.user) {
              console.log('✅ 会话设置成功:', data.user.email);
              setStatus('success');
              
              setTimeout(() => {
                navigate('/topic', { replace: true });
              }, 1500);
              
            } else {
              console.error('❌ 会话数据无效');
              setErrorMessage('会话数据无效');
              setStatus('error');
            }
            
          } catch (sessionError) {
            console.error('❌ 设置会话异常:', sessionError);
            setErrorMessage(`会话设置异常: ${sessionError instanceof Error ? sessionError.message : '未知错误'}`);
            setStatus('error');
          }
          
        } else {
          console.log('🔄 没有OAuth参数，检查当前认证状态...');
          
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
            3. 清除浏览器缓存和Cookie
          </Typography>
          <Typography variant="body2" color="text.secondary">
            4. 联系技术支持
          </Typography>
          
          {errorMessage.includes('流程状态已过期') && (
            <Alert severity="info" sx={{ mt: 2, maxWidth: 600 }}>
              <Typography variant="body2">
                <strong>OAuth流程状态错误说明：</strong><br/>
                这通常是因为OAuth流程中断或超时导致的。系统将自动重定向到登录页面，请重新尝试Google登录。
              </Typography>
            </Alert>
          )}
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
