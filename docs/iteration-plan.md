# Questify 迭代规划

## 项目概述

**项目名称**：Questify  
**副标题**：把现实任务，变成角色成长  
**迭代周期**：5 个阶段  
**技术栈**：React + TypeScript + Vite + Tailwind CSS + Zustand + Framer Motion

---

## 迭代规划总览

| 迭代 | 名称 | 核心目标 | 预计工期 | 关键交付物 |
|------|------|---------|---------|-----------|
| Phase 1 | 核心框架与基础展示 | 搭建项目架构，实现基础页面和角色展示 | 3-4 天 | 可运行的框架，角色卡，任务列表 |
| Phase 2 | 任务管理核心功能 | 完善任务的增删改查和状态管理 | 3-4 天 | 完整的任务管理功能 |
| Phase 3 | 奖励与成长系统 | 实现游戏化奖励机制和成长逻辑 | 4-5 天 | 奖励弹窗，升级系统，属性成长 |
| Phase 4 | 成就与统计系统 | 建立长期激励机制和数据统计 | 3-4 天 | 成就系统，每日结算，统计面板 |
| Phase 5 | 体验优化与打磨 | 提升视觉体验和交互流畅度 | 3-4 天 | 动画，主题切换，细节优化 |

---

## 迭代详细说明

### Phase 1: 核心框架与基础展示

**目标**：搭建项目基础架构，实现核心页面的基本框架和静态展示

**核心功能**：
- 项目初始化与技术栈配置
- 路由系统与页面布局
- 角色卡静态展示
- 任务列表基础展示
- 本地存储初始化

**验收标准**：
- ✅ 项目可正常运行
- ✅ 4 个主要页面路由切换正常
- ✅ 角色卡正确显示用户信息
- ✅ 任务列表正确渲染
- ✅ 数据可持久化到 localStorage

**技术要点**：
- 使用 Vite + React + TypeScript 搭建项目
- 使用 Tailwind CSS 实现响应式布局
- 使用 Zustand 管理全局状态
- 设计合理的数据结构（Quest, Character, Achievement）

---

### Phase 2: 任务管理核心功能

**目标**：完善任务的增删改查、状态管理和筛选功能

**核心功能**：
- 创建新任务（支持不同类型、难度、标签）
- 编辑任务信息
- 删除任务
- 任务状态切换（todo / doing / done）
- 任务筛选（按类型、状态、今日任务）
- 今日任务管理（设置主线任务）

**验收标准**：
- ✅ 可创建包含所有字段的新任务
- ✅ 任务奖励自动计算正确
- ✅ 可编辑和删除任务
- ✅ 状态切换流畅
- ✅ 筛选功能正常
- ✅ 只能设置一个主线任务

**技术要点**：
- 实现任务表单组件和验证逻辑
- 设计任务筛选逻辑
- 实现主线任务的唯一性约束
- 确保数据更新及时同步到 UI

---

### Phase 3: 奖励与成长系统

**目标**：实现游戏化的奖励机制和角色成长系统

**核心功能**：
- 完成任务后的奖励弹窗
- 经验值计算与累计
- 等级提升逻辑与升级弹窗
- 金币奖励
- 属性成长（力量/智力/专注/活力）
- 角色信息实时更新

**验收标准**：
- ✅ 完成任务后弹出奖励弹窗，显示 EXP/Gold/属性奖励
- ✅ 经验值正确累计到角色
- ✅ 达到升级条件时显示升级提示
- ✅ 属性值正确增加
- ✅ 角色卡数据实时更新

**技术要点**：
- 设计奖励计算函数
- 实现等级公式：`nextLevelExp = level * 100`
- 使用 Framer Motion 实现奖励动画
- 确保状态更新的一致性

---

### Phase 4: 成就与统计系统

**目标**：建立长期激励机制和每日数据统计

**核心功能**：
- 成就系统（解锁条件判断、进度展示）
- 称号系统
- 每日结算页面
- 今日成长统计（EXP/Gold/属性提升）
- 成就解锁提示

**验收标准**：
- ✅ 成就列表正确展示
- ✅ 达成条件时自动解锁成就
- ✅ 称号正确显示和佩戴
- ✅ 每日结算页正确统计数据
- ✅ 成就解锁时有提示

**技术要点**：
- 设计成就触发条件判断逻辑
- 实现进度追踪系统
- 每日数据汇总与展示
- 成就通知组件

---

### Phase 5: 体验优化与打磨

**目标**：提升视觉体验、交互流畅度和细节完善

**核心功能**：
- 完善动画效果（列表、弹窗、升级等）
- 深浅色主题切换
- 任务拖拽排序
- UI 细节优化
- 交互反馈优化

**验收标准**：
- ✅ 页面切换和交互动画流畅
- ✅ 主题切换正常且美观
- ✅ 可拖拽调整任务顺序
- ✅ UI 统一协调，符合设计规范
- ✅ 无明显 bug 和体验问题

**技术要点**：
- 使用 Framer Motion 完善动画
- 实现主题系统（CSS 变量）
- 使用 react-beautiful-dnd 实现拖拽
- 细节打磨（过渡、阴影、圆角等）

---

## 开发注意事项

### 数据结构定义

**角色数据结构**：
```typescript
type Character = {
  name: string;
  avatar: string;
  level: number;
  exp: number;
  gold: number;
  title: string;
  stats: {
    strength: number;
    intelligence: number;
    focus: number;
    vitality: number;
  };
};
```

**任务数据结构**：
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

**成就数据结构**：
```typescript
type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
};
```

### 技术实现原则

1. **组件化**：页面级组件 + 通用组件 + 状态 hooks
2. **状态管理**：使用 Zustand 管理全局状态，避免 prop drilling
3. **数据持久化**：localStorage 存储，考虑数据迁移方案
4. **性能优化**：避免不必要的重渲染，使用 React.memo 和 useMemo
5. **代码规范**：遵循 TypeScript 最佳实践，保持代码可读性

---

## 风险与依赖

### 技术风险

- **localStorage 容量限制**：需控制数据量，定期清理过期数据
- **状态同步**：多组件共享状态时需确保一致性
- **动画性能**：复杂动画可能影响性能，需适度使用

### 功能依赖

- Phase 2 依赖 Phase 1 的基础框架
- Phase 3 依赖 Phase 2 的任务管理功能
- Phase 4 依赖 Phase 3 的奖励和成长数据
- Phase 5 可部分并行开发

---

## 验收流程

每个迭代完成后需进行以下验收：

1. **功能验收**：所有核心功能可正常运行
2. **数据验收**：数据存储和读取正常
3. **UI 验收**：界面美观、交互流畅
4. **性能验收**：无明显性能问题
5. **代码验收**：代码规范、可维护性良好

---

## 后续迭代方向

MVP 完成后可考虑的扩展方向：

- 云端数据同步
- 社交功能（好友、排行榜）
- 更多任务类型和奖励机制
- AI 任务推荐
- 移动端适配
- 更多主题和自定义选项
