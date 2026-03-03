"use client"

import { Sword, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function Header() {
  const today = new Date()

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sword className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Questify
              </h1>
              <p className="text-sm text-muted-foreground">今天也来推进主线吧</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(today)}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
