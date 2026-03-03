# ✅ Questify Phase 1 - 启动检查清单

## 📦 安装依赖

```bash
cd /Users/shiyao/vibe-coding-practice/questify
npm install
```

预计时间：2-3 分钟

---

## 🔑 配置环境变量

### 1. 复制环境变量模板

```bash
cp .env.example .env.local
```

### 2. 编辑 .env.local

打开 `.env.local` 文件，配置以下内容：

#### Option A: 使用 Supabase（推荐，免费）

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 创建新项目（选择离你最近的区域）
4. 进入 Settings → Database
5. 找到 "Connection string" → "URI"
6. 复制连接字符串到 `DATABASE_URL`

```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

#### Option B: 本地 PostgreSQL

如果你本地安装了 PostgreSQL：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/questify"
```

#### 生成 NEXTAUTH_SECRET

Mac/Linux:
```bash
openssl rand -base64 32
```

Windows（PowerShell）:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

或使用在线工具：https://generate-secret.vercel.app/32

将生成的值粘贴到 `.env.local`：

```env
NEXTAUTH_SECRET="你生成的密钥"
```

#### 完整的 .env.local 示例

```env
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="生成的32位密钥"
```

---

## 🗄️ 初始化数据库

### 1. 生成 Prisma Client

```bash
npx prisma generate
```

### 2. 推送数据库 Schema

```bash
npx prisma db push
```

看到 "✔ Your database is now in sync with your Prisma schema" 就成功了！

### 3. 导入种子数据

```bash
npx prisma db seed
```

看到 "✅ 种子数据创建成功" 就完成了！

### 4. （可选）查看数据库

```bash
npx prisma studio
```

访问 http://localhost:5555 可视化查看数据库内容

---

## 🚀 启动开发服务器

```bash
npm run dev
```

看到以下信息表示启动成功：

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in xxxms
```

---

## ✅ 功能测试

### 1. 访问应用

打开浏览器访问：http://localhost:3000

### 2. 登录测试

- 点击 "开始冒险 (Demo 模式)"
- 应该自动进入 Dashboard

### 3. 验证角色卡

- 左侧应该显示角色卡
- 默认状态：Lv.1，初出茅庐，0 经验，0 金币
- 4 个属性都是 1

### 4. 验证任务功能

如果没有任务，需要先添加测试数据。

#### 方法 1：使用 Prisma Studio

```bash
npx prisma studio
```

1. 打开 Quest 表
2. 点击 "Add record"
3. 填写字段（记得填写 userId，从 User 表复制）
4. 保存

#### 方法 2：使用 API（需要先登录）

使用浏览器开发者工具控制台：

```javascript
fetch('/api/quests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '学习 Next.js',
    description: '完成 Next.js 官方教程',
    type: 'MAIN',
    difficulty: 'MEDIUM',
    tag: 'STUDY',
    isToday: true
  })
}).then(r => r.json()).then(console.log)
```

刷新页面，应该能看到任务了。

### 5. 测试完成任务

- 点击任务的 "完成" 按钮
- 观察角色卡的变化：
  - 经验值增加
  - 金币增加
  - 属性增加（根据任务标签）
  - 经验条进度更新

### 6. 测试页面导航

- 点击侧边栏的各个菜单项
- 确认页面切换正常
- 其他页面显示 "Phase X 功能" 占位符

---

## 🐛 常见问题排查

### 问题 1：npm install 失败

```
Error: EACCES: permission denied
```

**解决**：
```bash
sudo npm install
# 或
npm install --legacy-peer-deps
```

### 问题 2：Prisma 连接失败

```
Error: Can't reach database server
```

**排查**：
1. 检查 DATABASE_URL 是否正确
2. 确认数据库服务正在运行
3. Supabase 用户：确认项目未暂停
4. 测试连接：`npx prisma db pull`

### 问题 3：Next.js 启动失败

```
Error: Invalid environment variables
```

**解决**：
1. 确认 .env.local 文件存在
2. 检查所有必需的环境变量都已配置
3. 重启开发服务器

### 问题 4：登录后空白页

**排查**：
1. 打开浏览器控制台查看错误
2. 确认 API 路由正常：访问 http://localhost:3000/api/character
3. 检查数据库中是否创建了 User 和 Character

### 问题 5：看不到任务

**原因**：数据库中没有任务数据

**解决**：使用上面的方法添加测试数据

---

## 📊 验收检查清单

完成以下检查后，Phase 1 就算完整运行成功了：

- [ ] npm install 成功
- [ ] 数据库初始化成功
- [ ] 种子数据导入成功
- [ ] 开发服务器启动成功
- [ ] 可以访问登录页
- [ ] 可以登录进入 Dashboard
- [ ] 角色卡正确显示
- [ ] 可以看到任务（添加测试数据后）
- [ ] 可以完成任务
- [ ] 完成任务后角色数据更新
- [ ] 经验条正确显示进度
- [ ] 4 个页面路由正常切换
- [ ] 无控制台错误

---

## 🎯 下一步

### 本地开发成功后

1. **熟悉代码结构**
   - 查看 `src/app` 了解页面结构
   - 查看 `src/components` 了解组件
   - 查看 `src/lib` 了解工具函数
   - 查看 `prisma/schema.prisma` 了解数据模型

2. **尝试修改**
   - 修改角色初始属性
   - 修改奖励倍率
   - 修改 UI 颜色
   - 添加新的任务类型

3. **准备部署**
   - 阅读 `DEPLOYMENT.md`
   - 推送代码到 GitHub
   - 在 Vercel 部署
   - 测试生产环境

---

## 📞 需要帮助？

### 查看文档

- **快速启动**：`QUICKSTART.md`
- **部署指南**：`DEPLOYMENT.md`
- **技术方案**：`TECHNICAL_SPEC.md`
- **项目总结**：`PROJECT_SUMMARY.md`

### 在线资源

- Next.js 文档：https://nextjs.org/docs
- Prisma 文档：https://www.prisma.io/docs
- Supabase 文档：https://supabase.com/docs
- Vercel 文档：https://vercel.com/docs

---

**🎉 祝你开发顺利！Questify Phase 1 等你来探索！**
