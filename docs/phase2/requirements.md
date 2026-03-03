# Phase 2: 任务管理核心功能

## 迭代目标

完善任务的增删改查、状态管理和筛选功能，实现完整的任务管理流程。

**预计工期**：3-4 天  
**依赖**：Phase 1（核心框架与基础展示）

---

## 功能需求

### 1. 创建新任务

**优先级**：P0

**需求描述**：
- 创建任务表单弹窗组件
- 支持输入任务标题和描述
- 选择任务类型（main / side / daily / challenge）
- 选择难度（easy / medium / hard）
- 选择标签（study / work / health / life）
- 选择是否加入今日任务
- 自动计算并预览奖励

**验收标准**：
- ✅ 点击"新建任务"按钮弹出表单
- ✅ 所有字段可正常输入和选择
- ✅ 奖励根据类型和难度自动计算
- ✅ 保存后任务添加到列表
- ✅ 表单验证正确（标题必填）

**奖励计算规则**：

**基础奖励**：
- Easy: 20 EXP / 5 Gold
- Medium: 50 EXP / 10 Gold
- Hard: 100 EXP / 20 Gold

**类型额外奖励**：
- Main: 额外 +20 EXP
- Challenge: 额外 +30 EXP
- Daily: 奖励较低，但参与 streak
- Side: 基础奖励

**标签属性映射**：
- study → 智力 +1
- work → 专注 +1
- health → 活力 +1
- life → 力量 +1

**技术实现**：
```typescript
// utils/rewardCalculator.ts
export const calculateReward = (
  difficulty: 'easy' | 'medium' | 'hard',
  type: 'main' | 'side' | 'daily' | 'challenge',
  tag: 'study' | 'work' | 'health' | 'life'
) => {
  const baseReward = {
    easy: { exp: 20, gold: 5 },
    medium: { exp: 50, gold: 10 },
    hard: { exp: 100, gold: 20 }
  };

  const typeBonus = {
    main: 20,
    challenge: 30,
    side: 0,
    daily: -10 // 日常任务奖励略低
  };

  const statReward = {
    study: { intelligence: 1 },
    work: { focus: 1 },
    health: { vitality: 1 },
    life: { strength: 1 }
  };

  return {
    exp: baseReward[difficulty].exp + typeBonus[type],
    gold: baseReward[difficulty].gold,
    statReward: statReward[tag]
  };
};
```

**数据结构**：
```typescript
type CreateQuestForm = {
  title: string;
  description?: string;
  type: 'main' | 'side' | 'daily' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  tag: 'study' | 'work' | 'health' | 'life';
  isToday: boolean;
};
```

---

### 2. 编辑任务

**优先级**：P0

**需求描述**：
- 点击任务的编辑按钮进入编辑模式
- 可修改任务的所有字段
- 保存后更新任务信息
- 奖励重新计算

**验收标准**：
- ✅ 点击编辑按钮弹出表单，预填当前任务信息
- ✅ 修改后可保存
- ✅ 奖励根据修改后的配置重新计算
- ✅ 任务信息实时更新

**技术实现**：
- 复用创建任务的表单组件
- 传入初始值进行预填
- 调用更新方法而非创建方法

---

### 3. 删除任务

**优先级**：P0

**需求描述**：
- 点击删除按钮
- 显示确认对话框
- 确认后从列表中移除任务
- 如果删除的是主线任务，需要提示用户

**验收标准**：
- ✅ 点击删除弹出确认对话框
- ✅ 确认后任务从列表消失
- ✅ 删除主线任务时有特殊提示
- ✅ 可取消删除操作

**技术实现**：
```typescript
const deleteQuest = (questId: string) => {
  const quest = quests.find(q => q.id === questId);
  
  if (quest?.type === 'main') {
    // 特殊提示
    if (!confirm('删除主线任务会影响今日成长，确定删除吗？')) {
      return;
    }
  }
  
  setQuests(quests.filter(q => q.id !== questId));
};
```

---

### 4. 任务状态切换

**优先级**：P0

**需求描述**：
- 支持三种状态：todo（未开始）、doing（进行中）、done（已完成）
- 点击状态按钮切换状态
- 状态切换时有视觉反馈
- 完成任务时触发后续奖励流程（Phase 3 实现）

**验收标准**：
- ✅ 状态按钮可点击
- ✅ 状态正确切换
- ✅ 不同状态有不同的视觉样式
- ✅ 状态变更保存到本地存储

**技术实现**：
```typescript
const updateQuestStatus = (questId: string, newStatus: Quest['status']) => {
  setQuests(quests.map(q => 
    q.id === questId 
      ? { 
          ...q, 
          status: newStatus,
          completedAt: newStatus === 'done' ? new Date().toISOString() : undefined
        }
      : q
  ));
};
```

**UI 设计**：
- todo: 灰色圆圈图标
- doing: 蓝色旋转图标或进度条
- done: 绿色勾选图标

---

### 5. 任务筛选

**优先级**：P1

**需求描述**：
- 按类型筛选：全部 / 主线 / 支线 / 日常 / 挑战
- 按状态筛选：未完成 / 已完成
- 按日期筛选：今日任务
- 按奖励筛选：高奖励任务
- 多个筛选条件可组合

**验收标准**：
- ✅ 点击筛选标签后列表正确过滤
- ✅ 筛选条件组合正确
- ✅ 无符合条件任务时显示空状态
- ✅ 筛选结果数量显示

**技术实现**：
```typescript
const filterQuests = (
  quests: Quest[],
  filters: {
    type?: Quest['type'] | 'all';
    status?: 'todo' | 'done' | 'all';
    isToday?: boolean;
  }
) => {
  return quests.filter(quest => {
    if (filters.type && filters.type !== 'all' && quest.type !== filters.type) {
      return false;
    }
    if (filters.status === 'todo' && quest.status === 'done') {
      return false;
    }
    if (filters.status === 'done' && quest.status !== 'done') {
      return false;
    }
    if (filters.isToday && !quest.isToday) {
      return false;
    }
    return true;
  });
};
```

**UI 组件**：
- 使用标签式筛选栏
- 当前选中状态高亮
- 支持清除所有筛选

---

### 6. 今日任务管理

**优先级**：P0

**需求描述**：
- 标记任务是否属于今日任务
- 今日任务在 Dashboard 页面显示
- 主线任务唯一性约束：每天只能有一个主线任务
- 设置新主线任务时，自动取消之前的主线任务

**验收标准**：
- ✅ 可标记任务是否属于今日
- ✅ Dashboard 只显示今日任务
- ✅ 只能设置一个主线任务
- ✅ 设置新主线时旧主线自动降级为支线

**技术实现**：
```typescript
const setMainQuest = (questId: string) => {
  setQuests(quests.map(q => {
    if (q.id === questId) {
      return { ...q, type: 'main' as const, isToday: true };
    }
    if (q.type === 'main' && q.isToday) {
      return { ...q, type: 'side' as const };
    }
    return q;
  }));
};
```

---

### 7. 快捷新增任务

**优先级**：P1

**需求描述**：
- 在 Dashboard 页面提供快速新增入口
- 只需输入标题即可快速创建
- 默认类型为支线任务
- 默认难度为 Medium
- 默认标签为 work
- 默认加入今日任务

**验收标准**：
- ✅ 输入标题后按回车或点击按钮创建
- ✅ 快速创建的任务使用默认配置
- ✅ 创建后可再编辑补充信息
- ✅ 输入框自动清空，可继续创建

**技术实现**：
```typescript
const quickAddQuest = (title: string) => {
  const newQuest: Quest = {
    id: Date.now().toString(),
    title,
    type: 'side',
    difficulty: 'medium',
    tag: 'work',
    status: 'todo',
    expReward: 50,
    goldReward: 10,
    statReward: { focus: 1 },
    createdAt: new Date().toISOString(),
    isToday: true
  };
  
  addQuest(newQuest);
};
```

---

## 组件拆分

### 新增组件

- `CreateQuestModal`：创建任务弹窗
- `EditQuestModal`：编辑任务弹窗（可复用 CreateQuestModal）
- `FilterTabs`：筛选标签组件
- `QuickAddQuest`：快速新增任务组件
- `ConfirmDialog`：确认对话框组件

### 更新组件

- `QuestCard`：增加编辑、删除、状态切换按钮
- `QuestBoardPage`：增加筛选功能
- `DashboardPage`：增加快速新增入口

---

## 状态管理

### QuestStore 扩展

```typescript
interface QuestStore {
  quests: Quest[];
  
  // 查询
  getQuestById: (id: string) => Quest | undefined;
  getTodayQuests: () => Quest[];
  getMainQuest: () => Quest | undefined;
  
  // 操作
  addQuest: (quest: Quest) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  updateQuestStatus: (id: string, status: Quest['status']) => void;
  setMainQuest: (id: string) => void;
  
  // 筛选
  filterQuests: (filters: FilterOptions) => Quest[];
}
```

---

## UI 设计要点

### 任务卡片

- 卡片左侧：状态按钮（可点击切换）
- 卡片中部：标题、标签、难度
- 卡片右侧：奖励信息、操作按钮（编辑、删除）
- 不同类型任务使用不同边框颜色：
  - Main: 金色边框
  - Challenge: 红色边框
  - Daily: 蓝色边框
  - Side: 默认边框

### 筛选栏

- 横向标签式布局
- 当前选中标签高亮显示
- 支持多选组合筛选

### 表单弹窗

- 模态框居中显示
- 半透明背景遮罩
- 表单字段分组排列
- 底部操作按钮（取消、保存）
- 奖励预览区域实时更新

---

## 验收清单

- [ ] 可创建包含所有字段的新任务
- [ ] 任务奖励自动计算正确
- [ ] 可编辑和删除任务
- [ ] 状态切换流畅
- [ ] 筛选功能正常
- [ ] 只能设置一个主线任务
- [ ] 快速新增功能正常
- [ ] 所有操作数据持久化
- [ ] UI 交互流畅
- [ ] 无明显 bug

---

## 下一步计划

完成 Phase 2 后，进入 Phase 3 开发奖励与成长系统：
- 完成任务后的奖励弹窗
- 经验值计算与累计
- 等级提升逻辑
- 属性成长
- 角色信息实时更新
