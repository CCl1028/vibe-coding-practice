# 数据库配置指南

## 🎯 推荐方案：使用 Supabase（免费，3分钟搞定）

### 步骤 1: 创建 Supabase 账号

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 登录（或注册新账号）

### 步骤 2: 创建项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: questify
   - **Database Password**: 设置一个强密码（记住它！）
   - **Region**: 选择 Northeast Asia (Tokyo) 或 Southeast Asia (Singapore)
3. 点击 "Create new project"，等待 1-2 分钟

### 步骤 3: 获取数据库连接字符串

1. 项目创建完成后，进入 **Settings** → **Database**
2. 找到 **Connection string** 部分
3. 选择 **URI** 模式
4. 复制连接字符串，格式类似：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. 将 `[YOUR-PASSWORD]` 替换为你在步骤2设置的密码

### 步骤 4: 配置环境变量

打开 `.env.local` 文件，替换 `DATABASE_URL`：

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres:你的密码@db.xxxxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="bkTK80V8ygPLJzWDK3kIVKl47xWDg7ldMkHvC+G5WOY="
```

### 步骤 5: 继续执行 CHECKLIST.md

现在可以继续执行：

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

---

## 方案 2: 使用本地 PostgreSQL（需要安装）

### macOS 安装

```bash
# 使用 Homebrew 安装
brew install postgresql@15

# 启动服务
brew services start postgresql@15

# 创建数据库
createdb questify
```

### 配置 .env.local

```env
DATABASE_URL="postgresql://你的用户名@localhost:5432/questify?schema=public"
```

通常 macOS 上默认用户名是你的系统用户名，无需密码。

---

## 方案 3: 使用 Docker（快速隔离）

```bash
# 启动 PostgreSQL 容器
docker run --name questify-db \
  -e POSTGRES_PASSWORD=questify123 \
  -e POSTGRES_DB=questify \
  -p 5432:5432 \
  -d postgres:15

# 配置 .env.local
DATABASE_URL="postgresql://postgres:questify123@localhost:5432/questify?schema=public"
```

---

## ✅ 验证连接

配置完成后，运行：

```bash
npx prisma db push
```

如果看到 "✔ Your database is now in sync with your Prisma schema"，说明连接成功！

---

## 🆘 常见问题

### 1. Connection refused

检查：
- 数据库服务是否启动
- 端口是否正确（PostgreSQL 默认 5432）
- 防火墙是否阻止连接

### 2. Authentication failed

检查：
- 用户名和密码是否正确
- Supabase 的密码是否替换了 `[YOUR-PASSWORD]`

### 3. Database does not exist

本地 PostgreSQL 需要先创建数据库：
```bash
createdb questify
```

---

## 🎉 推荐使用 Supabase

**优点：**
- ✅ 免费（500MB 存储）
- ✅ 无需安装软件
- ✅ 3 分钟配置完成
- ✅ 支持远程访问
- ✅ 自带管理界面

**缺点：**
- ❌ 需要网络连接
- ❌ 免费版有性能限制（但足够开发用）

**选择建议：开发阶段用 Supabase，部署到生产环境时继续用 Supabase 或切换到 Vercel Postgres。**
