"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Tag, Calendar, Clock, Pin } from "lucide-react";
import type { Post } from "@/lib/posts";

interface Props {
  posts: Post[];
}

export default function BlogSearch({ posts }: Props) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");

  // 收集所有标签
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  // 过滤
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return posts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query, activeTag]);

  return (
    <div>
      {/* 搜索框 */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
        <input
          type="text"
          placeholder="搜索文章..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm
                     placeholder:text-dark-500 focus:outline-none focus:border-accent transition-colors"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTag("")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !activeTag ? "bg-accent text-white" : "bg-dark-700 text-dark-400 hover:text-white"
            }`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTag === tag ? "bg-accent text-white" : "bg-dark-700 text-dark-400 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 结果 */}
      <p className="text-dark-500 text-sm mb-4">
        {query || activeTag ? `找到 ${filtered.length} 篇文章` : `共 ${posts.length} 篇文章`}
      </p>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-dark-400 text-lg mb-2">没有找到匹配的文章</p>
          <p className="text-dark-500 text-sm">试试其他关键词或标签</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className={`card-hover block ${post.pinned ? "border-l-2 border-accent" : ""}`}>
              <div className="flex items-center gap-2 mb-2">
                {post.pinned && <Pin size={14} className="text-accent" />}
                <h2 className="text-xl font-semibold text-white">{post.title}</h2>
              </div>
              <p className="text-dark-400 mb-3 leading-relaxed">{post.excerpt}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-dark-500">
                <span className="flex items-center gap-1.5"><Calendar size={14} />{post.date}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{post.readingTime} min</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={(e) => { e.preventDefault(); setActiveTag(tag); }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-dark-700 rounded-full text-dark-400 hover:text-accent cursor-pointer transition-colors"
                  >
                    <Tag size={12} />{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
