"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Coins, Star, Zap, Brain, Target, Heart, Sparkles } from "lucide-react"
import { Quest } from "@/types"

interface RewardModalProps {
  isOpen: boolean
  onClose: () => void
  quest: Quest & {
    expReward: number
    goldReward: number
    strReward: number
    intReward: number
    focReward: number
    vitReward: number
  }
  isMainQuest?: boolean
}

export function RewardModal({ isOpen, onClose, quest, isMainQuest = false }: RewardModalProps) {
  const statRewards = [
    { label: "力量", value: quest.strReward, icon: <Zap className="w-4 h-4" />, color: "text-red-400" },
    { label: "智力", value: quest.intReward, icon: <Brain className="w-4 h-4" />, color: "text-blue-400" },
    { label: "专注", value: quest.focReward, icon: <Target className="w-4 h-4" />, color: "text-purple-400" },
    { label: "活力", value: quest.vitReward, icon: <Heart className="w-4 h-4" />, color: "text-green-400" },
  ].filter((stat) => stat.value > 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-md ${
          isMainQuest
            ? "border-yellow-500/50 bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900"
            : "border-slate-700"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="space-y-6 py-4"
            >
              {/* 标题 */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center"
                >
                  {isMainQuest ? (
                    <Star className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                  ) : (
                    <Sparkles className="w-16 h-16 text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]" />
                  )}
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-3xl font-bold ${
                    isMainQuest ? "text-yellow-400" : "text-blue-400"
                  }`}
                >
                  {isMainQuest ? "主线任务完成！" : "任务完成！"}
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground"
                >
                  {quest.title}
                </motion.p>
              </div>

              {/* 奖励展示 */}
              <div className="space-y-4">
                {/* 经验值 */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-blue-400" />
                    <span className="text-lg font-semibold">经验值</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="text-2xl font-bold text-blue-400"
                  >
                    +{quest.expReward}
                  </motion.span>
                </motion.div>

                {/* 金币 */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <Coins className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                    <span className="text-lg font-semibold">金币</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="text-2xl font-bold text-yellow-400"
                  >
                    +{quest.goldReward}
                  </motion.span>
                </motion.div>

                {/* 属性提升 */}
                {statRewards.length > 0 && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-3"
                  >
                    <div className="text-sm font-semibold text-purple-400">属性提升</div>
                    <div className="grid grid-cols-2 gap-2">
                      {statRewards.map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.9 + index * 0.1, type: "spring" }}
                          className="flex items-center justify-between p-2 rounded bg-secondary/50"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                delay: 1 + index * 0.1,
                                duration: 0.5,
                              }}
                              className={stat.color}
                            >
                              {stat.icon}
                            </motion.div>
                            <span className="text-sm">{stat.label}</span>
                          </div>
                          <span className={`font-bold ${stat.color}`}>+{stat.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 确认按钮 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <Button
                  onClick={onClose}
                  className={`w-full ${
                    isMainQuest
                      ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  size="lg"
                >
                  太棒了！
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
