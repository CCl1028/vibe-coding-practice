/**
 * 玩家统计数据管理
 * 用于追踪玩家的累计数据，支持成就系统
 */

import { Quest, QuestTag } from '@/types'

export type PlayerStats = {
  totalQuestsCompleted: number
  mainQuestsCompleted: number
  challengeQuestsCompleted: number
  tagQuestsCompleted: {
    STUDY: number
    WORK: number
    HEALTH: number
    LIFE: number
  }
  totalExpEarned: number
  totalGoldEarned: number
  currentStreak: number
  maxStreak: number
  lastActiveDate?: string
}

const STORAGE_KEY = 'questify_player_stats'

// 初始化统计数据
const initialStats: PlayerStats = {
  totalQuestsCompleted: 0,
  mainQuestsCompleted: 0,
  challengeQuestsCompleted: 0,
  tagQuestsCompleted: {
    STUDY: 0,
    WORK: 0,
    HEALTH: 0,
    LIFE: 0,
  },
  totalExpEarned: 0,
  totalGoldEarned: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastActiveDate: undefined,
}

/**
 * 获取玩家统计数据
 */
export const getPlayerStats = (): PlayerStats => {
  if (typeof window === 'undefined') {
    return initialStats
  }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return initialStats
  }
  
  try {
    return JSON.parse(stored)
  } catch {
    return initialStats
  }
}

/**
 * 保存玩家统计数据
 */
export const savePlayerStats = (stats: PlayerStats): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

/**
 * 更新 Streak（连续天数）
 */
export const updateStreak = (stats: PlayerStats): void => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  if (!stats.lastActiveDate) {
    // 第一次活跃
    stats.currentStreak = 1
    stats.maxStreak = 1
  } else if (stats.lastActiveDate === yesterday) {
    // 连续活跃
    stats.currentStreak += 1
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
  } else if (stats.lastActiveDate !== today) {
    // 不连续，重置
    stats.currentStreak = 1
  }
  // 如果是今天已经活跃过，不做任何操作
  
  stats.lastActiveDate = today
}

/**
 * 更新玩家统计（任务完成时调用）
 */
export const updatePlayerStatsOnQuestComplete = (
  quest: {
    type: string
    tag: QuestTag
    expReward: number
    goldReward: number
  }
): void => {
  const stats = getPlayerStats()
  
  // 更新任务统计
  stats.totalQuestsCompleted += 1
  
  if (quest.type === 'MAIN') {
    stats.mainQuestsCompleted += 1
  }
  
  if (quest.type === 'CHALLENGE') {
    stats.challengeQuestsCompleted += 1
  }
  
  // 更新标签统计
  stats.tagQuestsCompleted[quest.tag] = (stats.tagQuestsCompleted[quest.tag] || 0) + 1
  
  // 更新奖励统计
  stats.totalExpEarned += quest.expReward
  stats.totalGoldEarned += quest.goldReward
  
  // 更新 Streak（仅主线任务）
  if (quest.type === 'MAIN') {
    updateStreak(stats)
  }
  
  savePlayerStats(stats)
}

/**
 * 重置玩家统计（测试用）
 */
export const resetPlayerStats = (): void => {
  savePlayerStats(initialStats)
}

/**
 * 获取统计摘要
 */
export const getStatsSummary = (): {
  totalQuests: number
  totalExp: number
  totalGold: number
  currentStreak: number
} => {
  const stats = getPlayerStats()
  return {
    totalQuests: stats.totalQuestsCompleted,
    totalExp: stats.totalExpEarned,
    totalGold: stats.totalGoldEarned,
    currentStreak: stats.currentStreak,
  }
}
