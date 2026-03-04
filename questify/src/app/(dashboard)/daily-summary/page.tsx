"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Coins,
  Star,
  Zap,
  Brain,
  Target,
  Heart,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { getTodayReward, DailyReward } from "@/lib/daily-rewards"
import { useRouter } from "next/navigation"

export default function DailySummaryPage() {
  const [todayReward, setTodayReward] = useState<DailyReward | null>(null)
  const router = useRouter()

  useEffect(() => {
    const reward = getTodayReward()
    setTodayReward(reward)
  }, [])

  if (!todayReward) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const hasCompletedQuests = todayReward.completedQuests > 0
  const hasMainQuest = todayReward.mainQuestCompleted

  return (
    <PageWrapper>
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold">今日结算</h1>
        <p className="text-muted-foreground">
          {hasCompletedQuests
            ? hasMainQuest
              ? "今天的冒险圆满结束！🎉"
              : "今天也有不错的收获！"
            : "今天还没有完成任何任务"}
        </p>
      </motion.div>

      {/* 今日任务完成情况 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              今日任务完成情况
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary text-center">
                <div className="text-3xl font-bold">
                  {todayReward.completedQuests}
                </div>
                <div className="text-sm text-muted-foreground">完成任务数</div>
              </div>
              <div
                className={`p-4 rounded-lg text-center ${
                  hasMainQuest
                    ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50"
                    : "bg-secondary"
                }`}
              >
                <div className="text-3xl font-bold">
                  {hasMainQuest ? "✅" : "⬜"}
                </div>
                <div className="text-sm text-muted-foreground">
                  主线任务{hasMainQuest ? "已完成" : "未完成"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 今日奖励 */}
      {hasCompletedQuests && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                今日奖励
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Zap className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      +{todayReward.totalExp}
                    </div>
                    <div className="text-sm text-muted-foreground">EXP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      +{todayReward.totalGold}
                    </div>
                    <div className="text-sm text-muted-foreground">Gold</div>
                  </div>
                </div>
              </div>

              {/* 属性提升 */}
              <Separator className="my-4" />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  属性提升
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {todayReward.totalStats.strength > 0 && (
                    <StatItem
                      icon={<Zap className="w-4 h-4" />}
                      label="力量"
                      value={todayReward.totalStats.strength}
                      color="text-red-500"
                    />
                  )}
                  {todayReward.totalStats.intelligence > 0 && (
                    <StatItem
                      icon={<Brain className="w-4 h-4" />}
                      label="智力"
                      value={todayReward.totalStats.intelligence}
                      color="text-blue-500"
                    />
                  )}
                  {todayReward.totalStats.focus > 0 && (
                    <StatItem
                      icon={<Target className="w-4 h-4" />}
                      label="专注"
                      value={todayReward.totalStats.focus}
                      color="text-purple-500"
                    />
                  )}
                  {todayReward.totalStats.vitality > 0 && (
                    <StatItem
                      icon={<Heart className="w-4 h-4" />}
                      label="体力"
                      value={todayReward.totalStats.vitality}
                      color="text-green-500"
                    />
                  )}
                </div>
                {Object.values(todayReward.totalStats).every((v) => v === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    今日未获得属性提升
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 明日建议 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              明日建议
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!hasMainQuest && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm">
                  💡 推荐明天设置一个新的主线任务，保持你的成长 Streak！
                </p>
              </div>
            )}
            {hasMainQuest && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm">
                  🔥 太棒了！继续保持你的主线 Streak，每天一小步，成就大未来！
                </p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm">
                📊 查看成就中心，看看还有哪些成就可以解锁！
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 返回按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-4"
      >
        <Button onClick={() => router.push("/")}>返回首页</Button>
        <Button
          variant="outline"
          onClick={() => router.push("/achievements")}
        >
          查看成就
        </Button>
      </motion.div>
      </div>
    </PageWrapper>
  )
}

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-secondary">
      <div className={color}>{icon}</div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`ml-auto font-bold ${color}`}>+{value}</span>
    </div>
  )
}
