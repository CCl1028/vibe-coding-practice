/**
 * 🆙 升级弹窗组件
 * 角色升级时的庆祝动画
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
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';

interface LevelUpModalProps {
  visible: boolean;
  oldLevel: number;
  newLevel: number;
  newTitle: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function LevelUpModal({
  visible,
  oldLevel,
  newLevel,
  newTitle,
  onClose,
}: LevelUpModalProps) {
  // 动画值
  const scale = useSharedValue(0);
  const levelScale = useSharedValue(1);
  const glow = useSharedValue(0);
  const sparkles = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // 弹出动画
      scale.value = withSequence(
        withSpring(1.2, { damping: 6 }),
        withSpring(1, { damping: 10 })
      );

      // 等级数字脉冲
      levelScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      // 光晕效果
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      );

      // 星星闪烁
      sparkles.value = withDelay(
        300,
        withTiming(1, { duration: 500 })
      );
    } else {
      scale.value = 0;
      levelScale.value = 1;
      glow.value = 0;
      sparkles.value = 0;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const levelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const sparklesStyle = useAnimatedStyle(() => ({
    opacity: sparkles.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 光晕背景 */}
        <Animated.View style={[styles.glowBg, glowStyle]} />

        {/* 星星装饰 */}
        <Animated.View style={[styles.sparklesContainer, sparklesStyle]}>
          {['⭐', '🌟', '✨', '💫', '⭐', '✨'].map((emoji, index) => (
            <Text
              key={index}
              style={[
                styles.sparkle,
                {
                  left: `${10 + index * 15}%`,
                  top: `${20 + (index % 2) * 10}%`,
                },
              ]}
            >
              {emoji}
            </Text>
          ))}
        </Animated.View>

        <Animated.View style={[styles.modal, containerStyle]}>
          {/* 皇冠图标 */}
          <View style={styles.crownContainer}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>

          {/* 升级标题 */}
          <Text style={styles.title}>等级提升!</Text>

          {/* 等级变化 */}
          <View style={styles.levelChange}>
            <Text style={styles.oldLevel}>Lv.{oldLevel}</Text>
            <Text style={styles.arrow}>→</Text>
            <Animated.Text style={[styles.newLevel, levelStyle]}>
              Lv.{newLevel}
            </Animated.Text>
          </View>

          {/* 新称号 */}
          <View style={styles.titleSection}>
            <Text style={styles.titleLabel}>获得新称号</Text>
            <View style={styles.titleBadge}>
              <Text style={styles.titleEmoji}>🏅</Text>
              <Text style={styles.newTitle}>{newTitle}</Text>
            </View>
          </View>

          {/* 鼓励语 */}
          <Text style={styles.encouragement}>
            继续加油，向更高峰进发！
          </Text>

          {/* 关闭按钮 */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>继续冒险 ⚔️</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  glowBg: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.lavender[300],
    shadowColor: colors.lavender[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
  },
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 28,
  },
  modal: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: SCREEN_WIDTH - spacing.lg * 2,
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.lavender[300],
    shadowColor: colors.lavender[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  crownContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.cream[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.cream[300],
  },
  crownEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    color: colors.lavender[600],
    marginBottom: spacing.lg,
  },
  levelChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  oldLevel: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.muted,
  },
  arrow: {
    fontSize: fontSize.xl,
    color: colors.lavender[400],
  },
  newLevel: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    color: colors.lavender[500],
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cream[100],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.cream[300],
  },
  titleEmoji: {
    fontSize: 20,
  },
  newTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.cream[700],
  },
  encouragement: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: colors.lavender[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    shadowColor: colors.lavender[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
