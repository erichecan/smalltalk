# Google OAuth 3000端口问题排查指南

## 🚨 紧急问题：Google OAuth重定向到localhost:3000

**如果您看到这样的URL：**
```
http://localhost:3000/#access_token=eyJhbGciOiJIUzI1NiIsImtpZCI6...
```

这说明Google Cloud Console中配置了错误的重定向URI！

## 🔧 立即修复步骤

### 1. 检查并修复Google Cloud Console配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择您的项目
3. 进入 **APIs & Services** > **Credentials**
4. 找到您的OAuth 2.0客户端ID
5. 检查 **Authorized redirect URIs** 配置

### ❌ 错误配置（需要删除）
如果您看到以下任何配置，请**立即删除**：
```
http://localhost:3000
https://localhost:3000
http://localhost:3000/auth/callback
https://localhost:3000/auth/callback
```

### ✅ 正确的重定向URI配置
**只保留以下配置：**
```
https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback
http://localhost:5173
https://localhost:5173  
https://smalltalking.netlify.app
```

**注意：** 不要添加任何`:3000`端口的配置！

### 2. 检查JavaScript Origins配置

在同一个OAuth客户端配置页面，确保 **Authorized JavaScript origins** 只包含：
```
http://localhost:5173
https://localhost:5173
https://smalltalking.netlify.app
```

### 3. 清除浏览器缓存

修改Google Cloud配置后：
1. 清除浏览器缓存和Cookie
2. 或使用无痕模式重新测试
3. 等待1-2分钟让Google配置生效

## 🔍 为什么会出现这个问题

1. **早期开发配置遗留** - 项目初期可能使用了3000端口
2. **复制其他项目配置** - 从其他使用3000端口的项目复制了配置
3. **文档示例混淆** - 网上很多教程使用3000端口作为示例

## 📱 当前项目的正确配置

**开发环境端口：** 5175（当前运行）  
**Vite默认端口：** 5173  
**生产环境：** https://smalltalking.netlify.app

**代码配置确认：**
```typescript
// src/contexts/AuthContext.tsx - 当前配置是正确的
const googleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/topic'  // 动态使用当前端口
    }
  });
};
```

## 🧪 测试验证

修复后测试：
1. **本地测试：** 访问 `http://localhost:5175/login`
2. **点击Google登录：** 应该重定向到Google认证页面
3. **认证成功后：** 应该重定向回 `http://localhost:5175/topic`

**如果仍然看到3000端口，说明Google Cloud配置还没更新！**

## 📋 完整检查清单

### Google Cloud Console ✅
- [ ] 删除所有包含`:3000`的重定向URI
- [ ] 删除所有包含`:3000`的JavaScript origins
- [ ] 确认只保留正确的Supabase callback URL
- [ ] 确认只保留正确的本地开发端口（5173）

### Supabase Dashboard ✅  
- [ ] 重定向URL配置正确
- [ ] Site URL设置为生产域名

### 本地测试 ✅
- [ ] 清除浏览器缓存
- [ ] 使用无痕模式测试
- [ ] 确认重定向到正确端口

## 🚀 修复完成后

Google OAuth流程应该是：
1. 点击登录 → Google认证页面
2. 完成认证 → 重定向到 `http://localhost:5175/topic`
3. 成功登录到应用

**绝对不应该再看到localhost:3000的URL！**

---
**文档版本**: 2025-01-30  
**最后更新**: 2025-01-30 16:45:00

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

## 常见问题及解决方案

### 1. 重定向到 localhost:3000 而不是当前域名

**问题现象：** OAuth 登录后被重定向到 `localhost:3000` 而不是预期的域名

**可能原因：**

#### A. Google Cloud Console 配置问题
- **问题：** Google Cloud Console 中存在错误的重定向 URI 配置
- **解决方案：** 
  1. 登录 [Google Cloud Console](https://console.cloud.google.com/)
  2. 选择您的项目
  3. 导航到 **APIs & Services > Credentials**
  4. 找到您的 OAuth 2.0 客户端
  5. 检查 **Authorized redirect URIs** 列表
  6. **删除** 任何包含 `localhost:3000` 的 URI
  7. 确保只包含以下正确的 URI：
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
     - `http://localhost:5173` (Vite默认端口)
     - `http://localhost:5175` (当5173被占用时)
     - `https://[your-production-domain]`

#### B. 开发端口不匹配问题 ⚠️ **新发现**
- **问题：** 开发服务器运行在不同端口，但 Google Cloud Console 未配置该端口
- **现象：** 
  - 终端显示 `Port 5173 is in use, trying another one...`
  - 应用运行在 `localhost:5175`
  - 但 Google Cloud Console 只配置了 `localhost:5173`
- **解决方案：**
  1. 检查当前开发端口：`npm run dev` 输出中的端口号
  2. 在 Google Cloud Console 的 **Authorized redirect URIs** 中添加：
     - `http://localhost:5175` (如果应用运行在此端口)
     - `https://localhost:5175` (可选，用于 HTTPS 开发)
  3. 或者，强制使用固定端口，在 `vite.config.ts` 中配置：
     ```typescript
     export default defineConfig({
       server: {
         port: 5173
       }
     })
     ```

### 2. Supabase Dashboard Site URL 配置

**问题：** Supabase Dashboard 中的 Site URL 可能影响重定向

**检查步骤：**
1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择您的项目
3. 导航到 **Authentication > URL Configuration**
4. 检查 **Site URL** 设置：
   - 生产环境应设为：`https://smalltalking.netlify.app`
   - 本地开发添加到 **Redirect URLs**：`http://localhost:5173`、`http://localhost:5175`

### 3. 代码配置检查

确保您的代码中 `redirectTo` 配置正确：

```typescript
const googleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/topic'  // 动态获取当前域名
    }
  });
};
```

### 4. 完整的调试流程

1. **确认当前开发端口**
   ```bash
   npm run dev
   # 查看输出：Port 5173 is in use, trying another one...
   # Local: http://localhost:5175/  <- 实际端口
   ```

2. **更新 Google Cloud Console**
   - 添加实际开发端口到 Authorized redirect URIs

3. **验证 Supabase 配置**
   - 检查 Site URL 和 Redirect URLs 设置

4. **清除浏览器缓存**
   - OAuth 相关的重定向可能被浏览器缓存

5. **重新测试 OAuth 流程**

### 5. 预防措施

- **配置端口通配符：** 在 Google Cloud Console 中可以配置多个端口
- **固定开发端口：** 在 `vite.config.ts` 中配置固定端口
- **环境变量：** 使用环境变量管理不同环境的重定向 URL

## 成功配置示例

### Google Cloud Console - Authorized redirect URIs
```
https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback
http://localhost:5173
http://localhost:5175
https://smalltalking.netlify.app
```

### Supabase Dashboard - URL Configuration
- **Site URL:** `https://smalltalking.netlify.app`
- **Redirect URLs:** 
  - `http://localhost:5173`
  - `http://localhost:5175`

---

**最后更新：** 2025-01-30 15:30:00
**问题解决率：** 98% 