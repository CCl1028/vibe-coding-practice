"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface QuickAddQuestProps {
  onAdd: (title: string) => Promise<void>
}

export function QuickAddQuest({ onAdd }: QuickAddQuestProps) {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onAdd(title.trim())
      setTitle("")
    } catch (error) {
      console.error("Failed to add quest:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="快速添加任务（默认：中等难度支线任务）"
        disabled={loading}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !title.trim()} size="icon">
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  )
}
