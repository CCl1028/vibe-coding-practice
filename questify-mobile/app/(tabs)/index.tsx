/**
 * 🏠 首页
 * 显示角色信息和今日任务
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { CharacterCard, QuestCard, Button } from '../../src/components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme';
import { Character, Quest, QuestStatus } from '../../src/types';
import { useAuth } from '../../src/lib/auth';
import { characterService, questService } from '../../src/lib/services';

// 默认角色（游客模式）
const DEFAULT_CHARACTER: Character = {
  id: '1',
  name: '游客冒险者',
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

export default function HomeScreen() {
  const { user } = useAuth();
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加载数据
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [charData, questData] = await Promise.all([
        characterService.get(user.id),
        questService.getAll(user.id, { isToday: true }),
      ]);

      if (charData) {
        setCharacter(charData);
      }
      setQuests(questData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStatusChange = async (id: string, status: QuestStatus) => {
    // 先乐观更新 UI
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );

    if (user) {
      // 更新数据库
      const quest = quests.find((q) => q.id === id);
      await questService.updateStatus(id, status);

      // 如果完成任务，增加奖励
      if (status === 'DONE' && quest) {
        const updatedChar = await characterService.addRewards(user.id, {
          exp: quest.expReward,
          gold: quest.goldReward,
          str: quest.strReward,
          int: quest.intReward,
          foc: quest.focReward,
          vit: quest.vitReward,
        });
        if (updatedChar) {
          setCharacter(updatedChar);
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));

    if (user) {
      await questService.delete(id);
    }
  };

  // 获取当前时间的问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 夜深了';
    if (hour < 12) return '🌅 早上好';
    if (hour < 18) return '☀️ 下午好';
    return '🌆 晚上好';
  };

  // 分类任务
  const mainQuests = quests.filter((q) => q.type === 'MAIN');
  const otherQuests = quests.filter((q) => q.type !== 'MAIN');
  const completedCount = quests.filter((q) => q.status === 'DONE').length;
  const totalCount = quests.length || 1; // 防止除以 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* 问候语 */}
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>冒险者 {character.name}！</Text>
        </View>

        {/* 未登录提示 */}
        {!user && (
          <View style={styles.guestBanner}>
            <Text style={styles.guestText}>👻 当前为游客模式，数据不会保存</Text>
          </View>
        )}

        {/* 今日进度 */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressEmoji}>🎯</Text>
            <Text style={styles.progressTitle}>今日进度</Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{completedCount}</Text>
              <Text style={styles.progressLabel}>已完成</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{quests.length}</Text>
              <Text style={styles.progressLabel}>总任务</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>
                {Math.round((completedCount / totalCount) * 100)}%
              </Text>
              <Text style={styles.progressLabel}>完成率</Text>
            </View>
          </View>
        </View>

        {/* 角色卡片 */}
        <View>
          <CharacterCard character={character} />
        </View>

        {/* 主线任务 */}
        {mainQuests.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>⭐</Text>
              <Text style={styles.sectionTitle}>今日主线</Text>
            </View>
            {mainQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {/* 其他任务 */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>📋</Text>
            <Text style={styles.sectionTitle}>其他任务</Text>
          </View>
          {otherQuests.length > 0 ? (
            otherQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>暂无其他任务</Text>
              <Text style={styles.emptyHint}>去任务页面添加新任务吧！</Text>
            </View>
          )}
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  guestBanner: {
    backgroundColor: colors.cream[100],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  guestText: {
    fontSize: fontSize.sm,
    color: colors.cream[700],
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.primary[300],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressEmoji: {
    fontSize: 20,
  },
  progressTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary[500],
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  progressDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
