"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Coins, Zap } from "lucide-react"

type Props = {
  completedQuests: number
  totalExp: number
  totalGold: number
  mainQuestCompleted: boolean
}

export function DailyStatsCards({
  completedQuests,
  totalExp,
  totalGold,
  mainQuestCompleted,
}: Props) {
  const stats = [
    {
      label: "已完成",
      value: completedQuests,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      label: "获得 EXP",
      value: totalExp,
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "获得 Gold",
      value: totalGold,
      icon: Coins,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* 主线任务状态 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className={
            mainQuestCompleted
              ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50"
              : ""
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`text-3xl ${
                  mainQuestCompleted ? "animate-bounce" : ""
                }`}
              >
                {mainQuestCompleted ? "✅" : "⬜"}
              </div>
              <div>
                <div className="text-sm font-bold">
                  {mainQuestCompleted ? "主线完成" : "主线未完成"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mainQuestCompleted ? "保持 Streak!" : "今天加油！"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
