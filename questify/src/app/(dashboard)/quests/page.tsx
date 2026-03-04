"use client"

import { useEffect, useState } from "react"
import { QuestCard } from "@/components/quest-card"
import { QuestFormModal, QuestFormData } from "@/components/quest-form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ListTodo, Plus, Filter } from "lucide-react"
import { QuestType, Difficulty, QuestStatus } from "@prisma/client"
import { calculateRewards } from "@/lib/rewards"

type FilterType = "ALL" | QuestType
type FilterStatus = "ALL" | "TODO" | "DONE"

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [questFormOpen, setQuestFormOpen] = useState(false)
  const [editingQuest, setEditingQuest] = useState<any | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [questToDelete, setQuestToDelete] = useState<string | null>(null)
  
  // 筛选状态
  const [filterType, setFilterType] = useState<FilterType>("ALL")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL")
  const [showTodayOnly, setShowTodayOnly] = useState(false)

  useEffect(() => {
    loadQuests()
  }, [])

  const loadQuests = async () => {
    try {
      const res = await fetch("/api/quests")
      const data = await res.json()
      setQuests(data)
    } catch (error) {
      console.error("Failed to load quests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuest = async (data: QuestFormData) => {
    try {
      const rewards = calculateRewards(data.difficulty, data.type, data.tag)
      
      await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          expReward: rewards.expReward,
          goldReward: rewards.goldReward,
          strReward: rewards.statReward.strength,
          intReward: rewards.statReward.intelligence,
          focReward: rewards.statReward.focus,
          vitReward: rewards.statReward.vitality,
        }),
      })

      await loadQuests()
    } catch (error) {
      console.error("Failed to create quest:", error)
    }
  }

  const handleEditQuest = async (data: QuestFormData) => {
    if (!editingQuest) return

    try {
      const rewards = calculateRewards(data.difficulty, data.type, data.tag)

      await fetch(`/api/quests/${editingQuest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          expReward: rewards.expReward,
          goldReward: rewards.goldReward,
          strReward: rewards.statReward.strength,
          intReward: rewards.statReward.intelligence,
          focReward: rewards.statReward.focus,
          vitReward: rewards.statReward.vitality,
        }),
      })

      setEditingQuest(null)
      await loadQuests()
    } catch (error) {
      console.error("Failed to edit quest:", error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: QuestStatus) => {
    try {
      await fetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          completedAt: newStatus === "DONE" ? new Date().toISOString() : undefined
        }),
      })

      await loadQuests()
    } catch (error) {
      console.error("Failed to update quest:", error)
    }
  }

  const openEditDialog = (id: string) => {
    const quest = quests.find((q) => q.id === id)
    if (quest) {
      setEditingQuest(quest)
      setQuestFormOpen(true)
    }
  }

  const handleDeleteQuest = (id: string) => {
    const quest = quests.find((q) => q.id === id)
    if (quest?.type === "MAIN") {
      setQuestToDelete(id)
      setDeleteConfirmOpen(true)
    } else {
      confirmDelete(id)
    }
  }

  const confirmDelete = async (id?: string) => {
    const deleteId = id || questToDelete
    if (!deleteId) return

    try {
      await fetch(`/api/quests/${deleteId}`, { method: "DELETE" })
      await loadQuests()
      setQuestToDelete(null)
    } catch (error) {
      console.error("Failed to delete quest:", error)
    }
  }

  // 筛选逻辑
  const filteredQuests = quests.filter((quest) => {
    if (filterType !== "ALL" && quest.type !== filterType) return false
    if (filterStatus === "TODO" && quest.status === "DONE") return false
    if (filterStatus === "DONE" && quest.status !== "DONE") return false
    if (showTodayOnly && !quest.isToday) return false
    return true
  })

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListTodo className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold">任务面板</h1>
        </div>
        <Button onClick={() => setQuestFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建任务
        </Button>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* 类型筛选 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>任务类型</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterBadge
                  active={filterType === "ALL"}
                  onClick={() => setFilterType("ALL")}
                >
                  全部
                </FilterBadge>
                <FilterBadge
                  active={filterType === "MAIN"}
                  onClick={() => setFilterType("MAIN")}
                >
                  主线任务
                </FilterBadge>
                <FilterBadge
                  active={filterType === "SIDE"}
                  onClick={() => setFilterType("SIDE")}
                >
                  支线任务
                </FilterBadge>
                <FilterBadge
                  active={filterType === "DAILY"}
                  onClick={() => setFilterType("DAILY")}
                >
                  日常任务
                </FilterBadge>
                <FilterBadge
                  active={filterType === "CHALLENGE"}
                  onClick={() => setFilterType("CHALLENGE")}
                >
                  挑战任务
                </FilterBadge>
              </div>
            </div>

            {/* 状态筛选 */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">任务状态</div>
              <div className="flex flex-wrap gap-2">
                <FilterBadge
                  active={filterStatus === "ALL"}
                  onClick={() => setFilterStatus("ALL")}
                >
                  全部
                </FilterBadge>
                <FilterBadge
                  active={filterStatus === "TODO"}
                  onClick={() => setFilterStatus("TODO")}
                >
                  未完成
                </FilterBadge>
                <FilterBadge
                  active={filterStatus === "DONE"}
                  onClick={() => setFilterStatus("DONE")}
                >
                  已完成
                </FilterBadge>
              </div>
            </div>

            {/* 其他筛选 */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">其他筛选</div>
              <div className="flex flex-wrap gap-2">
                <FilterBadge
                  active={showTodayOnly}
                  onClick={() => setShowTodayOnly(!showTodayOnly)}
                >
                  今日任务
                </FilterBadge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 任务统计 */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>共 {filteredQuests.length} 个任务</span>
        <span>•</span>
        <span>
          未完成 {filteredQuests.filter((q) => q.status !== "DONE").length}
        </span>
        <span>•</span>
        <span>已完成 {filteredQuests.filter((q) => q.status === "DONE").length}</span>
      </div>

      {/* 任务列表 */}
      {filteredQuests.length > 0 ? (
        <div className="space-y-3">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onStatusChange={handleStatusChange}
              onEdit={openEditDialog}
              onDelete={handleDeleteQuest}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {quests.length === 0
              ? "还没有任务，点击上方「新建任务」按钮创建第一个任务吧！"
              : "没有符合筛选条件的任务"}
          </CardContent>
        </Card>
      )}

      {/* 任务表单弹窗 */}
      <QuestFormModal
        open={questFormOpen}
        onOpenChange={(open) => {
          setQuestFormOpen(open)
          if (!open) setEditingQuest(null)
        }}
        onSubmit={editingQuest ? handleEditQuest : handleCreateQuest}
        initialData={editingQuest}
        mode={editingQuest ? "edit" : "create"}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={() => confirmDelete()}
        title="删除主线任务"
        description="删除主线任务会影响今日成长，确定要删除吗？"
        confirmText="确认删除"
        variant="destructive"
      />
    </div>
  )
}

function FilterBadge({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={`cursor-pointer transition-all ${
        active
          ? "bg-purple-600 text-white hover:bg-purple-700"
          : "hover:bg-slate-800"
      }`}
      onClick={onClick}
    >
      {children}
    </Badge>
  )
}
