# Profile & Social Integration – Product Specification

_Last updated: 2025-07-02 17:45:00_

## 1. Purpose
Integrate Achievements, Community Feed, Friends, and Leaderboard into a unified **Profile** experience, providing users with a one-stop "learning business card" that combines

*成果展示 · 社交互动 · 竞争激励*

## 2. Key Values
1. **成果展示** – 直观呈现学习成就、目标完成度与成长轨迹。
2. **社交互动** – 好友关系 + 社区动态，提高学习黏性与互助氛围。
3. **竞争驱动** – 全局/好友排行榜与实时差距提示，激发学习动力。

## 3. Information Architecture
```
Profile
 ├── Header (Avatar • Nickname • Target Edit • Current Rank badge)
 ├── Achievements Wall
 ├── Friends & Feed (tabbed)
 │     ├─ Friends List (online / offline / search)
 │     └─ Social Feed (like • comment • share)
 ├── Leaderboard (global / region / friends)
 └── Footer (existing BottomNav)
```
*设计约束：*
• **必须**沿用现有 Tailwind 变量 / 色板（绿色 #0ecd6a 体系、Slate/Gray 系列等）
• 组件风格保持与原页面一致（圆角、阴影、Chip、Material Icon）
• 不新增自定义颜色或字体，仅复用 `tailwind.config.js` 中已存在的 tokens

## 4. Functional Modules
| 模块 | 功能点 | 备注 |
|------|---------|------|
| 用户信息 | 头像/昵称/学习目标编辑，当前状态 (学习中/休息) | 头像旁显示全局排名 badge |
| 成就展示 | 徽章墙、进度条、分享 | share->feed & 外链 |
| 好友互动 | 列表(搜索/分组)、请求管理、快捷按钮(对战/私信) | 与 `Friends list.html` 视觉一致 |
| 社区动态 | 信息流卡片(文字/表情/图片) 点赞/评论 | 复用 `Community.html` 卡片样式 |
| 排行榜 | 全局/地区/好友榜，高亮自己，差距提示 | `Leaderboard.html` 色板/布局 |

## 5. MVP To-Do  (priority H>M>L)
### H – Day 1-3
1. IA & Wireframe (遵循现有样式)  
2. DB & API 契约: `achievements`, `user_achievement`, `friends`, `friend_requests`, `feed_items`, ranking view  
3. 成就墙组件化（徽章卡、进度条、分享 Btn）  
4. Friends List + Feed: 只读 + 点赞  
5. Leaderboard 基础版（全局/好友）  

### M – Day 4-7
6. Feed 发布（文本+图片上传）  
7. 私信/对战入口占位  
8. 成就分享至外部社媒  

### L – Day 8-10
9. 地区榜  
10. 动效优化（排名上升粒子、成就解锁弹窗）  
11. Profile 名片 QR 码  

## 6. Milestones
| Day | 里程碑 |
|-----|---------|
| 3 | 架构 + 数据表 + 接口 ready |
| 6 | Profile 可展示核心四模块 |
| 9 | 互动功能 & 完整榜单 |
| 11 | QA / Pre-release |

## 7. Non-Functional
* Style Guide: 100% 复用现有组件 & 色板，不引入新 CSS Framework / 自定义样式。  
* A11y: 所有图标附带 aria-label；颜色对比符合 WCAG AA。
* Perf: 首屏 < 1 MB；API list/feed 分页；排行榜缓存 5 min。

---
> **Approved by**: _Product Owner Sophie_ ✅ 