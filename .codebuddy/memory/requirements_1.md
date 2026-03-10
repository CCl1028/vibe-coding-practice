# 📜 冒险日志 Tab - 产品需求文档

## 0. 背景与目的

当前 Questify 已有「任务完成 → 获得经验/金币 → 角色成长」的核心循环，但用户缺少一个**回顾与沉淀**的入口。

**冒险日志**将历史任务数据转化为可回忆的成长记录，让用户感受到「我真的在一步步变强」，提升成就感与长期留存。

---

## 1. 目标

### 1.1 用户目标
- 🎯 快速看到一段时间内的「成长成果」（经验、主线、升级、连续天数）
- 📅 按天回看：那天完成了什么、获得了什么
- 📈 看到长期趋势：等级/经验变化、主线完成率、属性增长来源

### 1.2 产品目标
- ✨ **增强成就感闭环**：完成任务 → 成长 → 可视化回顾 → 更愿意继续完成
- 🎮 **强化产品差异化**：相比普通 Todo 的「已完成列表」，提供 RPG 风格的「战报/冒险记录」

### 1.3 本期不做
- 团队协作历史
- 社交分享（可留占位）
- 复杂数据分析（AI 预测、画像等）

---

## 2. 底部 Tab 结构

新增后变为 **4 个 Tab**：

| 顺序 | Tab 名称 | 图标 | 说明 |
|------|---------|------|------|
| 1 | 任务 | 📋 list | 今日进度 + 主线/其他任务 |
| 2 | **日志** | 📜 book | **本期新增**：冒险记录 |
| 3 | 成就 | 🏆 trophy | 成就殿堂 |
| 4 | 我的 | 👤 person | 角色详情 |

---

## 3. 页面信息架构

```
冒险日志 (/history)
├── 📊 顶部指标卡 (KPIBar)
│   └── 总经验 | 完成任务 | 主线天数 | 完成率 | 最长连续
├── 🗓️ 日历热力图 (HeatmapCalendar)
│   └── 点击某天 → 打开日详情抽屉
└── 📋 日详情抽屉 (DayDetailDrawer)
    ├── 当日结算卡
    └── 完成的任务列表
```

---

## 4. 核心组件设计

### 4.1 顶部：日期范围 + 指标卡

#### DateRangePicker
- 最近 7 天（默认）
- 最近 30 天
- 本月
- 自定义范围（可后置）

#### KPIBar（4-5 个指标卡）

| 指标 | 说明 | emoji |
|------|------|-------|
| 总经验 | 范围内获得的总 EXP | ⭐ |
| 完成任务 | 完成的任务总数 | ✅ |
| 主线天数 | 完成主线的天数 | 🎯 |
| 完成率 | 主线天数 / 总天数 | 📊 |
| 最长连续 | 主线连续完成的最长天数 | 🔥 |

---

### 4.2 日历热力图 (HeatmapCalendar)

**设计要点**：
- GitHub contribution 风格的热力图
- 颜色深浅 = 当日获得的经验值
- 完成主线的日期加 🏅 勋章标识
- Hover/长按显示 Tooltip：`当日经验 +150 | 完成 5 个任务 | 主线 ✓`
- 点击日期 → 打开日详情抽屉

**热力值映射**：
```
0 EXP      → 最浅色（灰色）
1-50 EXP   → level 1（浅绿）
51-100 EXP → level 2（中绿）
101-150    → level 3（深绿）
150+       → level 4（最深绿）
```

---

### 4.3 日详情抽屉 (DayDetailDrawer)

从底部滑出的抽屉，展示某天的详细记录。

#### 结构

```
┌──────────────────────────────────────────┐
│  📅 2026年3月10日 周二           🏅主线达成 │
├──────────────────────────────────────────┤
│  ┌─────┬─────┬─────┬─────┐              │
│  │ +120│ +80 │  5  │ ✓  │              │
│  │ 经验 │ 金币 │完成数│主线 │              │
│  └─────┴─────┴─────┴─────┘              │
├──────────────────────────────────────────┤
│  💪 属性成长                              │
│  力量 +2  智力 +3  专注 +1  活力 +2       │
├──────────────────────────────────────────┤
│  ⭐ 主线任务                              │
│  ☑️ 完成产品需求文档                      │
├──────────────────────────────────────────┤
│  📋 其他任务                              │
│  ☑️ 晨跑 30 分钟                          │
│  ☑️ 阅读技术文章                          │
│  ☑️ 整理房间                              │
└──────────────────────────────────────────┘
```

#### 内容字段

| 字段 | 说明 |
|------|------|
| 日期 | 2026年3月10日 周二 |
| 勋章 | 主线达成 🏅 / 高经验日 ⚡ / 升级 🆙 |
| 经验获得 | +120 EXP |
| 金币获得 | +80 Gold |
| 完成数 | 5 个任务 |
| 主线状态 | ✓ 已完成 / ✗ 未完成 |
| 属性成长 | 力量 +2, 智力 +3, 专注 +1, 活力 +2 |
| 任务列表 | 按类型分组展示当天完成的任务 |

---

## 5. 数据模型

### 5.1 DailySummary（日汇总）

```typescript
type DailySummary = {
  date: string;              // "2026-03-10"
  expEarned: number;         // 当日获得经验
  goldEarned: number;        // 当日获得金币
  completedCount: number;    // 完成任务数
  mainCompleted: boolean;    // 是否完成主线
  statGains: {               // 属性成长
    strength: number;
    intelligence: number;
    focus: number;
    vitality: number;
  };
  badges: string[];          // 勋章 ["MAIN_CLEAR", "HIGH_EXP", "LEVEL_UP"]
};
```

### 5.2 HistoryKPIs（范围统计）

```typescript
type HistoryKPIs = {
  totalExp: number;           // 总经验
  completedCount: number;     // 完成任务数
  mainCompletedDays: number;  // 主线完成天数
  mainCompletionRate: number; // 主线完成率 (0-1)
  longestStreak: number;      // 最长连续天数
  daysInRange: number;        // 范围内天数
};
```

### 5.3 DayDetail（日详情）

```typescript
type DayDetail = {
  date: string;
  summary: DailySummary;
  quests: Quest[];           // 当天完成的任务
};
```

---

## 6. 本地存储方案

由于当前采用纯本地存储（AsyncStorage），数据聚合在前端完成。

### 6.1 聚合逻辑

从 `@questify/quests` 中筛选 `status === 'DONE'` 且 `completedAt` 在指定日期范围内的任务，按天聚合：

```typescript
// 伪代码
function aggregateDailySummary(date: string, quests: Quest[]): DailySummary {
  const dayQuests = quests.filter(q => 
    q.status === 'DONE' && 
    q.completedAt?.startsWith(date)
  );
  
  return {
    date,
    expEarned: sum(dayQuests.map(q => q.expReward)),
    goldEarned: sum(dayQuests.map(q => q.goldReward)),
    completedCount: dayQuests.length,
    mainCompleted: dayQuests.some(q => q.type === 'MAIN'),
    statGains: {
      strength: sum(dayQuests.map(q => q.strReward)),
      intelligence: sum(dayQuests.map(q => q.intReward)),
      focus: sum(dayQuests.map(q => q.focReward)),
      vitality: sum(dayQuests.map(q => q.vitReward)),
    },
    badges: computeBadges(...),
  };
}
```

### 6.2 勋章规则

| 勋章 | 条件 |
|------|------|
| 🏅 MAIN_CLEAR | 当天完成主线任务 |
| ⚡ HIGH_EXP | 当天经验 ≥ 150 |
| 🆙 LEVEL_UP | 当天发生升级（需要额外记录） |
| 🔥 STREAK | 连续完成主线（需要 streak 计算） |

---

## 7. 交互细节

| 场景 | 交互 |
|------|------|
| 切换日期范围 | 刷新 KPI + 热力图 |
| Hover/长按日历格子 | 显示 Tooltip（经验/完成数/主线） |
| 点击日历格子 | 打开 DayDetailDrawer |
| 下拉刷新 | 重新聚合数据 |
| 空状态 | 显示引导：「还没有冒险记录，去完成第一个任务吧！」|

---

## 8. UI 文案

| 位置 | 文案 |
|------|------|
| Tab 名称 | 日志 |
| 页面标题 | 冒险日志 |
| 副标题 | 记录你的每一次成长 |
| 空状态 | 📜 还没有冒险记录<br>完成第一个任务，开启你的成长旅程！ |
| KPI 标签 | 总经验 / 完成任务 / 主线天数 / 完成率 / 最长连续 |

---

## 9. 验收标准

### MVP（最小可用）

- [ ] 新增「日志」Tab，位于任务和成就之间
- [ ] 页面展示最近 7 天的 KPI 指标卡
- [ ] 日历热力图显示正确（颜色 = 经验，主线 = 勋章）
- [ ] 点击某天打开 DayDetailDrawer，展示当日 KPI 和任务列表
- [ ] 无数据时显示空状态引导

### 增强（可后置）

- [ ] 日期范围切换（7天/30天/本月/自定义）
- [ ] Tooltip hover 效果
- [ ] 勋章系统（HIGH_EXP、LEVEL_UP、STREAK）
- [ ] 升级事件记录

---

## 10. 开发里程碑

### Phase 1: MVP 🎯

1. **新增 Tab 和路由**
   - `app/(tabs)/history.tsx`
   - `_layout.tsx` 添加日志 Tab

2. **数据服务**
   - `src/lib/local-storage.ts` 新增 `historyService`
   - 实现 `getDailySummaries(startDate, endDate)` 
   - 实现 `getDayDetail(date)`

3. **页面组件**
   - KPIBar 指标卡
   - HeatmapCalendar 热力图
   - DayDetailDrawer 日详情抽屉

### Phase 2: 增强 ✨

1. DateRangePicker 日期选择器
2. 勋章系统完善
3. 动画与过渡效果
4. 性能优化（大数据量时的虚拟滚动）

---

## 11. 技术备注

### 热力图库选择

可选方案（React Native）：
- 自定义实现（推荐，更可控）
- `react-native-chart-kit`
- `react-native-svg` + 自绘

### 颜色方案

使用现有主题色：
```typescript
// 热力图颜色（参考 colors.mint）
level0: colors.gray[100],     // 无数据
level1: colors.mint[200],     // 1-50
level2: colors.mint[400],     // 51-100
level3: colors.mint[500],     // 101-150
level4: colors.mint[600],     // 150+
```

---

## 附录：与原始 PRD 对比

| 原始 PRD | 本文档 | 说明 |
|----------|--------|------|
| History/Chronicle | 冒险日志 | 更符合 RPG 调性 |
| 3 个子 Tab（Chronicle/Calendar/Stats） | 单页（日历为主） | MVP 简化 |
| API 接口设计 | 本地存储聚合 | 适配当前架构 |
| 英文文案 | 中文文案 | 本地化 |
