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
