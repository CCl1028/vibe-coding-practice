/**
 * 👤 角色详情页
 * 显示角色完整信息和统计
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

import { Ionicons } from '@expo/vector-icons';
import { CharacterCard } from '../../src/components';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  statColors,
} from '../../src/theme';
import { Character } from '../../src/types';

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

const MOCK_STATS = {
  totalQuests: 47,
  completedQuests: 42,
  streakDays: 7,
  totalExp: 2150,
  totalGold: 1250,
};

export default function CharacterScreen() {
  const [character] = useState<Character>(MOCK_CHARACTER);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.title}>我的角色</Text>
          <Pressable style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.gray[500]} />
          </Pressable>
        </View>

        {/* 角色卡片 */}
        <View>
          <CharacterCard character={character} />
        </View>

        {/* 统计概览 */}
        <View style={styles.statsOverview}>
          <Text style={styles.sectionTitle}>📊 冒险统计</Text>
          <View style={styles.statsGrid}>
            <StatCard
              emoji="🎯"
              value={MOCK_STATS.totalQuests}
              label="总任务数"
              color={colors.primary[500]}
            />
            <StatCard
              emoji="✅"
              value={MOCK_STATS.completedQuests}
              label="已完成"
              color={colors.mint[500]}
            />
            <StatCard
              emoji="🔥"
              value={MOCK_STATS.streakDays}
              label="连续天数"
              color={colors.coral[500]}
            />
            <StatCard
              emoji="⭐"
              value={MOCK_STATS.totalExp}
              label="总经验"
              color={colors.lavender[500]}
            />
          </View>
        </View>

        {/* 属性详情 */}
        <View style={styles.attributesSection}>
          <Text style={styles.sectionTitle}>💪 属性详情</Text>
          <View style={styles.attributesList}>
            <AttributeBar
              emoji="💪"
              label="力量"
              value={character.stats.strength}
              maxValue={20}
              color={statColors.strength}
              description="提升体力任务效率"
            />
            <AttributeBar
              emoji="🧠"
              label="智力"
              value={character.stats.intelligence}
              maxValue={20}
              color={statColors.intelligence}
              description="提升学习任务效率"
            />
            <AttributeBar
              emoji="🎯"
              label="专注"
              value={character.stats.focus}
              maxValue={20}
              color={statColors.focus}
              description="提升工作任务效率"
            />
            <AttributeBar
              emoji="❤️"
              label="活力"
              value={character.stats.vitality}
              maxValue={20}
              color={statColors.vitality}
              description="提升健身任务效率"
            />
          </View>
        </View>

        {/* 称号历程 */}
        <View style={styles.titlesSection}>
          <Text style={styles.sectionTitle}>🏅 称号历程</Text>
          <View style={styles.titlesList}>
            <TitleItem title="初出茅庐" level={1} unlocked />
            <TitleItem title="积极行动者" level={3} unlocked />
            <TitleItem title="稳定推进者" level={5} unlocked current />
            <TitleItem title="深度潜行者" level={7} />
            <TitleItem title="挑战征服者" level={10} />
            <TitleItem title="高效执行官" level={15} />
            <TitleItem title="传奇冒险者" level={20} />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface StatCardProps {
  emoji: string;
  value: number;
  label: string;
  color: string;
}

function StatCard({ emoji, value, label, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface AttributeBarProps {
  emoji: string;
  label: string;
  value: number;
  maxValue: number;
  color: string;
  description: string;
}

function AttributeBar({
  emoji,
  label,
  value,
  maxValue,
  color,
  description,
}: AttributeBarProps) {
  const progress = (value / maxValue) * 100;

  return (
    <View style={styles.attributeItem}>
      <View style={styles.attributeHeader}>
        <Text style={styles.attributeEmoji}>{emoji}</Text>
        <Text style={styles.attributeLabel}>{label}</Text>
        <Text style={[styles.attributeValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.attributeBarBg}>
        <View
          style={[
            styles.attributeBarFill,
            { width: `${progress}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.attributeDesc}>{description}</Text>
    </View>
  );
}

interface TitleItemProps {
  title: string;
  level: number;
  unlocked?: boolean;
  current?: boolean;
}

function TitleItem({ title, level, unlocked, current }: TitleItemProps) {
  return (
    <View
      style={[
        styles.titleItem,
        unlocked && styles.titleUnlocked,
        current && styles.titleCurrent,
      ]}
    >
      <View style={styles.titleLeft}>
        <Text style={styles.titleIcon}>{unlocked ? '🏅' : '🔒'}</Text>
        <View>
          <Text
            style={[styles.titleName, !unlocked && styles.titleLocked]}
          >
            {title}
          </Text>
          <Text style={styles.titleLevel}>Lv.{level} 解锁</Text>
        </View>
      </View>
      {current && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentText}>当前</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  statsOverview: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  attributesSection: {
    marginTop: spacing.xl,
  },
  attributesList: {
    gap: spacing.md,
  },
  attributeItem: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  attributeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  attributeEmoji: {
    fontSize: 20,
  },
  attributeLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  attributeValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  attributeBarBg: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  attributeBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  attributeDesc: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  titlesSection: {
    marginTop: spacing.xl,
  },
  titlesList: {
    gap: spacing.sm,
  },
  titleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    opacity: 0.5,
  },
  titleUnlocked: {
    opacity: 1,
  },
  titleCurrent: {
    borderWidth: 2,
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleIcon: {
    fontSize: 24,
  },
  titleName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  titleLocked: {
    color: colors.text.muted,
  },
  titleLevel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  currentText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.inverse,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
