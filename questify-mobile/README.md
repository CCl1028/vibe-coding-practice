# 🏰 Questify Mobile

可爱风格的任务管理 App，将日常任务游戏化，让每一天都像冒险！

## ✨ 特性

- 🎮 **游戏化任务管理** - 完成任务获得经验值和金币
- 👤 **角色成长系统** - 升级解锁新称号
- 🏆 **成就系统** - 收集各种有趣的成就
- 💖 **可爱 UI 设计** - 马卡龙配色，软萌风格
- ✨ **丰富动画** - 流畅的交互动画

## 🚀 快速开始

### 前置要求

- Node.js >= 20.x
- npm 或 yarn
- Expo Go App（用于在手机上预览）

### 安装

```bash
# 进入项目目录
cd questify-mobile

# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

### 在手机上预览

1. 在手机应用商店下载 **Expo Go** App
2. 扫描终端中的二维码
3. 即可在手机上实时预览！

## 📁 项目结构

```
questify-mobile/
├── app/                      # Expo Router 页面
│   ├── _layout.tsx          # 根布局
│   ├── login.tsx            # 登录页
│   └── (tabs)/              # Tab 导航
│       ├── _layout.tsx      # Tab 布局
│       ├── index.tsx        # 首页
│       ├── quests.tsx       # 任务列表
│       ├── character.tsx    # 角色详情
│       └── achievements.tsx # 成就页
│
├── src/
│   ├── components/          # 可复用组件
│   │   ├── CharacterCard.tsx
│   │   ├── QuestCard.tsx
│   │   ├── Button.tsx
│   │   ├── RewardModal.tsx
│   │   └── LevelUpModal.tsx
│   │
│   ├── theme/               # 主题配置
│   │   ├── colors.ts        # 配色方案
│   │   ├── spacing.ts       # 间距系统
│   │   └── index.ts
│   │
│   ├── lib/                 # 工具函数
│   │   ├── api.ts          # API 调用
│   │   └── rewards.ts      # 奖励计算
│   │
│   └── types/              # TypeScript 类型
│       └── index.ts
│
├── assets/                  # 静态资源
├── app.json                # Expo 配置
└── package.json
```

## 🎨 设计系统

### 配色方案（清新色系）

| 颜色 | 用途 | 色值 |
|------|------|------|
| 🌊 天蓝色 | 主色调 | `#0EA5E9` |
| 🌿 薄荷绿 | 成功/完成 | `#14B8A6` |
| 💜 薰衣草紫 | 经验/升级 | `#A855F7` |
| 🍋 奶油黄 | 金币/奖励 | `#F59E0B` |
| 💙 深蓝色 | 智力/信息 | `#3B82F6` |
| 🌺 珊瑚红 | 力量/挑战 | `#F43F5E` |

### 组件库

- **CharacterCard** - 角色信息卡片
- **QuestCard** - 任务卡片，支持完成/删除
- **Button** - 可爱风格按钮
- **RewardModal** - 任务完成奖励弹窗
- **LevelUpModal** - 升级庆祝弹窗

## 🔗 后端连接

目前使用模拟数据，正式使用时需要：

1. 部署 Web 端后端到服务器
2. 修改 `src/lib/api.ts` 中的 `API_BASE_URL`
3. 配置用户认证（JWT Token）

```typescript
// src/lib/api.ts
const API_BASE_URL = 'https://your-backend-url.com/api';
```

## 📱 构建发布

```bash
# 构建 iOS
npx expo build:ios

# 构建 Android
npx expo build:android

# 使用 EAS Build（推荐）
npx eas build --platform ios
npx eas build --platform android
```

## 🛠️ 技术栈

- **Expo** - React Native 开发框架
- **Expo Router** - 文件系统路由
- **React Native Reanimated** - 高性能动画
- **TypeScript** - 类型安全
- **Zustand** - 状态管理（可选）

## 📄 License

MIT
