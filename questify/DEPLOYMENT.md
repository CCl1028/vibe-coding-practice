# Questify 部署 SOP（标准操作流程）

## 📋 部署前准备清单

- [ ] GitHub 账号
- [ ] Vercel 账号（使用 GitHub 登录）
- [ ] 数据库服务（选择以下之一）
  - [ ] Vercel Postgres（推荐）
  - [ ] Supabase（免费套餐）

---

## 🚀 完整部署流程

### 第一步：推送代码到 GitHub

```bash
# 1. 初始化 Git（如果还没有）
cd /Users/shiyao/vibe-coding-practice/questify
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "feat: Questify Phase 1 初始化"

# 4. 在 GitHub 创建新仓库（通过 Web 界面）
# 访问 https://github.com/new
# 仓库名：questify
# 可见性：Public 或 Private

# 5. 关联远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/questify.git

# 6. 推送到 GitHub
git branch -M main
git push -u origin main
```

---

### 第二步：配置数据库

#### 选项 A：使用 Vercel Postgres（推荐）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Storage** → **Create Database**
3. 选择 **Postgres**
4. 选择区域（建议选择离你最近的）
5. 点击 **Create**
6. 复制 `POSTGRES_PRISMA_URL` 连接字符串（这就是你的 `DATABASE_URL`）

#### 选项 B：使用 Supabase

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 **New Project**
3. 填写项目信息，选择区域
4. 等待项目创建完成（约 2 分钟）
5. 进入 **Settings** → **Database**
6. 找到 **Connection string** → **URI**
7. 复制连接字符串，格式如下：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

---

### 第三步：部署到 Vercel

#### 1. 导入项目

1. 访问 [Vercel New Project](https://vercel.com/new)
2. 点击 **Import Git Repository**
3. 选择你的 `questify` 仓库
4. 点击 **Import**

#### 2. 配置环境变量

在 **Environment Variables** 区域添加：

```
DATABASE_URL=你的数据库连接字符串
```

```
NEXTAUTH_SECRET=运行以下命令生成
```

生成 `NEXTAUTH_SECRET`：
```bash
openssl rand -base64 32
```

如果没有 openssl，可以使用在线生成器：
https://generate-secret.vercel.app/32

`NEXTAUTH_URL` 会自动生成，无需手动设置。

#### 3. 部署

1. 点击 **Deploy**
2. 等待构建完成（约 2-3 分钟）
3. 构建成功后，你会看到 🎉 **Congratulations!** 页面

---

### 第四步：初始化数据库

部署成功后，需要初始化数据库：

#### 方式一：本地执行（推荐）

```bash
# 1. 在本地设置生产数据库 URL
export DATABASE_URL="你的生产数据库URL"

# 2. 推送 schema
npx prisma db push

# 3. 运行种子数据
npx prisma db seed
```

#### 方式二：使用 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 链接项目
vercel link

# 4. 在 Vercel 环境中执行
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

---

### 第五步：验证部署

1. 访问你的 Vercel 部署 URL（类似 `https://questify-xxx.vercel.app`）
2. 点击 **开始冒险 (Demo 模式)**
3. 验证以下功能：
   - [ ] 登录成功
   - [ ] 角色卡正确显示
   - [ ] 可以查看任务
   - [ ] 页面导航正常

---

## 🔧 常见问题排查

### 问题 1：构建失败 - "Prisma Client not generated"

**解决方案**：
确保 `package.json` 中有：
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 问题 2：数据库连接失败

**排查步骤**：
1. 检查 `DATABASE_URL` 是否正确配置
2. 确认数据库允许来自 Vercel 的连接
3. Supabase 用户：检查密码中是否有特殊字符需要 URL 编码

### 问题 3：NextAuth 错误

**排查步骤**：
1. 确认 `NEXTAUTH_SECRET` 已配置
2. 检查 Vercel 环境变量是否保存

### 问题 4：页面加载慢

**解决方案**：
- 使用离用户最近的数据库区域
- 启用 Vercel Edge Network（自动）

---

## 📝 更新部署

每次修改代码后，推送到 GitHub 即可自动部署：

```bash
git add .
git commit -m "feat: 添加新功能"
git push
```

Vercel 会自动检测更新并重新部署。

---

## 🎯 生产环境检查清单

部署完成后，确认以下项目：

- [ ] 数据库已初始化（表结构已创建）
- [ ] 种子数据已导入（成就数据）
- [ ] 登录功能正常
- [ ] 角色创建正常
- [ ] 任务 CRUD 功能正常
- [ ] 页面路由正常
- [ ] 响应式布局正常
- [ ] 无控制台错误

---

## 📊 监控和日志

### Vercel Dashboard

- **部署日志**: 查看构建和部署日志
- **Analytics**: 查看访问统计
- **Logs**: 查看运行时错误

### Prisma Studio

查看数据库数据：

```bash
# 使用生产数据库
DATABASE_URL="你的生产URL" npx prisma studio
```

---

## 🔐 安全建议

1. ✅ 不要在代码中硬编码密钥
2. ✅ 使用环境变量存储敏感信息
3. ✅ 定期更新依赖包
4. ✅ 数据库使用强密码
5. ✅ 启用 HTTPS（Vercel 自动启用）

---

## 📞 需要帮助？

- Vercel 文档: https://vercel.com/docs
- Next.js 文档: https://nextjs.org/docs
- Prisma 文档: https://www.prisma.io/docs

---

**部署完成！🎉 现在你的 Questify 应用已经可以在线访问了！**
