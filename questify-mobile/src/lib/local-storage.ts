/**
 * 📦 本地存储服务
 * 使用 AsyncStorage 实现离线优先的数据存储
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, Quest, Achievement, QuestStatus, DailyCheckRecord, OverdueSettlement } from '../types';

// 存储键名
const KEYS = {
  CHARACTER: 'questify_character',
  QUESTS: 'questify_quests',
  ACHIEVEMENTS: 'questify_achievements',
  PLAYER_STATS: 'questify_player_stats',
  DAILY_CHECK: 'questify_daily_check',
};

// ============ 默认数据 ============

const DEFAULT_CHARACTER: Character = {
  id: 'local-hero',
  name: '冒险者',
  avatar: 'default',
  level: 1,
  exp: 0,
  gold: 100,
  title: '新手冒险者',
  stats: {
    strength: 5,
    intelligence: 5,
    focus: 5,
    vitality: 5,
  },
};

// 默认成就定义
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: '1', key: 'first_quest', title: '初出茅庐', description: '完成第一个任务', icon: '🎯', progress: 0, target: 1, unlocked: false },
  { id: '2', key: 'quest_master_10', title: '任务达人', description: '完成10个任务', icon: '⭐', progress: 0, target: 10, unlocked: false },
  { id: '3', key: 'quest_master_50', title: '任务大师', description: '完成50个任务', icon: '🏆', progress: 0, target: 50, unlocked: false },
  { id: '4', key: 'level_5', title: '初级冒险者', description: '达到5级', icon: '🌟', progress: 0, target: 5, unlocked: false },
  { id: '5', key: 'level_10', title: '中级冒险者', description: '达到10级', icon: '💫', progress: 0, target: 10, unlocked: false },
  { id: '6', key: 'gold_500', title: '小富翁', description: '累计获得500金币', icon: '💰', progress: 0, target: 500, unlocked: false },
  { id: '7', key: 'gold_2000', title: '大富翁', description: '累计获得2000金币', icon: '💎', progress: 0, target: 2000, unlocked: false },
  { id: '8', key: 'streak_3', title: '连续作战', description: '连续3天完成任务', icon: '🔥', progress: 0, target: 3, unlocked: false },
  { id: '9', key: 'streak_7', title: '周周不落', description: '连续7天完成任务', icon: '🔥🔥', progress: 0, target: 7, unlocked: false },
  { id: '10', key: 'hard_quest', title: '勇者无惧', description: '完成一个困难任务', icon: '🦸', progress: 0, target: 1, unlocked: false },
];

// 玩家统计（用于成就追踪）
interface PlayerStats {
  totalQuestsCompleted: number;
  totalGoldEarned: number;
  currentStreak: number;
  lastCompletedDate: string | null;
  hardQuestsCompleted: number;
}

const DEFAULT_PLAYER_STATS: PlayerStats = {
  totalQuestsCompleted: 0,
  totalGoldEarned: 0,
  currentStreak: 0,
  lastCompletedDate: null,
  hardQuestsCompleted: 0,
};

// ============ 通用存储方法 ============

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (error) {
    console.error(`[LocalStorage] 读取 ${key} 失败:`, error);
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[LocalStorage] 写入 ${key} 失败:`, error);
  }
}

// ============ 角色服务 ============

export const localCharacterService = {
  async get(): Promise<Character> {
    return getItem(KEYS.CHARACTER, DEFAULT_CHARACTER);
  },

  async update(updates: Partial<Character>): Promise<Character> {
    const current = await this.get();
    const updated = { ...current, ...updates };
    // 如果有 stats 更新，需要合并
    if (updates.stats) {
      updated.stats = { ...current.stats, ...updates.stats };
    }
    await setItem(KEYS.CHARACTER, updated);
    return updated;
  },

  async addRewards(rewards: {
    exp: number;
    gold: number;
    str: number;
    int: number;
    foc: number;
    vit: number;
  }): Promise<Character> {
    const current = await this.get();

    // 计算经验和升级
    let newExp = current.exp + rewards.exp;
    let newLevel = current.level;
    while (newExp >= newLevel * 100) {
      newExp -= newLevel * 100;
      newLevel++;
    }

    const updated: Character = {
      ...current,
      exp: newExp,
      level: newLevel,
      gold: current.gold + rewards.gold,
      stats: {
        strength: current.stats.strength + rewards.str,
        intelligence: current.stats.intelligence + rewards.int,
        focus: current.stats.focus + rewards.foc,
        vitality: current.stats.vitality + rewards.vit,
      },
    };

    // 更新称号
    if (newLevel >= 20) {
      updated.title = '传奇冒险者';
    } else if (newLevel >= 15) {
      updated.title = '精英冒险者';
    } else if (newLevel >= 10) {
      updated.title = '资深冒险者';
    } else if (newLevel >= 5) {
      updated.title = '熟练冒险者';
    }

    await setItem(KEYS.CHARACTER, updated);

    // 更新成就进度（等级相关）
    await localAchievementService.checkLevelAchievements(newLevel);

    return updated;
  },

  async reset(): Promise<Character> {
    await setItem(KEYS.CHARACTER, DEFAULT_CHARACTER);
    return DEFAULT_CHARACTER;
  },

  // 扣除惩罚（删除任务或过期惩罚）
  async applyPenalty(penalty: { exp?: number; gold?: number }): Promise<Character> {
    const current = await this.get();
    
    let newExp = current.exp - (penalty.exp || 0);
    let newLevel = current.level;
    
    // 经验值不能低于 0，如果低于当前等级的 0，则降级
    while (newExp < 0 && newLevel > 1) {
      newLevel--;
      newExp += newLevel * 100;
    }
    if (newExp < 0) newExp = 0;

    const updated: Character = {
      ...current,
      exp: newExp,
      level: newLevel,
      gold: Math.max(0, current.gold - (penalty.gold || 0)),
    };

    await setItem(KEYS.CHARACTER, updated);
    return updated;
  },
};

// ============ 任务服务 ============

export const localQuestService = {
  async getAll(options?: { isToday?: boolean; status?: QuestStatus }): Promise<Quest[]> {
    let quests = await getItem<Quest[]>(KEYS.QUESTS, []);

    if (options?.isToday !== undefined) {
      quests = quests.filter((q) => q.isToday === options.isToday);
    }
    if (options?.status) {
      quests = quests.filter((q) => q.status === options.status);
    }

    // 按创建时间倒序
    return quests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(quest: Omit<Quest, 'id' | 'createdAt'>): Promise<Quest> {
    const quests = await getItem<Quest[]>(KEYS.QUESTS, []);
    const newQuest: Quest = {
      ...quest,
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    quests.push(newQuest);
    await setItem(KEYS.QUESTS, quests);
    return newQuest;
  },

  async updateStatus(questId: string, status: QuestStatus): Promise<Quest | null> {
    const quests = await getItem<Quest[]>(KEYS.QUESTS, []);
    const index = quests.findIndex((q) => q.id === questId);
    if (index === -1) return null;

    quests[index].status = status;
    if (status === 'DONE') {
      quests[index].completedAt = new Date().toISOString();
    } else {
      quests[index].completedAt = undefined;
    }

    await setItem(KEYS.QUESTS, quests);

    // 如果完成任务，更新统计和成就
    if (status === 'DONE') {
      await this.trackQuestCompletion(quests[index]);
    }

    return quests[index];
  },

  async update(questId: string, updates: Partial<Quest>): Promise<Quest | null> {
    const quests = await getItem<Quest[]>(KEYS.QUESTS, []);
    const index = quests.findIndex((q) => q.id === questId);
    if (index === -1) return null;

    quests[index] = { ...quests[index], ...updates };
    await setItem(KEYS.QUESTS, quests);
    return quests[index];
  },

  async delete(questId: string): Promise<boolean> {
    const quests = await getItem<Quest[]>(KEYS.QUESTS, []);
    const filtered = quests.filter((q) => q.id !== questId);
    await setItem(KEYS.QUESTS, filtered);
    return true;
  },

  // 追踪任务完成（更新统计和成就）
  async trackQuestCompletion(quest: Quest): Promise<void> {
    const stats = await getItem<PlayerStats>(KEYS.PLAYER_STATS, DEFAULT_PLAYER_STATS);
    const today = new Date().toISOString().split('T')[0];

    stats.totalQuestsCompleted++;
    stats.totalGoldEarned += quest.goldReward;

    // 连续天数计算
    if (stats.lastCompletedDate) {
      const lastDate = new Date(stats.lastCompletedDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        stats.currentStreak++;
      } else if (diffDays > 1) {
        stats.currentStreak = 1;
      }
      // diffDays === 0 保持不变
    } else {
      stats.currentStreak = 1;
    }
    stats.lastCompletedDate = today;

    // 困难任务
    if (quest.difficulty === 'HARD') {
      stats.hardQuestsCompleted++;
    }

    await setItem(KEYS.PLAYER_STATS, stats);

    // 更新成就进度
    await localAchievementService.checkQuestAchievements(stats);
  },

  // 获取今日任务（创建日期为今天）
  async getTodayQuests(): Promise<Quest[]> {
    const quests = await getItem<Quest[]>(KEYS.QUESTS, []);
    const today = new Date().toISOString().split('T')[0];
    return quests.filter((q) => {
      const questDate = q.createdAt.split('T')[0];
      return questDate === today && q.status !== 'DONE';
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // 获取过期任务（创建日期早于今天且未完成）
  async getOverdueQuests(): Promise<Quest[]> {
    const quests = await getItem<Quest[]>(KEYS.QUESTS, []);
    const today = new Date().toISOString().split('T')[0];
    return quests.filter((q) => {
      const questDate = q.createdAt.split('T')[0];
      return questDate < today && q.status !== 'DONE';
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // 每日过期结算（返回新过期的任务和总惩罚）
  async performDailySettlement(): Promise<OverdueSettlement | null> {
    const today = new Date().toISOString().split('T')[0];
    const dailyCheck = await getItem<DailyCheckRecord>(KEYS.DAILY_CHECK, {
      lastCheckDate: '',
      todayClearAchieved: false,
    });

    // 如果今天已经检查过，不再执行
    if (dailyCheck.lastCheckDate === today) {
      return null;
    }

    const quests = await getItem<Quest[]>(KEYS.QUESTS, []);
    const newOverdueQuests: Quest[] = [];
    let totalExpPenalty = 0;
    let totalGoldPenalty = 0;

    // 找出新过期的任务（昨天的今日任务变成过期）
    for (let i = 0; i < quests.length; i++) {
      const quest = quests[i];
      const questDate = quest.createdAt.split('T')[0];
      
      // 如果任务创建日期早于今天且未完成且未执行过惩罚
      if (questDate < today && quest.status !== 'DONE' && !quest.overduePenaltyApplied) {
        // 计算惩罚
        const expPenalty = quest.type === 'MAIN' ? 20 : 10;
        
        quests[i] = {
          ...quest,
          isOverdue: true,
          overduePenaltyApplied: true,
          penaltyAmount: { exp: expPenalty, gold: 0 },
        };
        
        newOverdueQuests.push(quests[i]);
        totalExpPenalty += expPenalty;
      }
    }

    // 如果有新过期任务，保存更新
    if (newOverdueQuests.length > 0) {
      await setItem(KEYS.QUESTS, quests);
    }

    // 更新每日检查记录
    await setItem(KEYS.DAILY_CHECK, {
      lastCheckDate: today,
      todayClearAchieved: false,
    });

    // 如果没有新过期任务，返回 null
    if (newOverdueQuests.length === 0) {
      return null;
    }

    return {
      overdueQuests: newOverdueQuests,
      totalPenalty: {
        exp: totalExpPenalty,
        gold: totalGoldPenalty,
      },
    };
  },

  // 检查是否已达成今日全清
  async checkTodayClear(): Promise<{ achieved: boolean; reward: number }> {
    const today = new Date().toISOString().split('T')[0];
    const dailyCheck = await getItem<DailyCheckRecord>(KEYS.DAILY_CHECK, {
      lastCheckDate: today,
      todayClearAchieved: false,
    });

    // 如果今天已达成过，不再重复奖励
    if (dailyCheck.todayClearAchieved) {
      return { achieved: false, reward: 0 };
    }

    const quests = await getItem<Quest[]>(KEYS.QUESTS, []);
    const todayQuests = quests.filter((q) => {
      const questDate = q.createdAt.split('T')[0];
      return questDate === today;
    });

    // 如果今日没有任务，不触发全清
    if (todayQuests.length === 0) {
      return { achieved: false, reward: 0 };
    }

    // 检查是否全部完成
    const allCompleted = todayQuests.every((q) => q.status === 'DONE');
    if (!allCompleted) {
      return { achieved: false, reward: 0 };
    }

    // 标记今日全清已达成
    await setItem(KEYS.DAILY_CHECK, {
      ...dailyCheck,
      todayClearAchieved: true,
    });

    // 检查是否有主线任务完成
    const hasMainQuest = todayQuests.some((q) => q.type === 'MAIN');
    const reward = 20 + (hasMainQuest ? 10 : 0); // 全清20 + 主线10

    return { achieved: true, reward };
  },
};

// ============ 成就服务 ============

export const localAchievementService = {
  async getAll(): Promise<Achievement[]> {
    return getItem(KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
  },

  async updateProgress(achievementId: string, progress: number): Promise<boolean> {
    const achievements = await this.getAll();
    const index = achievements.findIndex((a) => a.id === achievementId);
    if (index === -1) return false;

    achievements[index].progress = progress;
    if (progress >= achievements[index].target && !achievements[index].unlocked) {
      achievements[index].unlocked = true;
      achievements[index].unlockedAt = new Date().toISOString();
    }

    await setItem(KEYS.ACHIEVEMENTS, achievements);
    return true;
  },

  async checkQuestAchievements(stats: PlayerStats): Promise<void> {
    const achievements = await this.getAll();
    let updated = false;

    for (const achievement of achievements) {
      let newProgress = 0;

      switch (achievement.key) {
        case 'first_quest':
          newProgress = Math.min(stats.totalQuestsCompleted, 1);
          break;
        case 'quest_master_10':
          newProgress = Math.min(stats.totalQuestsCompleted, 10);
          break;
        case 'quest_master_50':
          newProgress = Math.min(stats.totalQuestsCompleted, 50);
          break;
        case 'gold_500':
          newProgress = Math.min(stats.totalGoldEarned, 500);
          break;
        case 'gold_2000':
          newProgress = Math.min(stats.totalGoldEarned, 2000);
          break;
        case 'streak_3':
          newProgress = Math.min(stats.currentStreak, 3);
          break;
        case 'streak_7':
          newProgress = Math.min(stats.currentStreak, 7);
          break;
        case 'hard_quest':
          newProgress = Math.min(stats.hardQuestsCompleted, 1);
          break;
        default:
          continue;
      }

      if (newProgress > achievement.progress) {
        achievement.progress = newProgress;
        if (newProgress >= achievement.target && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date().toISOString();
        }
        updated = true;
      }
    }

    if (updated) {
      await setItem(KEYS.ACHIEVEMENTS, achievements);
    }
  },

  async checkLevelAchievements(level: number): Promise<void> {
    const achievements = await this.getAll();
    let updated = false;

    for (const achievement of achievements) {
      if (achievement.key === 'level_5') {
        const newProgress = Math.min(level, 5);
        if (newProgress > achievement.progress) {
          achievement.progress = newProgress;
          if (newProgress >= 5 && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
          }
          updated = true;
        }
      } else if (achievement.key === 'level_10') {
        const newProgress = Math.min(level, 10);
        if (newProgress > achievement.progress) {
          achievement.progress = newProgress;
          if (newProgress >= 10 && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
          }
          updated = true;
        }
      }
    }

    if (updated) {
      await setItem(KEYS.ACHIEVEMENTS, achievements);
    }
  },

  async reset(): Promise<Achievement[]> {
    await setItem(KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
    return DEFAULT_ACHIEVEMENTS;
  },
};

// ============ 数据管理 ============

export const localStorageService = {
  async clearAll(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.CHARACTER),
      AsyncStorage.removeItem(KEYS.QUESTS),
      AsyncStorage.removeItem(KEYS.ACHIEVEMENTS),
      AsyncStorage.removeItem(KEYS.PLAYER_STATS),
      AsyncStorage.removeItem(KEYS.DAILY_CHECK),
    ]);
  },

  async exportData(): Promise<object> {
    return {
      character: await localCharacterService.get(),
      quests: await localQuestService.getAll(),
      achievements: await localAchievementService.getAll(),
      stats: await getItem(KEYS.PLAYER_STATS, DEFAULT_PLAYER_STATS),
    };
  },
};
