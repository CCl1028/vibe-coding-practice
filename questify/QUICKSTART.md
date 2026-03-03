# Questify Phase 1 - 快速启动指南

## ✅ 项目已创建完成

项目位置：`/Users/shiyao/vibe-coding-practice/questify`

---

## 🚀 本地开发启动步骤

### 1. 安装依赖

```bash
cd /Users/shiyao/vibe-coding-practice/questify
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的配置：

```env
# 本地开发可以使用 SQLite（简化版）
# 或者使用在线 PostgreSQL（推荐 Supabase 免费套餐）
DATABASE_URL="postgresql://username:password@localhost:5432/questify"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="使用 openssl rand -base64 32 生成"
```

**快速获取免费数据库**：
- Supabase: https://supabase.com
- 创建项目后，在 Settings → Database 找到连接字符串

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# 导入种子数据（成就数据）
npx prisma db seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3000

---

## 📁 项目结构说明

```
questify/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义
│   └── seed.ts                # 初始数据
│
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # 主应用页面
│   │   │   ├── page.tsx       # 首页 Dashboard
│   │   │   ├── quests/        # 任务面板（Phase 2）
│   │   │   ├── achievements/  # 成就中心（Phase 4）
│   │   │   └── summary/       # 每日结算（Phase 4）
│   │   │
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证 API
│   │   │   ├── character/     # 角色 API
│   │   │   └── quests/        # 任务 API
│   │   │
│   │   ├── login/             # 登录页
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui 基础组件
│   │   ├── character-card.tsx # 角色卡
│   │   ├── quest-card.tsx     # 任务卡片
│   │   ├── header.tsx         # 顶部导航
│   │   └── sidebar.tsx        # 侧边栏
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 客户端
│   │   ├── auth.ts            # NextAuth 配置
│   │   ├── rewards.ts         # 奖励计算逻辑
│   │   └── utils.ts           # 工具函数
│   │
│   └── types/
│       ├── index.ts           # TypeScript 类型定义
│       └── next-auth.d.ts     # NextAuth 类型扩展
│
├── .env.example               # 环境变量模板
├── DEPLOYMENT.md              # 详细部署指南
└── README.md                  # 项目说明
```

---

## 🎯 Phase 1 核心功能

### ✅ 已实现

1. **认证系统**
   - Demo 模式登录（自动创建用户和角色）
   - NextAuth.js 集成

2. **角色系统**
   - 角色卡展示（等级、经验、金币、属性）
   - 经验条进度显示
   - 4 个属性：力量、智力、专注、活力

3. **任务系统**
   - 任务列表展示
   - 主线任务高亮
   - 任务完成功能
   - 奖励计算和发放

4. **数据持久化**
   - PostgreSQL 数据库
   - Prisma ORM
   - 完整的 CRUD API

5. **UI 组件**
   - 深色主题（RPG 风格）
   - shadcn/ui 组件库
   - 响应式布局

### 📝 Phase 1 功能演示流程

1. 点击"开始冒险"登录
2. 查看角色卡（初始状态：Lv.1）
3. 完成一个任务
4. 观察角色经验、金币、属性的变化
5. 切换到其他页面（占位符）

---

## 🔧 开发工具

### Prisma Studio（数据库可视化）

```bash
npx prisma studio
```

访问 http://localhost:5555 查看数据库数据

### 查看数据库结构

```bash
npx prisma db pull      # 从数据库拉取 schema
npx prisma format       # 格式化 schema 文件
```

---

## 🐛 故障排查

### 问题 1：npm install 失败

**原因**：Node.js 版本过低（需要 v16+）

**解决**：
```bash
# 检查版本
node -v

# 如果低于 v16，升级 Node.js
# 或使用 nvm 切换版本
```

### 问题 2：Prisma 生成失败

**解决**：
```bash
# 清理并重新生成
rm -rf node_modules/.prisma
npx prisma generate
```

### 问题 3：数据库连接失败

**排查**：
1. 检查 `.env.local` 中的 `DATABASE_URL`
2. 确认数据库服务正在运行
3. 测试连接：`npx prisma db push`

### 问题 4：端口被占用

```bash
# 更换端口启动
PORT=3001 npm run dev
```

---

## 📦 添加测试数据

想要快速测试？运行这个命令添加示例任务：

```bash
# 进入 Prisma Studio
npx prisma studio

# 或使用 API（启动服务器后）
curl -X POST http://localhost:3000/api/quests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习 Next.js",
    "description": "完成 Next.js 官方教程",
    "type": "MAIN",
    "difficulty": "MEDIUM",
    "tag": "STUDY",
    "isToday": true
  }'
```

---

## 🚀 准备部署？

查看详细部署指南：[DEPLOYMENT.md](./DEPLOYMENT.md)

快速部署步骤：
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署完成！

---

## 📚 下一步

- [ ] 本地运行并测试
- [ ] 添加测试数据
- [ ] 熟悉代码结构
- [ ] 准备 Phase 2 开发
- [ ] 部署到 Vercel

---

## 💡 技术亮点

1. **全栈 TypeScript**：类型安全，开发体验好
2. **App Router**：Next.js 14 最新特性
3. **Prisma ORM**：类型安全的数据库操作
4. **shadcn/ui**：高质量 UI 组件
5. **深色主题**：RPG 游戏风格设计

---

**Happy Coding! 🎉**

有问题随时查看文档或提问！
