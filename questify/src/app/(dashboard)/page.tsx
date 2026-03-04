"use client"

import { useEffect, useState } from "react"
import { CharacterCard } from "@/components/character-card"
import { QuestCard } from "@/components/quest-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Coins, Star, Zap } from "lucide-react"
import { Character, Quest } from "@/types"
import { calculateLevel, getTitleForLevel } from "@/lib/rewards"

export default function DashboardPage() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleCompleteQuest = async (id: string) => {
    try {
      const quest = quests.find((q) => q.id === id)
      if (!quest) return

      // 更新任务状态
      await fetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      })

      // 更新角色数据
      if (character) {
        const newExp = character.exp + quest.expReward
        const newGold = character.gold + quest.goldReward
        const levelData = calculateLevel(newExp)

        await fetch("/api/character", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exp: newExp,
            gold: newGold,
            level: levelData.level,
            title: getTitleForLevel(levelData.level),
            strength: character.stats.strength + (quest.strReward || 0),
            intelligence: character.stats.intelligence + (quest.intReward || 0),
            focus: character.stats.focus + (quest.focReward || 0),
            vitality: character.stats.vitality + (quest.vitReward || 0),
          }),
        })
      }

      // 重新加载数据
      await loadData()
    } catch (error) {
      console.error("Failed to complete quest:", error)
    }
  }

  const handleDeleteQuest = async (id: string) => {
    try {
      await fetch(`/api/quests/${id}`, { method: "DELETE" })
      await loadData()
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
            onComplete={handleCompleteQuest}
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
                onComplete={handleCompleteQuest}
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
