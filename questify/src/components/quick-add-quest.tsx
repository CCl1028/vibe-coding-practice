"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { QuestFormModal, QuestFormData } from "@/components/quest-form-modal"

interface QuickAddQuestProps {
  onAdd: (data: QuestFormData) => Promise<void>
}

export function QuickAddQuest({ onAdd }: QuickAddQuestProps) {
  const [title, setTitle] = useState("")
  const [showModal, setShowModal] = useState(false)

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setShowModal(true)
  }

  const handleSubmit = async (data: QuestFormData) => {
    try {
      await onAdd(data)
      setTitle("")
      setShowModal(false)
    } catch (error) {
      console.error("Failed to add quest:", error)
    }
  }

  return (
    <>
      <form onSubmit={handleOpenModal} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="快速添加任务..."
          className="flex-1"
        />
        <Button type="submit" disabled={!title.trim()} size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      <QuestFormModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={handleSubmit}
        initialData={{
          title: title.trim(),
          description: "",
          type: "SIDE",
          difficulty: "MEDIUM",
          tag: "WORK",
          isToday: true,
        }}
        mode="create"
      />
    </>
  )
}
