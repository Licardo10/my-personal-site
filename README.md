# 🌐 YuMo Personal Site

基于 Next.js 14 的个人博客网站，部署在 Cloudflare Pages，通过 GitHub Actions 自动构建发布。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router, SSG, `output: "export"`) |
| 样式 | Tailwind CSS 3.4 |
| 语言 | TypeScript |
| 内容 | Markdown + gray-matter |
| 部署 | Cloudflare Pages (via wrangler CLI) |
| CI/CD | GitHub Actions |
| 域名 | l1ka.me (阿里云注册, Cloudflare DNS) |
| 后台管理 | 自定义 HTML/JS (GitHub API) |

## 项目结构

```
src/
  app/
    page.tsx              # 首页
    layout.tsx            # 全局布局
    blog/page.tsx         # 博客列表
    blog/[slug]/page.tsx  # 文章详情 (SSG)
    gallery/page.tsx      # 影集
    about/page.tsx        # 关于我
  components/
    Header.tsx            # 导航栏
    Footer.tsx            # 页脚
    Carousel.tsx          # 相册浏览器
  lib/
    posts.ts              # Markdown 解析
content/
  posts/                  # Markdown 文章
  gallery.json            # 相册数据
public/
  admin/                  # 后台管理页
  images/                 # 图片资源
```

## 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 静态导出到 out/
```

## 部署流程

```
git push main → GitHub Actions → npm run build → wrangler pages deploy → l1ka.me
```

### 环境变量 (GitHub Secrets)

| Name | 说明 |
|------|------|
| `CF_API_TOKEN` | Cloudflare API Token (Pages:Edit 权限) |

## 后台管理

访问 `/admin`，密码登录后通过 GitHub API 直接编辑：

- 文章发布/编辑/删除 → `content/posts/*.md`
- 媒体上传 → `public/images/`, `public/videos/`
- 相册管理 → `content/gallery.json`

所有操作自动触发 GitHub Actions 部署，2-3 分钟后生效。
