/**
 * 📋 任务 Tab
 * 整合今日进度、今日主线、其他任务和添加任务功能
 * 支持今日/过期任务分区、删除惩罚、过期结算
 */

import React, { useState, useCallback, useEffect } from 'react';
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
import { Quest, QuestStatus, QuestType, Difficulty, QuestTag, Character, OverdueSettlement } from '../../src/types';
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
  const [overdueQuests, setOverdueQuests] = useState<Quest[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 过期结算弹窗
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlement, setSettlement] = useState<OverdueSettlement | null>(null);

  // 删除确认弹窗
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Quest | null>(null);
  const [deletePenalty, setDeletePenalty] = useState(0);

  // 今日全清弹窗
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearReward, setClearReward] = useState(0);

  // 编辑模式
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);

  // 新任务表单状态
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<QuestType>('SIDE');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('MEDIUM');
  const [newTag, setNewTag] = useState<QuestTag>('WORK');

  // 加载本地数据
  const loadData = useCallback(async () => {
    try {
      const [todayData, overdueData, charData] = await Promise.all([
        localQuestService.getTodayQuests(),
        localQuestService.getOverdueQuests(),
        localCharacterService.get(),
      ]);
      
      // 获取今日已完成的任务
      const allQuests = await localQuestService.getAll();
      const today = new Date().toISOString().split('T')[0];
      const todayCompleted = allQuests.filter((q) => {
        const questDate = q.createdAt.split('T')[0];
        return questDate === today && q.status === 'DONE';
      });
      
      setQuests([...todayData, ...todayCompleted]);
      setOverdueQuests(overdueData);
      setCharacter(charData);
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  }, []);

  // 执行每日结算
  const performSettlement = useCallback(async () => {
    try {
      const result = await localQuestService.performDailySettlement();
      if (result && result.overdueQuests.length > 0) {
        // 扣除惩罚
        const updatedChar = await localCharacterService.applyPenalty(result.totalPenalty);
        setCharacter(updatedChar);
        setSettlement(result);
        setShowSettlementModal(true);
        // 重新加载数据
        await loadData();
      }
    } catch (error) {
      console.error('执行每日结算失败:', error);
    }
  }, [loadData]);

  // 首次进入时执行每日结算
  useEffect(() => {
    performSettlement();
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
    // 更新本地状态
    const updateQuestList = (list: Quest[]) =>
      list.map((q) => (q.id === id ? { ...q, status } : q));
    
    setQuests(updateQuestList);
    setOverdueQuests(updateQuestList);

    const quest = [...quests, ...overdueQuests].find((q) => q.id === id);
    await localQuestService.updateStatus(id, status);

    // 如果完成任务，增加奖励
    if (status === 'DONE' && quest) {
      // 检查是否是过期任务，过期任务只给 50% 奖励
      const isOverdue = quest.isOverdue || quest.overduePenaltyApplied;
      const rewardMultiplier = isOverdue ? 0.5 : 1;
      
      const updatedChar = await localCharacterService.addRewards({
        exp: Math.floor(quest.expReward * rewardMultiplier),
        gold: Math.floor(quest.goldReward * rewardMultiplier),
        str: Math.floor(quest.strReward * rewardMultiplier),
        int: Math.floor(quest.intReward * rewardMultiplier),
        foc: Math.floor(quest.focReward * rewardMultiplier),
        vit: Math.floor(quest.vitReward * rewardMultiplier),
      });
      setCharacter(updatedChar);

      // 检查今日全清
      const clearResult = await localQuestService.checkTodayClear();
      if (clearResult.achieved) {
        // 发放全清奖励
        const charWithReward = await localCharacterService.addRewards({
          exp: 0,
          gold: clearResult.reward,
          str: 0,
          int: 0,
          foc: 0,
          vit: 0,
        });
        setCharacter(charWithReward);
        setClearReward(clearResult.reward);
        setShowClearModal(true);
      }
    }
  };

  // 计算删除惩罚
  const calculateDeletePenalty = (quest: Quest): number => {
    const isOverdue = quest.isOverdue || quest.overduePenaltyApplied;
    let penalty = isOverdue ? 10 : 5; // 过期10金币，今日5金币
    if (quest.type === 'MAIN') {
      penalty += 5; // 主线额外5金币
    }
    return penalty;
  };

  // 显示删除确认弹窗
  const handleDeleteRequest = (id: string) => {
    const quest = [...quests, ...overdueQuests].find((q) => q.id === id);
    if (!quest) return;
    
    const penalty = calculateDeletePenalty(quest);
    setDeleteTarget(quest);
    setDeletePenalty(penalty);
    setShowDeleteModal(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    // 扣除金币
    const updatedChar = await localCharacterService.applyPenalty({ gold: deletePenalty });
    setCharacter(updatedChar);

    // 删除任务
    setQuests((prev) => prev.filter((q) => q.id !== deleteTarget.id));
    setOverdueQuests((prev) => prev.filter((q) => q.id !== deleteTarget.id));
    await localQuestService.delete(deleteTarget.id);

    // 关闭弹窗
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeletePenalty(0);
  };

  const handleDelete = async (id: string) => {
    handleDeleteRequest(id);
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
    setIsEditMode(false);
    setEditingQuestId(null);
  };

  // 打开编辑弹窗
  const handleEdit = (id: string) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.status === 'DONE') return;

    // 填充表单
    setNewTitle(quest.title);
    setNewDescription(quest.description || '');
    setNewType(quest.type);
    setNewDifficulty(quest.difficulty);
    setNewTag(quest.tag);
    setIsEditMode(true);
    setEditingQuestId(id);
    setShowModal(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!newTitle.trim() || !editingQuestId) {
      if (Platform.OS === 'web') {
        window.alert('请输入任务名称');
      } else {
        Alert.alert('提示', '请输入任务名称');
      }
      return;
    }

    try {
      const rewards = calculateRewards(newDifficulty, newType, newTag);

      const updates = {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        type: newType,
        difficulty: newDifficulty,
        tag: newTag,
        expReward: rewards.expReward,
        goldReward: rewards.goldReward,
        strReward: rewards.statReward.strength,
        intReward: rewards.statReward.intelligence,
        focReward: rewards.statReward.focus,
        vitReward: rewards.statReward.vitality,
      };

      await localQuestService.update(editingQuestId, updates);

      setQuests((prev) =>
        prev.map((q) => (q.id === editingQuestId ? { ...q, ...updates } : q))
      );

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('更新任务失败:', error);
      if (Platform.OS === 'web') {
        window.alert('更新任务失败，请重试');
      } else {
        Alert.alert('错误', '更新任务失败，请重试');
      }
    }
  };

  // 获取当前时间的问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 夜深了';
    if (hour < 12) return '🌅 早上好';
    if (hour < 18) return '☀️ 下午好';
    return '🌆 晚上好';
  };

  // 分类今日任务
  const todayMainQuests = quests.filter((q) => q.type === 'MAIN' && q.status !== 'DONE');
  const todayOtherQuests = quests.filter((q) => q.type !== 'MAIN' && q.status !== 'DONE');
  const todayCompletedQuests = quests.filter((q) => q.status === 'DONE');
  
  // 今日统计
  const todayTotal = quests.length;
  const todayCompletedCount = todayCompletedQuests.length;
  
  // 过期统计
  const overdueCount = overdueQuests.length;

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
              <Text style={styles.progressValue}>{todayCompletedCount}</Text>
              <Text style={styles.progressLabel}>已完成</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{todayTotal}</Text>
              <Text style={styles.progressLabel}>总任务</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>
                {todayTotal > 0 ? Math.round((todayCompletedCount / todayTotal) * 100) : 0}%
              </Text>
              <Text style={styles.progressLabel}>完成率</Text>
            </View>
          </View>
        </View>

        {/* 过期任务警告区 */}
        {overdueCount > 0 && (
          <View style={styles.overdueSection}>
            <View style={styles.overdueHeader}>
              <Text style={styles.overdueEmoji}>⚠️</Text>
              <Text style={styles.overdueTitle}>过期任务 ({overdueCount})</Text>
            </View>
            <Text style={styles.overdueHint}>完成过期任务只能获得 50% 奖励</Text>
            {overdueQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isOverdue={true}
              />
            ))}
          </View>
        )}

        {/* 主线任务 */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>⭐</Text>
            <Text style={styles.sectionTitle}>今日主线</Text>
          </View>
          {todayMainQuests.length > 0 ? (
            todayMainQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
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
          {todayOtherQuests.length > 0 ? (
            todayOtherQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
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

        {/* 已完成任务 */}
        {todayCompletedQuests.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>✅</Text>
              <Text style={styles.sectionTitle}>已完成 ({todayCompletedCount})</Text>
            </View>
            {todayCompletedQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {/* 底部间距 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 添加按钮 */}
      <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={32} color={colors.text.inverse} />
      </Pressable>

      {/* 创建/编辑任务弹窗 */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setShowModal(false); resetForm(); }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => { setShowModal(false); resetForm(); }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? '✏️ 编辑任务' : '✨ 创建新任务'}
              </Text>
              <Pressable onPress={() => { setShowModal(false); resetForm(); }}>
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
                onPress={isEditMode ? handleSaveEdit : handleCreateQuest}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.submitButtonText}>
                  {isEditMode ? '保存修改 ✅' : '创建任务 🚀'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContent}>
            <Text style={styles.alertEmoji}>⚠️</Text>
            <Text style={styles.alertTitle}>确认放弃任务？</Text>
            <Text style={styles.alertQuestTitle}>「{deleteTarget?.title}」</Text>
            <View style={styles.alertPenalty}>
              <Text style={styles.alertPenaltyText}>放弃将扣除: </Text>
              <Text style={styles.alertPenaltyValue}>{deletePenalty} 金币 💰</Text>
            </View>
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonCancel]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.alertButtonCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonConfirm]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.alertButtonConfirmText}>确认放弃</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 过期结算弹窗 */}
      <Modal
        visible={showSettlementModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSettlementModal(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContent}>
            <Text style={styles.alertEmoji}>⚠️</Text>
            <Text style={styles.alertTitle}>昨日任务未完成</Text>
            <Text style={styles.alertSubtitle}>以下任务已过期：</Text>
            <View style={styles.settlementList}>
              {settlement?.overdueQuests.map((quest) => (
                <View key={quest.id} style={styles.settlementItem}>
                  <Text style={styles.settlementQuestType}>
                    {quest.type === 'MAIN' ? '⭐' : '📌'}
                  </Text>
                  <Text style={styles.settlementQuestTitle} numberOfLines={1}>
                    {quest.title}
                  </Text>
                  <Text style={styles.settlementPenalty}>
                    -{quest.penaltyAmount?.exp || 0} EXP
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.settlementTotal}>
              <Text style={styles.settlementTotalLabel}>总计扣除:</Text>
              <Text style={styles.settlementTotalValue}>
                {settlement?.totalPenalty.exp || 0} EXP
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.alertButton, styles.alertButtonFull]}
              onPress={() => setShowSettlementModal(false)}
            >
              <Text style={styles.alertButtonConfirmText}>我知道了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 今日全清庆祝弹窗 */}
      <Modal
        visible={showClearModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={[styles.alertContent, styles.celebrateContent]}>
            <Text style={styles.celebrateEmoji}>🎉</Text>
            <Text style={styles.celebrateTitle}>今日全清！</Text>
            <Text style={styles.celebrateSubtitle}>所有任务已完成</Text>
            <View style={styles.celebrateReward}>
              <Text style={styles.celebrateRewardText}>+{clearReward} 金币 💰</Text>
            </View>
            <TouchableOpacity
              style={[styles.alertButton, styles.celebrateButton]}
              onPress={() => setShowClearModal(false)}
            >
              <Text style={styles.celebrateButtonText}>太棒了!</Text>
            </TouchableOpacity>
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
  // 过期任务区样式
  overdueSection: {
    backgroundColor: '#FFF5F5',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  overdueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  overdueEmoji: {
    fontSize: 18,
  },
  overdueTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#C53030',
  },
  overdueHint: {
    fontSize: fontSize.sm,
    color: '#E53E3E',
    marginBottom: spacing.md,
  },
  // 弹窗样式
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  alertContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  alertEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  alertTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  alertQuestTitle: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  alertPenalty: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  alertPenaltyText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  alertPenaltyValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#E53E3E',
  },
  alertButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  alertButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  alertButtonCancel: {
    backgroundColor: colors.gray[100],
  },
  alertButtonConfirm: {
    backgroundColor: '#E53E3E',
  },
  alertButtonFull: {
    backgroundColor: colors.primary[500],
    width: '100%',
    marginTop: spacing.md,
  },
  alertButtonCancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  alertButtonConfirmText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.inverse,
  },
  // 过期结算弹窗
  settlementList: {
    width: '100%',
    marginBottom: spacing.md,
  },
  settlementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settlementQuestType: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  settlementQuestTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  settlementPenalty: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#E53E3E',
  },
  settlementTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  settlementTotalLabel: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  settlementTotalValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#E53E3E',
  },
  // 今日全清庆祝弹窗
  celebrateContent: {
    backgroundColor: '#F0FFF4',
    borderWidth: 2,
    borderColor: '#68D391',
  },
  celebrateEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  celebrateTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#22543D',
    marginBottom: spacing.xs,
  },
  celebrateSubtitle: {
    fontSize: fontSize.md,
    color: '#276749',
    marginBottom: spacing.lg,
  },
  celebrateReward: {
    backgroundColor: '#C6F6D5',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  celebrateRewardText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#22543D',
  },
  celebrateButton: {
    backgroundColor: '#48BB78',
    width: '100%',
  },
  celebrateButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.inverse,
  },
});
