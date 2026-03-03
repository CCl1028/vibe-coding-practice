import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-yellow-400" />
        <h1 className="text-3xl font-bold">成就中心</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 4 功能</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            此页面将在 Phase 4 实现：
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
            <li>成就徽章展示</li>
            <li>称号系统</li>
            <li>进度型成就追踪</li>
            <li>成就解锁动画</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
