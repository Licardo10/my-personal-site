import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { Calendar, Tag } from "lucide-react";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
      <h1 className="section-title">技术博客</h1>
      <p className="text-dark-400 mb-12 max-w-2xl">
        这里记录了我阅读技术文章的笔记、实践中的思考与总结。
      </p>

      {posts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-dark-400 text-lg mb-2">暂无文章</p>
          <p className="text-dark-500 text-sm">内容正在准备中，敬请期待...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card-hover block">
              <h2 className="text-xl font-semibold text-white mb-3">{post.title}</h2>
              <p className="text-dark-400 mb-4 leading-relaxed">{post.excerpt}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500">
                <span className="flex items-center gap-1.5"><Calendar size={14} />{post.date}</span>
                {post.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-dark-700 rounded-full text-dark-400">
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
