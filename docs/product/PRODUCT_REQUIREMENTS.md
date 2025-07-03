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

#### 10.3.4 搜索功能技术实现 (2025-01-30 新增)

**搜索服务架构**:
```typescript
// 搜索结果类型定义
interface SearchResults {
  vocabulary: VocabularyItem[];
  topics: ExtendedTopicItem[]; // 包含收藏对话
}

// 搜索服务实现
export const searchService = {
  async search(query: string, userId: string): Promise<SearchResults> {
    // 1. 搜索用户词汇（仅匹配单词名称）
    const vocabulary = await vocabularyService.getUserVocabulary(userId);
    const matchedVocabulary = vocabulary.filter(v => 
      v.word.toLowerCase().includes(query.toLowerCase())
    );

    // 2. 搜索收藏对话（匹配标题+消息内容）
    const bookmarkedConversations = await getBookmarkedConversations(userId);
    const matchedConversations = bookmarkedConversations.filter(conv => {
      const searchableContent = [
        conv.topic,
        conv.messages?.map(msg => msg.text).join(' ') || ''
      ].join(' ').toLowerCase();
      
      return searchableContent.includes(query.toLowerCase());
    });

    return {
      vocabulary: matchedVocabulary,
      topics: matchedConversations.map(conv => ({
        id: conv.id,
        name: conv.topic,
        icon: '💬',
        description: `${conv.messages?.length || 0} 条消息 • ${new Date(conv.created_at).toLocaleDateString()}`,
        conversation: conv
      }))
    };
  }
};
```

**搜索状态管理**:
```typescript
// Vocabulary.tsx中的搜索状态
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<SearchResults>({ 
  vocabulary: [], 
  topics: [] 
});

// 实时搜索实现
useEffect(() => {
  if (searchQuery.trim()) {
    handleSearch();
  } else {
    setSearchResults({ vocabulary: [], topics: [] });
  }
}, [searchQuery]);

// Tab切换时清空搜索
useEffect(() => {
  setSearchQuery('');
  setSearchResults({ vocabulary: [], topics: [] });
}, [activeTab]);
```

**数据库查询优化**:
```sql
-- 词汇搜索索引
CREATE INDEX idx_vocabulary_word_search 
ON vocabulary(user_id, LOWER(word));

-- 收藏对话搜索索引  
CREATE INDEX idx_conversations_bookmarked_search
ON conversation_history(user_id, bookmarked, topic, created_at DESC);
```

### 10.4 用户体验设计

#### 10.4.1 交互流程
1. **首次进入**: 默认显示词汇tab，展示来自对话的词汇
2. **Tab切换**: 流畅的tab切换动画和状态保持
3. **搜索体验**: 精准搜索用户词汇和收藏对话内容
4. **状态反馈**: 即时的视觉反馈和状态更新

#### 10.4.2 搜索功能设计 (2025-01-30 更新)

**搜索范围定义**:
- **词汇搜索**: 搜索用户词汇库中的单词名称
- **收藏对话搜索**: 搜索用户收藏对话的标题和消息内容
- **搜索逻辑**: 不包含预设话题，只搜索用户个人学习内容

**搜索交互设计**:
```
搜索框布局:
┌─────────────────────────────────────────┐
│ 🔍 Search vocabulary...                 │
└─────────────────────────────────────────┘

搜索结果布局:
┌─────────────────────────────────────────┐
│ 🔍 搜索结果                             │
├─────────────────────────────────────────┤
│ 📚 词汇 (3)                             │
│ ┌─────────────────────────────────────┐ │
│ │ Travel (名词)                       │ │
│ │ 旅行，出行                           │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 💬 收藏对话 (2)                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💬 Travel Planning                  │ │
│ │ 5条消息 • 2025-01-29               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**搜索逻辑实现**:
1. **词汇匹配**: 用户输入关键词 → 匹配词汇表中的单词名称
2. **对话匹配**: 用户输入关键词 → 匹配收藏对话的标题+消息内容
3. **结果展示**: 按类型分组展示，词汇显示完整卡片，对话显示话题卡片
4. **点击交互**: 
   - 词汇结果：直接在当前页面展示词汇详情
   - 对话结果：跳转到对话页面，恢复历史对话

**搜索状态管理**:
- **实时搜索**: 输入关键词立即触发搜索
- **Tab切换清空**: 切换tab时自动清空搜索状态
- **空状态提示**: 无搜索结果时显示友好提示

#### 10.4.3 个性化功能
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
│   │   ├── practice.json        // 练习相关(Quiz、练习)
│   │   ├── settings.json        // 设置页面(偏好、账户)
│   │   ├── help.json           // 帮助文档(FAQ、指南)
│   │   └── index.ts            // 英语资源导出
│   └── zh/                       // 中文资源包
│       ├── common.json
│       ├── navigation.json
│       ├── auth.json
│       ├── chat.json
│       ├── learning.json
│       ├── practice.json
│       ├── settings.json
│       ├── help.json
│       └── index.ts
├── hooks/
│   └── useLanguage.ts           // 语言切换Hook
└── components/
    └── LanguageSwitch.tsx       // 语言切换组件
```

#### 11.2.3 配置文件结构
```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入所有语言资源
import enResources from '../locales/en';
import zhResources from '../locales/zh';

const resources = {
  en: enResources,
  zh: zhResources,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React已经转义
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
```

### 11.3 翻译键值规范

#### 11.3.1 命名约定
```json
{
  "button": {
    "submit": "Submit",
    "cancel": "Cancel", 
    "save": "Save"
  },
  "label": {
    "email": "Email Address",
    "password": "Password"
  },
  "message": {
    "success": "Operation successful",
    "error": "Something went wrong"
  }
}
```

#### 11.3.2 使用规范
```typescript
// 在组件中使用
import { useTranslation } from 'react-i18next';

function LoginForm() {
  const { t } = useTranslation('auth');
  
  return (
    <form>
      <label>{t('label.email')}</label>
      <button>{t('button.submit')}</button>
    </form>
  );
}
```

### 11.4 语言切换实现

#### 11.4.1 全局语言切换Hook
```typescript
// src/hooks/useLanguage.ts
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };
  
  return {
    currentLanguage: i18n.language,
    changeLanguage,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文' }
    ]
  };
};
```

#### 11.4.2 语言切换组件
```typescript
// src/components/LanguageSwitch.tsx
import { useLanguage } from '../hooks/useLanguage';

export const LanguageSwitch = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};
```

### 11.5 关键页面国际化实现

#### 11.5.1 登录注册页面
```json
// locales/en/auth.json
{
  "login": {
    "title": "Welcome Back",
    "subtitle": "Sign in to continue learning",
    "email": "Email Address",
    "password": "Password",
    "rememberMe": "Remember me",
    "forgotPassword": "Forgot password?",
    "submit": "Sign In",
    "switchToRegister": "Don't have an account? Sign up"
  },
  "register": {
    "title": "Join SmallTalk",
    "subtitle": "Start your language learning journey",
    "submit": "Create Account",
    "switchToLogin": "Already have an account? Sign in"
  }
}
```

#### 11.5.2 导航相关
```json
// locales/en/navigation.json
{
  "bottomNav": {
    "chat": "Chat",
    "practice": "Practice", 
    "vocabulary": "Vocabulary",
    "profile": "Profile"
  },
  "topNav": {
    "back": "Back",
    "settings": "Settings",
    "help": "Help"
  }
}
```

## 12. Quiz与Matching游戏化学习功能需求 (2025-01-30 新增)

### 12.1 产品定位
通过游戏化和社交化的学习体验，让用户高效记忆单词，持续保持学习热情，结合艾宾浩斯遗忘曲线算法实现科学复习。

#### 12.1.1 目标用户
- **核心用户**: 需要背单词的学生（初高中、大学备考TOEFL/IELTS/GRE等）和职场人士
- **次级用户**: 兴趣学习者或语言爱好者

#### 12.1.2 产品愿景
做到"学得快，记得牢"，通过游戏化让学习变得有趣且高效。

### 12.2 核心游戏模式设计

#### 12.2.1 Quiz模式
**基础玩法**:
- 选择题形式测试单词掌握情况
- 4选1的答案选择，包含单词释义、例句理解等题型

**难度动态调整**:
- 根据用户答题正确率和单词熟练度动态调整
- 高熟练度单词减少出现频率
- 低熟练度单词增加出现频率
- 内置艾宾浩斯遗忘曲线算法自动安排复习

**奖励机制**:
- 每题正确获得基础积分（10分）
- 连续答对触发连击奖励（2x、3x积分加成）
- 完美答题（10/10）获得"Perfect Streak"成就
- 答题结束显示正确率、积分、复习建议

#### 12.2.2 Matching模式  
**基础玩法**:
- 单词与释义/例句的配对游戏
- 点击匹配相应的单词和含义

**趣味性优化**:
- 限时挑战（60秒内匹配最多单词）
- 多种主题（动物、科技、商务、旅行等）
- 可选择感兴趣的主题进行专项练习

**奖励机制**:
- 按匹配正确率和完成时间计算积分
- 时间越短、正确率越高，积分越多
- 完成特定主题解锁成就（如"科技达人"、"旅行专家"）

### 12.3 学习积分系统

#### 12.3.1 积分来源
- **日常练习**: Quiz/Matching完成获得积分
- **连续学习**: 连续多日打卡有额外积分奖励（连续7天+50%，连续30天+100%）
- **完美表现**: 满分完成获得奖励积分
- **社交互动**: 好友对战、分享学习成果获得积分

#### 12.3.2 积分用途
- **解锁内容**: 解锁新主题（高级单词包、专业词汇等）
- **虚拟奖励**: 头像框、背景图、特殊称号
- **对战入场券**: 参与排行榜竞赛、好友对战
- **学习工具**: 购买额外的复习提醒、学习报告等

### 12.4 艾宾浩斯遗忘曲线算法

#### 12.4.1 复习时间安排
- **第1次复习**: 学习后20分钟
- **第2次复习**: 学习后1天  
- **第3次复习**: 学习后3天
- **第4次复习**: 学习后7天
- **第5次复习**: 学习后15天
- **第6次复习**: 学习后30天

#### 12.4.2 熟练度管理
**等级划分**:
- **未掌握**(0分): 从未学习或多次答错
- **初级掌握**(1-2分): 正确率60-80%，需要继续巩固
- **完全掌握**(3分): 正确率90%以上，进入长期记忆

**动态调整**:
- 答对+1分，答错-1分（最低0分）
- 连续3次答对进入下一等级
- 答错立即降级，重新安排复习

#### 12.4.3 智能推荐
- 每日学习任务自动生成：70%复习+30%新单词
- 根据用户学习时间偏好推送复习提醒
- 临近考试时调整复习频率和难度

### 12.5 社交功能设计

#### 12.5.1 排行榜系统
**个人排行榜**:
- 按周、月、总积分显示排名
- 全国排名、地区排名、好友排名
- 排名变化趋势展示

**好友排行榜**:
- 专属好友学习圈
- 每周积分最高者获得"学习之星"称号
- 好友学习进度对比

#### 12.5.2 好友分享功能
**学习成果分享**:
- 生成精美的学习报告卡片
- 包含学习时长、正确率、积分、连续天数等
- 一键分享到微信、微博、朋友圈等社交平台
- 分享内容包含激励语句和邀请链接

**挑战分享**:
- 完成高难度挑战后生成成就卡片
- 邀请好友挑战相同题目
- 分享链接支持直接跳转到挑战页面

#### 12.5.3 好友对战
**实时对战**:
- 好友间实时Quiz/Matching PK
- 同时完成10道相同题目
- 实时显示双方答题进度和得分
- 对战结束显示详细报告和排名

**异步对战**:
- 好友不在线时发起异步挑战
- 系统记录挑战题目和用户成绩
- 好友上线后完成挑战，系统自动计算结果
- 对战积分计入总积分和排行榜

### 12.6 成就系统

#### 12.6.1 成就分类
**学习类成就**:
- "初出茅庐": 完成首次Quiz/Matching
- "勤学苦练": 完成100次练习
- "学霸": 连续10次满分
- "博学": 学会1000个单词

**社交类成就**:
- "社交达人": 添加10个好友
- "挑战者": 发起100次好友对战
- "分享之王": 分享学习成果50次

**坚持类成就**:
- "持之以恒": 连续打卡7天
- "月度坚持": 连续打卡30天
- "年度学霸": 连续打卡365天

#### 12.6.2 成就奖励
- 解锁特殊头像框和称号
- 获得额外积分奖励
- 解锁隐藏学习内容
- 获得好友对战特权

### 12.7 打卡系统

#### 12.7.1 打卡规则
- 每日完成至少1次Quiz或Matching即可打卡
- 连续打卡天数累计，中断后重新开始
- 支持补签功能（使用积分购买）

#### 12.7.2 打卡奖励
- **连续7天**: 积分+50%加成1天
- **连续30天**: 解锁特殊主题
- **连续100天**: 获得"坚持之星"称号
- **连续365天**: 获得"年度学霸"终极成就

### 12.8 技术架构设计

#### 12.8.1 数据库设计
```sql
-- 练习记录表
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'quiz' or 'matching'
  topic TEXT,
  score INTEGER,
  total_questions INTEGER,
  correct_answers INTEGER,
  time_spent INTEGER, -- 秒
  streak_count INTEGER DEFAULT 0,
  perfect_score BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 单词熟练度表  
CREATE TABLE word_mastery (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  word_id UUID,
  word TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0, -- 0-3
  next_review TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户积分表
CREATE TABLE user_points (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_points INTEGER DEFAULT 0,
  daily_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  streak_bonus INTEGER DEFAULT 0,
  last_daily_reset DATE DEFAULT CURRENT_DATE,
  last_weekly_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 打卡记录表
CREATE TABLE check_in_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  check_in_date DATE DEFAULT CURRENT_DATE,
  consecutive_days INTEGER DEFAULT 1,
  activities JSONB, -- 记录当日完成的练习活动
  bonus_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 好友对战表
CREATE TABLE friend_battles (
  id UUID PRIMARY KEY,
  challenger_id UUID REFERENCES auth.users(id),
  opponent_id UUID REFERENCES auth.users(id),
  battle_type TEXT NOT NULL, -- 'quiz' or 'matching'
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'expired'
  challenger_score INTEGER,
  opponent_score INTEGER,
  questions JSONB, -- 题目数据
  settings JSONB, -- 对战设置(主题、难度等)
  winner_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 成就记录表
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_type TEXT NOT NULL, -- 'learning', 'social', 'streak'
  achievement_code TEXT NOT NULL, -- 'first_quiz', 'perfect_10', etc.
  achievement_name TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

-- 学习主题表
CREATE TABLE learning_topics (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'animals', 'technology', 'business', etc.
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  word_count INTEGER DEFAULT 0,
  unlock_points INTEGER DEFAULT 0, -- 需要积分解锁
  icon TEXT,
  description TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户解锁记录表
CREATE TABLE user_unlocks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  unlock_type TEXT NOT NULL, -- 'topic', 'achievement', 'avatar', etc.
  unlock_id TEXT NOT NULL,
  points_spent INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP DEFAULT NOW()
);
```

#### 12.8.2 组件架构
```
Practice.tsx (练习主页)
├── GameModeSelector.tsx (游戏模式选择)
├── QuizGame.tsx (Quiz游戏组件)
│   ├── QuizQuestion.tsx (题目组件)
│   ├── QuizOptions.tsx (选项组件)
│   └── QuizTimer.tsx (计时器)
├── MatchingGame.tsx (Matching游戏组件)
│   ├── MatchingGrid.tsx (匹配网格)
│   ├── MatchingCard.tsx (卡片组件)
│   └── MatchingTimer.tsx (计时器)
├── GameResult.tsx (结果展示)
│   ├── ScoreDisplay.tsx (分数展示)
│   ├── StreakDisplay.tsx (连击展示)
│   └── RecommendationPanel.tsx (建议面板)
├── SocialFeatures/ (社交功能)
│   ├── LeaderBoard.tsx (排行榜)
│   ├── FriendBattle.tsx (好友对战)
│   ├── ShareResult.tsx (分享结果)
│   └── AchievementModal.tsx (成就弹窗)
├── Progress/ (进度相关)
│   ├── CheckInPanel.tsx (打卡面板)
│   ├── StreakCounter.tsx (连击计数)
│   ├── PointsDisplay.tsx (积分显示)
│   └── AchievementBadges.tsx (成就徽章)
└── Settings/ (设置相关)
    ├── DifficultySelector.tsx (难度选择)
    ├── TopicSelector.tsx (主题选择)
    └── GameSettings.tsx (游戏设置)
```

#### 12.8.3 核心算法服务
```typescript
// 艾宾浩斯遗忘曲线算法
class SpacedRepetitionAlgorithm {
  // 计算下次复习时间
  calculateNextReview(masteryLevel: number, reviewCount: number): Date {
    const intervals = [20 * 60, 24 * 60 * 60, 3 * 24 * 60 * 60, 
                      7 * 24 * 60 * 60, 15 * 24 * 60 * 60, 30 * 24 * 60 * 60]; // 秒
    const interval = intervals[Math.min(reviewCount, intervals.length - 1)];
    const adjustedInterval = interval * (1 + masteryLevel * 0.3); // 根据熟练度调整
    return new Date(Date.now() + adjustedInterval * 1000);
  }

  // 更新熟练度等级
  updateMasteryLevel(isCorrect: boolean, currentLevel: number, consecutiveCorrect: number): number {
    if (isCorrect) {
      if (consecutiveCorrect >= 3 && currentLevel < 3) {
        return currentLevel + 1;
      }
      return Math.min(currentLevel + 0.1, 3);
    } else {
      return Math.max(currentLevel - 0.5, 0);
    }
  }

  // 生成每日学习任务
  async generateDailyTasks(userId: string): Promise<Task[]> {
    const reviewWords = await this.getWordsNeedingReview(userId);
    const newWords = await this.getNewWordsForUser(userId, 10);
    
    return [
      ...reviewWords.map(word => ({ type: 'review', word, priority: 'high' })),
      ...newWords.map(word => ({ type: 'learn', word, priority: 'normal' }))
    ].slice(0, 20); // 限制每日任务数量
  }
}

// 积分计算引擎
class PointsEngine {
  // Quiz积分计算
  calculateQuizPoints(correctAnswers: number, totalQuestions: number, 
                     timeSpent: number, streakCount: number): number {
    const basePoints = correctAnswers * 10;
    const accuracyBonus = (correctAnswers / totalQuestions) >= 0.8 ? 20 : 0;
    const speedBonus = timeSpent < (totalQuestions * 10) ? 15 : 0; // 10秒/题为快速
    const streakBonus = Math.min(streakCount * 5, 50); // 连击奖励，最高50分
    
    return basePoints + accuracyBonus + speedBonus + streakBonus;
  }

  // Matching积分计算
  calculateMatchingPoints(correctMatches: number, totalMatches: number, 
                         timeSpent: number): number {
    const basePoints = correctMatches * 8;
    const accuracyBonus = (correctMatches / totalMatches) >= 0.9 ? 25 : 0;
    const speedBonus = this.calculateSpeedBonus(timeSpent, totalMatches);
    
    return basePoints + accuracyBonus + speedBonus;
  }

  // 连击奖励计算
  applyStreakMultiplier(basePoints: number, streakCount: number): number {
    if (streakCount >= 10) return basePoints * 3;
    if (streakCount >= 5) return basePoints * 2;
    if (streakCount >= 3) return Math.floor(basePoints * 1.5);
    return basePoints;
  }

  // 每日连续奖励
  calculateDailyStreakBonus(consecutiveDays: number): number {
    if (consecutiveDays >= 30) return 100;
    if (consecutiveDays >= 7) return 50;
    if (consecutiveDays >= 3) return 20;
    return 0;
  }
}

// 游戏难度调整算法
class DifficultyEngine {
  // 根据用户表现调整难度
  adjustDifficulty(userPerformance: UserPerformance): GameDifficulty {
    const { averageAccuracy, averageTime, recentSessions } = userPerformance;
    
    if (averageAccuracy > 0.85 && averageTime < 8) {
      return 'hard';
    } else if (averageAccuracy > 0.7 && averageTime < 12) {
      return 'medium';
    } else {
      return 'easy';
    }
  }

  // 选择适合的单词
  selectWordsForSession(difficulty: GameDifficulty, userVocabulary: Word[], 
                       sessionType: 'quiz' | 'matching'): Word[] {
    const wordsByLevel = this.groupWordsByDifficulty(userVocabulary);
    const sessionSize = sessionType === 'quiz' ? 10 : 8;
    
    switch (difficulty) {
      case 'easy':
        return this.selectFromLevels(wordsByLevel, [0, 1], sessionSize);
      case 'medium':
        return this.selectFromLevels(wordsByLevel, [1, 2], sessionSize);
      case 'hard':
        return this.selectFromLevels(wordsByLevel, [2, 3], sessionSize);
    }
  }
}
```

### 12.9 用户体验流程

#### 12.9.1 新用户引导
1. **欢迎页面**: 介绍Quiz和Matching玩法，展示学习目标
2. **能力测试**: 10道简单Quiz测试确定初始水平
3. **首次体验**: 引导完成第一次Quiz和Matching，给予正面反馈
4. **奖励反馈**: 获得新手积分包和"初学者"成就
5. **目标设定**: 帮助用户设定学习目标和每日任务量

#### 12.9.2 日常学习流程  
1. **进入练习页**: 显示今日推荐任务、复习提醒、积分进度
2. **选择模式**: Quiz/Matching/混合模式，可选择主题和难度
3. **开始练习**: 
   - 动态调整难度，确保适中挑战性
   - 实时显示进度条、连击次数、剩余时间
   - 即时反馈答题结果，错误时显示正确答案
4. **查看结果**: 
   - 积分获得、正确率、用时统计
   - 学习建议、需要复习的单词
   - 打卡状态、连续天数更新
5. **社交分享**: 
   - 一键生成学习报告卡片
   - 分享到社交平台，邀请好友挑战

#### 12.9.3 好友对战流程
1. **发起对战**: 
   - 从好友列表选择对手
   - 选择对战模式（Quiz/Matching）和主题
   - 设定对战规则（题目数量、时限等）
2. **等待响应**: 
   - 实时对战：等待好友接受，开始同步答题
   - 异步对战：好友可在24小时内完成挑战
3. **进行对战**: 
   - 实时显示双方答题进度和得分
   - 支持表情互动（点赞、加油等）
   - 倒计时显示营造紧张感
4. **结果展示**: 
   - 详细对比双方表现（正确率、速度、积分）
   - 显示单题得分情况和错题解析
   - 积分奖励分配，更新排行榜排名
5. **再次挑战**: 
   - 支持立即发起复仇之战
   - 可以调整难度和主题再次对战

### 12.10 个性化学习引擎

#### 12.10.1 智能内容推荐
```typescript
class PersonalizationEngine {
  // 基于学习历史推荐内容
  async recommendContent(userId: string): Promise<Recommendation[]> {
    const userProfile = await this.getUserLearningProfile(userId);
    const weakAreas = await this.identifyWeakAreas(userId);
    const preferences = await this.getUserPreferences(userId);
    
    return [
      ...this.recommendReviewWords(weakAreas),
      ...this.recommendNewTopics(preferences),
      ...this.recommendChallenges(userProfile.skill_level)
    ];
  }

  // 学习路径规划
  createLearningPath(userLevel: number, goals: string[]): LearningPath {
    const milestones = this.generateMilestones(userLevel, goals);
    const dailyTasks = this.planDailyTasks(milestones);
    
    return {
      milestones,
      dailyTasks,
      estimatedDuration: this.calculateDuration(milestones),
      adaptiveAdjustments: true
    };
  }
}
```

#### 12.10.2 自适应难度系统
- **实时调整**: 根据用户答题情况动态调整题目难度
- **学习曲线**: 确保学习挑战性适中，避免过难或过易
- **个性化节奏**: 适应不同用户的学习速度和偏好

### 12.11 数据分析与报告

#### 12.11.1 学习分析
```typescript
interface LearningAnalytics {
  // 每日统计
  daily: {
    wordsLearned: number;
    practiceTime: number;
    accuracy: number;
    streakCount: number;
  };
  
  // 每周分析
  weekly: {
    totalSessions: number;
    averageAccuracy: number;
    improvementRate: number;
    weakTopics: string[];
  };
  
  // 长期趋势
  trends: {
    learningVelocity: number;
    retentionRate: number;
    masteryProgression: MasteryLevel[];
    goalProgress: number;
  };
}
```

#### 12.11.2 性能指标监控
- **学习效率**: 单位时间内的学习成果
- **记忆保持**: 长期记忆效果评估
- **参与度**: 用户活跃度和粘性指标
- **社交影响**: 好友互动对学习效果的影响

### 12.12 运营策略与活动

#### 12.12.1 定期活动设计
**主题挑战月**:
- 每月推出特定主题（科技、旅行、商务等）
- 特殊奖励和限定成就
- 排行榜竞赛和团体挑战

**学习节日**:
- 世界读书日、国际教育日等特殊节日活动
- 双倍积分、免费解锁内容
- 社区分享和表彰优秀学习者

**社交促进活动**:
- 好友邀请奖励计划
- 学习小组功能和团队挑战
- 分享有奖活动

#### 12.12.2 用户分层运营
**新用户（0-7天）**:
- 详细功能引导和新手任务
- 新手积分包和成就奖励
- 一对一学习顾问服务

**活跃用户（7-30天）**:
- 个性化学习挑战
- 高级功能逐步解锁
- 社交功能推荐

**核心用户（30天以上）**:
- 高级挑战和专属内容
- 社区领袖权限
- 内测新功能邀请

**流失风险用户**:
- 个性化学习提醒
- 特殊回归奖励
- 简化学习任务

### 12.13 技术性能优化

#### 12.13.1 前端优化
- **组件懒加载**: 按需加载游戏组件
- **状态管理**: 使用React Context优化状态传递
- **动画优化**: CSS3动画和React Spring提升交互体验
- **缓存策略**: 智能缓存用户数据和游戏资源

#### 12.13.2 后端优化
- **算法优化**: 艾宾浩斯算法的高效实现
- **数据库索引**: 优化查询性能，特别是排行榜和统计查询
- **实时功能**: WebSocket实现好友对战实时同步
- **缓存层**: Redis缓存热点数据

### 12.14 未来扩展规划

#### 12.14.1 AI智能化
- **智能出题**: AI生成个性化题目
- **语音识别**: 发音练习和评测
- **聊天机器人**: AI学习助手和答疑

#### 12.14.2 内容扩展
- **多语言支持**: 扩展到其他语言学习
- **专业词汇**: 行业专业词汇包
- **考试专项**: 托福、雅思等考试专项训练

#### 12.14.3 社交功能深化
- **学习社区**: 构建学习者社区
- **导师系统**: 高级用户指导新手
- **学习群组**: 基于兴趣的学习小组

这套Quiz和Matching重构方案将打造一个完整的游戏化学习生态系统，通过科学的记忆算法、丰富的社交功能和个性化的学习体验，显著提升用户的学习效果和平台粘性。

## 13. 总结与下阶段规划

### 13.1 本次优化成果总结

#### UI/UX优化
✅ **路由系统简化**: 删除重复路由，统一用户访问路径  
✅ **Profile页面优化**: 删除冗余功能，简化界面布局  
✅ **Vocabulary页面简化**: 专注核心功能，提升使用效率  
✅ **导航一致性**: 更新翻译文件，保持界面文本统一

#### 新功能设计
🔄 **History收藏功能**: 将对话转化为可重复学习的话题资源  
🔄 **Topics个性化**: 基于用户收藏的个性化学习话题推荐

### 13.2 用户体验提升
- **简化操作流程**: 减少冗余步骤，提升操作效率
- **功能定位明确**: 每个页面专注核心功能，避免混乱  
- **数据价值最大化**: 历史对话可转化为学习资源
- **个性化学习**: 基于用户兴趣的话题推荐机制

### 13.3 下阶段开发重点
1. **History收藏功能开发** (当前优先级)
2. **国际化体验完善** (持续优化)  
3. **移动端响应式适配** (用户体验)
4. **AI对话质量提升** (核心功能)

## 14. Quiz与Matching游戏化重构需求 (2025-01-30 最新更新)

### 14.1 产品背景与目标
基于现有Practice页面，重构Quiz和Matching功能，打造游戏化、社交化的单词学习体验，结合艾宾浩斯遗忘曲线算法实现科学复习。

**核心目标**：
- 提升学习趣味性和用户粘性
- 实现科学化的单词记忆和复习
- 增强社交互动促进学习动力
- 建立完整的学习激励体系

### 14.2 重构后的Practice页面架构

#### 14.2.1 页面入口与导航
- **位置**: 底部导航第二个tab"Practice"
- **主页面**: Practice.tsx作为游戏模式选择页
- **子模式**: Quiz游戏、Matching游戏、混合模式
- **快速入口**: 支持直接启动今日推荐练习

#### 14.2.2 游戏模式选择界面
```
Practice主页布局:
┌─────────────────────────────────────┐
│ 🎯 今日学习目标                     │
│ 新单词: 10个 | 复习: 20个          │
├─────────────────────────────────────┤
│ 📊 学习进度                         │
│ ████████░░ 80% (积分: 2,450)      │
├─────────────────────────────────────┤
│ 🎮 选择练习模式                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ 📝 Quiz │ │ 🎯 Match│ │ 🔀 混合 ││
│ │ 选择题  │ │ 配对游戏│ │ 模式   ││
│ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────┤
│ 🏆 社交功能                        │
│ 排行榜 | 好友对战 | 分享成果       │
└─────────────────────────────────────┘
```

### 14.3 Quiz游戏重新设计

#### 14.3.1 游戏机制升级
**题型多样化**:
- **单词释义**: 选择正确的中文释义
- **例句理解**: 根据例句选择对应单词
- **同义词辨析**: 选择意思最接近的单词
- **语境应用**: 根据语境选择最合适的单词

**智能出题算法**:
```typescript
interface QuizQuestion {
  id: string;
  type: 'definition' | 'example' | 'synonym' | 'context';
  word: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 1 | 2 | 3; // 基础、中级、高级
  explanation: string;
}

class QuizEngine {
  // 基于用户水平生成题目
  generateQuestions(userLevel: number, wordList: Word[]): QuizQuestion[] {
    // 70%已学单词复习 + 30%新单词学习
    const reviewWords = this.selectReviewWords(wordList, userLevel);
    const newWords = this.selectNewWords(wordList, userLevel);
    
    return [...reviewWords, ...newWords]
      .map(word => this.createQuestion(word, userLevel))
      .sort(() => Math.random() - 0.5); // 随机打乱
  }
}
```

#### 14.3.2 游戏体验增强
**实时反馈系统**:
- **即时判定**: 选择后立即显示对错，绿色✓或红色✗
- **解释说明**: 错误时显示正确答案和详细解释
- **进度显示**: 实时显示当前进度"5/10"和剩余时间
- **连击提示**: 连续答对时显示"连击x3!"动画效果

**激励机制设计**:
- **基础积分**: 每题答对获得10分
- **速度奖励**: 5秒内答对额外+5分
- **连击奖励**: 连续3题+50%积分，连续5题+100%积分
- **完美奖励**: 全部答对额外+100分奖励

### 14.4 Matching游戏全新设计

#### 14.4.1 游戏玩法创新
**匹配模式**:
- **经典模式**: 单词与释义一对一匹配
- **快速模式**: 限时60秒内完成最多匹配
- **挑战模式**: 增加干扰项，提高难度
- **主题模式**: 特定主题(旅行、商务、科技等)专项练习

**游戏界面设计**:
```
Matching游戏界面:
┌─────────────────────────────────────┐
│ ⏱️ 01:25 | 🎯 8/10 | ⚡ 连击x4    │
├─────────────────────────────────────┤
│ 单词区域:                           │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Travel  │ │ Business│ │ Technology ││
│ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────┤
│ 释义区域:                           │
│ ┌─────────────┐ ┌─────────────┐   │
│ │ 商业，生意   │ │ 科技，技术   │   │
│ └─────────────┘ └─────────────┘   │
│ ┌─────────────┐                    │
│ │ 旅行，出行   │                    │
│ └─────────────┘                    │
└─────────────────────────────────────┘
```

#### 14.4.2 交互体验优化
**匹配动效**:
- **连线动画**: 点击匹配时显示连线动画
- **成功反馈**: 正确匹配时卡片变绿并消失
- **错误提示**: 错误匹配时红色闪烁提示
- **完成庆祝**: 全部完成时播放庆祝动画

### 14.5 艾宾浩斯遗忘曲线算法实现

#### 14.5.1 科学复习时间表
```typescript
class SpacedRepetitionSystem {
  // 标准复习间隔(小时)
  private static REVIEW_INTERVALS = [
    0.33,    // 20分钟后
    24,      // 1天后  
    72,      // 3天后
    168,     // 7天后
    360,     // 15天后
    720      // 30天后
  ];

  // 计算下次复习时间
  calculateNextReview(
    masteryLevel: number, 
    reviewCount: number, 
    lastCorrect: boolean
  ): Date {
    let intervalIndex = Math.min(reviewCount, this.REVIEW_INTERVALS.length - 1);
    
    // 根据熟练度和答题结果调整间隔
    if (!lastCorrect) {
      intervalIndex = Math.max(0, intervalIndex - 1); // 降级
    } else if (masteryLevel >= 2) {
      intervalIndex = Math.min(intervalIndex + 1, this.REVIEW_INTERVALS.length - 1); // 升级
    }
    
    const hours = this.REVIEW_INTERVALS[intervalIndex];
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
}
```

#### 14.5.2 个性化学习计划
**每日任务生成**:
- **复习任务**: 基于遗忘曲线到期的单词
- **新学任务**: 根据用户水平推荐新单词
- **弱项强化**: 识别薄弱环节，增加练习频率
- **目标导向**: 结合用户设定的学习目标调整任务

### 14.6 社交功能全面升级

#### 14.6.1 好友系统设计
**好友管理**:
- **添加好友**: 通过用户名、邮箱或二维码添加
- **好友列表**: 显示在线状态、学习进度、最近活动
- **学习圈子**: 创建或加入学习小组，共同进步
- **互动功能**: 点赞、评论、相互鼓励

#### 14.6.2 分享功能
**学习成果分享**:
- 生成精美的学习报告卡片
- 包含学习时长、正确率、积分、连续天数等
- 一键分享到微信、微博、朋友圈等社交平台
- 分享内容包含激励语句和邀请链接

**挑战分享**:
- 完成高难度挑战后生成成就卡片
- 邀请好友挑战相同题目
- 分享链接支持直接跳转到挑战页面

#### 14.6.3 排行榜体系
**多维度排名**:
- **积分排行**: 总积分、周积分、月积分排名
- **学习排行**: 学习天数、单词掌握数量排名
- **对战排行**: 对战胜率、连胜记录排名
- **好友排行**: 好友圈内的专属排名

### 14.7 成就与激励系统

#### 14.7.1 成就分类体系
```typescript
interface Achievement {
  id: string;
  category: 'learning' | 'social' | 'streak' | 'challenge';
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: string;
    value: number;
    timeframe?: string;
  };
  rewards: {
    points?: number;
    badge?: string;
    title?: string;
    unlocks?: string[];
  };
}
```

**学习类成就**:
- 🏆 "初学者": 完成第一次练习
- 🎯 "神射手": Quiz连续10题全对
- ⚡ "闪电侠": Matching游戏30秒内完成
- 📚 "词汇大师": 掌握1000个单词

**社交类成就**:
- 👥 "社交达人": 添加10个好友
- 🎉 "分享之王": 分享学习成果50次
- 👑 "排行榜王者": 周排行榜第一名
- 📈 "影响力者": 通过分享带来10个新用户注册

**坚持类成就**:
- 🔥 "坚持7天": 连续打卡7天
- 💪 "月度坚持": 连续打卡30天
- 🌟 "年度学霸": 连续打卡365天

#### 14.7.2 打卡系统设计
**打卡机制**:
- **基础打卡**: 完成任意练习即可打卡
- **质量打卡**: 完成每日推荐任务才能打卡
- **连续奖励**: 连续天数越多，奖励越丰厚
- **补签功能**: 使用积分或观看广告补签

**奖励递增**:
- 连续3天: +20积分
- 连续7天: +50积分 + 特殊徽章
- 连续30天: +200积分 + 解锁高级主题
- 连续100天: +500积分 + 专属称号

### 14.8 数据分析与个性化

#### 14.8.1 学习数据追踪
```typescript
interface UserLearningProfile {
  // 基础统计
  totalWords: number;
  masteredWords: number;
  currentStreak: number;
  totalSessions: number;
  
  // 能力评估
  skillLevel: number; // 1-10
  strongAreas: string[];
  weakAreas: string[];
  learningSpeed: number;
  
  // 偏好分析
  preferredGameMode: 'quiz' | 'matching' | 'mixed';
  preferredTopics: string[];
  optimalSessionLength: number;
  peakLearningHours: number[];
  
  // 社交数据
  friendCount: number;
  battleWinRate: number;
  shareFrequency: number;
}
```

#### 14.8.2 智能推荐引擎
**内容推荐**:
- **难度适配**: 根据用户能力推荐合适难度的内容
- **兴趣匹配**: 基于学习历史推荐感兴趣的主题
- **时间优化**: 在用户最佳学习时段推送提醒
- **社交推荐**: 推荐水平相近的好友进行对战

### 14.9 技术实现架构

#### 14.9.1 前端组件结构
```
src/pages/Practice.tsx (主页面)
├── components/
│   ├── GameModeSelector.tsx (模式选择)
│   ├── DailyProgress.tsx (每日进度)
│   ├── QuickStart.tsx (快速开始)
│   └── SocialPanel.tsx (社交面板)
├── games/
│   ├── quiz/
│   │   ├── QuizGame.tsx (Quiz主组件)
│   │   ├── QuizQuestion.tsx (题目组件)
│   │   ├── QuizTimer.tsx (计时器)
│   │   └── QuizResult.tsx (结果页)
│   └── matching/
│       ├── MatchingGame.tsx (Matching主组件)
│       ├── MatchingBoard.tsx (游戏面板)
│       ├── MatchingCard.tsx (匹配卡片)
│       └── MatchingResult.tsx (结果页)
├── social/
│   ├── LeaderBoard.tsx (排行榜)
│   ├── FriendBattle.tsx (好友对战)
│   ├── BattleRoom.tsx (对战房间)
│   └── SharePanel.tsx (分享面板)
└── systems/
    ├── AchievementSystem.tsx (成就系统)
    ├── CheckInSystem.tsx (打卡系统)
    ├── PointsSystem.tsx (积分系统)
    └── ProgressTracker.tsx (进度跟踪)
```

#### 14.9.2 数据库架构设计
```sql
-- 用户学习档案表
CREATE TABLE user_learning_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  skill_level INTEGER DEFAULT 1,
  total_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  preferred_game_mode TEXT DEFAULT 'quiz',
  learning_goals JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 单词掌握记录表
CREATE TABLE word_mastery_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  word TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0, -- 0-3级
  review_count INTEGER DEFAULT 0,
  last_review TIMESTAMP,
  next_review TIMESTAMP,
  consecutive_correct INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 游戏会话记录表
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  game_type TEXT NOT NULL, -- 'quiz', 'matching'
  mode TEXT, -- 'classic', 'timed', 'challenge'
  score INTEGER,
  max_score INTEGER,
  accuracy DECIMAL(5,2),
  time_spent INTEGER, -- 秒
  questions_answered INTEGER,
  streak_achieved INTEGER,
  points_earned INTEGER,
  session_data JSONB, -- 详细游戏数据
  created_at TIMESTAMP DEFAULT NOW()
);

-- 好友关系表
CREATE TABLE friend_relationships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  friend_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 用户成就记录表
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_id TEXT NOT NULL,
  achievement_category TEXT,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress_data JSONB -- 成就进度数据
);

-- 积分交易记录表
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  transaction_type TEXT NOT NULL, -- 'earn', 'spend'
  points INTEGER,
  source TEXT, -- 'quiz', 'matching', 'streak', 'achievement', etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 打卡记录表
CREATE TABLE check_in_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  check_in_date DATE DEFAULT CURRENT_DATE,
  consecutive_days INTEGER DEFAULT 1,
  quality_checkin BOOLEAN DEFAULT FALSE, -- 是否完成了质量打卡
  bonus_points INTEGER DEFAULT 0,
  activities JSONB, -- 当日完成的学习活动
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 14.9.3 核心服务层设计
```typescript
// 游戏引擎服务
export class GameEngineService {
  async startQuizSession(userId: string, settings: QuizSettings): Promise<QuizSession>
  async submitQuizAnswer(sessionId: string, answer: QuizAnswer): Promise<QuizResult>
  async startMatchingSession(userId: string, settings: MatchingSettings): Promise<MatchingSession>
  async submitMatching(sessionId: string, matching: MatchingPair): Promise<MatchingResult>
}

// 艾宾浩斯算法服务
export class SpacedRepetitionService {
  async getWordsForReview(userId: string): Promise<Word[]>
  async updateWordMastery(userId: string, word: string, correct: boolean): Promise<void>
  async generateDailyTasks(userId: string): Promise<LearningTask[]>
  async calculateNextReview(wordId: string, performance: Performance): Promise<Date>
}

// 社交功能服务
export class SocialService {
  async addFriend(userId: string, friendId: string): Promise<void>
  async acceptFriendRequest(userId: string, friendId: string): Promise<void>
  async getFriendsList(userId: string): Promise<Friend[]>
  async getLeaderboard(type: LeaderboardType, timeframe: TimeFrame): Promise<LeaderboardEntry[]>
  async shareAchievement(userId: string, achievementId: string): Promise<ShareLink>
}

// 成就系统服务
export class AchievementService {
  async checkAchievements(userId: string, action: UserAction): Promise<Achievement[]>
  async unlockAchievement(userId: string, achievementId: string): Promise<void>
  async getUserAchievements(userId: string): Promise<UserAchievement[]>
  async calculateAchievementProgress(userId: string): Promise<AchievementProgress[]>
}

// 积分系统服务
export class PointsService {
  async awardPoints(userId: string, points: number, source: string): Promise<void>
  async spendPoints(userId: string, points: number, purpose: string): Promise<boolean>
  async getUserPoints(userId: string): Promise<UserPoints>
  async getPointsHistory(userId: string, limit?: number): Promise<PointsTransaction[]>
}
```

### 14.10 实施计划与里程碑

#### 14.10.1 第一阶段：核心游戏功能 (Week 1-2)
- ✅ 重构Practice页面主框架
- ✅ 实现新版Quiz游戏引擎
- ✅ 实现新版Matching游戏引擎  
- ✅ 集成艾宾浩斯算法
- ✅ 基础积分系统

#### 14.10.2 第二阶段：社交功能和激励系统 (Week 3-4)
- 🔄 好友系统开发
- 🔄 排行榜系统
- 🔄 分享功能
- 🔄 成就系统
- 🔄 打卡系统

#### 14.10.3 第三阶段：个性化与优化 (Week 5-6)
- ⏳ 智能推荐引擎
- ⏳ 学习数据分析
- ⏳ 性能优化
- ⏳ UI/UX细节优化
- ⏳ 全面测试

#### 14.10.4 第四阶段：高级功能 (Week 7-8)
- ⏳ 高级成就系统
- ⏳ 学习社区功能
- ⏳ AI智能出题
- ⏳ 数据可视化
- ⏳ 运营活动系统

### 14.11 成功指标与KPI

#### 14.11.1 用户参与度指标
- **日活跃用户(DAU)**: 目标提升50%
- **平均会话时长**: 目标增加到15分钟
- **用户留存率**: 7日留存率达到60%
- **游戏完成率**: Quiz/Matching完成率达到80%

#### 14.11.2 学习效果指标
- **单词掌握效率**: 每小时掌握单词数提升30%
- **长期记忆保持**: 30天后单词记忆保持率达到70%
- **学习坚持性**: 连续学习7天的用户比例达到40%
- **个性化满意度**: 用户对推荐内容满意度达到4.5/5

#### 14.11.3 社交功能指标
- **好友添加率**: 新用户24小时内添加好友比例达到30%
- **对战参与率**: 用户参与好友对战比例达到50%
- **分享转化率**: 学习成果分享带来的新用户注册转化率达到5%
- **社区活跃度**: 社交功能使用频次周均3次以上

这套全面的Quiz和Matching重构方案将SmallTalk打造成一个集科学学习、游戏化体验、社交互动于一体的现代化语言学习平台，为用户提供高效且有趣的学习体验。

## 15. 社交功能系统需求 (2025-01-31 新增)

### 15.1 社交功能总体架构
基于现有Profile页面，集成完整的社交功能体系，包括积分排行榜、成就徽章、好友管理和社区互动。

### 15.2 核心功能模块

#### 15.2.1 积分和排行榜系统
**功能描述**: 完整的用户积分计算、等级晋升和多维度排行榜展示
- **积分来源**: 对话完成(10分)、词汇掌握(5分)、练习正确(2分)、连续打卡(奖励分)、成就解锁(奖励分)
- **等级系统**: 每100积分升一级，显示用户当前等级和进度条
- **排行榜类型**: 全站排行榜、好友排行榜、周/月榜单
- **统计维度**: 总积分、连续天数、对话数量、词汇掌握数

#### 15.2.2 成就和徽章系统  
**功能描述**: 多层次成就体系，激励用户持续学习
- **成就分类**: 对话类、词汇类、练习类、连击类、社交类、特殊类
- **稀有度等级**: 普通(灰色)、稀有(蓝色)、史诗(紫色)、传说(金色)
- **进度跟踪**: 实时显示成就完成进度，支持隐藏成就
- **分享功能**: 成就解锁后可分享到社区或外部平台
- **奖励机制**: 成就完成获得积分奖励和特殊徽章

#### 15.2.3 好友管理系统
**功能描述**: 完整的社交关系管理，促进用户互动
- **好友发现**: 通过邮箱搜索、推荐算法等方式添加好友
- **请求管理**: 发送/接收好友请求，支持同意/拒绝/阻止
- **好友动态**: 查看好友学习活动、成就解锁、排名变化
- **好友排行**: 独立的好友排行榜，促进友好竞争
- **隐私设置**: 用户可设置活动可见性和好友权限

#### 15.2.4 社区功能
**功能描述**: 学习社区平台，用户分享交流学习心得
- **帖子类型**: 成就分享、学习技巧、问题求助、庆祝里程碑、一般讨论
- **互动功能**: 点赞、评论、分享、关注话题
- **话题分类**: 语法帮助、词汇技巧、练习伙伴、成就展示、学习建议
- **内容管理**: 支持置顶、精选、举报机制
- **可见性控制**: 公开、仅好友、私密三种可见性级别

### 15.3 数据库架构
```sql
-- 2025-01-31 已完成数据库设计，包含以下核心表：
-- user_points: 用户积分和等级
-- points_transactions: 积分交易记录
-- user_learning_stats: 学习统计数据
-- achievements: 成就定义
-- user_achievements: 用户成就记录
-- friendships: 好友关系
-- community_posts: 社区帖子
-- post_interactions: 帖子互动
-- notifications: 通知系统
```

### 15.4 Profile页面重构方案
**设计理念**: 将Profile页面改造为社交功能的统一入口，采用Tab切换设计
- **个人信息Tab**: 基本资料、学习统计、等级展示
- **排行榜Tab**: 全站排行榜、好友排行榜、历史排名
- **成就Tab**: 已获得成就、进度中成就、成就分类浏览
- **好友Tab**: 好友列表、好友请求、好友动态
- **社区Tab**: 社区动态、我的帖子、关注话题

### 15.5 实施优先级和时间规划

#### 15.5.1 第一阶段：积分和排行榜系统 (2天)
- ✅ 数据库架构设计完成
- 🔄 Profile页面框架重构
- 🔄 积分系统服务层开发
- 🔄 排行榜UI组件开发
- 🔄 用户等级和积分显示

#### 15.5.2 第二阶段：成就系统 (2天)  
- 成就定义和配置
- 成就检测逻辑
- 成就展示UI组件
- 成就分享功能
- 成就通知系统

#### 15.5.3 第三阶段：好友系统 (2天)
- 好友搜索和添加
- 好友请求管理
- 好友列表和动态
- 好友排行榜
- 隐私设置

#### 15.5.4 第四阶段：社区功能 (2天)
- 帖子发布和编辑
- 互动功能(点赞评论)
- 话题管理
- 内容展示和筛选
- 通知系统集成

### 15.6 国际化支持
为所有社交功能添加完整的国际化支持，支持中英文双语：
- 成就名称和描述
- 排行榜标签
- 社区功能文本
- 通知消息
- 用户界面文本

### 15.7 成功指标
- **用户参与度**: 社交功能使用率达到70%
- **用户留存**: 7日留存率提升至65%
- **社区活跃度**: 每日帖子数量和互动次数
- **好友网络**: 平均每用户好友数量达到5人
- **成就完成率**: 用户平均成就解锁数量

## 16. 总结与下阶段规划

### 16.1 Quiz与Matching重构价值
- **学习效率提升**: 通过科学算法和游戏化设计，显著提高单词记忆效率
- **用户粘性增强**: 社交功能和成就系统大幅提升用户留存和活跃度  
- **产品差异化**: 打造独特的游戏化学习体验，形成竞争优势
- **商业价值增长**: 优质用户体验带来用户增长和付费转化提升