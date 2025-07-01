# Google OAuth 3000端口问题排查指南

## 问题描述
如果您遇到Google登录时出现3000端口相关的callback错误，请按以下步骤排查：

## 1. 检查Google Cloud Console配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择您的项目
3. 进入 **APIs & Services** > **Credentials**
4. 找到您的OAuth 2.0客户端ID
5. 检查 **Authorized redirect URIs** 配置

### ✅ 正确的重定向URI配置
```
https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback
http://localhost:5173
https://localhost:5173  
https://smalltalking.netlify.app
```

### ❌ 错误配置（需要删除）
如果您看到以下任何配置，请删除：
```
http://localhost:3000
https://localhost:3000
http://localhost:3000/auth/callback
```

## 2. 检查Supabase配置

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择smalltalk项目
3. 进入 **Authentication** > **Providers**
4. 检查Google提供商配置
5. 确认 **Redirect URL** 显示为：
   ```
   https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback
   ```

## 3. 当前代码配置确认

当前代码中的Google OAuth配置（AuthContext.tsx）：
```typescript
const googleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/topic'
    }
  });
  if (error) throw error;
};
```

这里的`redirectTo`配置会自动使用当前域名：
- 本地开发：`http://localhost:5175/topic`（或其他可用端口）
- 生产环境：`https://smalltalking.netlify.app/topic`

## 4. 如何修复3000端口问题

如果您在Google Cloud Console中发现了3000端口的配置：

1. **删除错误的重定向URI**：
   - 在Google Cloud Console中删除任何包含`:3000`的重定向URI

2. **确保正确的配置**：
   - 保留上述 ✅ 部分列出的正确URI

3. **清除浏览器缓存**：
   ```bash
   # 清除浏览器缓存和Cookie
   # 或使用无痕模式重新测试
   ```

## 5. 测试验证

修复后请测试：
1. 本地环境：`http://localhost:5175/login`（当前端口）
2. 生产环境：`https://smalltalking.netlify.app/login`

## 6. 常见原因

3000端口配置通常来自：
- 早期开发时使用的端口配置
- 复制其他项目的配置
- 错误的文档示例

## 总结

**当前正确的端口配置：**
- 开发环境：5175（或Vite自动分配的端口）
- 生产环境：443（HTTPS标准端口）
- 绝对不应该有3000端口的配置

---
**文档版本**: 2025-01-30  
**最后更新**: 2025-01-30 15:30:00 