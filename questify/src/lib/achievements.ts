/**
 * 成就系统核心逻辑
 */

import { Achievement } from '@/types'
import { getPlayerStats } from './player-stats'

export type AchievementCategory = 'task' | 'streak' | 'special'

export type AchievementConditionType = 
  | 'total_quests' 
  | 'main_quests' 
  | 'streak' 
  | 'tag_quests' 
  | 'challenge_quests' 
  | 'total_exp'

export type AchievementCondition = {
  type: AchievementConditionType
  operator: '>=' | '=='
  value: number
  tag?: string
}

export type AchievementDefinition = {
  id: string
  key: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  target: number
  condition: AchievementCondition
}

// 初始成就列表
export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'first_blood',
    key: 'first_blood',
    title: 'First Blood',
    description: '首次完成 1 个任务',
    icon: 'sword',
    category: 'task',
    target: 1,
    condition: { type: 'total_quests', operator: '>=', value: 1 }
  },
  {
    id: 'main_story_clear',
    key: 'main_story_clear',
    title: 'Main Story Clear',
    description: '首次完成主线任务',
    icon: 'crown',
    category: 'task',
    target: 1,
    condition: { type: 'main_quests', operator: '>=', value: 1 }
  },
  {
    id: 'streak_3',
    key: 'streak_3',
    title: 'Streak Master',
    description: '连续 3 天完成主线任务',
    icon: 'fire',
    category: 'streak',
    target: 3,
    condition: { type: 'streak', operator: '>=', value: 3 }
  },
  {
    id: 'streak_7',
    key: 'streak_7',
    title: 'Week Warrior',
    description: '连续 7 天完成主线任务',
    icon: 'flame',
    category: 'streak',
    target: 7,
    condition: { type: 'streak', operator: '>=', value: 7 }
  },
  {
    id: 'scholar',
    key: 'scholar',
    title: 'Scholar',
    description: '累计完成 10 个学习类任务',
    icon: 'book',
    category: 'task',
    target: 10,
    condition: { type: 'tag_quests', operator: '>=', value: 10, tag: 'STUDY' }
  },
  {
    id: 'worker',
    key: 'worker',
    title: 'Workaholic',
    description: '累计完成 10 个工作类任务',
    icon: 'briefcase',
    category: 'task',
    target: 10,
    condition: { type: 'tag_quests', operator: '>=', value: 10, tag: 'WORK' }
  },
  {
    id: 'iron_will',
    key: 'iron_will',
    title: 'Iron Will',
    description: '累计完成 5 个挑战任务',
    icon: 'shield',
    category: 'task',
    target: 5,
    condition: { type: 'challenge_quests', operator: '>=', value: 5 }
  },
  {
    id: 'exp_master',
    key: 'exp_master',
    title: 'Experience Master',
    description: '累计获得 1000 EXP',
    icon: 'star',
    category: 'special',
    target: 1000,
    condition: { type: 'total_exp', operator: '>=', value: 1000 }
  },
  {
    id: 'quest_hunter_10',
    key: 'quest_hunter_10',
    title: 'Quest Hunter',
    description: '累计完成 10 个任务',
    icon: 'target',
    category: 'task',
    target: 10,
    condition: { type: 'total_quests', operator: '>=', value: 10 }
  },
  {
    id: 'quest_master_50',
    key: 'quest_master_50',
    title: 'Quest Master',
    description: '累计完成 50 个任务',
    icon: 'trophy',
    category: 'task',
    target: 50,
    condition: { type: 'total_quests', operator: '>=', value: 50 }
  },
]

const STORAGE_KEY = 'questify_achievements'

/**
 * 初始化成就数据
 */
const initAchievements = (): Achievement[] => {
  return achievementDefinitions.map(def => ({
    id: def.id,
    key: def.key,
    title: def.title,
    description: def.description,
    icon: def.icon,
    progress: 0,
    target: def.target,
    unlocked: false,
    unlockedAt: undefined,
  }))
}

/**
 * 获取成就列表
 */
export const getAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') {
    return initAchievements()
  }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const initial = initAchievements()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
  
  try {
    return JSON.parse(stored)
  } catch {
    const initial = initAchievements()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
}

/**
 * 保存成就列表
 */
export const saveAchievements = (achievements: Achievement[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements))
}

/**
 * 评估成就条件
 */
export const evaluateCondition = (condition: AchievementCondition): number => {
  const stats = getPlayerStats()
  
  let value = 0
  
  switch (condition.type) {
    case 'total_quests':
      value = stats.totalQuestsCompleted
      break
    case 'main_quests':
      value = stats.mainQuestsCompleted
      break
    case 'streak':
      value = stats.currentStreak
      break
    case 'tag_quests':
      value = stats.tagQuestsCompleted[condition.tag as keyof typeof stats.tagQuestsCompleted] || 0
      break
    case 'challenge_quests':
      value = stats.challengeQuestsCompleted
      break
    case 'total_exp':
      value = stats.totalExpEarned
      break
  }
  
  return value
}

/**
 * 检查并解锁成就
 * 返回新解锁的成就列表
 */
export const checkAndUnlockAchievements = (): Achievement[] => {
  const achievements = getAchievements()
  const newlyUnlocked: Achievement[] = []
  
  achievements.forEach((achievement, index) => {
    if (achievement.unlocked) return
    
    const def = achievementDefinitions.find(d => d.id === achievement.id)
    if (!def) return
    
    const currentValue = evaluateCondition(def.condition)
    
    // 更新进度
    achievements[index].progress = Math.min(currentValue, achievement.target)
    
    // 检查是否达成
    const isUnlocked = def.condition.operator === '>=' 
      ? currentValue >= def.condition.value
      : currentValue === def.condition.value
    
    if (isUnlocked && !achievement.unlocked) {
      achievements[index].unlocked = true
      achievements[index].unlockedAt = new Date().toISOString()
      achievements[index].progress = achievement.target
      newlyUnlocked.push(achievements[index])
    }
  })
  
  saveAchievements(achievements)
  return newlyUnlocked
}

/**
 * 获取成就统计
 */
export const getAchievementStats = (): {
  total: number
  unlocked: number
  locked: number
} => {
  const achievements = getAchievements()
  const unlocked = achievements.filter(a => a.unlocked).length
  
  return {
    total: achievements.length,
    unlocked,
    locked: achievements.length - unlocked,
  }
}

/**
 * 根据类别筛选成就
 */
export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
  const achievements = getAchievements()
  const definitions = achievementDefinitions.filter(d => d.category === category)
  
  return achievements.filter(a => 
    definitions.some(d => d.id === a.id)
  )
}

/**
 * 获取已解锁成就
 */
export const getUnlockedAchievements = (): Achievement[] => {
  return getAchievements().filter(a => a.unlocked)
}

/**
 * 获取未解锁成就
 */
export const getLockedAchievements = (): Achievement[] => {
  return getAchievements().filter(a => !a.unlocked)
}

/**
 * 重置成就（测试用）
 */
export const resetAchievements = (): void => {
  const initial = initAchievements()
  saveAchievements(initial)
}
