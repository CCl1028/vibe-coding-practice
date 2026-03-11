/**
 * 👤 角色卡片组件
 * 支持自定义头像、编辑昵称
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';
import { Character } from '../types';
import { getExpForNextLevel } from '../lib/rewards';

interface CharacterCardProps {
  character: Character;
  onEditName?: () => void;
  onEditAvatar?: () => void;
}

export function CharacterCard({ character, onEditName, onEditAvatar }: CharacterCardProps) {
  const nextLevelExp = getExpForNextLevel(character.level);
  const progress = (character.exp / nextLevelExp) * 100;

  return (
    <View style={styles.container}>
      {/* 顶部装饰 */}
      <View style={styles.decorTop}>
        <Ionicons name="sparkles" size={16} color={colors.cream[400]} />
        <Ionicons name="star" size={16} color={colors.cream[500]} />
        <Ionicons name="sparkles" size={16} color={colors.cream[400]} />
      </View>

      {/* 头像和基本信息 */}
      <View style={styles.header}>
        <Pressable onPress={onEditAvatar} style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {character.avatarUri ? (
              <Image source={{ uri: character.avatarUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={36} color={colors.primary[400]} />
            )}
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{character.level}</Text>
          </View>
          {onEditAvatar && (
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={12} color={colors.text.inverse} />
            </View>
          )}
        </Pressable>

        <View style={styles.info}>
          <Pressable onPress={onEditName} style={styles.nameRow}>
            <Text style={styles.name}>{character.name}</Text>
            {onEditName && (
              <Ionicons name="pencil" size={14} color={colors.gray[400]} style={styles.editIcon} />
            )}
          </Pressable>
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
          <View style={[styles.expBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* 金币 */}
      <View style={styles.goldSection}>
        <View style={styles.goldIcon}>
          <Ionicons name="cash" size={24} color={colors.cream[500]} />
        </View>
        <Text style={styles.goldLabel}>金币</Text>
        <Text style={styles.goldValue}>{character.gold}</Text>
      </View>

      {/* 属性 */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>属性</Text>
        <View style={styles.statsGrid}>
          <StatItem
            iconName="flash"
            label="力量"
            value={character.stats.strength}
            color={colors.coral[500]}
          />
          <StatItem
            iconName="bulb"
            label="知识"
            value={character.stats.intelligence}
            color={colors.sky[500]}
          />
          <StatItem
            iconName="eye"
            label="专注"
            value={character.stats.focus}
            color={colors.lavender[500]}
          />
          <StatItem
            iconName="heart"
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
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}

function StatItem({ iconName, label, value, color }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={iconName} size={18} color={color} />
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  editAvatarBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary[500],
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  editIcon: {
    marginLeft: spacing.sm,
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
