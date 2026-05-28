# 项目进展：AI 资讯聚合站

## 项目概述

个人使用的 AI 资讯聚合网站，每天自动抓取英文 AI 资讯，存储到 Supabase，网站展示。后续可扩展企业微信推送。

- **代码仓库**：https://github.com/GoldFish-404/ai-news-daily
- **生产地址**：https://ai-news-daily-theta.vercel.app（国内需绑域名才能访问）
- **本地开发**：`cd D:/07_项目/ai-news-daily && npm run dev` → http://localhost:3000
- **项目目录**：`D:/07_项目/ai-news-daily`

---

## 最终技术栈

| 层 | 选型 | 备注 |
|---|---|---|
| 框架 | Next.js 16 (App Router) + TypeScript | Vercel 原生支持，Turbopack 构建 |
| UI | Tailwind CSS v4 | 极简风格，无组件库 |
| 数据库 | Supabase (PostgreSQL) | 免费 500MB，项目 ID: `ywagzernzjgwnfkcisrz` |
| 爬虫依赖 | `rss-parser`（RSS 解析）、`cheerio`（HTML 解析） | |
| 定时任务 | Vercel Cron Jobs | 每天 9:00 触发 `/api/crawl` |
| 部署 | GitHub + Vercel CLI | 目前手动部署，未配置 Git 自动部署 |
| 推送 | 无（二期加企业微信机器人） | |

## 项目结构

```
ai-news-daily/
├── app/
│   ├── layout.tsx             # 根布局，页面标题 "AI 每日资讯"
│   ├── page.tsx               # Server Component，从 Supabase 读数据
│   ├── news-page.tsx          # Client Component，筛选 + 文章列表
│   └── api/crawl/route.ts     # 爬虫 API（Vercel Cron 每天调用）
├── lib/
│   ├── supabase.ts            # 两个客户端：supabase（anon读）、supabaseAdmin（service_role写）
│   ├── dedup.ts               # 去重写入 Supabase（upsert on url）
│   ├── schema.sql             # 建表 SQL（已在 Supabase 执行）
│   └── sources/
│       ├── types.ts           # Article 接口定义
│       ├── arxiv.ts           # arXiv cs.AI，取最近 15 篇
│       ├── hackernews.ts      # HN top 50，AI 关键词过滤 + score≥200
│       ├── rss.ts             # OpenAI/Anthropic/DeepMind/Meta 博客，过滤 7 天内
│       └── github.ts          # GitHub Trending HTML 解析（cheerio）
├── vercel.json                # Cron 配置：0 9 * * *
├── .env.local                 # 环境变量（不提交 Git）
└── package.json
```

## 数据库

**表结构**（`articles`）：

```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
title TEXT NOT NULL,
url TEXT NOT NULL UNIQUE,          -- 去重依据
summary TEXT,
source TEXT NOT NULL,              -- arxiv | hackernews | rss | github
source_name TEXT,                  -- 显示用，如 "OpenAI Blog"
published_at TIMESTAMPTZ,
crawled_at TIMESTAMPTZ DEFAULT NOW(),
created_at TIMESTAMPTZ DEFAULT NOW()
```

**Supabase 连接信息**：
- Project URL: `https://ywagzernzjgwnfkcisrz.supabase.co`
- RLS 已尝试禁用但实际未生效，最终使用 service_role key 写入（绕过 RLS）
- anon key 用于前端读取

## 环境变量（Vercel + .env.local）

```
SUPABASE_URL=https://ywagzernzjgwnfkcisrz.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...（anon public key）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...（service_role key，用于写入）
```

---

## 开发过程中的修改记录

### 1. 初始方案确认
- 用户选择：个人使用、简单 UI、英文资讯源、不需要推送、全权由我决定技术栈
- 数据源优先级：GitHub Trending、arXiv、Hacker News、官方博客 RSS
- 用户不会前后端

### 2. 项目初始化
- Next.js 16 + TypeScript + Tailwind CSS v4
- 目录名从"网页推送ai咨讯"改为 `ai-news-daily`（npm 不支持中文包名）
- 移除 Google Fonts（Geist 字体国内加载失败），改用系统字体
- `.env.local` 已加入 `.gitignore`

### 3. Supabase 写入问题（关键修复）
- **问题**：爬虫 API 返回 `saved: 0`，数据未入库
- **根因**：Supabase 默认开启 RLS，anon key 无 INSERT 权限
- **尝试**：让用户执行 `ALTER TABLE DISABLE ROW LEVEL SECURITY` → 未生效
- **最终方案**：创建 `supabaseAdmin` 客户端使用 service_role key（绕过 RLS），仅用于服务端写入；前端读取仍用 anon key

### 4. 数据源调优
- **RSS**：初次返回 968 条（全历史），添加 7 天时间过滤后降至 4 条
- **Hacker News**：从 top 100 降至 top 50，避免 Vercel 免费版 10 秒超时
- **GitHub Trending**：本地网络无法访问 GitHub（国内限制），部署到 Vercel 后可正常工作
- **HN 限流**：本地频繁调用触发限流，生产环境每天一次不受影响

### 5. GitHub 仓库创建
- 用户提供 Personal Access Token（ghp_xxx）
- 通过 Node.js `--use-system-ca` 解决 SSL 证书验证问题
- 仓库地址：`https://github.com/GoldFish-404/ai-news-daily`

### 6. Vercel 部署
- 用户提供 Vercel Token（vcp_xxx）
- 通过 `vercel --token --scope gold-fish-s-projects --prod` 部署
- 环境变量通过 `vercel env add` 配置
- **Git 自动部署未配置**（需 GitHub OAuth 授权，用户需在 Vercel Dashboard 手动操作）

### 7. UI 中文化（用户反馈）
- 页面标题：AI Daily News → AI 每日资讯
- 筛选器：All Sources → 全部来源，Blogs → 官方博客，GitHub Trending → GitHub 热门
- 日期格式：en-US → zh-CN
- HN 摘要：points → 热度，comments → 评论，by → 作者
- 空态文案翻译

### 8. Vercel 域名国内不可访问
- 根因：`.vercel.app` 域名被 GFW 干扰，非配置问题
- 解决方案：绑定自有域名 + CDN（待用户购买域名后实施）

### 9. 百度翻译集成（标题中文化）
- **背景**：用户英文能力有限，需要中文标题才能判断文章是否值得阅读
- **方案**：爬虫抓取英文标题 → 爬虫阶段调用百度翻译 API → 翻译结果直接替换 title 字段存入数据库
- **为何替换而非新增 title_zh 列**：需要 ALTER TABLE 但 service_role key 无法执行 DDL，替换 title 无需改数据库结构
- **API**：百度翻译（免费 200 万字符/月，国内直连）
- **实现**：`lib/translate.ts` 批量翻译（\n 分隔多文本），MD5 签名

### 10. 文档自动维护机制
- 每个项目独立维护 `docs/project-log.md` + `docs/dev-lessons.md`
- 开发过程中跟随对话进度实时更新，不推送到 Git
- 用户纠正：文档应存本地，不应推送

---

## 当前状态

| 模块 | 状态 | 备注 |
|---|---|---|
| 爬虫 4 个源 | 已完成 | arXiv/HN/RSS 正常，GitHub 需网络通畅 |
| Supabase 存储 | 已完成 | 已有 1000+ 条数据 |
| 首页 UI | 已完成 | 中文界面，来源筛选，时间线展示 |
| Vercel Cron | 已配置 | 每天 9:00 自动抓取 |
| 本地运行 | 正常 | `npm run dev` → localhost:3000 |
| Vercel 生产 | 已部署 | 国内无法直接访问，需绑域名 |
| Git 自动部署 | 未配置 | 需在 Vercel Dashboard 手动连接 GitHub |

---

## 待办事项

- [ ] 绑定自有域名解决国内访问问题
- [ ] Vercel Dashboard 连接 GitHub 实现自动部署
- [ ] 二期：企业微信机器人推送
- [ ] GitHub Trending 在当前网络恢复后验证
