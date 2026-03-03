# Phase 4: 成就与统计系统

## 迭代目标

建立长期激励机制和数据统计功能，通过成就系统和每日结算增强用户的持续使用动力。

**预计工期**：3-4 天  
**依赖**：Phase 3（奖励与成长系统）

---

## 功能需求

### 1. 成就系统设计与实现

**优先级**：P0

**需求描述**：
- 定义成就列表和解锁条件
- 创建成就数据结构
- 实现成就解锁检测逻辑
- 成就进度追踪
- 成就解锁通知

**验收标准**：
- ✅ 成就列表正确展示
- ✅ 解锁条件判断正确
- ✅ 进度实时更新
- ✅ 达成条件时自动解锁
- ✅ 解锁时有通知提示

**成就数据结构**：
```typescript
type Achievement = {
  id: string;
  title: string;          // 成就名称
  description: string;    // 成就描述
  icon: string;           // 图标标识
  category: 'task' | 'streak' | 'special'; // 成就类型
  unlocked: boolean;      // 是否已解锁
  unlockedAt?: string;    // 解锁时间
  progress: number;       // 当前进度
  target: number;         // 目标进度
};

type AchievementCondition = {
  type: 'total_quests' | 'main_quests' | 'streak' | 'tag_quests' | 'challenge_quests' | 'total_exp';
  operator: '>=' | '==';
  value: number;
};
```

**初始成就列表**：
```typescript
const initialAchievements: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Blood',
    description: '首次完成 1 个任务',
    icon: 'sword',
    category: 'task',
    unlocked: false,
    progress: 0,
    target: 1,
    condition: { type: 'total_quests', operator: '>=', value: 1 }
  },
  {
    id: 'main_story_clear',
    title: 'Main Story Clear',
    description: '首次完成主线任务',
    icon: 'crown',
    category: 'task',
    unlocked: false,
    progress: 0,
    target: 1,
    condition: { type: 'main_quests', operator: '>=', value: 1 }
  },
  {
    id: 'streak_3',
    title: 'Streak Master',
    description: '连续 3 天完成主线任务',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    progress: 0,
    target: 3,
    condition: { type: 'streak', operator: '>=', value: 3 }
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: '累计完成 10 个学习类任务',
    icon: 'book',
    category: 'task',
    unlocked: false,
    progress: 0,
    target: 10,
    condition: { type: 'tag_quests', operator: '>=', value: 10, tag: 'study' }
  },
  {
    id: 'iron_will',
    title: 'Iron Will',
    description: '累计完成 5 个挑战任务',
    icon: 'shield',
    category: 'task',
    unlocked: false,
    progress: 0,
    target: 5,
    condition: { type: 'challenge_quests', operator: '>=', value: 5 }
  },
  {
    id: 'exp_master',
    title: 'Experience Master',
    description: '累计获得 1000 EXP',
    icon: 'star',
    category: 'special',
    unlocked: false,
    progress: 0,
    target: 1000,
    condition: { type: 'total_exp', operator: '>=', value: 1000 }
  }
];
```

**技术实现**：
```typescript
// 检查成就解锁
const checkAchievements = () => {
  const stats = getPlayerStats(); // 获取玩家统计数据
  
  achievements.forEach(achievement => {
    if (achievement.unlocked) return;
    
    const isUnlocked = evaluateCondition(achievement.condition, stats);
    
    if (isUnlocked && achievement.progress < achievement.target) {
      unlockAchievement(achievement.id);
    }
  });
};

// 评估条件
const evaluateCondition = (condition: AchievementCondition, stats: PlayerStats): boolean => {
  let value = 0;
  
  switch (condition.type) {
    case 'total_quests':
      value = stats.totalQuestsCompleted;
      break;
    case 'main_quests':
      value = stats.mainQuestsCompleted;
      break;
    case 'streak':
      value = stats.currentStreak;
      break;
    case 'tag_quests':
      value = stats.tagQuestsCompleted[condition.tag!] || 0;
      break;
    case 'challenge_quests':
      value = stats.challengeQuestsCompleted;
      break;
    case 'total_exp':
      value = stats.totalExpEarned;
      break;
  }
  
  // 更新进度
  updateAchievementProgress(condition.type, value);
  
  // 判断是否达成
  return condition.operator === '>=' 
    ? value >= condition.value 
    : value === condition.value;
};

// 解锁成就
const unlockAchievement = (achievementId: string) => {
  setAchievements(achievements.map(a => 
    a.id === achievementId 
      ? { ...a, unlocked: true, unlockedAt: new Date().toISOString(), progress: a.target }
      : a
  ));
  
  // 显示解锁通知
  showAchievementNotification(achievementId);
};
```

---

### 2. 玩家统计数据

**优先级**：P0

**需求描述**：
- 记录玩家的累计数据
- 为成就系统提供数据支持
- 持久化存储统计数据

**验收标准**：
- ✅ 统计数据正确累计
- ✅ 数据持久化存储
- ✅ 可查询各类统计数据

**数据结构**：
```typescript
type PlayerStats = {
  totalQuestsCompleted: number;        // 累计完成任务数
  mainQuestsCompleted: number;         // 累计主线任务数
  challengeQuestsCompleted: number;    // 累计挑战任务数
  tagQuestsCompleted: {                // 各标签任务数
    study: number;
    work: number;
    health: number;
    life: number;
  };
  totalExpEarned: number;              // 累计获得经验
  totalGoldEarned: number;             // 累计获得金币
  currentStreak: number;               // 当前连续天数
  maxStreak: number;                   // 最大连续天数
  lastActiveDate?: string;             // 最后活跃日期
};
```

**技术实现**：
```typescript
const updatePlayerStats = (quest: Quest, reward: Reward) => {
  const stats = getPlayerStats();
  
  // 更新任务统计
  stats.totalQuestsCompleted += 1;
  if (quest.type === 'main') stats.mainQuestsCompleted += 1;
  if (quest.type === 'challenge') stats.challengeQuestsCompleted += 1;
  stats.tagQuestsCompleted[quest.tag] += 1;
  
  // 更新奖励统计
  stats.totalExpEarned += reward.exp;
  stats.totalGoldEarned += reward.gold;
  
  // 更新活跃日期和 streak
  updateStreak(stats);
  
  setPlayerStats(stats);
};

const updateStreak = (stats: PlayerStats) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (stats.lastActiveDate === yesterday) {
    // 连续活跃
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else if (stats.lastActiveDate !== today) {
    // 不连续
    stats.currentStreak = 1;
  }
  
  stats.lastActiveDate = today;
};
```

---

### 3. 成就解锁通知

**优先级**：P0

**需求描述**：
- 成就解锁时显示通知
- 通知自动消失
- 可点击查看详情
- 在奖励弹窗中也可显示

**验收标准**：
- ✅ 解锁时右上角弹出通知
- ✅ 通知显示成就名称和图标
- ✅ 3秒后自动消失
- ✅ 可点击跳转到成就页

**UI 设计**：
- 右上角弹出式通知
- 半透明背景
- 图标 + 成就名称
- "新成就解锁！"文案
- 滑入滑出动画

**技术实现**：
```typescript
const showAchievementNotification = (achievementId: string) => {
  const achievement = getAchievementById(achievementId);
  
  // 添加到通知队列
  addNotification({
    id: `achievement-${achievementId}`,
    type: 'achievement',
    title: '新成就解锁！',
    message: achievement.title,
    icon: achievement.icon,
    duration: 3000
  });
};
```

---

### 4. 成就中心页面

**优先级**：P0

**需求描述**：
- 展示所有成就列表
- 区分已解锁和未解锁
- 显示解锁进度
- 支持筛选（全部/已解锁/未解锁）
- 按类别分组展示

**验收标准**：
- ✅ 所有成就正确显示
- ✅ 已解锁和未解锁视觉区分
- ✅ 进度条正确显示
- ✅ 筛选功能正常
- ✅ 分组展示清晰

**页面布局**：
```
顶部：统计概览（已解锁 X / 总数 Y）
中间：筛选标签（全部 | 已解锁 | 未解锁）
主体：
  - 称号区（显示已解锁称号）
  - 成就徽章墙（网格布局）
    - 已解锁：彩色图标 + 名称 + 解锁日期
    - 未解锁：灰色图标 + 名称 + 进度条
```

**组件拆分**：
- `AchievementsPage`：成就中心页面
- `AchievementBadge`：成就徽章组件
- `AchievementProgress`：进度条组件
- `TitleSection`：称号展示区

---

### 5. 称号系统

**优先级**：P1

**需求描述**：
- 定义称号列表和解锁条件
- 根据等级或成就解锁称号
- 显示当前佩戴称号
- 支持切换佩戴称号

**验收标准**：
- ✅ 称号列表正确显示
- ✅ 解锁条件判断正确
- ✅ 可切换佩戴称号
- ✅ 当前称号在角色卡显示

**称号数据结构**：
```typescript
type Title = {
  id: string;
  name: string;           // 称号名称
  description: string;    // 称号描述
  icon: string;           // 图标
  unlockCondition: string; // 解锁条件描述
  type: 'level' | 'achievement' | 'special';
  requiredValue: number;  // 所需等级或成就数
  unlocked: boolean;
};
```

**初始称号列表**：
```typescript
const titles: Title[] = [
  { id: 'beginner', name: '初出茅庐', type: 'level', requiredValue: 1 },
  { id: 'promising', name: '初露锋芒', type: 'level', requiredValue: 5 },
  { id: 'steady', name: '稳定推进者', type: 'level', requiredValue: 10 },
  { id: 'elite', name: '精英探险家', type: 'level', requiredValue: 15 },
  { id: 'legendary', name: '传奇冒险者', type: 'level', requiredValue: 20 },
  { id: 'streak_master', name: '连胜大师', type: 'achievement', requiredValue: 3 },
  { id: 'challenge_king', name: '挑战之王', type: 'achievement', requiredValue: 5 }
];
```

---

### 6. 每日结算页面

**优先级**：P0

**需求描述**：
- 展示今日完成的任务统计
- 显示今日获得的奖励
- 显示属性提升总览
- 如果升级，显示升级信息
- 显示明日建议

**验收标准**：
- ✅ 正确统计今日数据
- ✅ 奖励信息清晰展示
- ✅ 升级信息正确显示
- ✅ 鼓励文案友好

**页面布局**：
```
顶部：
  - "今日结算"
  - 鼓励文案："今天的冒险圆满结束"

主体：
  A. 今日任务结果
     - 完成任务数
     - 主线任务是否完成
     - 支线/挑战任务数
  
  B. 今日奖励
     - EXP +数值
     - Gold +数值
     - 属性提升列表
  
  C. 升级反馈（如有）
     - Level Up! Lv.X → Lv.Y
     - 新称号
  
  D. 明日建议
     - "推荐明天设置一个新的主线任务"
     - "继续保持你的主线 streak"
```

**技术实现**：
```typescript
const getTodaySummary = (): DailyReward => {
  const today = new Date().toISOString().split('T')[0];
  const dailySummary = storage.get(STORAGE_KEYS.DAILY_SUMMARY, {});
  return dailySummary[today] || createEmptyDailyReward(today);
};

const createEmptyDailyReward = (date: string): DailyReward => ({
  date,
  totalExp: 0,
  totalGold: 0,
  totalStats: {},
  completedQuests: 0,
  mainQuestCompleted: false
});
```

---

### 7. 统计数据展示

**优先级**：P1

**需求描述**：
- 在 Dashboard 页面显示今日成长统计
- 使用小卡片展示关键数据
- 实时更新统计信息

**验收标准**：
- ✅ 今日统计正确显示
- ✅ 数据实时更新
- ✅ UI 简洁清晰

**展示内容**：
- 已完成任务数
- 今日获得 EXP
- 今日获得 Gold
- 今日属性提升

**UI 设计**：
- 4 张小卡片横排
- 每张卡片：图标 + 数值 + 标签
- 主线完成状态单独标记

---

## 组件拆分

### 页面级组件

- `AchievementsPage`：成就中心页面
- `DailySummaryPage`：每日结算页面

### 通用组件

- `AchievementBadge`：成就徽章
- `AchievementCard`：成就卡片
- `AchievementProgress`：进度条
- `TitleSection`：称号区域
- `TitleBadge`：称号徽章
- `DailyStatsCard`：统计卡片
- `SummaryCard`：结算卡片
- `Notification`：通知组件

---

## 状态管理

### AchievementStore 新增

```typescript
interface AchievementStore {
  achievements: Achievement[];
  titles: Title[];
  
  // 查询
  getAchievementById: (id: string) => Achievement | undefined;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getCurrentTitle: () => Title;
  
  // 操作
  updateAchievementProgress: (type: string, value: number) => void;
  unlockAchievement: (id: string) => void;
  checkAchievements: () => void;
  unlockTitle: (id: string) => void;
  setCurrentTitle: (id: string) => void;
}
```

### StatsStore 新增

```typescript
interface StatsStore {
  playerStats: PlayerStats;
  dailyReward: DailyReward;
  
  // 操作
  updatePlayerStats: (quest: Quest, reward: Reward) => void;
  updateDailyReward: (reward: Reward) => void;
  getPlayerStats: () => PlayerStats;
  getTodayReward: () => DailyReward;
  updateStreak: () => void;
}
```

---

## 数据持久化

新增存储键：
```typescript
const STORAGE_KEYS = {
  // ... 已有的
  PLAYER_STATS: 'questify_player_stats',
  ACHIEVEMENTS: 'questify_achievements',
  TITLES: 'questify_titles'
};
```

---

## 验收清单

- [ ] 成就列表正确展示
- [ ] 成就解锁条件判断正确
- [ ] 成就进度实时更新
- [ ] 成就解锁通知正常显示
- [ ] 称号系统正常工作
- [ ] 每日结算页面数据正确
- [ ] 今日统计显示正确
- [ ] 统计数据持久化
- [ ] Streak 计算正确
- [ ] UI 美观易用
- [ ] 无明显 bug

---

## 下一步计划

完成 Phase 4 后，进入 Phase 5 进行体验优化与打磨：
- 完善动画效果
- 深浅色主题切换
- 任务拖拽排序
- UI 细节优化
- 性能优化
