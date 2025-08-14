// 认证调试页面 - 帮助诊断认证状态问题 - 2025-01-14 00:15:00
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Alert, Divider } from '@mui/material';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    addDebugInfo('🔍 开始检查认证状态...');
    
    try {
      // 检查Supabase配置
      addDebugInfo(`🌐 Supabase URL: ${import.meta.env.VITE_SUPABASE_URL || '未配置'}`);
      addDebugInfo(`🔑 Supabase Anon Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '已配置' : '未配置'}`);
      
      // 检查当前用户
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        addDebugInfo(`❌ 获取用户失败: ${userError.message}`);
      } else {
        setSupabaseUser(currentUser);
        addDebugInfo(`✅ Supabase用户: ${currentUser ? currentUser.email : 'null'}`);
      }

      // 检查当前会话
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addDebugInfo(`❌ 获取会话失败: ${sessionError.message}`);
      } else {
        setSession(currentSession);
        addDebugInfo(`✅ Supabase会话: ${currentSession ? 'active' : 'null'}`);
      }

      // 检查React状态
      addDebugInfo(`✅ React认证状态: ${isAuthenticated ? '已认证' : '未认证'}`);
      addDebugInfo(`✅ React用户: ${user ? user.email : 'null'}`);

      // 检查本地存储
      const accessToken = localStorage.getItem('sb-znaacfatlmwotdxcfukp-auth-token');
      const refreshToken = localStorage.getItem('sb-znaacfatlmwotdxcfukp-refresh-token');
      addDebugInfo(`🔑 本地访问令牌: ${accessToken ? '存在' : '不存在'}`);
      addDebugInfo(`🔑 本地刷新令牌: ${refreshToken ? '存在' : '不存在'}`);

      // 检查所有相关的localStorage项
      const allStorageKeys = Object.keys(localStorage);
      const supabaseKeys = allStorageKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
      addDebugInfo(`📦 Supabase相关存储项: ${supabaseKeys.length}个`);
      supabaseKeys.forEach(key => {
        const value = localStorage.getItem(key);
        addDebugInfo(`  - ${key}: ${value ? '有值' : '空值'}`);
      });

      // 检查URL参数
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.has('access_token') || urlParams.has('refresh_token') || urlParams.has('code');
      addDebugInfo(`🔗 URL认证参数: ${hasAuthParams ? '存在' : '不存在'}`);

      addDebugInfo('🎉 认证状态检查完成');
      
    } catch (error) {
      addDebugInfo(`❌ 检查认证状态失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = async () => {
    try {
      addDebugInfo('🧹 清除认证状态...');
      await supabase.auth.signOut();
      addDebugInfo('✅ 认证状态已清除');
    } catch (error) {
      addDebugInfo(`❌ 清除认证状态失败: ${error}`);
    }
  };

  const refreshSession = async () => {
    try {
      addDebugInfo('🔄 刷新会话...');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        addDebugInfo(`❌ 刷新会话失败: ${error.message}`);
      } else {
        addDebugInfo(`✅ 会话刷新成功: ${data.session ? 'active' : 'null'}`);
      }
    } catch (error) {
      addDebugInfo(`❌ 刷新会话失败: ${error}`);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 认证调试页面
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        此页面用于诊断认证状态问题，帮助解决OAuth登录后状态不能保存的问题
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={checkAuthStatus}
          disabled={loading}
        >
          {loading ? '检查中...' : '🔍 检查认证状态'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={clearAuth}
        >
          🧹 清除认证
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={refreshSession}
        >
          🔄 刷新会话
        </Button>

        <Button 
          variant="contained" 
          color="secondary"
          onClick={async () => {
            try {
              addDebugInfo('🚀 测试Google OAuth登录...');
              const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: {
                  queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                  }
                }
              });
              
              if (error) {
                addDebugInfo(`❌ OAuth启动失败: ${error.message}`);
              } else {
                addDebugInfo('✅ OAuth启动成功，请完成Google登录');
              }
            } catch (error) {
              addDebugInfo(`❌ OAuth测试失败: ${error}`);
            }
          }}
        >
          🚀 测试Google OAuth
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {/* 当前状态 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 当前状态
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>React认证状态:</strong> {isAuthenticated ? '✅ 已认证' : '❌ 未认证'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>React用户:</strong> {user ? user.email : 'null'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>用户ID:</strong> {user ? user.id : 'null'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Supabase用户:</strong> {supabaseUser ? supabaseUser.email : 'null'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Supabase会话:</strong> {session ? '✅ 活跃' : '❌ 无会话'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 调试信息 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📝 调试信息
            </Typography>
            
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {debugInfo.length === 0 ? (
                <Typography color="text.secondary">
                  还没有调试信息，点击"检查认证状态"开始
                </Typography>
              ) : (
                debugInfo.map((info, index) => (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      mb: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    {info}
                  </Typography>
                ))
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 详细用户信息 */}
      {user && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              👤 用户详细信息
            </Typography>
            <pre style={{ overflow: 'auto', fontSize: '0.875rem' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Supabase用户信息 */}
      {supabaseUser && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔐 Supabase用户信息
            </Typography>
            <pre style={{ overflow: 'auto', fontSize: '0.875rem' }}>
              {JSON.stringify(supabaseUser, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AuthDebug;
