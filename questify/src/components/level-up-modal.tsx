"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, Sparkles } from "lucide-react"

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  oldLevel: number
  newLevel: number
  newTitle: string
}

export function LevelUpModal({ isOpen, onClose, oldLevel, newLevel, newTitle }: LevelUpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-yellow-500/50 bg-gradient-to-br from-slate-900 via-yellow-900/30 to-slate-900 shadow-2xl shadow-yellow-500/20">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="space-y-8 py-8"
            >
              {/* 背景光效 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-400/20 to-yellow-500/10 rounded-lg pointer-events-none"
              />

              {/* 顶部图标 */}
              <div className="text-center space-y-4 relative">
                {/* 星星装饰 */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 360],
                      x: [0, Math.cos((i * Math.PI) / 3) * 100],
                      y: [0, Math.sin((i * Math.PI) / 3) * 100],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.2 + i * 0.1,
                      ease: "easeOut",
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                ))}

                {/* 主图标 */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="flex justify-center relative z-10"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
                  </motion.div>
                </motion.div>

                {/* Level Up 文字 */}
                <motion.h2
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                  className="relative z-10"
                >
                  <motion.span
                    animate={{
                      textShadow: [
                        "0 0 20px rgba(250, 204, 21, 0.8)",
                        "0 0 40px rgba(250, 204, 21, 1)",
                        "0 0 20px rgba(250, 204, 21, 0.8)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-5xl font-bold text-yellow-400"
                  >
                    Level Up!
                  </motion.span>
                </motion.h2>
              </div>

              {/* 等级变化 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-6"
              >
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-slate-400">Lv.{oldLevel}</div>
                  <div className="text-sm text-muted-foreground mt-1">旧等级</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                >
                  <div className="text-3xl text-yellow-400">→</div>
                </motion.div>

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      delay: 1.2,
                      duration: 0.5,
                      repeat: 2,
                    }}
                    className="text-4xl font-bold text-yellow-400"
                  >
                    Lv.{newLevel}
                  </motion.div>
                  <div className="text-sm text-muted-foreground mt-1">新等级</div>
                </motion.div>
              </motion.div>

              {/* 新称号 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="text-center space-y-2"
              >
                <div className="text-sm text-muted-foreground">获得新称号</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring" }}
                  className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50"
                >
                  <motion.span
                    animate={{
                      textShadow: [
                        "0 0 10px rgba(250, 204, 21, 0.5)",
                        "0 0 20px rgba(250, 204, 21, 0.8)",
                        "0 0 10px rgba(250, 204, 21, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-xl font-bold text-yellow-400"
                  >
                    {newTitle}
                  </motion.span>
                </motion.div>
              </motion.div>

              {/* 确认按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold"
                  size="lg"
                >
                  继续冒险！
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
