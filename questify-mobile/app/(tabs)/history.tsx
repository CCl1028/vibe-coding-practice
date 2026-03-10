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
  Dimensions,
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

type YearMonth = {
  year: number;
  month: number; // 1-12
};

// ============ 常量 ============

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = spacing.md * 2;
const CELL_GAP = 4;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - spacing.lg * 2 - CALENDAR_PADDING - CELL_GAP * 6) / 7);

// 起始月份：2026年2月
const START_YEAR = 2026;
const START_MONTH = 2;

// ============ 工具函数 ============

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDay = WEEK_DAYS[date.getDay()];
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
 * 获取当前年月
 */
function getCurrentYearMonth(): YearMonth {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

/**
 * 比较两个年月
 * 返回: -1 (a < b), 0 (a == b), 1 (a > b)
 */
function compareYearMonth(a: YearMonth, b: YearMonth): number {
  if (a.year !== b.year) {
    return a.year < b.year ? -1 : 1;
  }
  if (a.month !== b.month) {
    return a.month < b.month ? -1 : 1;
  }
  return 0;
}

/**
 * 获取上一个月
 */
function getPrevMonth(ym: YearMonth): YearMonth {
  if (ym.month === 1) {
    return { year: ym.year - 1, month: 12 };
  }
  return { year: ym.year, month: ym.month - 1 };
}

/**
 * 获取下一个月
 */
function getNextMonth(ym: YearMonth): YearMonth {
  if (ym.month === 12) {
    return { year: ym.year + 1, month: 1 };
  }
  return { year: ym.year, month: ym.month + 1 };
}

/**
 * 获取指定月份的日历数据
 */
function getMonthWeeks(year: number, month: number): { weeks: string[][]; allDates: string[] } {
  const allDates: string[] = [];
  
  // 获取该月第一天和最后一天
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  
  // 生成该月所有日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    allDates.push(getDateString(date));
  }
  
  // 按周组织
  const weeks: string[][] = [];
  let currentWeek: string[] = [];
  
  // 第一天是周几
  const firstDayOfWeek = firstDay.getDay();
  
  // 补齐第一周前面的空位
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push('');
  }
  
  for (const date of allDates) {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // 补齐最后一周后面的空位
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push('');
    }
    weeks.push(currentWeek);
  }
  
  return { weeks, allDates };
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
  
  // 当前选中的年月
  const [currentYM, setCurrentYM] = useState<YearMonth>(getCurrentYearMonth());
  
  // 起始和结束月份
  const startYM: YearMonth = { year: START_YEAR, month: START_MONTH };
  const endYM: YearMonth = getCurrentYearMonth();
  
  // 是否可以切换上/下月
  const canGoPrev = compareYearMonth(currentYM, startYM) > 0;
  const canGoNext = compareYearMonth(currentYM, endYM) < 0;
  
  // 当前月份的日历数据
  const { weeks, allDates } = useMemo(
    () => getMonthWeeks(currentYM.year, currentYM.month),
    [currentYM.year, currentYM.month]
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

      // 计算 KPIs（当前月份）
      let totalExp = 0;
      let completedCount = 0;
      let mainCompletedDays = 0;
      let longestStreak = 0;
      let currentStreak = 0;

      for (const date of allDates) {
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

      setKPIs({
        totalExp,
        completedCount,
        mainCompletedDays,
        mainCompletionRate: allDates.length > 0 ? mainCompletedDays / allDates.length : 0,
        longestStreak,
        daysInRange: allDates.length,
      });
    } catch (error) {
      console.error('加载历史数据失败:', error);
    }
  }, [allDates]);

  // 当月份变化时，重置选中日期
  useEffect(() => {
    // 如果是当前月，选中今天
    const today = getDateString(new Date());
    const todayYM = getCurrentYearMonth();
    
    if (currentYM.year === todayYM.year && currentYM.month === todayYM.month) {
      setSelectedDate(today);
    } else {
      // 否则选中该月第一天
      setSelectedDate(allDates[0] || null);
    }
  }, [currentYM.year, currentYM.month, allDates]);

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
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setCurrentYM(getPrevMonth(currentYM));
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setCurrentYM(getNextMonth(currentYM));
    }
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

        {/* 热力图日历 */}
        <View style={styles.calendarSection}>
          {/* 月份选择器 */}
          <View style={styles.monthSelector}>
            <Pressable
              style={[styles.monthArrow, !canGoPrev && styles.monthArrowDisabled]}
              onPress={handlePrevMonth}
              disabled={!canGoPrev}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={canGoPrev ? colors.primary[500] : colors.gray[300]}
              />
            </Pressable>
            
            <View style={styles.monthTitleContainer}>
              <Text style={styles.monthTitle}>
                {currentYM.year}年{MONTH_NAMES[currentYM.month - 1]}
              </Text>
              {currentYM.year === getCurrentYearMonth().year && 
               currentYM.month === getCurrentYearMonth().month && (
                <View style={styles.currentMonthBadge}>
                  <Text style={styles.currentMonthBadgeText}>本月</Text>
                </View>
              )}
            </View>
            
            <Pressable
              style={[styles.monthArrow, !canGoNext && styles.monthArrowDisabled]}
              onPress={handleNextMonth}
              disabled={!canGoNext}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={canGoNext ? colors.primary[500] : colors.gray[300]}
              />
            </Pressable>
          </View>
          
          {/* 星期标题 */}
          <View style={styles.weekHeader}>
            {WEEK_DAYS.map((day) => (
              <View key={day} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* 日历网格 */}
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.calendarRow}>
              {week.map((date, dayIndex) => {
                if (!date) {
                  // 空白格子
                  return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.emptyCell} />;
                }
                
                const summary = summaries.get(date);
                const level = summary ? getExpLevel(summary.expEarned) : 0;
                const isToday = date === getDateString(new Date());
                const isSelected = date === selectedDate;
                const hasMain = summary?.mainCompleted;
                
                // 判断是否是未来日期
                // 使用 date 字符串解析时需要确保时区一致
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
                      styles.calendarCell,
                      isFuture ? styles.futureCell : heatLevelStyles[level],
                      isToday && styles.todayCell,
                      isSelected && styles.selectedCell,
                    ]}
                    onPress={() => !isFuture && handleDayPress(date)}
                    disabled={isFuture}
                  >
                    <Text style={[
                      styles.cellDay,
                      isFuture && styles.futureCellText,
                      isSelected && styles.selectedCellText,
                    ]}>
                      {new Date(date).getDate()}
                    </Text>
                    {hasMain && (
                      <View style={styles.cellBadge}>
                        <Ionicons name="medal" size={8} color={colors.cream[600]} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

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
                        智力 +{selectedSummary.statGains.intelligence}
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
  
  // 月份选择器
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthArrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
  },
  monthArrowDisabled: {
    backgroundColor: colors.gray[50],
  },
  monthTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  currentMonthBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  currentMonthBadgeText: {
    fontSize: fontSize.xs,
    color: colors.primary[600],
    fontWeight: fontWeight.medium,
  },
  
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekDayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CELL_GAP,
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  calendarCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDay: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  cellBadge: {
    position: 'absolute',
    bottom: 1,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: colors.coral[500],
    backgroundColor: colors.coral[100],
  },
  selectedCellText: {
    color: colors.coral[700],
    fontWeight: fontWeight.bold,
  },
  futureCell: {
    backgroundColor: colors.gray[50],
  },
  futureCellText: {
    color: colors.gray[300],
  },
  heatLevel0: {
    backgroundColor: colors.gray[100],
  },
  heatLevel1: {
    backgroundColor: colors.mint[200],
  },
  heatLevel2: {
    backgroundColor: colors.mint[300],
  },
  heatLevel3: {
    backgroundColor: colors.mint[400],
  },
  heatLevel4: {
    backgroundColor: colors.mint[500],
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
    width: 14,
    height: 14,
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
