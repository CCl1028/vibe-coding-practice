"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AchievementBadge } from "@/components/achievement-badge"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Lock } from "lucide-react"
import { Achievement } from "@/types"
import {
  getAchievements,
  getAchievementStats,
  checkAndUnlockAchievements,
} from "@/lib/achievements"

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState({ total: 0, unlocked: 0, locked: 0 })
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all")

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = () => {
    // 检查并解锁成就
    checkAndUnlockAchievements()
    
    // 加载成就列表
    const all = getAchievements()
    setAchievements(all)
    setStats(getAchievementStats())
  }

  const filteredAchievements = achievements.filter((a) => {
    if (filter === "unlocked") return a.unlocked
    if (filter === "locked") return !a.unlocked
    return true
  })

  const unlockedPercentage = stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0

  return (
    <PageWrapper>
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* 头部统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            成就中心
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 解锁进度 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">解锁进度</span>
                <span className="font-mono">
                  {stats.unlocked} / {stats.total}
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${unlockedPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                />
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-secondary">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">总成就数</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                <div className="text-2xl font-bold text-yellow-500">
                  {stats.unlocked}
                </div>
                <div className="text-sm text-muted-foreground">已解锁</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary">
                <div className="text-2xl font-bold text-muted-foreground">
                  {stats.locked}
                </div>
                <div className="text-sm text-muted-foreground">未解锁</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 成就列表 */}
      <Card>
        <CardHeader>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">
                全部 ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="unlocked">
                <Trophy className="w-4 h-4 mr-1" />
                已解锁 ({stats.unlocked})
              </TabsTrigger>
              <TabsTrigger value="locked">
                <Lock className="w-4 h-4 mr-1" />
                未解锁 ({stats.locked})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {filter === "unlocked" && "还没有解锁任何成就"}
              {filter === "locked" && "所有成就都已解锁！"}
              {filter === "all" && "暂无成就"}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AchievementBadge achievement={achievement} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
      </div>
    </PageWrapper>
  )
}
