---
title: "个人网站部署与调试：一次「所有检查失败」的全链路排查记录"
date: "2026-06-09"
tags: ["部署", "踩坑", "Cloudflare", "Next.js", "GitHub Actions"]
excerpt: "记录个人网站开发中遇到的多平台部署冲突、构建失败、依赖问题等连环坑，以及如何一步步定位并修复的完整过程。"
---

## 背景

我的个人网站搭建在 Next.js 14 + Cloudflare Pages 上，通过 GitHub Actions 自动部署。在一次例行维护中，遇到了连环故障——

**现象**：GitHub 仓库显示「所有检查失败」，Vercel、Cloudflare Workers、GitHub Actions 三个管道全部红灯。网站内容更新后不生效。

接下来是我花了几个小时逐步排查、最终修复全部问题的完整记录。

---

## 第一层：多平台部署冲突

### 现象

每次 `git push` 后，GitHub 显示多个检查失败：
- **Vercel**: Deployment has failed
- **Cloudflare Workers**: Workers Builds 失败
- **GitHub Actions**: Auto Deploy 34 秒后失败

### 排查

检查后发现，这个 GitHub 仓库同时被 **四个平台** 绑定：

| 平台 | 连接方式 | 问题 |
|------|----------|------|
| Cloudflare Pages | GitHub Actions + wrangler | Token 过期 |
| Vercel | GitHub App (账号级) | 项目已弃用但仍自动构建 |
| Netlify | GitHub App (账号级) | 未主动配置，自动消耗额度 |
| Cloudflare Workers | Cloudflare 后台 Git 集成 | 无法识别 Next.js 项目 |
| GitHub Pages | `gh-pages` 分支 | 遗留配置 |

### 修复

1. 在 GitHub Settings → Applications 中取消 Vercel、Netlify 的授权
2. 禁用 GitHub Pages
3. Vercel 的部署报错虽然解决了，但 Vercel 当时还连着仓库，Vercel 的部署失败邮件仍在发送——**GitHub 仓库里的 `.vercel` 目录和 `vercel.json` 清理掉也不能阻止 Vercel 自动部署**，必须在 GitHub 账号级断开 OAuth 授权。


## 第二层：GitHub Actions 构建失败

### 现象

`Auto Deploy` workflow 始终在 30-40 秒内失败，报错信息不可见（未经授权的 API 请求无法获取日志）。

### 排查过程

1. **尝试换部署 Action**：`wrangler-action@v3` → `pages-action@v1` → 都失败
2. **尝试直接 `npx wrangler`**：在 CI 中仍然失败，但本地完全正常
3. **怀疑是 Token 问题**：重新生成 Cloudflare API Token，验证有效，但部署继续失败
4. **怀疑是 `npm ci` 问题**：改成 `npm install`，无效

### 定位根因

最终在本地执行 `npm run build` 时，意外发现了**真正的错误**：

```
Error: Objects are not valid as a React child (found: [object Date])
```

原因有**两个**：

#### 根因 A: gray-matter Date 解析

Markdown 文章中的 `date: "2026-06-09"` 被 `gray-matter`（底层 `js-yaml`）解析成了 JavaScript 的 `Date` 对象，而不是字符串。React 无法直接渲染 `Date` 对象，导致所有包含日期的页面（首页、博客列表、文章详情）在 SSG 预渲染时全部崩溃。

**修复**：在 `lib/posts.ts` 中强制将 `date` 转为字符串：

```typescript
date: typeof data.date === 'string' ? data.date : String(data.date || '')
```

#### 根因 B: libsodium-wrappers 原生依赖

`package.json` 中存在 `libsodium-wrappers`、`tweetnacl` 等加密库依赖，但**代码中完全没有人使用它们**（后台管理页用的是 Web Crypto API）。这些库在 CI 的 Linux 环境中需要原生编译，导致 `npm install`/`npm ci` 失败。

**修复**：直接移除这些无用依赖。

### 为什么之前能构建成功？

因为之前 `package-lock.json` 锁定了可用的版本，且 TypeScript 构建时对 Date 的容忍度因版本差异而异。当执行了 `npm install`（而非 `npm ci`）后，依赖版本更新，`js-yaml` 的 Date 解析行为发生了变化。


## 第三层：Cloudflare Pages 项目被误删

### 现象

后台管理页修改博客内容后，GitHub Actions 部署再次失败。内容没有更新到网站上。

### 原因

在排查「Cloudflare Workers Builds 失败」时，误以为 Workers 项目需要清理，结果把 Cloudflare Pages 的 `lika-site` 项目也一并删除了。部署脚本 `wrangler pages deploy` 找不到目标项目，直接失败。

### 修复

1. 通过 Cloudflare API 重建 `lika-site` Pages 项目
2. 重新添加自定义域名 `l1ka.me`
3. **更新 DNS**：旧项目的 subdomain 是 `yumo-site.pages.dev`，新建项目变成了 `lika-site.pages.dev`，需要更新 CNAME 记录


## 总结：排查方法论

这次故障排查花了约 3 小时，总结几条教训：

### 🔍 排查优先级

1. **先跑本地构建**：`npm run build` 是本地就能验证的，优先于远程 CI 日志
2. **区分报错来源**：GitHub 上一个 ❌ 可能来自完全无关的第三方集成
3. **查看 GitHub Check Runs**：每个 ❌ 都标记了来源（Vercel / Cloudflare / Actions），逐个排查

### ⚠️ 常见陷阱

- **`npm ci`** 在跨平台（Windows → Linux CI）可能失败，换 `npm install` 更稳妥
- **无用的 npm 依赖**要及时清理，尤其是带原生编译的
- **gray-matter / YAML 解析器**可能把日期字符串转成 Date 对象，React 渲染前要确保是字符串
- **GitHub App 级 OAuth** 比仓库级配置更隐蔽，需要在 GitHub 账号设置里断开
- **Cloudflare Pages 项目**删了要重建 + 更新 DNS CNAME

### ✅ 稳定部署配置

最终采用的 GitHub Actions 配置（极简、可靠）：

```yaml
- name: Install dependencies
  run: npm install
- name: Build
  run: npm run build
- name: Deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: 04f61e52bd938c6a273dd5c782055921
  run: npx wrangler@latest pages deploy out --project-name=lika-site --branch=production
```

关键点：
- 不用 `npm ci`，用 `npm install`
- 不用第三方 Action（`wrangler-action`、`pages-action`），直接用 `npx wrangler`
- 环境变量通过 `env` 传递

---

> 这次经历让我深刻体会到：**部署管道越简单越好**。每多一个第三方 Action、每多一个平台集成，就多一个可能的故障点。
