/**
 * 🏆 成就页面
 * 展示所有成就和解锁状态
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme';
import { Achievement } from '../../src/types';

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    key: 'first_quest',
    title: '初次冒险',
    description: '完成你的第一个任务',
    icon: '🎯',
    progress: 1,
    target: 1,
    unlocked: true,
    unlockedAt: '2024-01-15',
  },
  {
    id: '2',
    key: 'quest_master_10',
    title: '任务新手',
    description: '累计完成 10 个任务',
    icon: '⭐',
    progress: 10,
    target: 10,
    unlocked: true,
    unlockedAt: '2024-01-20',
  },
  {
    id: '3',
    key: 'quest_master_50',
    title: '任务达人',
    description: '累计完成 50 个任务',
    icon: '🌟',
    progress: 42,
    target: 50,
    unlocked: false,
  },
  {
    id: '4',
    key: 'streak_7',
    title: '一周坚持',
    description: '连续 7 天完成任务',
    icon: '🔥',
    progress: 7,
    target: 7,
    unlocked: true,
    unlockedAt: '2024-02-01',
  },
  {
    id: '5',
    key: 'streak_30',
    title: '月度之星',
    description: '连续 30 天完成任务',
    icon: '💫',
    progress: 7,
    target: 30,
    unlocked: false,
  },
  {
    id: '6',
    key: 'early_bird',
    title: '早起鸟儿',
    description: '在早上 6 点前完成任务',
    icon: '🌅',
    progress: 0,
    target: 1,
    unlocked: false,
  },
  {
    id: '7',
    key: 'gold_collector',
    title: '小富翁',
    description: '累计获得 1000 金币',
    icon: '💰',
    progress: 1250,
    target: 1000,
    unlocked: true,
    unlockedAt: '2024-01-25',
  },
  {
    id: '8',
    key: 'level_5',
    title: '初露锋芒',
    description: '达到 5 级',
    icon: '🏅',
    progress: 5,
    target: 5,
    unlocked: true,
    unlockedAt: '2024-02-05',
  },
  {
    id: '9',
    key: 'level_10',
    title: '渐入佳境',
    description: '达到 10 级',
    icon: '🎖️',
    progress: 5,
    target: 10,
    unlocked: false,
  },
  {
    id: '10',
    key: 'main_quest_master',
    title: '主线猎人',
    description: '完成 10 个主线任务',
    icon: '👑',
    progress: 8,
    target: 10,
    unlocked: false,
  },
];

export default function AchievementsScreen() {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = MOCK_ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;

  const filteredAchievements = MOCK_ACHIEVEMENTS.filter((a) => {
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
      >
        {/* 头部 */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.title}>成就殿堂</Text>
          <Text style={styles.subtitle}>
            已解锁 {unlockedCount}/{totalCount} 个成就
          </Text>
        </Animated.View>

        {/* 进度概览 */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.progressCard}
        >
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercent}>
              {Math.round((unlockedCount / totalCount) * 100)}%
            </Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>收集进度</Text>
            <Text style={styles.progressDesc}>
              继续加油！还有 {totalCount - unlockedCount} 个成就等你解锁
            </Text>
          </View>
        </Animated.View>

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
          {filteredAchievements.map((achievement, index) => (
            <Animated.View
              key={achievement.id}
              entering={FadeInDown.delay(300 + index * 50).duration(400)}
            >
              <AchievementCard achievement={achievement} />
            </Animated.View>
          ))}
        </View>

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
  bottomSpacer: {
    height: spacing.xxl,
  },
});
