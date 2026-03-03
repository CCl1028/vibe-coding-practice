import { QuestType, Difficulty, QuestTag, QuestStatus } from '@prisma/client'

export type Character = {
  id: string
  name: string
  avatar: string
  level: number
  exp: number
  gold: number
  title: string
  stats: {
    strength: number
    intelligence: number
    focus: number
    vitality: number
  }
}

export type Quest = {
  id: string
  title: string
  description?: string
  type: QuestType
  difficulty: Difficulty
  tag: QuestTag
  status: QuestStatus
  expReward: number
  goldReward: number
  statReward: {
    strength?: number
    intelligence?: number
    focus?: number
    vitality?: number
  }
  createdAt: string
  completedAt?: string
  isToday: boolean
}

export type Achievement = {
  id: string
  key: string
  title: string
  description: string
  icon: string
  progress: number
  target: number
  unlocked: boolean
  unlockedAt?: string
}

export type DailySummary = {
  date: string
  completedQuests: number
  mainQuestCompleted: boolean
  expGained: number
  goldGained: number
  statsGained: {
    strength: number
    intelligence: number
    focus: number
    vitality: number
  }
}

export { QuestType, Difficulty, QuestTag, QuestStatus }
