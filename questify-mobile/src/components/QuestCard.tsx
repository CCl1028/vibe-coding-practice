/**
 * 📋 任务卡片组件
 * 可爱风格设计
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  questTypeColors,
  difficultyColors,
} from '../theme';
import { Quest, QuestStatus } from '../types';

interface QuestCardProps {
  quest: Quest;
  onStatusChange?: (id: string, status: QuestStatus) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TYPE_LABELS = {
  MAIN: '主线任务',
  SIDE: '支线任务',
  DAILY: '日常任务',
  CHALLENGE: '挑战任务',
};

const TYPE_EMOJIS = {
  MAIN: '⭐',
  SIDE: '📌',
  DAILY: '🔄',
  CHALLENGE: '⚔️',
};

const DIFFICULTY_LABELS = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
};

const DIFFICULTY_STARS = {
  EASY: '⭐',
  MEDIUM: '⭐⭐',
  HARD: '⭐⭐⭐',
};

const TAG_LABELS = {
  STUDY: '📚 学习',
  WORK: '💼 工作',
  HEALTH: '🏃 健身',
  LIFE: '🏠 生活',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function QuestCard({
  quest,
  onStatusChange,
  onEdit,
  onDelete,
}: QuestCardProps) {
  const isCompleted = quest.status === 'DONE';
  const isMain = quest.type === 'MAIN';
  const typeColor = questTypeColors[quest.type];
  const difficultyColor = difficultyColors[quest.difficulty];

  // 动画值
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const handleComplete = () => {
    if (!onStatusChange) return;

    // 完成动画
    checkScale.value = withSequence(
      withSpring(1.3, { damping: 2 }),
      withSpring(1, { damping: 4 })
    );

    scale.value = withSequence(
      withSpring(0.98),
      withSpring(1)
    );

    onStatusChange(quest.id, isCompleted ? 'DOING' : 'DONE');
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.container,
        isMain && styles.mainQuest,
        isCompleted && styles.completed,
        cardStyle,
      ]}
      onPress={() => onEdit?.(quest.id)}
    >
      {/* 任务类型装饰条 */}
      <View style={[styles.typeStrip, { backgroundColor: typeColor.border }]} />

      <View style={styles.content}>
        {/* 完成按钮 + 标题 */}
        <View style={styles.header}>
          <Pressable onPress={handleComplete} style={styles.checkButton}>
            <Animated.View style={checkStyle}>
              {isCompleted ? (
                <View style={styles.checkedCircle}>
                  <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                </View>
              ) : (
                <View style={styles.uncheckedCircle} />
              )}
            </Animated.View>
          </Pressable>

          <View style={styles.titleSection}>
            <Text
              style={[styles.title, isCompleted && styles.titleCompleted]}
              numberOfLines={2}
            >
              {quest.title}
            </Text>
            {quest.description && (
              <Text style={styles.description} numberOfLines={1}>
                {quest.description}
              </Text>
            )}
          </View>
        </View>

        {/* 标签区 */}
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: typeColor.bg }]}>
            <Text style={styles.tagEmoji}>{TYPE_EMOJIS[quest.type]}</Text>
            <Text style={[styles.tagText, { color: typeColor.text }]}>
              {TYPE_LABELS[quest.type]}
            </Text>
          </View>

          <View style={[styles.tag, { backgroundColor: difficultyColor.bg }]}>
            <Text style={[styles.tagText, { color: difficultyColor.text }]}>
              {DIFFICULTY_LABELS[quest.difficulty]}
            </Text>
          </View>

          <View style={styles.tagSimple}>
            <Text style={styles.tagText}>{TAG_LABELS[quest.tag]}</Text>
          </View>
        </View>

        {/* 奖励区 */}
        <View style={styles.rewards}>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>✨</Text>
            <Text style={styles.rewardValue}>+{quest.expReward}</Text>
            <Text style={styles.rewardLabel}>EXP</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>💰</Text>
            <Text style={styles.rewardValue}>+{quest.goldReward}</Text>
            <Text style={styles.rewardLabel}>金币</Text>
          </View>
        </View>

        {/* 删除按钮 */}
        {onDelete && (
          <Pressable
            style={styles.deleteButton}
            onPress={() => onDelete(quest.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.gray[400]} />
          </Pressable>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.gray[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  mainQuest: {
    borderWidth: 2,
    borderColor: colors.cream[300],
    shadowColor: colors.cream[500],
    shadowOpacity: 0.2,
  },
  completed: {
    opacity: 0.7,
  },
  typeStrip: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  checkButton: {
    padding: spacing.xs,
  },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.mint[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.background.secondary,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.muted,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginLeft: 36, // 对齐标题
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  tagSimple: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
  },
  tagEmoji: {
    fontSize: 12,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  rewards: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginLeft: 36, // 对齐标题
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardEmoji: {
    fontSize: 14,
  },
  rewardValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  rewardLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
});
