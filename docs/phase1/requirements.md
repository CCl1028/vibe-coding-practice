# Phase 1: 核心框架与基础展示

## 迭代目标

搭建项目基础架构，实现核心页面的基本框架和静态展示，为后续功能开发奠定基础。

**预计工期**：3-4 天  
**依赖**：无

---

## 功能需求

### 1. 项目初始化

**优先级**：P0（最高）

**需求描述**：
- 使用 Vite 创建 React + TypeScript 项目
- 配置 Tailwind CSS
- 安装必要依赖（react-router-dom, zustand, framer-motion, lucide-react）
- 配置项目结构

**验收标准**：
- ✅ 项目可正常运行 `npm run dev`
- ✅ Tailwind CSS 样式生效
- ✅ 目录结构清晰合理

**技术实现**：
```
项目结构：
src/
  components/      # 通用组件
  pages/           # 页面组件
  stores/          # Zustand stores
  hooks/           # 自定义 hooks
  types/           # TypeScript 类型定义
  utils/           # 工具函数
  assets/          # 静态资源
```

---

### 2. 路由系统与页面布局

**优先级**：P0

**需求描述**：
- 配置 React Router
- 实现 4 个主要页面的路由
- 创建全局布局组件（Header + 侧边栏 + 主内容区）
- 实现页面切换逻辑

**验收标准**：
- ✅ 可通过路由访问 4 个页面
- ✅ 页面切换流畅
- ✅ Header 显示产品 Logo 和日期
- ✅ 侧边栏显示导航菜单

**技术实现**：
```typescript
路由配置：
/ → Dashboard（今日冒险）
/quests → Quest Board（任务面板）
/achievements → Achievements（成就中心）
/summary → Daily Summary（每日结算）
```

**数据结构**：
- Header 显示：产品名称（Questify）、当前日期、状态文案
- 侧边栏：4 个导航项，带图标和文字

---

### 3. 角色卡静态展示

**优先级**：P0

**需求描述**：
- 创建 CharacterCard 组件
- 展示角色基本信息（头像、昵称、等级、称号）
- 显示经验条（EXP 进度）
- 显示金币数量
- 显示 4 个属性值（力量、智力、专注、活力）

**验收标准**：
- ✅ 角色卡显示完整信息
- ✅ 经验条正确显示进度百分比
- ✅ 属性值清晰展示
- ✅ UI 美观，符合 RPG 风格

**数据结构**：
```typescript
type Character = {
  name: string;           // 角色昵称
  avatar: string;         // 头像 URL 或标识
  level: number;          // 当前等级
  exp: number;            // 当前经验值
  gold: number;           // 金币数量
  title: string;          // 当前称号
  stats: {
    strength: number;     // 力量
    intelligence: number; // 智力
    focus: number;        // 专注
    vitality: number;     // 活力
  };
};
```

**初始数据示例**：
```typescript
const initialCharacter: Character = {
  name: '冒险者',
  avatar: 'default',
  level: 1,
  exp: 0,
  gold: 0,
  title: '初出茅庐',
  stats: {
    strength: 1,
    intelligence: 1,
    focus: 1,
    vitality: 1
  }
};
```

---

### 4. 任务列表基础展示

**优先级**：P0

**需求描述**：
- 创建 QuestCard 组件
- 创建任务列表组件
- 展示任务基本信息（标题、类型、难度、奖励）
- 支持简单的列表渲染
- 区分主线任务和支线任务

**验收标准**：
- ✅ 任务列表正确渲染
- ✅ 每个任务卡片显示完整信息
- ✅ 主线任务和支线任务视觉区分
- ✅ 空状态友好提示

**数据结构**：
```typescript
type Quest = {
  id: string;
  title: string;
  description?: string;
  type: 'main' | 'side' | 'daily' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  tag: 'study' | 'work' | 'health' | 'life';
  status: 'todo' | 'doing' | 'done';
  expReward: number;
  goldReward: number;
  statReward: {
    strength?: number;
    intelligence?: number;
    focus?: number;
    vitality?: number;
  };
  createdAt: string;
  completedAt?: string;
  isToday: boolean;
};
```

**测试数据**：
```typescript
const initialQuests: Quest[] = [
  {
    id: '1',
    title: '学习 React Hooks',
    description: '完成 React 官方文档 Hooks 章节',
    type: 'main',
    difficulty: 'medium',
    tag: 'study',
    status: 'todo',
    expReward: 50,
    goldReward: 10,
    statReward: { intelligence: 1 },
    createdAt: new Date().toISOString(),
    isToday: true
  },
  {
    id: '2',
    title: '完成项目文档',
    type: 'side',
    difficulty: 'easy',
    tag: 'work',
    status: 'todo',
    expReward: 20,
    goldReward: 5,
    statReward: { focus: 1 },
    createdAt: new Date().toISOString(),
    isToday: true
  }
];
```

---

### 5. 本地存储初始化

**优先级**：P0

**需求描述**：
- 设计 localStorage 存储方案
- 创建数据持久化工具函数
- 实现初始数据加载
- 实现数据保存逻辑

**验收标准**：
- ✅ 页面刷新后数据不丢失
- ✅ 初次访问时加载默认数据
- ✅ 数据变更时自动保存
- ✅ localStorage 数据格式规范

**技术实现**：
```typescript
// 存储键名
const STORAGE_KEYS = {
  CHARACTER: 'questify_character',
  QUESTS: 'questify_quests',
  ACHIEVEMENTS: 'questify_achievements',
  DAILY_SUMMARY: 'questify_daily_summary'
};

// 工具函数
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
```

---

### 6. 全局状态管理

**优先级**：P0

**需求描述**：
- 创建 Zustand stores
- 管理角色状态
- 管理任务列表状态
- 管理全局 UI 状态（弹窗、加载状态等）

**验收标准**：
- ✅ Zustand stores 正确配置
- ✅ 状态可在组件间共享
- ✅ 状态更新触发 UI 更新

**技术实现**：
```typescript
// stores/characterStore.ts
import { create } from 'zustand';

interface CharacterStore {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  character: storage.get(STORAGE_KEYS.CHARACTER, initialCharacter),
  updateCharacter: (updates) =>
    set((state) => {
      const newCharacter = { ...state.character, ...updates };
      storage.set(STORAGE_KEYS.CHARACTER, newCharacter);
      return { character: newCharacter };
    })
}));
```

---

## 组件拆分

### 页面级组件

- `DashboardPage`：今日冒险页面
- `QuestBoardPage`：任务面板页面
- `AchievementsPage`：成就中心页面
- `DailySummaryPage`：每日结算页面

### 通用组件

- `Layout`：全局布局组件
- `Header`：顶部导航栏
- `Sidebar`：侧边栏导航
- `CharacterCard`：角色卡组件
- `QuestCard`：任务卡片组件
- `ExpBar`：经验进度条组件
- `StatsPanel`：属性面板组件

---

## UI 设计要点

### 配色方案

**深色主题**：
- 背景：`#0f172a`（深蓝灰）
- 主色：`#6366f1`（蓝紫）
- 强调色：`#fbbf24`（金色）
- 成功色：`#10b981`（绿色）

### 卡片设计

- 圆角：`rounded-xl`（12px）
- 阴影：`shadow-lg`
- 内边距：`p-4` 到 `p-6`
- 边框：可选的发光效果（用于重点模块）

### 字体

- 标题：粗体，较大字号
- 正文：常规，适中字号
- 数据：等宽字体（可选）

---

## 验收清单

- [ ] 项目可正常运行，无报错
- [ ] 4 个页面路由切换正常
- [ ] 角色卡正确显示所有信息
- [ ] 任务列表正确渲染
- [ ] 数据持久化到 localStorage
- [ ] 全局状态管理正常
- [ ] UI 符合设计规范
- [ ] 响应式布局正常
- [ ] 代码规范，可读性好

---

## 下一步计划

完成 Phase 1 后，进入 Phase 2 开发任务管理核心功能：
- 创建任务功能
- 编辑/删除任务
- 任务筛选
- 完成任务逻辑
- 今日任务管理
