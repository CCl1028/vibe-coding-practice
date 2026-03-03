# Questify Phase 1 技术方案文档

## 📋 项目概述

**项目名称**：Questify  
**副标题**：把现实任务，变成角色成长  
**当前阶段**：Phase 1 - 核心框架与基础展示  
**预计工期**：3-4 天  
**技术栈**：Next.js 14 + React 18 + TypeScript + PostgreSQL

---

## 🏗️ 技术架构

### 前端架构

```
┌─────────────────────────────────────────────┐
│           Next.js App Router                │
│  (SSR + Client Components + API Routes)     │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐  ┌──────────────┐        │
│  │  UI Layer   │  │ State Layer  │        │
│  │             │  │              │        │
│  │ shadcn/ui   │  │  useState    │        │
│  │ Tailwind    │  │  useEffect   │        │
│  │ Framer      │  │              │        │
│  └─────────────┘  └──────────────┘        │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │       API Client Layer              │  │
│  │  (fetch + REST API calls)           │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 后端架构

```
┌─────────────────────────────────────────────┐
│        Next.js API Routes                   │
│     (Route Handlers - App Router)           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐  ┌──────────────┐        │
│  │   Auth      │  │  Business    │        │
│  │   Layer     │  │    Logic     │        │
│  │             │  │              │        │
│  │ NextAuth.js │  │  Rewards     │        │
│  │             │  │  Calculator  │        │
│  └─────────────┘  └──────────────┘        │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │       Prisma ORM Layer              │  │
│  │  (Type-safe Database Access)        │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │       PostgreSQL Database           │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🗄️ 数据库设计

### ER 图关系

```
User ──────────< Quest
  │
  │
  ├─────────── Character (1:1)
  │
  └─────────< UserAchievement ──> Achievement
```

### 核心表结构

#### User（用户表）
```typescript
{
  id: string (cuid)
  email: string (unique)
  name: string?
  character: Character (relation)
  quests: Quest[] (relation)
  createdAt: DateTime
}
```

#### Character（角色表）
```typescript
{
  id: string (cuid)
  userId: string (unique, FK)
  name: string
  level: number (default: 1)
  exp: number (default: 0)
  gold: number (default: 0)
  title: string (default: "初出茅庐")
  strength: number (default: 1)
  intelligence: number (default: 1)
  focus: number (default: 1)
  vitality: number (default: 1)
}
```

#### Quest（任务表）
```typescript
{
  id: string (cuid)
  userId: string (FK)
  title: string
  description: string?
  type: enum (MAIN, SIDE, DAILY, CHALLENGE)
  difficulty: enum (EASY, MEDIUM, HARD)
  tag: enum (STUDY, WORK, HEALTH, LIFE)
  status: enum (TODO, DOING, DONE)
  expReward: number
  goldReward: number
  strReward: number
  intReward: number
  focReward: number
  vitReward: number
  isToday: boolean
  createdAt: DateTime
  completedAt: DateTime?
}
```

### 索引策略

```sql
-- 加速查询今日任务
CREATE INDEX idx_quest_user_today ON Quest(userId, isToday);

-- 加速查询任务状态
CREATE INDEX idx_quest_user_status ON Quest(userId, status);
```

---

## 🔌 API 设计

### RESTful API 规范

#### 角色 API

**GET /api/character**
- 功能：获取当前用户角色信息
- 认证：Required
- 响应：
  ```json
  {
    "id": "xxx",
    "name": "冒险者",
    "level": 1,
    "exp": 0,
    "gold": 0,
    "title": "初出茅庐",
    "stats": {
      "strength": 1,
      "intelligence": 1,
      "focus": 1,
      "vitality": 1
    }
  }
  ```

**PATCH /api/character**
- 功能：更新角色信息
- 认证：Required
- 请求体：
  ```json
  {
    "exp": 150,
    "gold": 25,
    "strength": 2,
    "level": 2,
    "title": "积极行动者"
  }
  ```

#### 任务 API

**GET /api/quests**
- 功能：获取任务列表
- 认证：Required
- 查询参数：
  - `status`: TODO | DOING | DONE
  - `isToday`: true | false
- 响应：Quest[]

**POST /api/quests**
- 功能：创建新任务
- 认证：Required
- 请求体：
  ```json
  {
    "title": "学习 React",
    "description": "完成官方教程",
    "type": "MAIN",
    "difficulty": "MEDIUM",
    "tag": "STUDY",
    "isToday": true
  }
  ```

**PATCH /api/quests/[id]**
- 功能：更新任务
- 认证：Required
- 请求体：
  ```json
  {
    "status": "DONE"
  }
  ```

**DELETE /api/quests/[id]**
- 功能：删除任务
- 认证：Required

---

## 🎮 业务逻辑

### 奖励计算规则

```typescript
// 基础奖励
const BASE_REWARDS = {
  EASY: { exp: 20, gold: 5 },
  MEDIUM: { exp: 50, gold: 10 },
  HARD: { exp: 100, gold: 20 }
}

// 类型加成
const TYPE_BONUS = {
  MAIN: { exp: +20, gold: +5 },
  CHALLENGE: { exp: +30, gold: +10 },
  DAILY: { exp: 0, gold: 0 },
  SIDE: { exp: 0, gold: 0 }
}

// 属性映射
const STAT_MAPPING = {
  STUDY: { intelligence: +1 },
  WORK: { focus: +1 },
  HEALTH: { vitality: +1 },
  LIFE: { strength: +1 }
}
```

### 升级公式

```typescript
// 每级所需经验
nextLevelExp = currentLevel * 100

// 示例：
// Lv.1 → Lv.2: 100 EXP
// Lv.2 → Lv.3: 200 EXP
// Lv.3 → Lv.4: 300 EXP
```

### 称号系统

```typescript
const TITLE_LEVELS = {
  1: "初出茅庐",
  3: "积极行动者",
  5: "稳定推进者",
  7: "深度潜行者",
  10: "挑战征服者",
  15: "高效执行官",
  20: "传奇冒险者"
}
```

---

## 🎨 UI/UX 设计规范

### 配色方案

```css
/* Dark Theme - RPG Style */
--background: #0f172a      /* 深蓝灰 */
--primary: #6366f1         /* 蓝紫 */
--accent: #fbbf24          /* 金色 */
--success: #10b981         /* 绿色 */
--secondary: #334155       /* 灰蓝 */
```

### 组件设计原则

1. **圆角大一些**：`rounded-xl` (12px)
2. **轻微阴影**：`shadow-lg`
3. **发光边框**：仅用于重点模块（主线任务）
4. **渐变背景**：卡片使用微妙渐变增强层次

### 响应式断点

```typescript
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1400px',
}
```

---

## 🔒 安全措施

### 认证 & 授权

1. **NextAuth.js Session**：JWT 策略
2. **API 路由保护**：`getServerSession()` 验证
3. **数据隔离**：所有查询带 `userId` 过滤

### 数据验证

```typescript
// API 层验证必需字段
if (!title || !type || !difficulty || !tag) {
  return NextResponse.json(
    { error: "Missing required fields" },
    { status: 400 }
  )
}
```

### SQL 注入防护

- 使用 Prisma ORM（参数化查询）
- 不拼接 SQL 字符串

---

## 📊 性能优化

### 前端优化

1. **React Server Components**：默认服务端渲染
2. **动态导入**：页面级代码分割
3. **图片优化**：Next.js `<Image>` 组件（Phase 2+）

### 后端优化

1. **数据库索引**：userId + isToday 复合索引
2. **连接池**：Prisma 自动管理
3. **缓存策略**：
   - 角色数据：客户端 state 缓存
   - 任务列表：刷新后重新获取

### 数据库查询优化

```typescript
// 只查询需要的字段
const character = await prisma.character.findUnique({
  where: { userId },
  select: {
    id: true,
    name: true,
    level: true,
    // ...
  }
})

// 批量查询
const [character, quests] = await Promise.all([
  prisma.character.findUnique(...),
  prisma.quest.findMany(...)
])
```

---

## 🚀 部署架构

### Vercel 部署流程

```
GitHub Push
    ↓
Vercel Webhook Trigger
    ↓
Build Phase
  ├── npm install
  ├── prisma generate
  ├── next build
  └── 静态资源优化
    ↓
Deploy to Edge Network
  ├── Serverless Functions
  ├── Static Assets (CDN)
  └── API Routes
    ↓
Production Ready ✅
```

### 环境变量管理

```
开发环境 (.env.local)
  ↓
Vercel Dashboard (Environment Variables)
  ├── Production
  ├── Preview
  └── Development
```

---

## 📈 监控 & 日志

### Vercel Analytics

- **Real-time Logs**：查看 API 错误
- **Web Vitals**：性能指标监控
- **Edge Caching**：缓存命中率

### 错误处理

```typescript
try {
  // API 操作
} catch (error) {
  console.error("Operation failed:", error)
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}
```

---

## 🧪 测试策略（Phase 2+）

### 单元测试
- Jest + React Testing Library
- 测试组件逻辑

### API 测试
- Postman / Thunder Client
- 测试所有 API 端点

### E2E 测试
- Playwright
- 测试完整用户流程

---

## 📦 依赖管理

### 核心依赖

```json
{
  "next": "^14.2.0",
  "react": "^18.2.0",
  "prisma": "^5.14.0",
  "next-auth": "^4.24.7",
  "tailwindcss": "^3.4.3"
}
```

### 版本锁定

- 使用 `package-lock.json`
- 定期更新：`npm audit fix`

---

## 🔄 CI/CD 流程

### GitHub → Vercel 自动部署

```yaml
# 自动触发条件
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# 部署流程
- Install dependencies
- Run linting
- Build project
- Deploy to Vercel
```

---

## 📝 代码规范

### TypeScript

```typescript
// 使用接口定义类型
interface Character {
  id: string
  name: string
  // ...
}

// 避免使用 any
const data: unknown = await response.json()
```

### 组件规范

```typescript
// 使用 Props 接口
interface CharacterCardProps {
  character: Character
}

export function CharacterCard({ character }: CharacterCardProps) {
  // ...
}
```

---

## 🎯 Phase 1 验收标准

- [ ] ✅ 项目可正常运行
- [ ] ✅ 4 个页面路由正常
- [ ] ✅ 角色卡正确显示
- [ ] ✅ 任务列表渲染
- [ ] ✅ 完成任务逻辑
- [ ] ✅ 数据持久化
- [ ] ✅ API 正常工作
- [ ] ✅ 响应式布局
- [ ] ✅ 可部署到 Vercel

---

## 📚 技术文档

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org
- **Tailwind**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

**文档版本**：v1.0  
**最后更新**：2026-03-03  
**作者**：Questify Team
