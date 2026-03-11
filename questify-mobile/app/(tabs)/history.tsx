/**
 * 冒险日志 Tab
 * 记录你的每一次成长
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/theme';
import { Quest } from '../../src/types';
import { localQuestService } from '../../src/lib/local-storage';

// ============ 类型定义 ============

type DailySummary = {
  date: string;
  expEarned: number;
  goldEarned: number;
  completedCount: number;
  mainCompleted: boolean;
  statGains: {
    strength: number;
    intelligence: number;
    focus: number;
    vitality: number;
  };
  badges: string[];
  quests: Quest[];
};

type HistoryKPIs = {
  totalExp: number;
  completedCount: number;
  mainCompletedDays: number;
  mainCompletionRate: number;
  longestStreak: number;
  daysInRange: number;
};

type HalfYearPeriod = {
  id: string;
  label: string;
  year: number;
  half: 1 | 2; // H1 = 1-6月, H2 = 7-12月
  startDate: Date;
  endDate: Date;
};

// ============ 常量 ============

const WEEK_DAYS_FULL = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// ============ 工具函数 ============

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDay = WEEK_DAYS_FULL[date.getDay()];
  return `${month}月${day}日 周${weekDay}`;
}

function getExpLevel(exp: number): number {
  if (exp === 0) return 0;
  if (exp <= 50) return 1;
  if (exp <= 100) return 2;
  if (exp <= 150) return 3;
  return 4;
}

/**
 * 生成可选的半年时间段列表
 * 包括当前半年及之前的几个半年
 */
function getAvailablePeriods(): HalfYearPeriod[] {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const currentHalf = currentMonth < 6 ? 1 : 2;
  
  const periods: HalfYearPeriod[] = [];
  
  // 生成最近 4 个半年的选项（当前半年 + 过去 3 个半年）
  let year = currentYear;
  let half = currentHalf as 1 | 2;
  
  for (let i = 0; i < 4; i++) {
    const startMonth = half === 1 ? 0 : 6; // 1月或7月
    const endMonth = half === 1 ? 5 : 11; // 6月或12月
    
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, endMonth + 1, 0); // 月末
    
    periods.push({
      id: `${year}H${half}`,
      label: `${year} H${half}`,
      year,
      half,
      startDate,
      endDate,
    });
    
    // 移动到上一个半年
    if (half === 1) {
      half = 2;
      year--;
    } else {
      half = 1;
    }
  }
  
  return periods;
}

/**
 * 根据选定的时间段生成热力图数据
 * 返回按周组织的数据，每周是一列，每天是一行
 */
function getHeatmapDataForPeriod(period: HalfYearPeriod): { 
  columns: string[][]; 
  monthLabels: { month: string; weekIndex: number }[]; 
  allDates: string[];
  weeksCount: number;
} {
  const allDates: string[] = [];
  const columns: string[][] = [];
  const monthLabels: { month: string; weekIndex: number }[] = [];
  
  // 从半年的第一天开始
  const startDate = new Date(period.startDate);
  // 调整到周日开始
  const startDayOfWeek = startDate.getDay();
  if (startDayOfWeek !== 0) {
    startDate.setDate(startDate.getDate() - startDayOfWeek);
  }
  
  // 结束日期调整到周六
  const endDate = new Date(period.endDate);
  const endDayOfWeek = endDate.getDay();
  if (endDayOfWeek !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
  }
  
  let currentDate = new Date(startDate);
  let lastMonth = -1;
  let weekIndex = 0;
  
  while (currentDate <= endDate) {
    const column: string[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dateStr = getDateString(currentDate);
      column.push(dateStr);
      allDates.push(dateStr);
      
      // 记录月份标签（每月第一周）
      const currentMonth = currentDate.getMonth();
      if (currentMonth !== lastMonth && day === 0) {
        monthLabels.push({
          month: MONTH_NAMES[currentMonth],
          weekIndex,
        });
        lastMonth = currentMonth;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    columns.push(column);
    weekIndex++;
  }
  
  return { columns, monthLabels, allDates, weeksCount: weekIndex };
}

// ============ 组件 ============

export default function HistoryScreen() {
  const [summaries, setSummaries] = useState<Map<string, DailySummary>>(new Map());
  const [kpis, setKPIs] = useState<HistoryKPIs>({
    totalExp: 0,
    completedCount: 0,
    mainCompletedDays: 0,
    mainCompletionRate: 0,
    longestStreak: 0,
    daysInRange: 30,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tooltipDate, setTooltipDate] = useState<string | null>(null);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  
  // 可选的时间段列表
  const availablePeriods = useMemo(() => getAvailablePeriods(), []);
  
  // 当前选中的时间段（默认当前半年）
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(availablePeriods[0].id);
  
  // 获取当前选中的时间段
  const selectedPeriod = useMemo(
    () => availablePeriods.find(p => p.id === selectedPeriodId) || availablePeriods[0],
    [availablePeriods, selectedPeriodId]
  );
  
  // GitHub 风格热力图数据 - 根据选中的时间段动态生成
  const { columns, monthLabels, allDates, weeksCount } = useMemo(
    () => getHeatmapDataForPeriod(selectedPeriod),
    [selectedPeriod]
  );

  // 加载并聚合数据
  const loadData = useCallback(async () => {
    try {
      // 获取所有已完成的任务
      const allQuests = await localQuestService.getAll();
      const completedQuests = allQuests.filter(q => q.status === 'DONE' && q.completedAt);

      // 按天聚合
      const summaryMap = new Map<string, DailySummary>();
      
      for (const date of allDates) {
        const dayQuests = completedQuests.filter(q => 
          q.completedAt?.startsWith(date)
        );

        const expEarned = dayQuests.reduce((sum, q) => sum + q.expReward, 0);
        const goldEarned = dayQuests.reduce((sum, q) => sum + q.goldReward, 0);
        const mainCompleted = dayQuests.some(q => q.type === 'MAIN');

        const badges: string[] = [];
        if (mainCompleted) badges.push('MAIN_CLEAR');
        if (expEarned >= 150) badges.push('HIGH_EXP');

        summaryMap.set(date, {
          date,
          expEarned,
          goldEarned,
          completedCount: dayQuests.length,
          mainCompleted,
          statGains: {
            strength: dayQuests.reduce((sum, q) => sum + q.strReward, 0),
            intelligence: dayQuests.reduce((sum, q) => sum + q.intReward, 0),
            focus: dayQuests.reduce((sum, q) => sum + q.focReward, 0),
            vitality: dayQuests.reduce((sum, q) => sum + q.vitReward, 0),
          },
          badges,
          quests: dayQuests,
        });
      }

      setSummaries(summaryMap);

      // 计算 KPIs
      let totalExp = 0;
      let completedCount = 0;
      let mainCompletedDays = 0;
      let longestStreak = 0;
      let currentStreak = 0;
      let validDays = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const date of allDates) {
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        dateObj.setHours(0, 0, 0, 0);
        
        // 只统计过去的日期
        if (dateObj <= today) {
          validDays++;
          const summary = summaryMap.get(date);
          if (summary) {
            totalExp += summary.expEarned;
            completedCount += summary.completedCount;
            if (summary.mainCompleted) {
              mainCompletedDays++;
              currentStreak++;
              longestStreak = Math.max(longestStreak, currentStreak);
            } else {
              currentStreak = 0;
            }
          }
        }
      }

      setKPIs({
        totalExp,
        completedCount,
        mainCompletedDays,
        mainCompletionRate: validDays > 0 ? mainCompletedDays / validDays : 0,
        longestStreak,
        daysInRange: validDays,
      });
    } catch (error) {
      console.error('加载历史数据失败:', error);
    }
  }, [allDates]);

  // 初始化选中今天
  useEffect(() => {
    const today = getDateString(new Date());
    setSelectedDate(today);
  }, []);

  // 切换时间段时，检查并更新选中的日期
  useEffect(() => {
    if (selectedDate) {
      const isDateInPeriod = allDates.includes(selectedDate);
      if (!isDateInPeriod) {
        // 如果当前选中的日期不在新时间段内，选择今天（如果在范围内）或时间段的最后一天
        const today = getDateString(new Date());
        if (allDates.includes(today)) {
          setSelectedDate(today);
        } else {
          // 选择时间段内最近的过去日期
          const todayObj = new Date();
          todayObj.setHours(0, 0, 0, 0);
          const pastDates = allDates.filter(date => {
            const [year, month, day] = date.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            return dateObj <= todayObj;
          });
          if (pastDates.length > 0) {
            setSelectedDate(pastDates[pastDates.length - 1]);
          } else {
            setSelectedDate(null);
          }
        }
      }
    }
  }, [allDates, selectedDate]);

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

  const handleDayPress = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj <= today) {
      setSelectedDate(date);
    }
  };

  const handleDayLongPress = (date: string) => {
    setTooltipDate(date);
    // 3 秒后自动隐藏
    setTimeout(() => setTooltipDate(null), 3000);
  };

  const selectedSummary = selectedDate ? summaries.get(selectedDate) : null;

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
        {/* 页面标题 */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>冒险日志</Text>
          </View>
          <Text style={styles.subtitle}>记录你的每一次成长</Text>
        </View>

        {/* KPI 指标卡 - 一行紧凑布局 */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiItem}>
            <Ionicons name="star" size={16} color={colors.cream[500]} />
            <Text style={styles.kpiValue}>{kpis.totalExp}</Text>
            <Text style={styles.kpiLabel}>经验</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.mint[500]} />
            <Text style={styles.kpiValue}>{kpis.completedCount}</Text>
            <Text style={styles.kpiLabel}>完成</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Ionicons name="flag" size={16} color={colors.coral[500]} />
            <Text style={styles.kpiValue}>{kpis.mainCompletedDays}</Text>
            <Text style={styles.kpiLabel}>主线</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Ionicons name="stats-chart" size={16} color={colors.sky[500]} />
            <Text style={styles.kpiValue}>
              {Math.round(kpis.mainCompletionRate * 100)}%
            </Text>
            <Text style={styles.kpiLabel}>达成</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Ionicons name="flame" size={16} color={colors.coral[500]} />
            <Text style={styles.kpiValue}>{kpis.longestStreak}</Text>
            <Text style={styles.kpiLabel}>连续</Text>
          </View>
        </View>

        {/* GitHub 风格热力图 */}
        <View style={styles.calendarSection}>
          {/* 热力图标题和时间段选择器 */}
          <View style={styles.heatmapHeader}>
            <Text style={styles.heatmapTitle}>热力图</Text>
            <Pressable 
              style={styles.periodPickerButton}
              onPress={() => setShowPeriodPicker(true)}
            >
              <Text style={styles.periodPickerText}>{selectedPeriod.label}</Text>
              <Ionicons 
                name="chevron-down" 
                size={16} 
                color={colors.primary[500]} 
              />
            </Pressable>
          </View>
          
          {/* 月份标签 */}
          <View style={styles.monthLabelsContainer}>
            {monthLabels.map((label, index) => (
              <Text
                key={index}
                style={[
                  styles.monthLabel,
                  { left: `${(label.weekIndex / weeksCount) * 100}%` },
                ]}
              >
                {label.month}
              </Text>
            ))}
          </View>

          {/* 热力图主体 - 不滚动，全部显示 */}
          <View style={styles.heatmapGrid}>
            {columns.map((column, colIndex) => (
              <View key={colIndex} style={styles.heatmapColumn}>
                {column.map((date) => {
                  const summary = summaries.get(date);
                  const level = summary ? getExpLevel(summary.expEarned) : 0;
                  const isToday = date === getDateString(new Date());
                  const isSelected = date === selectedDate;
                  
                  // 判断是否是未来日期
                  const [year, month, day] = date.split('-').map(Number);
                  const dateObj = new Date(year, month - 1, day);
                  dateObj.setHours(0, 0, 0, 0);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isFuture = dateObj.getTime() > today.getTime();

                  const heatLevelStyles = [
                    styles.heatLevel0,
                    styles.heatLevel1,
                    styles.heatLevel2,
                    styles.heatLevel3,
                    styles.heatLevel4,
                  ];

                  return (
                    <Pressable
                      key={date}
                      style={[
                        styles.heatmapCell,
                        isFuture ? styles.futureCell : heatLevelStyles[level],
                        isToday && styles.todayCell,
                        isSelected && styles.selectedCell,
                      ]}
                      onPress={() => !isFuture && handleDayPress(date)}
                      onLongPress={() => handleDayLongPress(date)}
                      disabled={isFuture}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          {/* Tooltip */}
          {tooltipDate && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {formatDate(tooltipDate)}
                {summaries.get(tooltipDate)?.expEarned 
                  ? ` · ${summaries.get(tooltipDate)?.expEarned} EXP`
                  : ' · 无贡献'}
              </Text>
            </View>
          )}

          {/* 图例 */}
          <View style={styles.legend}>
            <Text style={styles.legendText}>少</Text>
            <View style={[styles.legendCell, styles.heatLevel0]} />
            <View style={[styles.legendCell, styles.heatLevel1]} />
            <View style={[styles.legendCell, styles.heatLevel2]} />
            <View style={[styles.legendCell, styles.heatLevel3]} />
            <View style={[styles.legendCell, styles.heatLevel4]} />
            <Text style={styles.legendText}>多</Text>
          </View>
        </View>

        {/* 日详情 - 页面内展示 */}
        {selectedDate && selectedSummary && (
          <View style={styles.dayDetailSection}>
            {/* 日期标题 */}
            <View style={styles.dayDetailHeader}>
              <View style={styles.dayDetailTitleRow}>
                <Ionicons name="calendar" size={20} color={colors.primary[500]} />
                <Text style={styles.dayDetailTitle}>
                  {formatDate(selectedSummary.date)}
                </Text>
              </View>
              {selectedSummary.mainCompleted && (
                <View style={styles.mainBadge}>
                  <Ionicons name="medal" size={12} color={colors.cream[600]} style={{ marginRight: 4 }} />
                  <Text style={styles.mainBadgeText}>主线达成</Text>
                </View>
              )}
            </View>

            {/* 日结算卡 */}
            <View style={styles.dayStatsCard}>
              <View style={styles.dayStatsRow}>
                <View style={styles.dayStat}>
                  <Text style={styles.dayStatValue}>+{selectedSummary.expEarned}</Text>
                  <Text style={styles.dayStatLabel}>经验</Text>
                </View>
                <View style={styles.dayStatDivider} />
                <View style={styles.dayStat}>
                  <Text style={styles.dayStatValue}>+{selectedSummary.goldEarned}</Text>
                  <Text style={styles.dayStatLabel}>金币</Text>
                </View>
                <View style={styles.dayStatDivider} />
                <View style={styles.dayStat}>
                  <Text style={styles.dayStatValue}>{selectedSummary.completedCount}</Text>
                  <Text style={styles.dayStatLabel}>完成数</Text>
                </View>
                <View style={styles.dayStatDivider} />
                <View style={styles.dayStat}>
                  <Ionicons 
                    name={selectedSummary.mainCompleted ? 'checkmark-circle' : 'close-circle'} 
                    size={20} 
                    color={selectedSummary.mainCompleted ? colors.mint[500] : colors.gray[400]} 
                  />
                  <Text style={styles.dayStatLabel}>主线</Text>
                </View>
              </View>
            </View>

            {/* 属性成长 */}
            {(selectedSummary.statGains.strength > 0 ||
              selectedSummary.statGains.intelligence > 0 ||
              selectedSummary.statGains.focus > 0 ||
              selectedSummary.statGains.vitality > 0) && (
              <View style={styles.statGainsSection}>
                <View style={styles.sectionSubtitleRow}>
                  <Ionicons name="fitness" size={18} color={colors.coral[500]} />
                  <Text style={styles.sectionSubtitle}>属性成长</Text>
                </View>
                <View style={styles.statGainsRow}>
                  {selectedSummary.statGains.strength > 0 && (
                    <View style={styles.statGain}>
                      <Text style={[styles.statGainText, { color: colors.coral[500] }]}>
                        力量 +{selectedSummary.statGains.strength}
                      </Text>
                    </View>
                  )}
                  {selectedSummary.statGains.intelligence > 0 && (
                    <View style={styles.statGain}>
                      <Text style={[styles.statGainText, { color: colors.sky[500] }]}>
                        知识 +{selectedSummary.statGains.intelligence}
                      </Text>
                    </View>
                  )}
                  {selectedSummary.statGains.focus > 0 && (
                    <View style={styles.statGain}>
                      <Text style={[styles.statGainText, { color: colors.lavender[500] }]}>
                        专注 +{selectedSummary.statGains.focus}
                      </Text>
                    </View>
                  )}
                  {selectedSummary.statGains.vitality > 0 && (
                    <View style={styles.statGain}>
                      <Text style={[styles.statGainText, { color: colors.mint[500] }]}>
                        活力 +{selectedSummary.statGains.vitality}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* 主线任务 */}
            {selectedSummary.quests.filter(q => q.type === 'MAIN').length > 0 && (
              <View style={styles.questsSection}>
                <View style={styles.sectionSubtitleRow}>
                  <Ionicons name="star" size={18} color={colors.cream[500]} />
                  <Text style={styles.sectionSubtitle}>主线任务</Text>
                </View>
                {selectedSummary.quests
                  .filter(q => q.type === 'MAIN')
                  .map(quest => (
                    <View key={quest.id} style={styles.questItem}>
                      <Ionicons name="checkbox" size={18} color={colors.mint[500]} style={{ marginRight: 8 }} />
                      <Text style={styles.questTitle}>{quest.title}</Text>
                    </View>
                  ))}
              </View>
            )}

            {/* 其他任务 */}
            {selectedSummary.quests.filter(q => q.type !== 'MAIN').length > 0 && (
              <View style={styles.questsSection}>
                <View style={styles.sectionSubtitleRow}>
                  <Ionicons name="list" size={18} color={colors.primary[500]} />
                  <Text style={styles.sectionSubtitle}>其他任务</Text>
                </View>
                {selectedSummary.quests
                  .filter(q => q.type !== 'MAIN')
                  .map(quest => (
                    <View key={quest.id} style={styles.questItem}>
                      <Ionicons name="checkbox" size={18} color={colors.mint[500]} style={{ marginRight: 8 }} />
                      <Text style={styles.questTitle}>{quest.title}</Text>
                    </View>
                  ))}
              </View>
            )}

            {/* 无任务 */}
            {selectedSummary.quests.length === 0 && (
              <View style={styles.noQuestsSection}>
                <Ionicons name="bed" size={32} color={colors.gray[400]} style={{ marginBottom: 8 }} />
                <Text style={styles.noQuestsText}>
                  这天没有完成任务，休息也是冒险的一部分
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 空状态提示（当选中日期无数据时） */}
        {selectedDate && !selectedSummary && (
          <View style={styles.dayDetailSection}>
            <View style={styles.dayDetailHeader}>
              <View style={styles.dayDetailTitleRow}>
                <Ionicons name="calendar" size={20} color={colors.primary[500]} />
                <Text style={styles.dayDetailTitle}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </View>
            <View style={styles.noQuestsSection}>
              <Ionicons name="bed" size={32} color={colors.gray[400]} style={{ marginBottom: 8 }} />
              <Text style={styles.noQuestsText}>
                这天没有完成任务，休息也是冒险的一部分
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 时间段选择器 Modal */}
      <Modal
        visible={showPeriodPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPeriodPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowPeriodPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择时间段</Text>
              <Pressable onPress={() => setShowPeriodPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>
            {availablePeriods.map((period) => (
              <Pressable
                key={period.id}
                style={[
                  styles.modalOption,
                  selectedPeriodId === period.id && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSelectedPeriodId(period.id);
                  setShowPeriodPicker(false);
                }}
              >
                <View style={styles.modalOptionContent}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedPeriodId === period.id && styles.modalOptionTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                  <Text style={styles.modalOptionSubtext}>
                    {period.half === 1 ? '1月 - 6月' : '7月 - 12月'}
                  </Text>
                </View>
                {selectedPeriodId === period.id && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary[500]} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
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
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // KPI 指标卡 - 一行紧凑布局
  kpiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
    shadowColor: colors.primary[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary[500],
    marginTop: 2,
  },
  kpiLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  kpiDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.gray[200],
  },

  // 日历区域
  calendarSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  // 热力图标题
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heatmapTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },

  // 时间段选择器按钮
  periodPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  periodPickerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary[600],
  },

  // Modal 弹出层样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalOptionActive: {
    backgroundColor: colors.primary[50],
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  modalOptionTextActive: {
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
  modalOptionSubtext: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginTop: 2,
  },

  // 月份标签
  monthLabelsContainer: {
    position: 'relative',
    height: 16,
    marginBottom: spacing.xs,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
    color: colors.text.muted,
  },

  // 热力图主体 - 不滚动，自适应宽度
  heatmapGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heatmapColumn: {
    flexDirection: 'column',
    flex: 1,
    gap: 3.5,
  },
  heatmapCell: {
    aspectRatio: 1,
    borderRadius: 3.5,
    marginHorizontal: 1.5,
  },

  // Tooltip
  tooltip: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: colors.gray[800],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    zIndex: 100,
  },
  tooltipText: {
    fontSize: fontSize.sm,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  todayCell: {
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  selectedCell: {
    borderWidth: 1.5,
    borderColor: colors.coral[500],
  },
  futureCell: {
    backgroundColor: colors.gray[50],
  },
  heatLevel0: {
    backgroundColor: colors.gray[100],
  },
  heatLevel1: {
    backgroundColor: colors.primary[100],
  },
  heatLevel2: {
    backgroundColor: colors.primary[200],
  },
  heatLevel3: {
    backgroundColor: colors.primary[300],
  },
  heatLevel4: {
    backgroundColor: colors.primary[400],
  },

  // 图例
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.sm,
  },

  // 日详情区域
  dayDetailSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dayDetailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayDetailTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  mainBadgeText: {
    fontSize: fontSize.xs,
    color: colors.cream[700],
    fontWeight: fontWeight.medium,
  },

  // 日结算卡
  dayStatsCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayStat: {
    alignItems: 'center',
  },
  dayStatValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary[500],
  },
  dayStatLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  dayStatDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
  },

  // 属性成长
  statGainsSection: {
    marginBottom: spacing.md,
  },
  sectionSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  statGainsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statGain: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statGainText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // 任务列表
  questsSection: {
    marginBottom: spacing.md,
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  questTitle: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    flex: 1,
  },

  // 无任务
  noQuestsSection: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  noQuestsText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
