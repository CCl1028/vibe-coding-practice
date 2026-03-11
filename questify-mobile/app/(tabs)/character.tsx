/**
 * 👤 角色详情页
 * 显示角色完整信息和统计
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

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
import { localCharacterService, localQuestService, localStorageService } from '../../src/lib/local-storage';

export default function CharacterScreen() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState({
    totalQuests: 0,
    completedQuests: 0,
    streakDays: 0,
    totalExp: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  
  // 编辑昵称相关状态
  const [showNameModal, setShowNameModal] = useState(false);
  const [editingName, setEditingName] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [charData, questData] = await Promise.all([
        localCharacterService.get(),
        localQuestService.getAll(),
      ]);

      setCharacter(charData);

      // 计算统计数据
      const completed = questData.filter((q) => q.status === 'DONE').length;
      const totalExp = questData
        .filter((q) => q.status === 'DONE')
        .reduce((sum, q) => sum + q.expReward, 0);

      setStats({
        totalQuests: questData.length,
        completedQuests: completed,
        streakDays: 7, // TODO: 实现连续天数计算
        totalExp,
      });
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  }, []);

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

  const handleResetData = () => {
    Alert.alert('重置数据', '确定要重置所有数据吗？这将清除你的角色、任务和成就进度。', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定重置',
        style: 'destructive',
        onPress: async () => {
          await localStorageService.clearAll();
          await loadData();
          Alert.alert('提示', '数据已重置');
        },
      },
    ]);
  };

  // 打开编辑昵称弹窗
  const handleEditName = () => {
    setEditingName(character?.name || '');
    setShowNameModal(true);
  };

  // 保存新昵称
  const handleSaveName = async () => {
    if (editingName.trim()) {
      const updated = await localCharacterService.update({ name: editingName.trim() });
      setCharacter(updated);
    }
    setShowNameModal(false);
  };

  // 选择头像
  const handleEditAvatar = async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相册权限才能选择头像');
      return;
    }

    // 打开图片选择器
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const avatarUri = result.assets[0].uri;
      const updated = await localCharacterService.update({ avatarUri });
      setCharacter(updated);
    }
  };

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
        <View style={styles.header}>
          <Text style={styles.title}>我的角色</Text>
          <Pressable
            style={styles.settingsButton}
            onPress={handleResetData}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={colors.gray[500]}
            />
          </Pressable>
        </View>

        {/* 数据存储提示 */}
        <View style={styles.localBanner}>
          <Ionicons name="phone-portrait-outline" size={16} color={colors.mint[700]} style={{ marginRight: spacing.xs }} />
          <Text style={styles.localText}>数据存储在本地，无需登录即可使用</Text>
        </View>

        {/* 角色卡片 */}
        {character && (
          <View>
            <CharacterCard 
              character={character} 
              onEditName={handleEditName}
              onEditAvatar={handleEditAvatar}
            />
          </View>
        )}

        {/* 统计概览 */}
        <View style={styles.statsOverview}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="stats-chart" size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>冒险统计</Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              iconName="flag"
              value={stats.totalQuests}
              label="总任务数"
              color={colors.primary[500]}
            />
            <StatCard
              iconName="checkmark-circle"
              value={stats.completedQuests}
              label="已完成"
              color={colors.mint[500]}
            />
            <StatCard
              iconName="flame"
              value={stats.streakDays}
              label="连续天数"
              color={colors.coral[500]}
            />
            <StatCard
              iconName="star"
              value={stats.totalExp}
              label="总经验"
              color={colors.lavender[500]}
            />
          </View>
        </View>

        {/* 属性详情 */}
        {character && (
          <View style={styles.attributesSection}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="fitness" size={20} color={colors.coral[500]} />
              <Text style={styles.sectionTitle}>属性详情</Text>
            </View>
            <View style={styles.attributesList}>
              <AttributeBar
                iconName="flash"
                label="力量"
                value={character.stats.strength}
                maxValue={20}
                color={statColors.strength}
                description="提升体力任务效率"
              />
              <AttributeBar
                iconName="bulb"
                label="知识"
                value={character.stats.intelligence}
                maxValue={20}
                color={statColors.intelligence}
                description="提升学习任务效率"
              />
              <AttributeBar
                iconName="eye"
                label="专注"
                value={character.stats.focus}
                maxValue={20}
                color={statColors.focus}
                description="提升工作任务效率"
              />
              <AttributeBar
                iconName="heart"
                label="活力"
                value={character.stats.vitality}
                maxValue={20}
                color={statColors.vitality}
                description="提升健康任务效率"
              />
            </View>
          </View>
        )}

        {/* 称号历程 */}
        {character && (
          <View style={styles.titlesSection}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="medal" size={20} color={colors.cream[500]} />
              <Text style={styles.sectionTitle}>称号历程</Text>
            </View>
            <View style={styles.titlesList}>
              <TitleItem title="初出茅庐" level={1} unlocked={character.level >= 1} current={character.level >= 1 && character.level < 3} />
              <TitleItem title="积极行动者" level={3} unlocked={character.level >= 3} current={character.level >= 3 && character.level < 5} />
              <TitleItem title="稳定推进者" level={5} unlocked={character.level >= 5} current={character.level >= 5 && character.level < 7} />
              <TitleItem title="深度潜行者" level={7} unlocked={character.level >= 7} current={character.level >= 7 && character.level < 10} />
              <TitleItem title="挑战征服者" level={10} unlocked={character.level >= 10} current={character.level >= 10 && character.level < 15} />
              <TitleItem title="高效执行官" level={15} unlocked={character.level >= 15} current={character.level >= 15 && character.level < 20} />
              <TitleItem title="传奇冒险者" level={20} unlocked={character.level >= 20} current={character.level >= 20} />
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 编辑昵称弹窗 */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改昵称</Text>
            <TextInput
              style={styles.nameInput}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="输入新昵称"
              placeholderTextColor={colors.gray[400]}
              autoFocus
              maxLength={20}
            />
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveName}
              >
                <Text style={styles.confirmButtonText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface StatCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
}

function StatCard({ iconName, value, label, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={iconName} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface AttributeBarProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  maxValue: number;
  color: string;
  description: string;
}

function AttributeBar({
  iconName,
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
        <Ionicons name={iconName} size={20} color={color} />
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
        <Ionicons 
          name={unlocked ? 'medal' : 'lock-closed'} 
          size={24} 
          color={unlocked ? colors.cream[500] : colors.gray[400]} 
        />
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  localBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint[100],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  localText: {
    fontSize: fontSize.sm,
    color: colors.mint[700],
  },
  statsOverview: {
    marginTop: spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
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
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
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
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  nameInput: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
  },
  confirmButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.inverse,
  },
});
