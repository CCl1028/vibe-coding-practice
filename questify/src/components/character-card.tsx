"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Coins, Zap, Brain, Target, Heart } from "lucide-react"
import { Character } from "@/types"
import { getExpForNextLevel } from "@/lib/rewards"
import { motion } from "framer-motion"

interface CharacterCardProps {
  character: Character
}

export function CharacterCard({ character }: CharacterCardProps) {
  const nextLevelExp = getExpForNextLevel(character.level)
  const progress = (character.exp / nextLevelExp) * 100

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-slate-900/90 to-purple-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{character.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {character.title}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">Lv.{character.level}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 经验条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">经验值</span>
            <span className="font-mono">
              {character.exp} / {nextLevelExp}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 金币 */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-muted-foreground">金币</span>
          </div>
          <span className="text-xl font-bold text-yellow-400">{character.gold}</span>
        </div>

        <Separator />

        {/* 属性 */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">属性</div>
          <div className="grid grid-cols-2 gap-3">
            <StatItem
              icon={<Zap className="w-4 h-4" />}
              label="力量"
              value={character.stats.strength}
              color="text-red-400"
            />
            <StatItem
              icon={<Brain className="w-4 h-4" />}
              label="智力"
              value={character.stats.intelligence}
              color="text-blue-400"
            />
            <StatItem
              icon={<Target className="w-4 h-4" />}
              label="专注"
              value={character.stats.focus}
              color="text-purple-400"
            />
            <StatItem
              icon={<Heart className="w-4 h-4" />}
              label="活力"
              value={character.stats.vitality}
              color="text-green-400"
            />
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-2">
        <motion.div
          key={`${label}-${value}`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
          className={color}
        >
          {icon}
        </motion.div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <motion.span
        key={value}
        initial={{ scale: 1.5, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`font-bold ${color}`}
      >
        {value}
      </motion.span>
    </div>
  )
}
