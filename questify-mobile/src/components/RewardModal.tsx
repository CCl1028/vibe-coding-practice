/**
 * 🎉 奖励弹窗组件
 * 完成任务后显示的庆祝动画
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { Quest } from '../types';

interface RewardModalProps {
  visible: boolean;
  quest: Quest | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function RewardModal({ visible, quest, onClose }: RewardModalProps) {
  // 动画值
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // 弹出动画
      scale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      rotate.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      confettiOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    } else {
      scale.value = 0;
      confettiOpacity.value = 0;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  if (!quest) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 彩带/五彩纸屑 */}
        <Animated.View style={[styles.confettiContainer, confettiStyle]}>
          {['🎉', '✨', '⭐', '🌟', '💫', '🎊'].map((emoji, index) => (
            <Text
              key={index}
              style={[
                styles.confetti,
                {
                  left: `${15 + index * 12}%`,
                  top: `${10 + (index % 3) * 10}%`,
                  transform: [{ rotate: `${index * 30}deg` }],
                },
              ]}
            >
              {emoji}
            </Text>
          ))}
        </Animated.View>

        <Animated.View style={[styles.modal, containerStyle]}>
          {/* 庆祝图标 */}
          <View style={styles.celebrationIcon}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
          </View>

          {/* 标题 */}
          <Text style={styles.title}>任务完成！</Text>
          <Text style={styles.questTitle}>{quest.title}</Text>

          {/* 奖励展示 */}
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardEmoji}>✨</Text>
              <View>
                <Text style={styles.rewardValue}>+{quest.expReward}</Text>
                <Text style={styles.rewardLabel}>经验值</Text>
              </View>
            </View>

            <View style={styles.rewardDivider} />

            <View style={styles.rewardItem}>
              <Text style={styles.rewardEmoji}>💰</Text>
              <View>
                <Text style={styles.rewardValue}>+{quest.goldReward}</Text>
                <Text style={styles.rewardLabel}>金币</Text>
              </View>
            </View>
          </View>

          {/* 属性奖励 */}
          {(quest.strReward > 0 ||
            quest.intReward > 0 ||
            quest.focReward > 0 ||
            quest.vitReward > 0) && (
            <View style={styles.statsRewards}>
              {quest.strReward > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>💪 +{quest.strReward}</Text>
                </View>
              )}
              {quest.intReward > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>🧠 +{quest.intReward}</Text>
                </View>
              )}
              {quest.focReward > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>🎯 +{quest.focReward}</Text>
                </View>
              )}
              {quest.vitReward > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>❤️ +{quest.vitReward}</Text>
                </View>
              )}
            </View>
          )}

          {/* 关闭按钮 */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>太棒了！</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confetti: {
    position: 'absolute',
    fontSize: 32,
  },
  modal: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: SCREEN_WIDTH - spacing.lg * 2,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cream[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  celebrationEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    marginBottom: spacing.sm,
  },
  questTitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
  },
  rewardItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  rewardEmoji: {
    fontSize: 28,
  },
  rewardValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  rewardLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  rewardDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.md,
  },
  statsRewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  statBadge: {
    backgroundColor: colors.lavender[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.lavender[700],
  },
  closeButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
