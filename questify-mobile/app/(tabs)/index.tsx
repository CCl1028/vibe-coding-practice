/**
 * 🏠 首页
 * 显示角色信息和今日任务
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterCard, QuestCard, Button } from '../../src/components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme';
import { Character, Quest, QuestStatus } from '../../src/types';

// 模拟数据（实际项目中从 API 获取）
const MOCK_CHARACTER: Character = {
  id: '1',
  name: '勇敢小骑士',
  avatar: 'default',
  level: 5,
  exp: 320,
  gold: 1250,
  title: '稳定推进者',
  stats: {
    strength: 8,
    intelligence: 12,
    focus: 10,
    vitality: 6,
  },
};

const MOCK_QUESTS: Quest[] = [
  {
    id: '1',
    title: '完成 React Native 学习',
    description: '学习 Expo 和基础组件',
    type: 'MAIN',
    difficulty: 'MEDIUM',
    tag: 'STUDY',
    status: 'TODO',
    expReward: 70,
    goldReward: 15,
    strReward: 0,
    intReward: 1,
    focReward: 0,
    vitReward: 0,
    createdAt: new Date().toISOString(),
    isToday: true,
  },
  {
    id: '2',
    title: '晨跑 30 分钟',
    type: 'DAILY',
    difficulty: 'EASY',
    tag: 'HEALTH',
    status: 'DONE',
    expReward: 20,
    goldReward: 5,
    strReward: 0,
    intReward: 0,
    focReward: 0,
    vitReward: 1,
    createdAt: new Date().toISOString(),
    isToday: true,
  },
  {
    id: '3',
    title: '阅读技术文章 3 篇',
    type: 'SIDE',
    difficulty: 'EASY',
    tag: 'STUDY',
    status: 'TODO',
    expReward: 20,
    goldReward: 5,
    strReward: 0,
    intReward: 1,
    focReward: 0,
    vitReward: 0,
    createdAt: new Date().toISOString(),
    isToday: true,
  },
];

export default function HomeScreen() {
  const [character, setCharacter] = useState<Character>(MOCK_CHARACTER);
  const [quests, setQuests] = useState<Quest[]>(MOCK_QUESTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: 实际从 API 刷新数据
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleStatusChange = (id: string, status: QuestStatus) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    // TODO: 调用 API 更新状态
  };

  const handleDelete = (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
    // TODO: 调用 API 删除
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
                {Math.round((completedCount / quests.length) * 100)}%
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
