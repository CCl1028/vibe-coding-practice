# Phase 3: 奖励与成长系统

## 迭代目标

实现游戏化的奖励机制和角色成长系统，让用户完成任务后获得即时反馈和成长感。

**预计工期**：4-5 天  
**依赖**：Phase 2（任务管理核心功能）

---

## 功能需求

### 1. 完成任务奖励弹窗

**优先级**：P0

**需求描述**：
- 完成任务后弹出奖励结算弹窗
- 显示获得的经验值、金币、属性提升
- 显示任务名称和类型
- 主线任务有特殊的视觉效果
- 弹窗动画流畅

**验收标准**：
- ✅ 点击完成任务后立即弹出弹窗
- ✅ 弹窗正确显示所有奖励信息
- ✅ 主线任务弹窗有金色高亮
- ✅ 弹窗有进入和退出动画
- ✅ 可点击关闭或确认按钮关闭弹窗

**UI 设计**：
- 弹窗尺寸：中等（约 400px 宽）
- 主线任务：金色边框 + 更大尺寸
- 显示内容：
  - 标题："Quest Completed!" 或 "Main Quest Cleared!"
  - 任务名称
  - EXP +数值（绿色高亮）
  - Gold +数值（金色高亮）
  - 属性提升（如：智力 +1）
  - 确认按钮

**技术实现**：
```typescript
type RewardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest;
  reward: {
    exp: number;
    gold: number;
    statReward: StatReward;
  };
  isMainQuest?: boolean;
};
```

**动画效果**：
- 使用 Framer Motion 实现弹窗缩放进入
- 奖励数字滚动动画（可选）
- 金币图标抖动动画
- 属性图标闪烁动画

---

### 2. 经验值计算与累计

**优先级**：P0

**需求描述**：
- 完成任务后计算获得的 EXP
- 累计到角色总经验值
- 更新经验进度条
- 触发升级检查

**验收标准**：
- ✅ 经验值正确计算（基础 + 类型加成）
- ✅ 总经验值正确累加
- ✅ 经验进度条正确更新
- ✅ 达到升级条件时触发升级

**等级公式**：
```typescript
// 计算升到下一级所需的经验值
const getNextLevelExp = (currentLevel: number): number => {
  return currentLevel * 100;
};

// 计算当前经验进度百分比
const getExpProgress = (currentExp: number, level: number): number => {
  const nextLevelExp = getNextLevelExp(level);
  return (currentExp / nextLevelExp) * 100;
};

// 检查是否升级
const checkLevelUp = (currentExp: number, level: number): boolean => {
  return currentExp >= getNextLevelExp(level);
};
```

**技术实现**：
```typescript
const addExperience = (expGain: number) => {
  const newExp = character.exp + expGain;
  const nextLevelExp = getNextLevelExp(character.level);
  
  if (newExp >= nextLevelExp) {
    // 升级
    levelUp();
    const remainingExp = newExp - nextLevelExp;
    updateCharacter({ exp: remainingExp });
  } else {
    updateCharacter({ exp: newExp });
  }
};
```

---

### 3. 等级提升逻辑

**优先级**：P0

**需求描述**：
- 检测是否达到升级条件
- 升级时更新等级
- 重置经验值（保留溢出部分）
- 触发升级弹窗
- 更新称号（可选）

**验收标准**：
- ✅ 经验值达标时自动升级
- ✅ 等级正确增加
- ✅ 经验值正确重置
- ✅ 显示升级弹窗
- ✅ 称号根据等级更新

**称号规则**：
```typescript
const getTitleByLevel = (level: number): string => {
  if (level >= 20) return '传奇冒险者';
  if (level >= 15) return '精英探险家';
  if (level >= 10) return '稳定推进者';
  if (level >= 5) return '初露锋芒';
  return '初出茅庐';
};
```

**技术实现**：
```typescript
const levelUp = () => {
  const newLevel = character.level + 1;
  const newTitle = getTitleByLevel(newLevel);
  
  updateCharacter({
    level: newLevel,
    title: newTitle
  });
  
  // 触发升级弹窗
  setShowLevelUpModal(true);
};
```

---

### 4. 升级弹窗

**优先级**：P0

**需求描述**：
- 升级时显示特殊弹窗
- 显示旧等级 → 新等级
- 显示新称号
- 更华丽的动画效果
- 可能解锁新成就提示

**验收标准**：
- ✅ 升级时弹出升级弹窗
- ✅ 正确显示等级变化
- ✅ 显示新称号
- ✅ 动画效果华丽
- ✅ 关闭后更新角色卡

**UI 设计**：
- 大号弹窗（约 500px 宽）
- 金色发光边框
- 大号"Level Up!"文字
- 等级变化：Lv.1 → Lv.2
- 新称号展示
- 庆祝动画（可选：彩带、星星）

**动画效果**：
- 弹窗弹跳进入
- 文字缩放闪烁
- 背景光效闪烁
- 延迟显示新称号

---

### 5. 金币奖励

**优先级**：P0

**需求描述**：
- 完成任务后获得金币
- 累计到角色总金币
- 更新角色卡金币显示
- 金币图标和动画

**验收标准**：
- ✅ 金币数量正确增加
- ✅ 角色卡金币实时更新
- ✅ 奖励弹窗显示金币
- ✅ 金币图标醒目

**技术实现**：
```typescript
const addGold = (goldGain: number) => {
  const newGold = character.gold + goldGain;
  updateCharacter({ gold: newGold });
};
```

---

### 6. 属性成长

**优先级**：P0

**需求描述**：
- 完成任务后根据任务标签获得属性提升
- 累计到角色属性值
- 更新角色卡属性显示
- 属性提升有视觉反馈

**验收标准**：
- ✅ 属性值正确增加（根据任务标签）
- ✅ 角色卡属性实时更新
- ✅ 奖励弹窗显示属性提升
- ✅ 属性图标高亮

**属性映射**：
```typescript
const tagToStat = {
  study: 'intelligence',  // 学习 → 智力
  work: 'focus',          // 工作 → 专注
  health: 'vitality',     // 健身 → 活力
  life: 'strength'        // 生活 → 力量
} as const;
```

**技术实现**：
```typescript
const addStat = (statReward: StatReward) => {
  const newStats = { ...character.stats };
  
  if (statReward.strength) newStats.strength += statReward.strength;
  if (statReward.intelligence) newStats.intelligence += statReward.intelligence;
  if (statReward.focus) newStats.focus += statReward.focus;
  if (statReward.vitality) newStats.vitality += statReward.vitality;
  
  updateCharacter({ stats: newStats });
};
```

---

### 7. 角色信息实时更新

**优先级**：P0

**需求描述**：
- 角色卡实时显示最新的经验、金币、属性
- 经验进度条平滑动画
- 数据变化时有视觉反馈
- 支持手动刷新（可选）

**验收标准**：
- ✅ 角色卡数据实时更新
- ✅ 进度条平滑过渡
- ✅ 数值变化有动画
- ✅ 不需要手动刷新

**动画效果**：
- 经验条宽度过渡：`transition-all duration-500`
- 数值滚动动画（可选）
- 属性图标闪烁

---

### 8. 奖励数据追踪

**优先级**：P1

**需求描述**：
- 记录今日获得的奖励总计
- 记录历史累计奖励
- 为每日结算页面提供数据支持

**验收标准**：
- ✅ 今日奖励数据正确累计
- ✅ 数据持久化存储
- ✅ 可查询历史数据

**数据结构**：
```typescript
type DailyReward = {
  date: string;           // 日期 YYYY-MM-DD
  totalExp: number;       // 今日获得经验
  totalGold: number;      // 今日获得金币
  totalStats: StatReward; // 今日属性提升
  completedQuests: number;// 完成任务数
  mainQuestCompleted: boolean; // 主线是否完成
};
```

**技术实现**：
```typescript
const updateDailyReward = (reward: Reward) => {
  const today = new Date().toISOString().split('T')[0];
  const dailyReward = storage.get(STORAGE_KEYS.DAILY_SUMMARY, {});
  
  if (!dailyReward[today]) {
    dailyReward[today] = {
      date: today,
      totalExp: 0,
      totalGold: 0,
      totalStats: {},
      completedQuests: 0,
      mainQuestCompleted: false
    };
  }
  
  dailyReward[today].totalExp += reward.exp;
  dailyReward[today].totalGold += reward.gold;
  dailyReward[today].completedQuests += 1;
  
  // 累加属性
  Object.entries(reward.statReward).forEach(([stat, value]) => {
    dailyReward[today].totalStats[stat] = 
      (dailyReward[today].totalStats[stat] || 0) + value;
  });
  
  storage.set(STORAGE_KEYS.DAILY_SUMMARY, dailyReward);
};
```

---

## 完成任务完整流程

```typescript
const completeQuest = (questId: string) => {
  const quest = getQuestById(questId);
  if (!quest) return;
  
  // 1. 计算奖励
  const reward = {
    exp: quest.expReward,
    gold: quest.goldReward,
    statReward: quest.statReward
  };
  
  // 2. 更新任务状态
  updateQuestStatus(questId, 'done');
  
  // 3. 添加奖励到角色
  addExperience(reward.exp);
  addGold(reward.gold);
  addStat(reward.statReward);
  
  // 4. 记录今日奖励
  updateDailyReward(reward);
  
  // 5. 显示奖励弹窗
  setShowRewardModal({
    isOpen: true,
    quest,
    reward,
    isMainQuest: quest.type === 'main'
  });
  
  // 6. 检查是否升级（在 addExperience 内部触发）
  // 7. 检查是否解锁成就（Phase 4 实现）
};
```

---

## 组件拆分

### 新增组件

- `RewardModal`：奖励结算弹窗
- `LevelUpModal`：升级弹窗
- `ExpBar`：经验进度条（增强动画）
- `StatDisplay`：属性显示组件（支持动画）

### 更新组件

- `CharacterCard`：实时更新显示，添加动画
- `QuestCard`：完成任务时触发奖励流程
- `DashboardPage`：处理奖励弹窗显示

---

## 状态管理

### CharacterStore 扩展

```typescript
interface CharacterStore {
  character: Character;
  
  // 基础操作
  updateCharacter: (updates: Partial<Character>) => void;
  
  // 奖励相关
  addExperience: (exp: number) => void;
  addGold: (gold: number) => void;
  addStat: (statReward: StatReward) => void;
  levelUp: () => void;
  
  // 计算方法
  getNextLevelExp: () => number;
  getExpProgress: () => number;
  checkLevelUp: (exp: number) => boolean;
}
```

### RewardStore 新增

```typescript
interface RewardStore {
  todayReward: DailyReward;
  
  updateTodayReward: (reward: Reward) => void;
  getTodayReward: () => DailyReward;
  resetTodayReward: () => void; // 每日重置
}
```

### ModalStore 新增

```typescript
interface ModalStore {
  rewardModal: {
    isOpen: boolean;
    quest?: Quest;
    reward?: Reward;
    isMainQuest?: boolean;
  };
  levelUpModal: {
    isOpen: boolean;
    oldLevel?: number;
    newLevel?: number;
    newTitle?: string;
  };
  
  showRewardModal: (data: RewardModalData) => void;
  hideRewardModal: () => void;
  showLevelUpModal: (data: LevelUpModalData) => void;
  hideLevelUpModal: () => void;
}
```

---

## UI 设计要点

### 奖励弹窗

- 普通任务：标准弹窗，蓝色主题
- 主线任务：加大弹窗，金色主题，发光效果
- 挑战任务：红色主题，特殊标识
- 动画：弹入 + 数字滚动

### 升级弹窗

- 大号弹窗，金色发光边框
- "Level Up!" 大号文字，带闪烁效果
- 等级变化清晰显示
- 新称号用高亮展示
- 背景光效

### 角色卡更新

- 经验条：平滑过渡动画
- 金币：数字滚动 + 图标闪烁
- 属性：高亮提升的属性

---

## 动画效果清单

使用 Framer Motion 实现：

- [ ] 奖励弹窗弹入动画
- [ ] 奖励数字滚动动画
- [ ] 金币图标抖动
- [ ] 属性图标闪烁
- [ ] 升级弹窗弹入动画
- [ ] Level Up 文字缩放闪烁
- [ ] 背景光效闪烁
- [ ] 经验条平滑过渡
- [ ] 属性值变化高亮

---

## 验收清单

- [ ] 完成任务后弹出奖励弹窗
- [ ] 奖励信息正确显示
- [ ] 主线任务有特殊视觉效果
- [ ] 经验值正确累计和显示
- [ ] 等级提升逻辑正确
- [ ] 升级弹窗正常显示
- [ ] 金币正确增加
- [ ] 属性正确成长
- [ ] 角色卡实时更新
- [ ] 今日奖励数据正确记录
- [ ] 所有动画流畅
- [ ] 数据持久化正常

---

## 下一步计划

完成 Phase 3 后，进入 Phase 4 开发成就与统计系统：
- 成就系统设计与实现
- 称号系统完善
- 每日结算页面
- 统计数据展示
- 成就解锁提示
