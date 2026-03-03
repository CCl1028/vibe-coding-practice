import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function SummaryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-green-400" />
        <h1 className="text-3xl font-bold">每日结算</h1>
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
            <li>今日任务结果统计</li>
            <li>今日奖励汇总</li>
            <li>升级反馈展示</li>
            <li>明日建议</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
