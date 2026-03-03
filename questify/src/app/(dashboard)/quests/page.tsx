import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListTodo } from "lucide-react"

export default function QuestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ListTodo className="w-8 h-8 text-purple-400" />
        <h1 className="text-3xl font-bold">任务面板</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 2 功能</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            此页面将在 Phase 2 实现：
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
            <li>创建新任务功能</li>
            <li>任务筛选（按类型、状态、难度）</li>
            <li>任务编辑功能</li>
            <li>批量管理任务</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
