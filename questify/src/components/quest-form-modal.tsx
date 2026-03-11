"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Coins, Star } from "lucide-react"
import { QuestType, Difficulty, QuestTag } from "@prisma/client"
import { calculateRewards } from "@/lib/rewards"

interface QuestFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: QuestFormData) => Promise<void>
  initialData?: QuestFormData & { id?: string }
  mode: "create" | "edit"
}

export interface QuestFormData {
  title: string
  description?: string
  type: QuestType
  difficulty: Difficulty
  tag: QuestTag
  isToday: boolean
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

export function QuestFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: QuestFormModalProps) {
  const [formData, setFormData] = useState<QuestFormData>({
    title: "",
    description: "",
    type: "SIDE",
    difficulty: "MEDIUM",
    tag: "WORK",
    isToday: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        title: "",
        description: "",
        type: "SIDE",
        difficulty: "MEDIUM",
        tag: "WORK",
        isToday: true,
      })
    }
  }, [initialData, open])

  const rewards = calculateRewards(formData.difficulty, formData.type, formData.tag)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    try {
      await onSubmit(formData)
      // 不在这里关闭弹窗，让父组件控制
    } catch (error) {
      console.error("Failed to submit quest:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "创建新任务" : "编辑任务"}
          </DialogTitle>
          <DialogDescription>
            填写任务信息，系统会自动计算奖励
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              任务标题 <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="今天要完成什么？"
              required
            />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">任务描述（可选）</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="添加更多细节..."
              rows={3}
            />
          </div>

          {/* 类型、难度、标签 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="type">类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value: QuestType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">难度</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: Difficulty) =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag">标签</Label>
              <Select
                value={formData.tag}
                onValueChange={(value: QuestTag) =>
                  setFormData({ ...formData, tag: value })
                }
              >
                <SelectTrigger id="tag">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TAG_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 今日任务 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isToday"
              checked={formData.isToday}
              onChange={(e) =>
                setFormData({ ...formData, isToday: e.target.checked })
              }
              className="w-4 h-4 rounded border-slate-700 bg-slate-900"
            />
            <Label htmlFor="isToday" className="cursor-pointer">
              加入今日任务
            </Label>
          </div>

          {/* 奖励预览 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-sm font-medium mb-2">奖励预览</div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Star className="w-4 h-4" />
                <span className="font-medium">+{rewards.expReward} EXP</span>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Coins className="w-4 h-4" />
                <span className="font-medium">+{rewards.goldReward}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {rewards.statReward.strength > 0 && "力量 +1"}
                {rewards.statReward.intelligence > 0 && "知识 +1"}
                {rewards.statReward.focus > 0 && "专注 +1"}
                {rewards.statReward.vitality > 0 && "活力 +1"}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading
                ? "保存中..."
                : mode === "create"
                ? "创建任务"
                : "保存修改"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
