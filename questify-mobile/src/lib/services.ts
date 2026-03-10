/**
 * 📡 数据服务层
 * 封装所有 Supabase 数据库操作
 */

import { supabase, Database } from './supabase';
import { Character, Quest, Achievement, QuestStatus } from '../types';

type QuestRow = Database['public']['Tables']['Quest']['Row'];
type CharacterRow = Database['public']['Tables']['Character']['Row'];

// ============ 角色服务 ============

export const characterService = {
  /**
   * 获取用户角色
   */
  async get(userId: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('Character')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error || !data) {
      console.error('获取角色失败:', error);
      return null;
    }

    return transformCharacter(data);
  },

  /**
   * 更新角色
   */
  async update(userId: string, updates: Partial<CharacterRow>): Promise<Character | null> {
    const { data, error } = await supabase
      .from('Character')
      .update(updates)
      .eq('userId', userId)
      .select()
      .single();

    if (error || !data) {
      console.error('更新角色失败:', error);
      return null;
    }

    return transformCharacter(data);
  },

  /**
   * 增加经验和金币（完成任务时调用）
   */
  async addRewards(
    userId: string,
    rewards: {
      exp: number;
      gold: number;
      str: number;
      int: number;
      foc: number;
      vit: number;
    }
  ): Promise<Character | null> {
    // 先获取当前角色数据
    const current = await this.get(userId);
    if (!current) return null;

    // 计算新值
    let newExp = current.exp + rewards.exp;
    let newLevel = current.level;

    // 升级检查（每 100 经验升一级）
    while (newExp >= newLevel * 100) {
      newExp -= newLevel * 100;
      newLevel++;
    }

    return this.update(userId, {
      exp: newExp,
      level: newLevel,
      gold: current.gold + rewards.gold,
      strength: current.stats.strength + rewards.str,
      intelligence: current.stats.intelligence + rewards.int,
      focus: current.stats.focus + rewards.foc,
      vitality: current.stats.vitality + rewards.vit,
    });
  },
};

// ============ 任务服务 ============

export const questService = {
  /**
   * 获取用户所有任务
   */
  async getAll(userId: string, options?: { isToday?: boolean; status?: QuestStatus }): Promise<Quest[]> {
    let query = supabase
      .from('Quest')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (options?.isToday !== undefined) {
      query = query.eq('isToday', options.isToday);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取任务失败:', error);
      return [];
    }

    return (data || []).map(transformQuest);
  },

  /**
   * 创建任务
   */
  async create(userId: string, quest: Omit<Quest, 'id' | 'createdAt'>): Promise<Quest | null> {
    const { data, error } = await supabase
      .from('Quest')
      .insert({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: quest.title,
        description: quest.description || null,
        type: quest.type,
        difficulty: quest.difficulty,
        tag: quest.tag,
        status: quest.status,
        expReward: quest.expReward,
        goldReward: quest.goldReward,
        strReward: quest.strReward,
        intReward: quest.intReward,
        focReward: quest.focReward,
        vitReward: quest.vitReward,
        isToday: quest.isToday,
        completedAt: quest.completedAt || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('创建任务失败:', error);
      return null;
    }

    return transformQuest(data);
  },

  /**
   * 更新任务状态
   */
  async updateStatus(questId: string, status: QuestStatus): Promise<Quest | null> {
    const updates: Partial<QuestRow> = { status };

    if (status === 'DONE') {
      updates.completedAt = new Date().toISOString();
    } else {
      updates.completedAt = null;
    }

    const { data, error } = await supabase
      .from('Quest')
      .update(updates)
      .eq('id', questId)
      .select()
      .single();

    if (error || !data) {
      console.error('更新任务状态失败:', error);
      return null;
    }

    return transformQuest(data);
  },

  /**
   * 更新任务
   */
  async update(questId: string, updates: Partial<Quest>): Promise<Quest | null> {
    const { data, error } = await supabase
      .from('Quest')
      .update({
        title: updates.title,
        description: updates.description,
        type: updates.type,
        difficulty: updates.difficulty,
        tag: updates.tag,
        status: updates.status,
        expReward: updates.expReward,
        goldReward: updates.goldReward,
        strReward: updates.strReward,
        intReward: updates.intReward,
        focReward: updates.focReward,
        vitReward: updates.vitReward,
        isToday: updates.isToday,
      })
      .eq('id', questId)
      .select()
      .single();

    if (error || !data) {
      console.error('更新任务失败:', error);
      return null;
    }

    return transformQuest(data);
  },

  /**
   * 删除任务
   */
  async delete(questId: string): Promise<boolean> {
    const { error } = await supabase
      .from('Quest')
      .delete()
      .eq('id', questId);

    if (error) {
      console.error('删除任务失败:', error);
      return false;
    }

    return true;
  },
};

// ============ 成就服务 ============

export const achievementService = {
  /**
   * 获取用户成就（包含进度）
   */
  async getAll(userId: string): Promise<Achievement[]> {
    // 获取所有成就定义
    const { data: achievements, error: achievementError } = await supabase
      .from('Achievement')
      .select('*')
      .order('createdAt', { ascending: true });

    if (achievementError || !achievements) {
      console.error('获取成就定义失败:', achievementError);
      return [];
    }

    // 获取用户成就进度
    const { data: userAchievements, error: userAchievementError } = await supabase
      .from('UserAchievement')
      .select('*')
      .eq('userId', userId);

    if (userAchievementError) {
      console.error('获取用户成就进度失败:', userAchievementError);
    }

    // 合并数据
    const userAchievementMap = new Map(
      (userAchievements || []).map((ua) => [ua.achievementId, ua])
    );

    return achievements.map((a) => {
      const userProgress = userAchievementMap.get(a.id);
      return {
        id: a.id,
        key: a.key,
        title: a.title,
        description: a.description,
        icon: a.icon,
        progress: userProgress?.progress || 0,
        target: a.target,
        unlocked: userProgress?.unlocked || false,
        unlockedAt: userProgress?.unlockedAt || undefined,
      };
    });
  },

  /**
   * 更新成就进度
   */
  async updateProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<boolean> {
    // 获取成就目标
    const { data: achievement } = await supabase
      .from('Achievement')
      .select('target')
      .eq('id', achievementId)
      .single();

    if (!achievement) return false;

    const unlocked = progress >= achievement.target;

    const { error } = await supabase.from('UserAchievement').upsert(
      {
        id: `${userId}-${achievementId}`,
        userId,
        achievementId,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : null,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('更新成就进度失败:', error);
      return false;
    }

    return true;
  },
};

// ============ 转换函数 ============

function transformCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    level: row.level,
    exp: row.exp,
    gold: row.gold,
    title: row.title,
    stats: {
      strength: row.strength,
      intelligence: row.intelligence,
      focus: row.focus,
      vitality: row.vitality,
    },
  };
}

function transformQuest(row: QuestRow): Quest {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    type: row.type,
    difficulty: row.difficulty,
    tag: row.tag,
    status: row.status,
    expReward: row.expReward,
    goldReward: row.goldReward,
    strReward: row.strReward,
    intReward: row.intReward,
    focReward: row.focReward,
    vitReward: row.vitReward,
    createdAt: row.createdAt,
    completedAt: row.completedAt || undefined,
    isToday: row.isToday,
  };
}
