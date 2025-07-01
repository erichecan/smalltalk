# SmallTalk 项目文档索引

## 📁 文档结构概览

本文档库包含 SmallTalk 项目的所有相关文档、配置文件、测试文件和工具脚本，按照功能分类组织。

```
docs/
├── product/           # 产品文档
├── development/       # 开发文档  
├── features/          # 功能实现文档
├── database/          # 数据库相关文件
├── testing/           # 测试文件
├── config/            # 配置文件
└── tools/             # 工具脚本
```

---

## 📋 各文件夹详细说明

### 🎯 product/ - 产品文档
**用途**: 产品规划、需求定义、用户体验设计

| 文件名 | 描述 | 更新时间 |
|--------|------|----------|
| `PRODUCT_REQUIREMENTS.md` | 产品需求文档，定义分层用户体验和核心功能 | 最新 |
| `BOTTOM_NAVIGATION_PLAN.md` | 底部导航设计规划，4个主入口设计方案 | 最新 |
| `README.md` | 项目概览和快速开始指南 | 副本 |

### 🛠️ development/ - 开发文档
**用途**: 开发指南、部署说明、贡献规范

| 文件名 | 描述 | 更新时间 |
|--------|------|----------|
| `INIT.md` | 项目初始化指南，技术架构和快速开始 | 最新 |
| `DEVELOPMENT_ISSUES.md` | 开发过程中的问题记录和解决方案 | 最新 |
| `CONTRIBUTING.md` | 贡献指南和开发规范 | 最新 |
| `DEPLOYMENT_GUIDE.md` | 部署指南，生产环境配置 | 最新 |
| `CHANGELOG.md` | 版本变更记录 | 最新 |

### ⚡ features/ - 功能实现文档  
**用途**: 具体功能的实现文档和配置指南

| 文件名 | 描述 | 更新时间 |
|--------|------|----------|
| `GOOGLE_LOGIN_IMPLEMENTATION_SUMMARY.md` | Google登录功能实现总结 | 2025-01-30 |
| `GOOGLE_OAUTH_SETUP.md` | Google OAuth详细配置指南 | 2025-01-30 |
| `PR_DESCRIPTION.md` | Pull Request描述模板 | 最新 |

### 🗄️ database/ - 数据库文件
**用途**: 数据库表结构、迁移脚本、设置工具

| 文件名 | 描述 | 用途 |
|--------|------|------|
| `create-all-tables.sql` | 完整数据库表结构创建脚本 | 生产部署 |
| `create-tables-simple.sql` | 简化版表结构脚本 | 开发测试 |
| `fix-existing-tables.sql` | 数据库表结构修复脚本 | 迁移修复 |
| `setup-database.js` | 数据库自动化设置工具 | 开发工具 |

### 🧪 testing/ - 测试文件
**用途**: 单元测试、集成测试、测试工具

| 文件名 | 描述 | 类型 |
|--------|------|------|
| `__tests__/Login.test.tsx` | 登录页面单元测试 | Jest测试 |
| `TestPage.tsx` | 测试页面组件 | React组件 |
| `test-i18n.html` | 国际化功能测试页面 | HTML测试 |
| `test-server.cjs` | 测试服务器脚本 | Node.js脚本 |
| `integrated-practice.html` | 集成练习测试页面 | HTML测试 |

### ⚙️ config/ - 配置文件
**用途**: 构建配置、代码质量配置、类型定义

| 文件名 | 描述 | 用途 |
|--------|------|------|
| `tsconfig.json` | TypeScript主配置文件 | 类型检查 |
| `tsconfig.app.json` | 应用TypeScript配置 | 构建配置 |
| `tsconfig.node.json` | Node.js TypeScript配置 | 工具配置 |
| `vite.config.ts` | Vite构建工具配置 | 构建工具 |
| `eslint.config.js` | ESLint代码检查配置 | 代码质量 |
| `jest.config.cjs` | Jest测试框架配置 | 测试工具 |
| `jest.setup.ts` | Jest测试环境设置 | 测试工具 |
| `postcss.config.js` | PostCSS处理配置 | 样式处理 |
| `tailwind.config.js` | Tailwind CSS配置 | 样式框架 |

### 🔧 tools/ - 工具脚本
**用途**: 开发工具、构建脚本、数据处理工具

| 文件名 | 描述 | 用途 |
|--------|------|------|
| `check_conversation_history.js` | 对话历史检查工具 | 数据验证 |
| `check_history.js` | 历史记录检查脚本 | 数据验证 |
| `download-assets.cjs` | 资源文件下载工具 | 资源管理 |
| `rename-assets-and-generate-map.cjs` | 资源重命名和映射生成 | 资源管理 |
| `assets-map.json` | 资源文件映射表 | 资源配置 |

---

## 🎯 使用指南

### 新开发者入门
1. 阅读 `product/PRODUCT_REQUIREMENTS.md` 了解产品需求
2. 查看 `development/INIT.md` 进行环境设置
3. 参考 `development/CONTRIBUTING.md` 了解开发规范

### 功能开发
1. 查看 `features/` 文件夹了解现有功能实现
2. 参考功能文档编写新功能
3. 更新相关文档

### 数据库操作
1. 使用 `database/setup-database.js` 快速设置数据库
2. 根据需要执行相应的 SQL 脚本
3. 遇到问题时使用修复脚本

### 测试验证
1. 运行 `testing/` 中的测试文件
2. 使用测试页面验证功能
3. 添加新的测试用例

### 配置修改
1. 在 `config/` 文件夹中修改相应配置
2. 确保配置文件同步到根目录（如需要）
3. 测试配置更改是否生效

### 工具使用
1. 使用 `tools/` 中的脚本进行开发任务
2. 查看脚本文档了解使用方法
3. 根据需要修改或扩展工具

---

## 📝 文档维护规范

### 更新原则
- **及时更新**: 功能变更时同步更新文档
- **版本控制**: 重要变更记录版本和时间
- **分类明确**: 新文档放入正确的分类文件夹

### 命名规范
- **英文命名**: 使用英文文件名，采用大写字母开头
- **描述清晰**: 文件名能清楚表达内容
- **扩展名统一**: Markdown文档使用 `.md` 扩展名

### 内容规范
- **结构清晰**: 使用标题层级组织内容
- **代码标注**: 代码块包含语言标识
- **时间戳**: 重要更新添加时间戳注释

---

## 🔄 定期维护任务

### 每月检查
- [ ] 清理过期文档
- [ ] 更新技术栈版本信息
- [ ] 检查链接有效性

### 每季度整理
- [ ] 重新组织文档结构
- [ ] 合并重复内容
- [ ] 更新开发指南

### 每年评估
- [ ] 评估文档架构合理性
- [ ] 更新项目技术选型文档
- [ ] 整理历史版本文档

---

**文档整理完成时间**: 2025-01-30 14:40:00  
**整理人员**: 开发团队  
**下次整理计划**: 2025-02-30 