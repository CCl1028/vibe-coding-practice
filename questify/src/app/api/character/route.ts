import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/character - 获取当前用户角色
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.user.id },
    })

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: character.id,
      name: character.name,
      avatar: character.avatar,
      level: character.level,
      exp: character.exp,
      gold: character.gold,
      title: character.title,
      stats: {
        strength: character.strength,
        intelligence: character.intelligence,
        focus: character.focus,
        vitality: character.vitality,
      },
    })
  } catch (error) {
    console.error("Get character error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/character - 更新角色信息
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { exp, gold, strength, intelligence, focus, vitality, level, title } = body

    const updateData: any = {}
    if (exp !== undefined) updateData.exp = exp
    if (gold !== undefined) updateData.gold = gold
    if (strength !== undefined) updateData.strength = strength
    if (intelligence !== undefined) updateData.intelligence = intelligence
    if (focus !== undefined) updateData.focus = focus
    if (vitality !== undefined) updateData.vitality = vitality
    if (level !== undefined) updateData.level = level
    if (title !== undefined) updateData.title = title

    const character = await prisma.character.update({
      where: { userId: session.user.id },
      data: updateData,
    })

    return NextResponse.json({
      id: character.id,
      name: character.name,
      avatar: character.avatar,
      level: character.level,
      exp: character.exp,
      gold: character.gold,
      title: character.title,
      stats: {
        strength: character.strength,
        intelligence: character.intelligence,
        focus: character.focus,
        vitality: character.vitality,
      },
    })
  } catch (error) {
    console.error("Update character error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
