---
title: "React Hooks 入门笔记"
date: "2026-06-08"
tags: ["React", "前端"]
excerpt: "学习 React Hooks 的核心概念与使用场景，包括 useState、useEffect 等常用 Hook。"
---

## 什么是 Hooks？

Hooks 是 React 16.8 引入的特性，让你在函数组件中使用 state 和生命周期功能。

### useState

```jsx
const [count, setCount] = useState(0);
```

### useEffect

```jsx
useEffect(() => {
  document.title = `点击了 ${count} 次`;
}, [count]);
```

## 总结

Hooks 让组件逻辑复用变得前所未有的简单。
