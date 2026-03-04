"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Flame, Sword, Crown, Book, Shield, Star, Target, Briefcase } from "lucide-react"
import { Achievement } from "@/types"

type Props = {
  achievement: Achievement | null
  onClose: () => void
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

export function AchievementNotification({ achievement, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  if (!achievement) return null

  const Icon = iconMap[achievement.icon] || Trophy

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 w-80"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-black/20 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="text-sm font-semibold text-white">
                    🎉 新成就解锁！
                  </span>
                </div>
                <button
                  onClick={() => {
                    setVisible(false)
                    setTimeout(onClose, 300)
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-white/90">
                {achievement.description}
              </p>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 3 }}
              className="h-1 bg-white/30 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
