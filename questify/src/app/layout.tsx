import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Questify - 把现实任务，变成角色成长",
  description: "一个将待办管理与轻 RPG 成长系统结合的个人效率产品",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
