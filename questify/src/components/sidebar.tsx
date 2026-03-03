"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ListTodo, Trophy, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "今日冒险", href: "/", icon: Home },
  { name: "任务面板", href: "/quests", icon: ListTodo },
  { name: "成就中心", href: "/achievements", icon: Trophy },
  { name: "每日结算", href: "/summary", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/30 p-4">
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "text-muted-foreground hover:bg-slate-800/50 hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
