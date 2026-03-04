"use client"

import { useEffect, useState } from "react"
import { CharacterCard } from "@/components/character-card"
import { QuestCard } from "@/components/quest-card"
import { QuickAddQuest } from "@/components/quick-add-quest"
import { QuestFormModal, QuestFormData } from "@/components/quest-form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { RewardModal } from "@/components/reward-modal"
import { LevelUpModal } from "@/components/level-up-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Coins, Star, Zap } from "lucide-react"
import { Character, Quest } from "@/types"
import { QuestStatus } from "@prisma/client"
import { calculateLevel, getTitleForLevel, calculateRewards, getExpForNextLevel } from "@/lib/rewards"
import { updateTodayReward } from "@/lib/daily-rewards"

export default function DashboardPage() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuest, setEditingQuest] = useState<any | null>(null)
  const [questFormOpen, setQuestFormOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [questToDelete, setQuestToDelete] = useState<string | null>(null)
  
  // 奖励弹窗状态
  const [rewardModalOpen, setRewardModalOpen] = useState(false)
  const [completedQuest, setCompletedQuest] = useState<any | null>(null)
  
  // 升级弹窗状态
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{
    oldLevel: number
    newLevel: number
    newTitle: string
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [characterRes, questsRes] = await Promise.all([
        fetch("/api/character"),
        fetch("/api/quests?isToday=true"),
      ])

      const characterData = await characterRes.json()
      const questsData = await questsRes.json()

      setCharacter({
        ...characterData,
        stats: {
          strength: characterData.stats.strength,
          intelligence: characterData.stats.intelligence,
          focus: characterData.stats.focus,
          vitality: characterData.stats.vitality,
        },
      })
      setQuests(questsData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteQuest = async (id: string, newStatus: QuestStatus) => {
    try {
      const quest = quests.find((q) => q.id === id)
      if (!quest) return

      // 更新任务状态
      await fetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          completedAt: newStatus === "DONE" ? new Date().toISOString() : undefined,
        }),
      })

      // 如果完成任务，显示奖励弹窗并更新角色数据
      if (newStatus === "DONE" && character) {
        // 先显示奖励弹窗
        setCompletedQuest(quest)
        setRewardModalOpen(true)

        const newExp = character.exp + quest.expReward
        const newGold = character.gold + quest.goldReward
        const newStats = {
          strength: character.stats.strength + (quest.strReward || 0),
          intelligence: character.stats.intelligence + (quest.intReward || 0),
          focus: character.stats.focus + (quest.focReward || 0),
          vitality: character.stats.vitality + (quest.vitReward || 0),
        }

        // 更新今日奖励追踪
        updateTodayReward({
          exp: quest.expReward,
          gold: quest.goldReward,
          stats: {
            strength: quest.strReward || 0,
            intelligence: quest.intReward || 0,
            focus: quest.focReward || 0,
            vitality: quest.vitReward || 0,
          },
          isMainQuest: quest.type === "MAIN",
        })

        // 检查是否升级
        const oldLevel = character.level
        const nextLevelExp = getExpForNextLevel(oldLevel)
        let finalLevel = oldLevel
        let finalExp = newExp

        if (newExp >= nextLevelExp) {
          // 升级了
          const levelData = calculateLevel(newExp)
          finalLevel = levelData.level
          finalExp = levelData.currentExp
          
          // 准备升级弹窗数据
          setLevelUpData({
            oldLevel,
            newLevel: finalLevel,
            newTitle: getTitleForLevel(finalLevel),
          })
        }

        // 更新角色数据
        await fetch("/api/character", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exp: finalExp,
            gold: newGold,
            level: finalLevel,
            title: getTitleForLevel(finalLevel),
            strength: newStats.strength,
            intelligence: newStats.intelligence,
            focus: newStats.focus,
            vitality: newStats.vitality,
          }),
        })

        // 重新加载数据
        await loadData()
      } else {
        // 只是状态切换，直接重新加载
        await loadData()
      }
    } catch (error) {
      console.error("Failed to update quest:", error)
    }
  }

  const handleRewardModalClose = () => {
    setRewardModalOpen(false)
    setCompletedQuest(null)
    
    // 如果有升级，显示升级弹窗
    if (levelUpData) {
      setTimeout(() => {
        setLevelUpModalOpen(true)
      }, 300)
    }
  }

  const handleLevelUpModalClose = () => {
    setLevelUpModalOpen(false)
    setLevelUpData(null)
  }

  const handleQuickAdd = async (title: string) => {
    const formData: QuestFormData = {
      title,
      type: "SIDE",
      difficulty: "MEDIUM",
      tag: "WORK",
      isToday: true,
    }
    await handleCreateQuest(formData)
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

      await loadData()
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
      await loadData()
    } catch (error) {
      console.error("Failed to edit quest:", error)
    }
  }

  const openEditDialog = (id: string) => {
    const quest = quests.find((q) => q.id === id)
    if (quest) {
      setEditingQuest(quest)
      setQuestFormOpen(true)
    }
  }

  const handleDeleteQuest = async (id: string) => {
    const quest = quests.find((q) => q.id === id)
    if (quest?.type === "MAIN") {
      // 主线任务需要特殊确认
      setQuestToDelete(id)
      setDeleteConfirmOpen(true)
    } else {
      await confirmDelete(id)
    }
  }

  const confirmDelete = async (id?: string) => {
    const deleteId = id || questToDelete
    if (!deleteId) return

    try {
      await fetch(`/api/quests/${deleteId}`, { method: "DELETE" })
      await loadData()
      setQuestToDelete(null)
    } catch (error) {
      console.error("Failed to delete quest:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  if (!character) {
    return <div className="text-center py-12">角色数据加载失败</div>
  }

  const mainQuest = quests.find((q) => q.type === "MAIN" && q.status !== "DONE")
  const sideQuests = quests.filter((q) => q.type !== "MAIN")
  const completedToday = quests.filter((q) => q.status === "DONE").length
  const todayExp = quests
    .filter((q) => q.status === "DONE")
    .reduce((sum, q) => sum + q.expReward, 0)
  const todayGold = quests
    .filter((q) => q.status === "DONE")
    .reduce((sum, q) => sum + q.goldReward, 0)

  return (
    <div className="space-y-6">
      {/* 快速添加任务 */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <QuickAddQuest onAdd={handleQuickAdd} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 角色卡 */}
        <div className="lg:col-span-1">
          <CharacterCard character={character} />
        </div>

        {/* 今日成长统计 */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="已完成"
            value={completedToday}
            color="text-green-400"
          />
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="今日 EXP"
            value={`+${todayExp}`}
            color="text-blue-400"
          />
          <StatCard
            icon={<Coins className="w-5 h-5" />}
            label="今日金币"
            value={`+${todayGold}`}
            color="text-yellow-400"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="连续天数"
            value="1"
            color="text-purple-400"
          />
        </div>
      </div>

      {/* 主线任务 */}
      {mainQuest && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            今日主线
          </h2>
          <QuestCard
            quest={mainQuest}
            onStatusChange={handleCompleteQuest}
            onEdit={openEditDialog}
            onDelete={handleDeleteQuest}
          />
        </div>
      )}

      <Separator />

      {/* 支线任务 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">支线任务</h2>
        {sideQuests.length > 0 ? (
          <div className="space-y-3">
            {sideQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStatusChange={handleCompleteQuest}
                onEdit={openEditDialog}
                onDelete={handleDeleteQuest}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无支线任务，前往任务面板创建新任务吧！
            </CardContent>
          </Card>
        )}
      </div>

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

      {/* 奖励结算弹窗 */}
      {completedQuest && (
        <RewardModal
          isOpen={rewardModalOpen}
          onClose={handleRewardModalClose}
          quest={completedQuest}
          isMainQuest={completedQuest.type === "MAIN"}
        />
      )}

      {/* 升级弹窗 */}
      {levelUpData && (
        <LevelUpModal
          isOpen={levelUpModalOpen}
          onClose={handleLevelUpModalClose}
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          newTitle={levelUpData.newTitle}
        />
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={color}>{icon}</div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
