/**
 * 📋 任务 Tab
 * 整合今日进度、今日主线、其他任务和添加任务功能
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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
import { QuestCard } from '../../src/components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme';
import { Quest, QuestStatus, QuestType, Difficulty, QuestTag, Character } from '../../src/types';
import { localQuestService, localCharacterService } from '../../src/lib/local-storage';
import { calculateRewards } from '../../src/lib/rewards';

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
  const [character, setCharacter] = useState<Character | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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
      const [questData, charData] = await Promise.all([
        localQuestService.getAll({ isToday: true }),
        localCharacterService.get(),
      ]);
      setQuests(questData);
      setCharacter(charData);
    } catch (error) {
      console.error('加载任务失败:', error);
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

  const handleStatusChange = async (id: string, status: QuestStatus) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );

    const quest = quests.find((q) => q.id === id);
    await localQuestService.updateStatus(id, status);

    // 如果完成任务，增加奖励
    if (status === 'DONE' && quest) {
      const updatedChar = await localCharacterService.addRewards({
        exp: quest.expReward,
        gold: quest.goldReward,
        str: quest.strReward,
        int: quest.intReward,
        foc: quest.focReward,
        vit: quest.vitReward,
      });
      setCharacter(updatedChar);
    }
  };

  const handleDelete = async (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
    await localQuestService.delete(id);
  };

  const handleCreateQuest = async () => {
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
  const totalCount = quests.length || 1;

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
          <Text style={styles.subtitle}>冒险者 {character?.name || '加载中...'}！</Text>
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
                {Math.round((completedCount / totalCount) * 100)}%
              </Text>
              <Text style={styles.progressLabel}>完成率</Text>
            </View>
          </View>
        </View>

        {/* 主线任务 */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>⭐</Text>
            <Text style={styles.sectionTitle}>今日主线</Text>
          </View>
          {mainQuests.length > 0 ? (
            mainQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>暂无主线任务</Text>
            </View>
          )}
        </View>

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
              <Text style={styles.emptyHint}>点击右下角添加新任务吧！</Text>
            </View>
          )}
        </View>

        {/* 底部间距 */}
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
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
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

              <View style={styles.scrollBottomSpacer} />
            </ScrollView>

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
  emptySection: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
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
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  submitButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});
