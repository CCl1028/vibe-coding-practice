/**
 * 🎁 奖励计算逻辑
 * 与 Web 端保持一致
 */

import { Difficulty, QuestType, QuestTag } from '../types';

// 基础奖励规则
const BASE_REWARDS = {
  EASY: { exp: 20, gold: 5 },
  MEDIUM: { exp: 50, gold: 10 },
  HARD: { exp: 100, gold: 20 },
};

// 类型额外奖励
const TYPE_BONUS = {
  MAIN: { exp: 20, gold: 5 },
  CHALLENGE: { exp: 30, gold: 10 },
  DAILY: { exp: 0, gold: 0 },
  SIDE: { exp: 0, gold: 0 },
};

// 标签属性映射
const TAG_STAT_MAPPING = {
  STUDY: { strength: 0, intelligence: 1, focus: 0, vitality: 0 },
  WORK: { strength: 0, intelligence: 0, focus: 1, vitality: 0 },
  HEALTH: { strength: 0, intelligence: 0, focus: 0, vitality: 1 },
  LIFE: { strength: 1, intelligence: 0, focus: 0, vitality: 0 },
};

export function calculateRewards(
  difficulty: Difficulty,
  type: QuestType,
  tag: QuestTag
) {
  const baseReward = BASE_REWARDS[difficulty];
  const typeBonus = TYPE_BONUS[type];
  const statReward = TAG_STAT_MAPPING[tag];

  return {
    expReward: baseReward.exp + typeBonus.exp,
    goldReward: baseReward.gold + typeBonus.gold,
    statReward,
  };
}

// 计算下一级所需经验
export function getExpForNextLevel(level: number): number {
  return level * 100;
}

// 计算当前经验的等级和进度
export function calculateLevel(exp: number) {
  let level = 1;
  let remainingExp = exp;

  while (remainingExp >= getExpForNextLevel(level)) {
    remainingExp -= getExpForNextLevel(level);
    level++;
  }

  return {
    level,
    currentExp: remainingExp,
    nextLevelExp: getExpForNextLevel(level),
    progress: (remainingExp / getExpForNextLevel(level)) * 100,
  };
}

// 根据等级获取称号
export function getTitleForLevel(level: number): string {
  if (level >= 20) return '传奇冒险者';
  if (level >= 15) return '高效执行官';
  if (level >= 10) return '挑战征服者';
  if (level >= 7) return '深度潜行者';
  if (level >= 5) return '稳定推进者';
  if (level >= 3) return '积极行动者';
  return '初出茅庐';
}
