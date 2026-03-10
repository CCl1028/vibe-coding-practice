/**
 * 👤 角色卡片组件
 * 可爱风格设计
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';
import { Character } from '../types';
import { getExpForNextLevel } from '../lib/rewards';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const nextLevelExp = getExpForNextLevel(character.level);
  const progress = (character.exp / nextLevelExp) * 100;

  // 头像弹跳动画
  const bounceValue = useSharedValue(1);

  React.useEffect(() => {
    bounceValue.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 2 }),
        withSpring(1, { damping: 2 })
      ),
      -1,
      true
    );
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceValue.value }],
  }));

  return (
    <View style={styles.container}>
      {/* 顶部装饰 */}
      <View style={styles.decorTop}>
        <Text style={styles.decorEmoji}>✨</Text>
        <Text style={styles.decorEmoji}>⭐</Text>
        <Text style={styles.decorEmoji}>✨</Text>
      </View>

      {/* 头像和基本信息 */}
      <View style={styles.header}>
        <Animated.View style={[styles.avatarContainer, avatarStyle]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>😊</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{character.level}</Text>
          </View>
        </Animated.View>

        <View style={styles.info}>
          <Text style={styles.name}>{character.name}</Text>
          <View style={styles.titleBadge}>
            <Text style={styles.titleText}>{character.title}</Text>
          </View>
        </View>
      </View>

      {/* 经验条 */}
      <View style={styles.expSection}>
        <View style={styles.expHeader}>
          <View style={styles.expLabel}>
            <Ionicons name="star" size={14} color={colors.lavender[500]} />
            <Text style={styles.expLabelText}>经验值</Text>
          </View>
          <Text style={styles.expValue}>
            {character.exp} / {nextLevelExp}
          </Text>
        </View>
        <View style={styles.expBarBg}>
          <Animated.View style={[styles.expBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* 金币 */}
      <View style={styles.goldSection}>
        <View style={styles.goldIcon}>
          <Text style={styles.goldEmoji}>💰</Text>
        </View>
        <Text style={styles.goldLabel}>金币</Text>
        <Text style={styles.goldValue}>{character.gold}</Text>
      </View>

      {/* 属性 */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>属性</Text>
        <View style={styles.statsGrid}>
          <StatItem
            icon="💪"
            label="力量"
            value={character.stats.strength}
            color={colors.coral[500]}
          />
          <StatItem
            icon="🧠"
            label="智力"
            value={character.stats.intelligence}
            color={colors.sky[500]}
          />
          <StatItem
            icon="🎯"
            label="专注"
            value={character.stats.focus}
            color={colors.lavender[500]}
          />
          <StatItem
            icon="❤️"
            label="活力"
            value={character.stats.vitality}
            color={colors.mint[500]}
          />
        </View>
      </View>
    </View>
  );
}

interface StatItemProps {
  icon: string;
  label: string;
  value: number;
  color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.primary[300],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: colors.primary[100],
  },
  decorTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  decorEmoji: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary[300],
  },
  avatarEmoji: {
    fontSize: 36,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.lavender[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },
  levelText: {
    color: colors.text.inverse,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  titleBadge: {
    backgroundColor: colors.cream[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  titleText: {
    color: colors.cream[700],
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  expSection: {
    marginBottom: spacing.lg,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  expLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expLabelText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  expValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.lavender[600],
  },
  expBarBg: {
    height: 12,
    backgroundColor: colors.lavender[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  expBarFill: {
    height: '100%',
    backgroundColor: colors.lavender[400],
    borderRadius: borderRadius.full,
  },
  goldSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cream[200],
  },
  goldIcon: {
    marginRight: spacing.sm,
  },
  goldEmoji: {
    fontSize: 24,
  },
  goldLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  goldValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.cream[600],
  },
  statsSection: {},
  statsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIcon: {
    fontSize: 18,
  },
  statLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});
