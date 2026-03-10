/**
 * 📋 任务列表页
 * 管理所有任务
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
import { QuestCard } from '../../src/components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme';
import { Quest, QuestStatus, QuestType, Difficulty, QuestTag } from '../../src/types';
import { localQuestService, localCharacterService } from '../../src/lib/local-storage';
import { calculateRewards } from '../../src/lib/rewards';

type FilterType = 'ALL' | QuestType;

const FILTERS: { key: FilterType; label: string; emoji: string }[] = [
  { key: 'ALL', label: '全部', emoji: '📋' },
  { key: 'MAIN', label: '主线', emoji: '⭐' },
  { key: 'SIDE', label: '支线', emoji: '📌' },
  { key: 'DAILY', label: '日常', emoji: '🔄' },
  { key: 'CHALLENGE', label: '挑战', emoji: '⚔️' },
];

const QUEST_TYPES: { key: QuestType; label: string; emoji: string }[] = [
  { key: 'MAIN', label: '主线', emoji: '⭐' },
  { key: 'SIDE', label: '支线', emoji: '📌' },
  { key: 'DAILY', label: '日常', emoji: '🔄' },
  { key: 'CHALLENGE', label: '挑战', emoji: '⚔️' },
];

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: 'EASY', label: '简单' },
  { key: 'MEDIUM', label: '中等' },
  { key: 'HARD', label: '困难' },
];

const TAGS: { key: QuestTag; label: string; emoji: string }[] = [
  { key: 'STUDY', label: '学习', emoji: '📚' },
  { key: 'WORK', label: '工作', emoji: '💼' },
  { key: 'HEALTH', label: '健康', emoji: '🏃' },
  { key: 'LIFE', label: '生活', emoji: '🏠' },
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showModal, setShowModal] = useState(false);

  // 新任务表单状态
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<QuestType>('SIDE');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('MEDIUM');
  const [newTag, setNewTag] = useState<QuestTag>('WORK');

  // 加载本地数据
  const loadData = useCallback(async () => {
    try {
      const data = await localQuestService.getAll();
      setQuests(data);
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleStatusChange = async (id: string, status: QuestStatus) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );

    const quest = quests.find((q) => q.id === id);
    await localQuestService.updateStatus(id, status);

    // 如果完成任务，增加奖励
    if (status === 'DONE' && quest) {
      await localCharacterService.addRewards({
        exp: quest.expReward,
        gold: quest.goldReward,
        str: quest.strReward,
        int: quest.intReward,
        foc: quest.focReward,
        vit: quest.vitReward,
      });
    }
  };

  const handleDelete = async (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
    await localQuestService.delete(id);
  };

  const handleCreateQuest = async () => {
    console.log('🚀 handleCreateQuest called, title:', newTitle);
    
    if (!newTitle.trim()) {
      if (Platform.OS === 'web') {
        window.alert('请输入任务名称');
      } else {
        Alert.alert('提示', '请输入任务名称');
      }
      return;
    }

    try {
      const rewards = calculateRewards(newDifficulty, newType, newTag);
      console.log('📊 计算奖励:', rewards);

      const newQuest = await localQuestService.create({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        type: newType,
        difficulty: newDifficulty,
        tag: newTag,
        status: 'TODO',
        expReward: rewards.expReward,
        goldReward: rewards.goldReward,
        strReward: rewards.statReward.strength,
        intReward: rewards.statReward.intelligence,
        focReward: rewards.statReward.focus,
        vitReward: rewards.statReward.vitality,
        isToday: true,
      });

      console.log('✅ 创建结果:', newQuest);

      setQuests((prev) => [newQuest, ...prev]);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('创建任务失败:', error);
      if (Platform.OS === 'web') {
        window.alert('创建任务失败，请重试');
      } else {
        Alert.alert('错误', '创建任务失败，请重试');
      }
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewType('SIDE');
    setNewDifficulty('MEDIUM');
    setNewTag('WORK');
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
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>📝</Text>
              <Text style={styles.sectionTitle}>
                待完成 ({todoQuests.length})
              </Text>
            </View>
            {todoQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {/* 已完成 */}
        {doneQuests.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>✅</Text>
              <Text style={styles.sectionTitle}>
                已完成 ({doneQuests.length})
              </Text>
            </View>
            {doneQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </View>
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
      <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={32} color={colors.text.inverse} />
      </Pressable>

      {/* 创建任务弹窗 */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* 半透明背景 - 点击关闭弹窗（绝对定位，在内容层下面） */}
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          {/* 内容区域 - 独立层，不受背景点击影响 */}
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✨ 创建新任务</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.modalScrollView}
            >
              {/* 任务名称 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>任务名称 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="输入任务名称"
                  placeholderTextColor={colors.text.muted}
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              {/* 描述 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>描述（可选）</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="任务详细描述"
                  placeholderTextColor={colors.text.muted}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* 任务类型 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>任务类型</Text>
                <View style={styles.optionRow}>
                  {QUEST_TYPES.map((t) => (
                    <Pressable
                      key={t.key}
                      style={[
                        styles.optionButton,
                        newType === t.key && styles.optionActive,
                      ]}
                      onPress={() => setNewType(t.key)}
                    >
                      <Text style={styles.optionEmoji}>{t.emoji}</Text>
                      <Text
                        style={[
                          styles.optionText,
                          newType === t.key && styles.optionTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 难度 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>难度</Text>
                <View style={styles.optionRow}>
                  {DIFFICULTIES.map((d) => (
                    <Pressable
                      key={d.key}
                      style={[
                        styles.optionButton,
                        styles.optionWide,
                        newDifficulty === d.key && styles.optionActive,
                      ]}
                      onPress={() => setNewDifficulty(d.key)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          newDifficulty === d.key && styles.optionTextActive,
                        ]}
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 标签 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>分类</Text>
                <View style={styles.optionRow}>
                  {TAGS.map((t) => (
                    <Pressable
                      key={t.key}
                      style={[
                        styles.optionButton,
                        newTag === t.key && styles.optionActive,
                      ]}
                      onPress={() => setNewTag(t.key)}
                    >
                      <Text style={styles.optionEmoji}>{t.emoji}</Text>
                      <Text
                        style={[
                          styles.optionText,
                          newTag === t.key && styles.optionTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 底部留白给按钮空间 */}
              <View style={styles.scrollBottomSpacer} />
            </ScrollView>

            {/* 提交按钮 - 移到 ScrollView 外部，固定在底部 */}
            <View style={styles.submitButtonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateQuest}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.submitButtonText}>创建任务 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  optionWide: {
    flex: 1,
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  optionEmoji: {
    fontSize: 14,
  },
  optionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  optionTextActive: {
    color: colors.primary[600],
  },
  modalScrollView: {
    flex: 1,
  },
  scrollBottomSpacer: {
    height: spacing.md,
  },
  submitButtonContainer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    // Web 端需要明确 cursor
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  submitButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});
