import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始创建种子数据...')

  // 创建初始成就
  const achievements = [
    {
      key: 'first_quest',
      title: 'First Blood',
      description: '完成第一个任务',
      icon: 'trophy',
      target: 1,
    },
    {
      key: 'main_quest_clear',
      title: 'Main Story Clear',
      description: '完成首个主线任务',
      icon: 'star',
      target: 1,
    },
    {
      key: 'streak_3',
      title: 'Streak x3',
      description: '连续3天完成主线',
      icon: 'flame',
      target: 3,
    },
    {
      key: 'scholar',
      title: 'Scholar',
      description: '累计完成10个学习类任务',
      icon: 'book',
      target: 10,
    },
    {
      key: 'iron_will',
      title: 'Iron Will',
      description: '累计完成5个挑战任务',
      icon: 'zap',
      target: 5,
    },
    {
      key: 'quest_master',
      title: 'Quest Master',
      description: '累计完成50个任务',
      icon: 'award',
      target: 50,
    },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement,
    })
  }

  console.log('✅ 种子数据创建成功')
  console.log(`   - 创建了 ${achievements.length} 个成就`)
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
