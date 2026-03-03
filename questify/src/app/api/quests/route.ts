import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QuestType, Difficulty, QuestTag, QuestStatus } from "@prisma/client"
import { calculateRewards } from "@/lib/rewards"

// GET /api/quests - 获取任务列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const isToday = searchParams.get("isToday")

    const where: any = { userId: session.user.id }
    if (status) where.status = status
    if (isToday) where.isToday = isToday === "true"

    const quests = await prisma.quest.findMany({
      where,
      orderBy: [
        { type: "asc" }, // MAIN 排在前面
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(quests)
  } catch (error) {
    console.error("Get quests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/quests - 创建新任务
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, type, difficulty, tag, isToday } = body

    // 验证必需字段
    if (!title || !type || !difficulty || !tag) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 计算奖励
    const rewards = calculateRewards(difficulty as Difficulty, type as QuestType, tag as QuestTag)

    const quest = await prisma.quest.create({
      data: {
        userId: session.user.id,
        title,
        description,
        type: type as QuestType,
        difficulty: difficulty as Difficulty,
        tag: tag as QuestTag,
        expReward: rewards.expReward,
        goldReward: rewards.goldReward,
        strReward: rewards.statReward.strength || 0,
        intReward: rewards.statReward.intelligence || 0,
        focReward: rewards.statReward.focus || 0,
        vitReward: rewards.statReward.vitality || 0,
        isToday: isToday || false,
      },
    })

    return NextResponse.json(quest, { status: 201 })
  } catch (error) {
    console.error("Create quest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
