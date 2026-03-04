"use client"

import { motion } from "framer-motion"
import { Trophy, Flame, Sword, Crown, Book, Shield, Star, Target, Briefcase } from "lucide-react"
import { Achievement } from "@/types"
import { Progress } from "@/components/ui/progress"

type Props = {
  achievement: Achievement
  onClick?: () => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sword: Sword,
  crown: Crown,
  fire: Flame,
  flame: Flame,
  book: Book,
  shield: Shield,
  star: Star,
  trophy: Trophy,
  target: Target,
  briefcase: Briefcase,
}

export function AchievementBadge({ achievement, onClick }: Props) {
  const Icon = iconMap[achievement.icon] || Trophy
  const progress = (achievement.progress / achievement.target) * 100

  return (
    <motion.div
      whileHover={{ scale: achievement.unlocked ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative rounded-lg p-4 cursor-pointer transition-all
        ${achievement.unlocked 
          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50' 
          : 'bg-secondary border-2 border-border'
        }
      `}
    >
      {/* 已解锁光效 */}
      {achievement.unlocked && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg"
        />
      )}

      <div className="relative flex flex-col items-center gap-3">
        {/* 图标 */}
        <motion.div
          animate={
            achievement.unlocked
              ? {
                  rotate: [0, 5, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${achievement.unlocked 
              ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
              : 'bg-secondary'
            }
          `}
        >
          <Icon
            className={`w-8 h-8 ${
              achievement.unlocked ? 'text-white' : 'text-muted-foreground'
            }`}
          />
        </motion.div>

        {/* 标题 */}
        <h3
          className={`text-sm font-bold text-center ${
            achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {achievement.title}
        </h3>

        {/* 描述 */}
        <p className="text-xs text-muted-foreground text-center line-clamp-2">
          {achievement.description}
        </p>

        {/* 进度 */}
        {!achievement.unlocked && (
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>进度</span>
              <span>
                {achievement.progress} / {achievement.target}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* 解锁时间 */}
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="text-xs text-muted-foreground">
            {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
