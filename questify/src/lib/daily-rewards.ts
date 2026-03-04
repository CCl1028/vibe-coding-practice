// 今日奖励数据结构
export interface DailyReward {
  date: string // YYYY-MM-DD
  totalExp: number
  totalGold: number
  totalStats: {
    strength: number
    intelligence: number
    focus: number
    vitality: number
  }
  completedQuests: number
  mainQuestCompleted: boolean
}

// 存储键
const STORAGE_KEY = "questify_daily_rewards"

// 获取今天的日期字符串
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

// 获取今日奖励数据
export function getTodayReward(): DailyReward {
  const today = getTodayDate()
  const storedData = localStorage.getItem(STORAGE_KEY)
  
  if (!storedData) {
    return createEmptyDailyReward(today)
  }

  const allRewards: Record<string, DailyReward> = JSON.parse(storedData)
  
  if (!allRewards[today]) {
    return createEmptyDailyReward(today)
  }

  return allRewards[today]
}

// 更新今日奖励数据
export function updateTodayReward(reward: {
  exp: number
  gold: number
  stats: {
    strength: number
    intelligence: number
    focus: number
    vitality: number
  }
  isMainQuest: boolean
}) {
  const today = getTodayDate()
  const storedData = localStorage.getItem(STORAGE_KEY)
  const allRewards: Record<string, DailyReward> = storedData
    ? JSON.parse(storedData)
    : {}

  if (!allRewards[today]) {
    allRewards[today] = createEmptyDailyReward(today)
  }

  const todayReward = allRewards[today]
  
  // 累加奖励
  todayReward.totalExp += reward.exp
  todayReward.totalGold += reward.gold
  todayReward.totalStats.strength += reward.stats.strength
  todayReward.totalStats.intelligence += reward.stats.intelligence
  todayReward.totalStats.focus += reward.stats.focus
  todayReward.totalStats.vitality += reward.stats.vitality
  todayReward.completedQuests += 1
  
  if (reward.isMainQuest) {
    todayReward.mainQuestCompleted = true
  }

  // 保存到 localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allRewards))
  
  return todayReward
}

// 获取历史奖励数据
export function getHistoryRewards(days: number = 7): DailyReward[] {
  const storedData = localStorage.getItem(STORAGE_KEY)
  
  if (!storedData) {
    return []
  }

  const allRewards: Record<string, DailyReward> = JSON.parse(storedData)
  const today = new Date()
  const history: DailyReward[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    
    if (allRewards[dateStr]) {
      history.push(allRewards[dateStr])
    } else {
      history.push(createEmptyDailyReward(dateStr))
    }
  }

  return history.reverse()
}

// 清理旧数据（保留最近 30 天）
export function cleanOldRewards() {
  const storedData = localStorage.getItem(STORAGE_KEY)
  
  if (!storedData) {
    return
  }

  const allRewards: Record<string, DailyReward> = JSON.parse(storedData)
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const cleanedRewards: Record<string, DailyReward> = {}
  
  Object.entries(allRewards).forEach(([date, reward]) => {
    const rewardDate = new Date(date)
    if (rewardDate >= thirtyDaysAgo) {
      cleanedRewards[date] = reward
    }
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedRewards))
}

// 创建空的每日奖励对象
function createEmptyDailyReward(date: string): DailyReward {
  return {
    date,
    totalExp: 0,
    totalGold: 0,
    totalStats: {
      strength: 0,
      intelligence: 0,
      focus: 0,
      vitality: 0,
    },
    completedQuests: 0,
    mainQuestCompleted: false,
  }
}

// 重置今日数据（用于测试）
export function resetTodayReward() {
  const today = getTodayDate()
  const storedData = localStorage.getItem(STORAGE_KEY)
  
  if (!storedData) {
    return
  }

  const allRewards: Record<string, DailyReward> = JSON.parse(storedData)
  delete allRewards[today]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allRewards))
}
