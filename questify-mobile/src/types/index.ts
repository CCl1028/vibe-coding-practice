/**
 * 📝 类型定义
 * 与 Web 端保持一致
 */

export type QuestType = 'MAIN' | 'SIDE' | 'DAILY' | 'CHALLENGE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestTag = 'STUDY' | 'WORK' | 'HEALTH' | 'LIFE';
export type QuestStatus = 'TODO' | 'DOING' | 'DONE';

export type Character = {
  id: string;
  name: string;
  avatar: string;
  avatarUri?: string; // 用户上传的头像 URI
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

export type Quest = {
  id: string;
  title: string;
  description?: string;
  type: QuestType;
  difficulty: Difficulty;
  tag: QuestTag;
  status: QuestStatus;
  expReward: number;
  goldReward: number;
  strReward: number;
  intReward: number;
  focReward: number;
  vitReward: number;
  createdAt: string;
  completedAt?: string;
  isToday: boolean;
  // 过期相关字段
  isOverdue?: boolean;              // 是否已过期
  overduePenaltyApplied?: boolean;  // 过期惩罚是否已执行
  penaltyAmount?: {                 // 惩罚金额记录
    exp: number;
    gold: number;
  };
};

export type Achievement = {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
};

export type DailySummary = {
  date: string;
  completedQuests: number;
  mainQuestCompleted: boolean;
  expGained: number;
  goldGained: number;
  statsGained: {
    strength: number;
    intelligence: number;
    focus: number;
    vitality: number;
  };
};

// 每日检查记录（用于过期结算）
export type DailyCheckRecord = {
  lastCheckDate: string;           // 上次检查日期 (YYYY-MM-DD)
  todayClearAchieved: boolean;     // 今日是否已达成全清
};

// 过期结算结果
export type OverdueSettlement = {
  overdueQuests: Quest[];          // 新过期的任务列表
  totalPenalty: {
    exp: number;
    gold: number;
  };
};
