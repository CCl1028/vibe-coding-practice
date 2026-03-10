/**
 * 📋 任务列表页
 * 管理所有任务
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { QuestCard, Button } from '../../src/components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme';
import { Quest, QuestStatus, QuestType } from '../../src/types';

// 模拟数据
const MOCK_ALL_QUESTS: Quest[] = [
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
  {
    id: '4',
    title: '完成项目重构',
    type: 'CHALLENGE',
    difficulty: 'HARD',
    tag: 'WORK',
    status: 'TODO',
    expReward: 130,
    goldReward: 30,
    strReward: 0,
    intReward: 0,
    focReward: 1,
    vitReward: 0,
    createdAt: new Date().toISOString(),
    isToday: false,
  },
];

type FilterType = 'ALL' | QuestType;

const FILTERS: { key: FilterType; label: string; emoji: string }[] = [
  { key: 'ALL', label: '全部', emoji: '📋' },
  { key: 'MAIN', label: '主线', emoji: '⭐' },
  { key: 'SIDE', label: '支线', emoji: '📌' },
  { key: 'DAILY', label: '日常', emoji: '🔄' },
  { key: 'CHALLENGE', label: '挑战', emoji: '⚔️' },
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState<Quest[]>(MOCK_ALL_QUESTS);
  const [filter, setFilter] = useState<FilterType>('ALL');

  const handleStatusChange = (id: string, status: QuestStatus) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
  };

  const handleDelete = (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  };

  const filteredQuests =
    filter === 'ALL' ? quests : quests.filter((q) => q.type === filter);

  const todoQuests = filteredQuests.filter((q) => q.status !== 'DONE');
  const doneQuests = filteredQuests.filter((q) => q.status === 'DONE');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.title}>任务面板</Text>
        <Text style={styles.subtitle}>
          共 {quests.length} 个任务，{quests.filter((q) => q.status === 'DONE').length} 个已完成
        </Text>
      </View>

      {/* 筛选标签 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterButton, filter === f.key && styles.filterActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={styles.filterEmoji}>{f.emoji}</Text>
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 任务列表 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 待完成 */}
        {todoQuests.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>📝</Text>
              <Text style={styles.sectionTitle}>
                待完成 ({todoQuests.length})
              </Text>
            </View>
            {todoQuests.map((quest, index) => (
              <Animated.View
                key={quest.id}
                entering={FadeInDown.delay(150 + index * 50).duration(400)}
              >
                <QuestCard
                  quest={quest}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* 已完成 */}
        {doneQuests.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>✅</Text>
              <Text style={styles.sectionTitle}>
                已完成 ({doneQuests.length})
              </Text>
            </View>
            {doneQuests.map((quest, index) => (
              <Animated.View
                key={quest.id}
                entering={FadeInDown.delay(350 + index * 50).duration(400)}
              >
                <QuestCard
                  quest={quest}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* 空状态 */}
        {filteredQuests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>暂无任务</Text>
            <Text style={styles.emptyHint}>点击下方按钮添加新任务</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 添加按钮 */}
      <Pressable style={styles.addButton}>
        <Ionicons name="add" size={32} color={colors.text.inverse} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
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
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  bottomSpacer: {
    height: 100,
  },
  addButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
