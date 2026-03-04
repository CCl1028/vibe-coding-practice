"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Calendar, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "主页", icon: LayoutDashboard },
  { href: "/achievements", label: "成就", icon: Trophy },
  { href: "/daily-summary", label: "今日结算", icon: Calendar },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-8">
            <div className="font-bold text-xl">Questify</div>
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 主体内容 */}
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}
