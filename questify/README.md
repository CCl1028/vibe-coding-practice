# Questify - 把现实任务，变成角色成长

一个将待办管理与轻 RPG 成长系统结合的个人效率产品。

## 功能特性

- 🎮 **RPG 成长系统**：经验值、等级、属性、金币
- ⚔️ **任务分类**：主线、支线、日常、挑战任务
- 🏆 **成就系统**：解锁徽章，获得称号
- 📊 **每日结算**：可视化你的成长轨迹
- 💾 **数据持久化**：PostgreSQL 云端存储

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: PostgreSQL
- **认证**: NextAuth.js
- **部署**: Vercel

## Phase 1 功能

✅ 核心框架搭建
✅ 角色卡静态展示
✅ 任务列表展示
✅ 完成任务流程
✅ 数据持久化

## 快速开始

### 1. 克隆项目

\`\`\`bash
git clone <your-repo-url>
cd questify
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`：

\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 `.env.local`，配置数据库连接：

\`\`\`env
DATABASE_URL="your-postgresql-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
\`\`\`

### 4. 初始化数据库

\`\`\`bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# 运行种子数据
npx prisma db seed
\`\`\`

### 5. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

### 方式一：通过 GitHub 自动部署

1. 推送代码到 GitHub
2. 访问 [Vercel Dashboard](https://vercel.com)
3. 导入你的 GitHub 仓库
4. 配置环境变量
5. 点击 Deploy

### 方式二：使用 Vercel CLI

\`\`\`bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
\`\`\`

## 环境变量配置

在 Vercel 中配置以下环境变量：

- `DATABASE_URL`: PostgreSQL 连接字符串
- `NEXTAUTH_URL`: 生产域名（自动生成）
- `NEXTAUTH_SECRET`: 认证密钥

## 项目结构

\`\`\`
questify/
├── prisma/
│   ├── schema.prisma      # 数据库 Schema
│   └── seed.ts            # 种子数据
├── src/
│   ├── app/
│   │   ├── (dashboard)/   # Dashboard 页面
│   │   ├── api/           # API Routes
│   │   ├── login/         # 登录页
│   │   └── layout.tsx     # 根布局
│   ├── components/        # React 组件
│   ├── lib/               # 工具函数
│   └── types/             # TypeScript 类型
├── .env.example           # 环境变量模板
└── README.md
\`\`\`

## 后续迭代

- **Phase 2**: 任务管理核心功能
- **Phase 3**: 奖励与成长系统
- **Phase 4**: 成就与统计系统
- **Phase 5**: 体验优化与打磨

## 许可证

MIT

---

**Made with ❤️ by [Your Name]**
