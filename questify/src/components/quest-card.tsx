"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Coins, Star, CheckCircle2, Circle, Trash2, Edit, PlayCircle } from "lucide-react"
import { Quest } from "@/types"
import { QuestStatus } from "@prisma/client"

interface QuestCardProps {
  quest: Quest & {
    expReward: number
    goldReward: number
    strReward: number
    intReward: number
    focReward: number
    vitReward: number
  }
  onStatusChange?: (id: string, status: QuestStatus) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const TYPE_LABELS = {
  MAIN: "主线任务",
  SIDE: "支线任务",
  DAILY: "日常任务",
  CHALLENGE: "挑战任务",
}

const DIFFICULTY_LABELS = {
  EASY: "简单",
  MEDIUM: "中等",
  HARD: "困难",
}

const TAG_LABELS = {
  STUDY: "学习",
  WORK: "工作",
  HEALTH: "健身",
  LIFE: "生活",
}

const TYPE_COLORS = {
  MAIN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  SIDE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DAILY: "bg-green-500/20 text-green-400 border-green-500/30",
  CHALLENGE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

const DIFFICULTY_COLORS = {
  EASY: "bg-green-500/20 text-green-400",
  MEDIUM: "bg-yellow-500/20 text-yellow-400",
  HARD: "bg-red-500/20 text-red-400",
}

const QuestCardComponent = ({ quest, onStatusChange, onEdit, onDelete }: QuestCardProps) => {
  const isCompleted = quest.status === "DONE"
  const isMain = quest.type === "MAIN"

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        isMain
          ? "border-yellow-500/40 bg-gradient-to-br from-yellow-900/10 to-transparent"
          : ""
      } ${isCompleted ? "opacity-60" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            {/* 标题 */}
            <div className="flex items-start gap-2">
              <button
                onClick={() => onStatusChange?.(quest.id, isCompleted ? "DOING" : "DONE")}
                className="cursor-pointer"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5 hover:text-green-400 transition-colors" />
                )}
              </button>
              <h3 className={`font-semibold ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                {quest.title}
              </h3>
            </div>

            {/* 描述 */}
            {quest.description && (
              <p className="text-sm text-muted-foreground ml-7">{quest.description}</p>
            )}

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 ml-7">
              <Badge className={TYPE_COLORS[quest.type]} variant="outline">
                {isMain && <Star className="w-3 h-3 mr-1" />}
                {TYPE_LABELS[quest.type]}
              </Badge>
              <Badge className={DIFFICULTY_COLORS[quest.difficulty]} variant="outline">
                {DIFFICULTY_LABELS[quest.difficulty]}
              </Badge>
              <Badge variant="secondary">{TAG_LABELS[quest.tag]}</Badge>
            </div>

            {/* 奖励 */}
            <div className="flex gap-4 ml-7 text-sm">
              <div className="flex items-center gap-1 text-blue-400">
                <Star className="w-4 h-4" />
                <span>+{quest.expReward} EXP</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Coins className="w-4 h-4" />
                <span>+{quest.goldReward}</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-2">
            {!isCompleted && onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(quest.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(quest.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 使用 memo 优化，仅在 quest.id 或 quest.status 改变时重新渲染
export const QuestCard = memo(QuestCardComponent, (prev, next) => {
  return (
    prev.quest.id === next.quest.id &&
    prev.quest.status === next.quest.status &&
    prev.quest.title === next.quest.title &&
    prev.quest.type === next.quest.type &&
    prev.quest.difficulty === next.quest.difficulty &&
    prev.quest.tag === next.quest.tag &&
    prev.quest.description === next.quest.description
  )
})