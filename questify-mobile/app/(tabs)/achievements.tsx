/**
 * 🏆 成就页面
 * 展示所有成就和解锁状态
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme';
import { Achievement } from '../../src/types';
import { useAuth } from '../../src/lib/auth';
import { achievementService } from '../../src/lib/services';

// 默认成就列表（游客模式）
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    key: 'first_quest',
    title: '初次冒险',
    description: '完成你的第一个任务',
    icon: '🎯',
    progress: 0,
    target: 1,
    unlocked: false,
  },
  {
    id: '2',
    key: 'quest_master_10',
    title: '任务新手',
    description: '累计完成 10 个任务',
    icon: '⭐',
    progress: 0,
    target: 10,
    unlocked: false,
  },
  {
    id: '3',
    key: 'quest_master_50',
    title: '任务达人',
    description: '累计完成 50 个任务',
    icon: '🌟',
    progress: 0,
    target: 50,
    unlocked: false,
  },
  {
    id: '4',
    key: 'streak_7',
    title: '一周坚持',
    description: '连续 7 天完成任务',
    icon: '🔥',
    progress: 0,
    target: 7,
    unlocked: false,
  },
  {
    id: '5',
    key: 'streak_30',
    title: '月度之星',
    description: '连续 30 天完成任务',
    icon: '💫',
    progress: 0,
    target: 30,
    unlocked: false,
  },
  {
    id: '6',
    key: 'gold_collector',
    title: '小富翁',
    description: '累计获得 1000 金币',
    icon: '💰',
    progress: 0,
    target: 1000,
    unlocked: false,
  },
];

export default function AchievementsScreen() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setAchievements(DEFAULT_ACHIEVEMENTS);
      return;
    }

    try {
      const data = await achievementService.getAll(user.id);
      if (data.length > 0) {
        setAchievements(data);
      }
    } catch (error) {
      console.error('加载成就失败:', error);
    }
  }, [user]);

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

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

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
        {/* 头部 */}
        <View>
          <Text style={styles.title}>成就殿堂</Text>
          <Text style={styles.subtitle}>
            已解锁 {unlockedCount}/{totalCount} 个成就
          </Text>
        </View>

        {/* 进度概览 */}
        <View style={styles.progressCard}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercent}>
              {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
            </Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>收集进度</Text>
            <Text style={styles.progressDesc}>
              {unlockedCount === totalCount
                ? '🎉 恭喜！你已解锁所有成就！'
                : `继续加油！还有 ${totalCount - unlockedCount} 个成就等你解锁`}
            </Text>
          </View>
        </View>

        {/* 筛选 */}
        <View style={styles.filterRow}>
          <FilterButton
            label="全部"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterButton
            label="已解锁"
            active={filter === 'unlocked'}
            onPress={() => setFilter('unlocked')}
          />
          <FilterButton
            label="未解锁"
            active={filter === 'locked'}
            onPress={() => setFilter('locked')}
          />
        </View>

        {/* 成就列表 */}
        <View style={styles.achievementsList}>
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>

        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>暂无成就</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function FilterButton({ label, active, onPress }: FilterButtonProps) {
  return (
    <Pressable
      style={[styles.filterButton, active && styles.filterActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const progress = Math.min(
    (achievement.progress / achievement.target) * 100,
    100
  );

  return (
    <View
      style={[
        styles.achievementCard,
        !achievement.unlocked && styles.achievementLocked,
      ]}
    >
      <View
        style={[
          styles.achievementIcon,
          !achievement.unlocked && styles.iconLocked,
        ]}
      >
        <Text style={styles.iconText}>{achievement.icon}</Text>
      </View>

      <View style={styles.achievementContent}>
        <Text
          style={[
            styles.achievementTitle,
            !achievement.unlocked && styles.textLocked,
          ]}
        >
          {achievement.title}
        </Text>
        <Text style={styles.achievementDesc}>{achievement.description}</Text>

        {/* 进度条 */}
        <View style={styles.achievementProgress}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor: achievement.unlocked
                    ? colors.mint[500]
                    : colors.lavender[400],
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.target}
          </Text>
        </View>
      </View>

      {achievement.unlocked && (
        <View style={styles.unlockedBadge}>
          <Text style={styles.unlockedText}>✓</Text>
        </View>
      )}
    </View>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.lavender[300],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lavender[100],
    borderWidth: 4,
    borderColor: colors.lavender[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.lavender[600],
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  progressDesc: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterActive: {
    backgroundColor: colors.lavender[500],
    borderColor: colors.lavender[500],
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  achievementsList: {
    gap: spacing.md,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cream[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLocked: {
    backgroundColor: colors.gray[100],
  },
  iconText: {
    fontSize: 28,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  textLocked: {
    color: colors.text.muted,
  },
  achievementDesc: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    fontWeight: fontWeight.medium,
    width: 40,
    textAlign: 'right',
  },
  unlockedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.mint[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    color: colors.text.inverse,
    fontWeight: fontWeight.bold,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
