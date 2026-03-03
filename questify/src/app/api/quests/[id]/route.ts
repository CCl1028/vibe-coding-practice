import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/quests/[id] - 更新任务
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const quest = await prisma.quest.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.isToday !== undefined) updateData.isToday = body.isToday
    if (body.status === "DONE" && !quest.completedAt) {
      updateData.completedAt = new Date()
    }

    const updatedQuest = await prisma.quest.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedQuest)
  } catch (error) {
    console.error("Update quest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/quests/[id] - 删除任务
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quest = await prisma.quest.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    await prisma.quest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete quest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
