# Google OAuth 登录完整配置指南（中英文对照）

## 📋 概述 Overview

本指南详细说明如何为 SmallTalk 应用配置 Google OAuth 登录，支持本地开发和 Netlify 生产环境部署。
This guide provides detailed instructions for configuring Google OAuth login for the SmallTalk app, supporting both local development and Netlify production deployment.

**目标域名 Target Domains**:
- 开发环境 Development: `http://localhost:5173`
- 生产环境 Production: `https://smalltalking.netlify.app`
- Supabase 回调 Callback: `https://znaacfatlmwotdxcfukp.supabase.co`

---

## 📝 前置条件 Prerequisites

- ✅ Google 账户 (Google Account)
- ✅ Google Cloud Console 访问权限 (Access to Google Cloud Console)
- ✅ Supabase 项目访问权限 (Access to Supabase project)
- ✅ Netlify 应用已创建 (Netlify app created)

---

## 🔧 步骤一：Google Cloud Console 配置

### 1.1 访问 Google Cloud Console

**中文导航路径**：
1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击"选择项目" → "新建项目"（如需要）

**English Navigation**:
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project" (if needed)

### 1.2 启用必要的 API

**中文操作步骤**：
1. 左侧菜单：**API 和服务** > **库**
2. 搜索并启用：
   - **Google+ API**
   - **People API** (推荐)

**English Steps**:
1. Left menu: **APIs & Services** > **Library**
2. Search and enable:
   - **Google+ API**
   - **People API** (recommended)

### 1.3 创建 OAuth 2.0 凭据

**中文操作步骤**：
1. 左侧菜单：**API 和服务** > **凭据**
2. 点击：**创建凭据** > **OAuth 2.0 客户端 ID**
3. 如果首次创建，需先配置：**OAuth 同意屏幕**

**English Steps**:
1. Left menu: **APIs & Services** > **Credentials**
2. Click: **Create Credentials** > **OAuth 2.0 Client ID**
3. If first time, configure: **OAuth consent screen** first

### 1.4 配置 OAuth 同意屏幕 (如需要)

**中文表单填写**：
- **用户类型 User Type**: 外部 (External)
- **应用名称 App name**: `SmallTalk App`
- **用户支持电子邮件 User support email**: 您的邮箱
- **开发者联系信息 Developer contact**: 您的邮箱

**English Form Fields**:
- **User Type**: External
- **App name**: `SmallTalk App`
- **User support email**: Your email
- **Developer contact information**: Your email

### 1.5 创建 Web 应用程序凭据

**应用类型 Application Type**: 
- 选择：**Web 应用程序** (Web application) ✅

**应用名称 Name**:
```
SmallTalk OAuth Client
```

**已获授权的 JavaScript 来源 Authorized JavaScript origins**:
```
http://localhost:5173
https://localhost:5173
https://smalltalking.netlify.app
```

**已获授权的重定向 URI (Authorized redirect URIs)**:
```
https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback
http://localhost:5173
https://localhost:5173
https://smalltalking.netlify.app
```

### 1.6 获取凭据信息

创建完成后，请记录：
- **客户端 ID (Client ID)**: `复制保存`
- **客户端密钥 (Client Secret)**: `复制保存`

⚠️ **安全提醒**: 请勿将客户端密钥提交到代码库中

---

## 🗄️ 步骤二：Supabase 配置

### 2.1 访问 Supabase 控制台

**中文导航**：
1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：**smalltalk**

**English Navigation**:
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: **smalltalk**

### 2.2 启用 Google 认证提供商

**中文操作路径**：
1. 左侧菜单：**身份验证** (Authentication) > **提供商** (Providers)
2. 找到：**Google** 
3. 开启：**启用 Google 登录** (Enable sign in with Google)

**English Operation Path**:
1. Left menu: **Authentication** > **Providers**
2. Find: **Google**
3. Toggle: **Enable sign in with Google**

### 2.3 配置 Google 凭据

**表单字段 Form Fields**：

| 中文字段 | English Field | 填入内容 Value |
|---------|---------------|---------------|
| 客户端 ID | Client ID | 从 Google Cloud Console 复制的客户端 ID |
| 客户端密钥 | Client Secret | 从 Google Cloud Console 复制的客户端密钥 |
| 重定向 URL | Redirect URL | `https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback` (自动生成) |

### 2.4 高级配置 (可选)

**附加范围 Additional Scopes**:
```
profile email
```

**跳过随机数检查 Skip nonce check**: 保持默认 (Keep default: OFF)

---

## 🌐 步骤三：Netlify 环境变量配置

### 3.1 访问 Netlify 控制台

**中文导航**：
1. 打开 [Netlify Dashboard](https://app.netlify.com/)
2. 选择站点：**smalltalking**
3. 进入：**站点设置** (Site settings) > **环境变量** (Environment variables)

**English Navigation**:
1. Open [Netlify Dashboard](https://app.netlify.com/)
2. Select site: **smalltalking**
3. Go to: **Site settings** > **Environment variables**

### 3.2 添加环境变量

点击：**添加变量** (Add variable)

| 变量名 Variable | 值 Value | 描述 Description |
|----------------|----------|------------------|
| `VITE_SUPABASE_URL` | `https://znaacfatlmwotdxcfukp.supabase.co` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase 匿名密钥 |
| `VITE_GEMINI_API_KEY` | `AIzaSyAeogFkSzZpam7VHnUE0cFa39Vt1_Tvsls` | Gemini API 密钥 |

---

## 🧪 步骤四：测试配置

### 4.1 本地开发测试

**启动开发服务器**:
```bash
npm run dev
```

**测试步骤**:
1. 访问：`http://localhost:5173/login`
2. 点击：**使用 Google 登录** (Sign in with Google)
3. 验证：是否跳转到 Google 登录页面
4. 完成登录后：检查是否重定向到 `/topic` 页面

### 4.2 生产环境测试

**部署到 Netlify**:
```bash
npm run build
# 通过 Netlify CLI 或 Git 推送部署
```

**测试步骤**:
1. 访问：`https://smalltalking.netlify.app/login`
2. 点击：**使用 Google 登录** (Sign in with Google)
3. 验证：完整的 OAuth 流程

---

## 🐛 故障排除 Troubleshooting

### 常见错误 Common Errors

#### 1. `redirect_uri_mismatch` 错误

**中文错误信息**: 重定向 URI 不匹配
**English Error**: redirect_uri_mismatch

**解决方案 Solution**:
1. 检查 Google Cloud Console 中的重定向 URI 配置
2. 确保包含以下 URL：
   ```
   https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback
   https://smalltalking.netlify.app
   ```

#### 2. `invalid_client` 错误

**原因 Cause**: 客户端 ID 或密钥错误
**解决方案 Solution**:
- 重新检查 Supabase 中的 Google Provider 配置
- 确保客户端 ID 和密钥正确复制

#### 3. 登录后没有重定向

**检查项目 Check Items**:
- 检查 `AuthContext.tsx` 中的 `redirectTo` 配置
- 验证环境变量是否正确设置
- 检查浏览器控制台是否有错误

#### 4. 开发环境正常，生产环境失败

**排查步骤 Debugging Steps**:
1. 确认 Netlify 环境变量配置正确
2. 检查 Google Cloud Console 中是否添加了生产域名
3. 查看 Netlify 部署日志

---

## 📊 配置验证清单

### ✅ Google Cloud Console 检查清单

- [ ] 已启用 Google+ API 和 People API
- [ ] 已创建 Web 应用程序 OAuth 客户端
- [ ] JavaScript 来源包含所有必要域名
- [ ] 重定向 URI 包含 Supabase 回调地址
- [ ] 已获取客户端 ID 和密钥

### ✅ Supabase 检查清单

- [ ] 已启用 Google 认证提供商
- [ ] 已配置正确的客户端 ID 和密钥
- [ ] 重定向 URL 显示正确
- [ ] 已设置必要的 OAuth 范围

### ✅ Netlify 检查清单

- [ ] 已配置所有必要的环境变量
- [ ] 环境变量值正确无误
- [ ] 已重新部署应用
- [ ] 生产域名在 Google OAuth 配置中

### ✅ 应用检查清单

- [ ] 本地开发环境 Google 登录正常
- [ ] 生产环境 Google 登录正常
- [ ] 登录后正确重定向到 `/topic` 页面
- [ ] 用户信息正确保存到 Supabase

---

## 🔒 安全最佳实践

### 密钥管理 Key Management
- ❌ **不要**将客户端密钥提交到 Git 仓库
- ✅ **使用**环境变量存储敏感信息
- ✅ **定期**轮换 OAuth 凭据

### 域名安全 Domain Security
- ✅ **只添加**必要的重定向 URI
- ✅ **使用 HTTPS** 用于生产环境
- ✅ **验证**所有配置的域名

### 监控建议 Monitoring
- 📊 监控 OAuth 成功率
- 📋 记录认证错误日志
- 🔍 定期检查访问权限

---

## 📞 获取帮助

### 调试信息收集
当遇到问题时，请收集以下信息：
1. **浏览器控制台错误** (Browser console errors)
2. **网络请求详情** (Network request details)  
3. **Supabase 认证日志** (Supabase auth logs)
4. **具体的错误消息** (Specific error messages)

### 技术支持资源
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Netlify 环境变量文档](https://docs.netlify.com/environment-variables/overview/)

---

**📅 配置完成时间**: 2025-01-30 15:10:00  
**🔄 下次检查时间**: 2025-02-30  
**📖 文档版本**: v2.0 (包含 Netlify 部署支持) 