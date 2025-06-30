# 产品需求文档（PRD）：Smalltalk 登录与未登录分层体验

## 1. 产品目标
- 降低新用户门槛，提升转化率
- 保护用户数据，支持个性化历史
- 兼顾调试/开发便利性

## 2. 未登录用户体验
- 可体验AI对话，但有功能/内容限制
- 只返回一轮AI对话（如1问1答）
- 历史记录不保存
- 页面右上角有"登录/注册"入口
- 需要更多对话或保存历史时，引导登录

## 3. 已登录用户体验
- 可获得完整体验（如5轮AI对话、历史自动保存、个性化推荐等）
- 历史页可查看所有对话
- 退出登录后，回到未登录体验

## 4. 页面与交互设计
### TopicInput 页
- 右上角有"登录/注册"按钮（未登录时显示，已登录时显示头像/昵称/退出）
- 输入话题后，未登录用户只能获得一轮AI对话，底部有"登录查看更多"按钮
- 已登录用户直接获得完整多轮对话

### Dialogue 页
- 未登录：只显示一轮AI对话，下方有"登录查看更多"按钮
- 已登录：显示全部对话，支持多轮交互，历史自动保存

### 历史页
- 未登录：提示"登录后可查看历史"
- 已登录：正常展示历史

## 5. 登录状态存储与调试便利性
- 登录状态由 Firebase Auth/Supabase Auth 管理，自动存储在本地（localStorage/cookie），刷新页面不会丢失
- 开发调试时可用"记住我"功能，或在本地存储模拟登录态
- 也可提供"游客一键登录"或"开发者快捷登录"按钮，方便调试

## 6. 引导与转化设计
- 在未登录用户体验受限时，明确提示"登录可解锁更多功能"
- 登录入口始终可见，降低转化门槛
- 登录后自动刷新页面，切换到完整体验

## 7. 伪代码流程示意
```plaintext
[未登录]
TopicInput -> Dialogue(只返回1轮) -> "登录查看更多"按钮
点击登录 -> 登录页 -> 登录成功 -> 返回Dialogue(5轮) + 历史页可用

[已登录]
TopicInput -> Dialogue(5轮) -> 历史自动保存 -> 历史页可用
```

## 8. 推荐方案总结
- 未登录可体验，但有限制（只返回一轮，不保存历史）
- 已登录解锁全部功能（多轮、历史、个性化）
- 登录入口始终可见，并在受限时引导用户登录
- 登录状态自动本地存储，刷新/重启浏览器不丢失
- 开发调试可用"记住我"或快捷登录 

## 9. 详细产品逻辑梳理

### 9.1 登录/注册/登出体验
- 支持邮箱+密码注册、登录，支持 Google 登录。
- 注册后自动发送邮箱确认邮件，用户需点击邮件链接激活账号。
- 未确认邮箱前，无法正常登录和体验完整功能。
- 登录状态自动本地存储，刷新页面不丢失。
- 右上角头像点击进入 Profile/My 页面，底部有 Log Out 按钮，点击后安全登出并跳转登录页。
- 登录入口始终可见，未登录时为人型图标，已登录时为头像/昵称。
- 登录页严格还原设计稿，支持"记住我"、忘记密码、Google 登录、自动注册/切换注册模式。

### 9.2 AI对话分层体验
#### 9.2.1 已登录用户
- TopicInput 页首次发起话题，AI 一次性返回 5 句（多轮对话初始内容），并保存到 Supabase 历史。
- Dialogue 页多轮对话，每次发言 AI 只返回 1 句，所有消息实时 update 到 Supabase。
- 历史页可分页查看所有对话，点击历史项直接展示历史内容。

#### 9.2.2 未登录用户
- TopicInput 页首次发起话题，只返回 1 句 AI 回复，不保存历史。
- Dialogue 页仅允许体验一轮，输入框和发送按钮在收到 AI 回复后禁用，底部提示"登录可继续多轮对话"。
- 再次尝试发言会提示"请登录后体验多轮对话"。
- 历史页提示"登录后可查看历史"。

#### 9.2.3 其他场景
- 历史对话回看：点击历史项进入 Dialogue 页，直接展示历史内容，不再调用 AI。

### 9.3 伪代码流程补充
```plaintext
[未登录]
TopicInput -> Dialogue(只返回1轮，输入框禁用) -> "登录查看更多"按钮
点击登录 -> 登录页 -> 登录成功 -> 返回Dialogue(5轮) + 历史页可用

[已登录]
TopicInput -> Dialogue(5轮) -> 多轮对话 -> 历史自动保存 -> 历史页可用

[邮箱注册]
注册 -> 收到确认邮件 -> 点击激活 -> 登录 -> 完整体验

[登出]
Profile/My 页点击 Log Out -> 跳转登录页 -> 恢复未登录体验
```

### 9.4 关键交互与安全说明
- 所有登录/注册/登出/邮箱确认流程均基于 Supabase Auth，安全可靠。
- 前端直连 Supabase，需配置好 RLS Policy，保证数据安全。
- 登录状态、用户信息、历史数据均类型安全，刷新/切换页面不丢失。
- 所有关键产品逻辑已自动化测试，便于持续优化。

## 10. 学习中心功能需求 (2025-01-30 新增)

### 10.1 功能概述
学习中心是SmallTalk的核心学习管理功能，作为底部导航"词汇"tab的主要页面，整合词汇、短语、语法、话题和收藏管理。

### 10.2 核心功能模块

#### 10.2.1 词汇管理
- **来源多样化**: 支持从对话中自动提取、手动添加、系统推荐
- **完整信息**: 单词、音标、释义、例句、发音播放
- **学习状态**: 未学习、学习中、已掌握三种状态
- **智能复习**: 基于遗忘曲线的复习提醒

#### 10.2.2 短语库
- **分类管理**: 问候、旅行、商务、社交、餐饮等分类
- **多语言支持**: 英文短语+中文翻译
- **使用场景**: 每个短语包含实际使用场景说明
- **收藏功能**: 一键收藏重要短语

#### 10.2.3 语法中心
- **系统化分类**: 动词时态、句子结构、介词、词汇等
- **理论+实践**: 语法规则说明+例句展示+练习题
- **交互式练习**: 填空题、选择题等多种题型
- **进度跟踪**: 语法掌握度可视化

#### 10.2.4 话题浏览
- **图标化展示**: 每个话题配备直观图标
- **快速进入**: 点击话题直接进入相关对话
- **学习轨迹**: 记录用户在各话题的学习进度

#### 10.2.5 收藏夹
- **跨类型收藏**: 统一管理词汇、短语、语法的收藏内容
- **分类展示**: 按类型分组显示收藏内容
- **快速访问**: 一键回到原始学习材料

### 10.3 技术实现要求

#### 10.3.1 数据存储设计
```sql
-- 词汇表
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  word TEXT NOT NULL,
  definition TEXT,
  example TEXT,
  pronunciation TEXT,
  source TEXT, -- 'conversation', 'manual', 'system'
  mastery_level INTEGER DEFAULT 0, -- 0: 未学, 1: 学习中, 2: 已掌握
  bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_reviewed TIMESTAMP
);

-- 短语表
CREATE TABLE phrases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  phrase TEXT NOT NULL,
  translation TEXT,
  category TEXT,
  usage_example TEXT,
  bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 语法进度表
CREATE TABLE grammar_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  grammar_topic TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  last_practiced TIMESTAMP
);
```

#### 10.3.2 组件架构
```
Vocabulary.tsx (主页面)
├── VocabularyTab (词汇管理)
├── PhrasesTab (短语库)
├── GrammarTab (语法中心)
├── TopicsTab (话题浏览)
└── BookmarksTab (收藏夹)
```

#### 10.3.3 状态管理
- 使用React useState/useEffect管理本地状态
- Supabase实时同步用户学习数据
- 本地缓存优化用户体验

### 10.4 用户体验设计

#### 10.4.1 交互流程
1. **首次进入**: 默认显示词汇tab，展示来自对话的词汇
2. **Tab切换**: 流畅的tab切换动画和状态保持
3. **搜索体验**: 全局搜索支持跨类型智能匹配
4. **状态反馈**: 即时的视觉反馈和状态更新

#### 10.4.2 个性化功能
- **学习偏好**: 记住用户常用的tab和分类
- **智能推荐**: 基于学习历史推荐相关内容
- **进度可视化**: 直观展示学习进度和成就

### 10.5 底部导航集成
- **导航位置**: 底部导航第三个位置"词汇"
- **图标设计**: 使用book相关图标保持一致性
- **状态同步**: 与其他页面的数据状态保持同步

### 10.6 性能优化
- **懒加载**: Tab内容按需加载
- **虚拟滚动**: 大列表优化渲染性能
- **缓存策略**: 智能缓存用户学习数据

### 10.7 未来扩展
- **AI辅助**: 智能词汇难度评估和推荐
- **社交功能**: 学习小组和词汇分享
- **语音识别**: 发音练习和评测
- **数据分析**: 详细的学习分析报告

## 11. 国际化(i18n)框架设计 (2025-01-30 新增)

### 11.1 需求背景
SmallTalk是面向全球用户的英语学习应用，需要支持多语言界面以提升用户体验：
- **主要目标语言**: 英语(默认)、中文简体
- **扩展语言**: 日语、韩语、西班牙语等
- **用户控制**: 设置页面提供语言切换功能
- **智能检测**: 自动检测浏览器语言偏好

### 11.2 技术架构设计

#### 11.2.1 技术选型
```javascript
// 核心依赖
{
  "react-i18next": "^13.5.0",      // React国际化库
  "i18next": "^23.7.0",            // 核心i18n引擎
  "i18next-browser-languagedetector": "^7.2.0", // 浏览器语言检测
  "i18next-http-backend": "^2.4.0" // 动态加载语言包
}
```

#### 11.2.2 目录结构
```
src/
├── i18n/
│   ├── index.ts                  // i18n初始化配置
│   ├── resources.ts              // 语言资源管理
│   └── detector.ts               // 语言检测配置
├── locales/
│   ├── en/                       // 英语资源包
│   │   ├── common.json           // 通用文本(按钮、标签等)
│   │   ├── navigation.json       // 导航相关(标签页、菜单)
│   │   ├── auth.json            // 认证相关(登录、注册)
│   │   ├── chat.json            // 对话相关(话题、消息)
│   │   ├── learning.json        // 学习中心(词汇、语法)
│   │   └── settings.json        // 设置页面
│   └── zh/                       // 中文资源包
│       ├── common.json
│       ├── navigation.json
│       ├── auth.json
│       ├── chat.json
│       ├── learning.json
│       └── settings.json
├── hooks/
│   └── useLanguage.ts           // 自定义语言管理hook
└── contexts/
    └── LanguageContext.tsx     // 语言状态管理
```

#### 11.2.3 配置实现
```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'smalltalk_language'
    },
    
    interpolation: {
      escapeValue: false
    }
  });
```

### 11.3 使用模式

#### 11.3.1 组件中使用
```tsx
import { useTranslation } from 'react-i18next';

function LearningCenter() {
  const { t } = useTranslation('learning');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('vocabulary.add')}</button>
      <p>{t('grammar.description', { count: 5 })}</p>
    </div>
  );
}
```

#### 11.3.2 语言切换
```tsx
import { useLanguage } from '../hooks/useLanguage';

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {supportedLanguages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### 11.4 语言资源结构

#### 11.4.1 通用资源(common.json)
```json
{
  "buttons": {
    "save": "Save",
    "cancel": "Cancel", 
    "confirm": "Confirm",
    "back": "Back"
  },
  "status": {
    "loading": "Loading...",
    "error": "Error occurred",
    "success": "Success"
  },
  "actions": {
    "bookmark": "Bookmark",
    "unbookmark": "Remove bookmark",
    "play": "Play",
    "share": "Share"
  }
}
```

#### 11.4.2 学习中心(learning.json)
```json
{
  "title": "Learning Center",
  "tabs": {
    "vocabulary": "Vocabulary",
    "phrases": "Phrases", 
    "grammar": "Grammar",
    "topics": "Topics",
    "bookmarks": "Bookmarks"
  },
  "vocabulary": {
    "title": "Vocabulary from Conversations",
    "add": "Add Word",
    "mastered": "Mastered",
    "learning": "Learning"
  },
  "search": {
    "placeholder": "Search phrases, vocabulary, grammar...",
    "results": "Search Results",
    "noResults": "No results found"
  }
}
```

### 11.5 丝滑切换体验设计

#### 11.5.1 性能优化
- **预加载策略**: 应用启动时预加载所有支持语言包
- **缓存机制**: localStorage缓存语言包，减少网络请求
- **懒加载**: 大型语言包按模块拆分，按需加载

#### 11.5.2 用户体验
- **即时切换**: 语言切换无页面刷新，状态保持
- **渐变动画**: 使用CSS transition实现文本切换动画
- **智能检测**: 首次访问根据浏览器语言自动设置
- **持久化**: 用户选择的语言偏好永久保存

#### 11.5.3 切换动画效果
```css
.language-transition {
  transition: opacity 0.2s ease-in-out;
}

.language-transition.changing {
  opacity: 0.7;
}
```

### 11.6 开发工具和流程

#### 11.6.1 翻译管理
- **键值命名**: 采用嵌套结构，语义化命名
- **翻译工具**: 支持i18next-scanner自动提取翻译键
- **质量控制**: 翻译缺失检测和警告机制

#### 11.6.2 开发辅助
```typescript
// 开发环境翻译缺失提醒
const missingKeyHandler = (lng: string, ns: string, key: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Missing translation: ${lng}.${ns}.${key}`);
  }
};
```

### 11.7 扩展性考虑

#### 11.7.1 RTL语言支持
- **布局适配**: 支持阿拉伯语等RTL语言
- **样式调整**: 自动调整文本方向和布局

#### 11.7.2 动态语言包
- **远程加载**: 支持从CDN动态加载语言包
- **热更新**: 支持语言包热更新机制

### 11.8 实施计划

#### 阶段1: 基础框架搭建
1. 安装配置i18next相关依赖
2. 创建基础目录结构和配置文件
3. 实现语言检测和切换功能

#### 阶段2: 核心页面改造
1. 学习中心页面i18n改造(测试页面)
2. 导航和通用组件改造
3. 认证页面(登录/注册)改造

#### 阶段3: 全量覆盖
1. 所有功能页面i18n覆盖
2. 错误提示和反馈信息
3. 动态内容的多语言处理

#### 阶段4: 优化完善
1. 性能优化和用户体验提升
2. 翻译质量检查和完善
3. 自动化测试和CI/CD集成

## 12. 开发服务器启动问题与解决方案 (2025-01-30 新增)

### 12.1 问题描述
在开发调试过程中，使用 `npm run dev` 启动Vite开发服务器时，可能遇到以下问题：
- 命令执行后显示服务器启动成功，但浏览器无法访问 `localhost:5173`
- 出现 `ERR_CONNECTION_REFUSED` 错误
- 服务器进程意外终止或超时

### 12.2 根本原因分析
1. **进程管理问题**: 直接运行 `npm run dev` 在shell中容易因为超时或进程管理问题导致服务器无法正常持续运行
2. **端口占用冲突**: 之前的开发进程可能未完全关闭，导致端口冲突
3. **前台进程限制**: 在某些终端环境中，前台进程可能被意外终止

### 12.3 推荐解决方案

#### 12.3.1 标准启动方式
```bash
# 1. 清理可能的端口占用
lsof -ti:5173,5174 | xargs kill -9 2>/dev/null || true

# 2. 后台启动开发服务器
nohup npm run dev > /dev/null 2>&1 & 

# 3. 验证服务器状态
sleep 3 && curl -s http://localhost:5173 > /dev/null && echo "Server is responding" || echo "Server not responding"
```

#### 12.3.2 备用方案
如果标准方案无效，可以尝试：
```bash
# 使用host绑定方式启动
npm run dev -- --host 0.0.0.0

# 或指定特定端口
npm run dev -- --port 3000
```

### 12.4 开发调试最佳实践

#### 12.4.1 启动前检查
- 确认没有其他Vite进程在运行: `ps aux | grep vite`
- 检查端口占用情况: `lsof -i :5173`
- 清理node_modules缓存: `rm -rf node_modules/.vite` (如有必要)

#### 12.4.2 稳定运行建议
1. **使用后台启动**: 避免因为终端关闭或超时导致服务器停止
2. **进程监控**: 定期检查服务器进程状态
3. **端口管理**: 开发结束后及时清理相关进程

#### 12.4.3 故障排查步骤
1. 检查进程状态: `ps aux | grep vite`
2. 检查端口占用: `lsof -i :5173`
3. 查看错误日志: 如果启动失败，检查终端输出
4. 网络连接测试: `curl -s http://localhost:5173`

### 12.5 自动化脚本
可以创建一个启动脚本来自动化这个过程：
```bash
#!/bin/bash
# scripts/dev-start.sh

echo "正在启动开发服务器..."

# 清理可能的端口占用
echo "清理端口占用..."
lsof -ti:5173,5174 | xargs kill -9 2>/dev/null || true

# 启动服务器
echo "启动开发服务器..."
nohup npm run dev > dev.log 2>&1 &

# 等待启动完成
echo "等待服务器启动..."
sleep 5

# 检查服务器状态
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 开发服务器启动成功！"
    echo "📝 访问地址: http://localhost:5173"
    echo "📋 日志文件: dev.log"
else
    echo "❌ 开发服务器启动失败，请检查日志文件 dev.log"
fi
```

使用方法：
```bash
chmod +x scripts/dev-start.sh
./scripts/dev-start.sh
``` 