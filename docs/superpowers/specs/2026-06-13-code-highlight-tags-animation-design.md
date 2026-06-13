# Spec: 后台标签下拉 + 代码高亮行号 + 过渡动画暗色优化

**Date:** 2026-06-13
**Status:** Approved

---

## 1. 标签下拉多选 (后台文章编辑器)

### 改动文件
- `public/admin/index.html`

### 设计
- 标签输入框右侧新增下拉按钮 `[▼]`
- 点击展开多选面板，列出所有已有标签（从 GitHub API 读取现有文章汇总）
- 勾选 → 追加到输入框（逗号分隔，自动去重）
- 取消勾选 → 从输入框移除该标签
- 已选中标签在下拉中显示勾选状态
- 点击面板外任意处关闭
- 输入框仍可手动输入新标签

### 实现要点
- `loadPostList()` 解析完文章后汇总 tags → 存入 `window._allTags`
- `showPostEditor()` 末尾渲染下拉面板
- 新增 `toggleTagDropdown()`, `toggleTag(tag)` 函数
- 纯 CSS 实现下拉面板样式

---

## 2. 代码高亮 + 行号

### 改动文件
- `src/app/blog/[slug]/page.tsx` — 引入 rehype-highlight
- `src/lib/rehype-code-lines.mjs` — 新文件，行号 rehype 插件
- `src/app/globals.css` — highlight.js 暗色主题 + 行号 CSS
- `package.json` — 新增 rehype-highlight 依赖

### 设计
- `react-markdown` + `remark-gfm` + `rehype-highlight`
- highlight.js 主题：`github-dark`（通过 CSS 引入）
- 行号通过自定义 rehype 插件实现：拆每行为 `<span class="code-line">`，CSS counter 显示行号
- 按需导入语言：js, ts, python, bash, yaml, json, markdown
- 服务端渲染时完成高亮，零客户端 JS

### rehype-code-lines 插件逻辑
```js
import { visit } from "unist-util-visit";
export default function rehypeCodeLines() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "code") return;
      if (!node.properties?.className?.includes("hljs")) return;
      const lines = node.children[0].value.split("\n");
      node.children = lines.map((line) => ({
        type: "element", tagName: "span",
        properties: { className: ["code-line"] },
        children: [{ type: "text", value: line || " " }],
      }));
    });
  };
}
```

### 行号 CSS
```css
pre code { counter-reset: line; }
pre code .code-line { display: block; counter-increment: line; }
pre code .code-line::before {
  content: counter(line);
  display: inline-block; width: 2rem; margin-right: 1rem;
  text-align: right; color: #636d83;
  user-select: none;
}
```

---

## 3. 过渡动画 + 暗色优化

### 改动文件
- `src/app/globals.css`

### 过渡动画 (纯 CSS)
```css
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
main { animation: fadeIn 0.3s ease; }

/* 卡片/按钮统一过渡 */
.card, .card-hover, .btn-primary, button, a {
  transition: all 0.3s ease;
}

/* 主题安全过渡 */
body, header, footer, .card, input, textarea, select {
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s;
}

/* 链接悬停下划线动画 */
a[href]:not(.btn-primary):not(.card-hover) {
  position: relative;
  transition: color 0.2s;
}
```

### 暗色优化
- 搜索框聚焦 → 边框 `#06b6d4`（accent），带 glow
- 选中文字 → `::selection` 高亮可读性
- 滚动条已在 base 层，保留
- 图片加载 → 暗色 placeholder 背景
- 标签 active 状态 → 提高对比度

---

## 风险 & 稳定性

| 项目 | 风险 | 缓解 |
|---|---|---|
| rehype-highlight 新依赖 | 低 | 纯 ESM、无运行时 JS、SSR 安全 |
| rehype-code-lines 自定义插件 | 低 | 仅静态构建阶段执行 |
| admin HTML 改动 | 低 | 仅新增功能，不动现有发布/编辑逻辑 |
| CSS 动画 | 极低 | 纯 CSS，不影响布局/交互 |

## 验证

- `npm run build` 通过
- `out/` 静态首页/博客页正常渲染
- 代码块有语法高亮 + 行号
- 后台标签下拉正常工作
