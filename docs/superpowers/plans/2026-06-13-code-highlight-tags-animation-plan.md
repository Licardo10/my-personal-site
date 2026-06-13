# 标签下拉 + 代码高亮行号 + 过渡动画 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为后台文章编辑器添加标签下拉多选，为博客正文实现代码语法高亮+行号，为全局添加过渡动画和暗色优化。

**Architecture:** 三个独立功能模块：后台 JS 纯 DOM 操作实现标签下拉；通过 rehype-highlight + 自定义 rehype 插件在构建期完成代码高亮和行号注入；纯 CSS 实现过渡动画和微调。

**Tech Stack:** Next.js 14 (SSG export), react-markdown, rehype-highlight, highlight.js github-dark theme, Tailwind CSS 3

---

### Task 1: 安装 rehype-highlight 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 rehype-highlight**

```bash
npm install rehype-highlight
```

- [ ] **Step 2: 验证安装**

```bash
node -e "require('rehype-highlight')"
```
Expected: 无报错

---

### Task 2: 创建 rehype-code-lines 行号插件

**Files:**
- Create: `src/lib/rehype-code-lines.mjs`

- [ ] **Step 1: 写入插件代码**

`src/lib/rehype-code-lines.mjs`:

```js
import { visit } from "unist-util-visit";

export default function rehypeCodeLines() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "code") return;
      const classes = node.properties?.className;
      if (!classes || !Array.isArray(classes)) return;
      if (!classes.some((c) => c === "hljs" || c.startsWith("hljs-"))) return;
      if (!node.children || node.children.length === 0) return;
      const firstChild = node.children[0];
      if (firstChild.type !== "text") return;
      const text = firstChild.value;
      const lines = text.split("\n");
      if (lines.length > 1 && lines[lines.length - 1] === "") {
        lines.pop();
      }
      node.children = lines.map((line) => ({
        type: "element",
        tagName: "span",
        properties: { className: ["code-line"] },
        children: [{ type: "text", value: line || " " }],
      }));
    });
  };
}
```

---

### Task 3: 代码高亮 + 行号 CSS

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 在 globals.css 末尾追加样式**

```css
/* ========== Code Highlight (github-dark) ========== */
.hljs { color: #c9d1d9; background: #0d1117; }
.hljs-doctag, .hljs-keyword, .hljs-meta .hljs-keyword, .hljs-template-tag, .hljs-template-variable, .hljs-type, .hljs-variable.language_ { color: #ff7b72; }
.hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__, .hljs-title.function_ { color: #d2a8ff; }
.hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-id, .hljs-variable { color: #79c0ff; }
.hljs-meta .hljs-string, .hljs-regexp, .hljs-string { color: #a5d6ff; }
.hljs-built_in, .hljs-symbol { color: #ffa657; }
.hljs-code, .hljs-comment, .hljs-formula { color: #8b949e; }
.hljs-name, .hljs-quote, .hljs-selector-pseudo, .hljs-selector-tag { color: #7ee787; }
.hljs-subst { color: #c9d1d9; }
.hljs-section { color: #1f6feb; font-weight: 700; }
.hljs-bullet { color: #f2cc60; }
.hljs-emphasis { color: #c9d1d9; font-style: italic; }
.hljs-strong { color: #c9d1d9; font-weight: 700; }
.hljs-addition { color: #aff5b4; background-color: #033a16; }
.hljs-deletion { color: #ffdcd7; background-color: #67060c; }

/* ========== Line Numbers ========== */
pre code { counter-reset: line; }
pre code .code-line { display: block; counter-increment: line; }
pre code .code-line::before {
  content: counter(line);
  display: inline-block; width: 2rem; margin-right: 1rem;
  text-align: right; color: #484f58;
  user-select: none;
}
```

---

### Task 4: 博客详情页集成 rehype 插件

**Files:**
- Modify: `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: 更新 import**

```tsx
import rehypeHighlight from "rehype-highlight";
import rehypeCodeLines from "@/lib/rehype-code-lines";
```

- [ ] **Step 2: 更新 ReactMarkdown 属性**

```tsx
<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeCodeLines]}>
```

---

### Task 5: 标签下拉多选 (后台)

**Files:**
- Modify: `public/admin/index.html`

- [ ] **Step 1: loadPostList 中汇总已有标签**

```js
const allTags=new Set();
mds.forEach(f=>{
  try{const raw=b64Decode(f.content);const tm=raw.match(/tags:\s*\[([^\]]*)\]/)
  if(tm)tm[1].split(",").forEach(t=>{const ct=t.trim().replace(/"/g,"");if(ct)allTags.add(ct)})}catch(e){}
});
window._allTags=Array.from(allTags).sort();
```

- [ ] **Step 2: showPostEditor 标签输入框下方添加下拉面板**

```html
<div style='position:relative;margin-top:0'>
  <button id='tagDropdownBtn' onclick='toggleTagDropdown()'
    style='position:absolute;right:4px;top:-38px;width:28px;height:28px;border-radius:6px;border:1px solid #27272a;background:#18181b;color:#a1a1aa;cursor:pointer;font-size:12px'>▼</button>
  <div id='tagDropdown' style='display:none;position:absolute;top:-4px;right:0;width:220px;max-height:200px;overflow-y:auto;background:#18181b;border:1px solid #27272a;border-radius:8px;z-index:100;padding:8px'>
    ...checkboxes...
  </div>
</div>
```

- [ ] **Step 3: 新增 toggleTagDropdown / toggleTag / syncTagCheckboxes 函数**

```js
function toggleTagDropdown(){const d=$id("tagDropdown");if(d.style.display==="none"){d.style.display="block";syncTagCheckboxes()}else d.style.display="none"}
function syncTagCheckboxes(){const current=$id("eTags").value.split(/[,，]/).map(x=>x.trim()).filter(Boolean);document.querySelectorAll("#tagDropdown input[type=checkbox]").forEach(cb=>{cb.checked=current.includes(cb.value)})}
function toggleTag(tag){const inp=$id("eTags");const current=inp.value.split(/[,，]/).map(x=>x.trim()).filter(Boolean);const idx=current.indexOf(tag);if(idx>=0)current.splice(idx,1);else current.push(tag);inp.value=current.join(",");syncTagCheckboxes()}
```

- [ ] **Step 4: 全局点击关闭下拉**

在 `render()` 末尾追加:

```js
document.addEventListener("click",function(e){const d=$id("tagDropdown");if(!d||d.style.display==="none")return;if(!e.target.closest("#tagDropdown")&&!e.target.closest("#tagDropdownBtn"))d.style.display="none"})
```

---

### Task 6: 过渡动画 + 暗色优化

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 末尾追加动画和优化**

```css
/* ========== Page Transition ========== */
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
main > * { animation: fadeIn 0.35s ease-out; }

/* ========== Universal Transitions ========== */
.card, .card-hover { transition: all 0.25s ease; }
a { transition: color 0.2s, border-color 0.2s; }
button { transition: all 0.2s ease; }
input, textarea, select { transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s; }

/* ========== Dark Theme Polish ========== */
input:focus, textarea:focus { box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15); }
::selection { background: rgba(6, 182, 212, 0.25); color: #22d3ee; }
img { background: #1e293b; }
.prose img { background: #1e293b; min-height: 100px; }
```

---

### Task 7: 构建验证 + 提交

- [ ] **Step 1: 构建**

```bash
npm run build
```

- [ ] **Step 2: 验证代码块有 hljs 类名**

```bash
rg "hljs" out/blog/my_RAG_API/index.html | head -3
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: 标签下拉多选 + 代码高亮行号 + 过渡动画暗色优化"
git push
```
