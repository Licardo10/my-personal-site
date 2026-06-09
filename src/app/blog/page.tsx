import { getAllPosts } from "@/lib/posts";
import BlogSearch from "@/components/BlogSearch";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
      <h1 className="section-title">技术博客</h1>
      <p className="text-dark-400 mb-10 max-w-2xl">
        这里记录了我阅读技术文章的笔记、实践中的思考与总结。
      </p>

      {posts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-dark-400 text-lg mb-2">暂无文章</p>
          <p className="text-dark-500 text-sm">内容正在准备中，敬请期待...</p>
        </div>
      ) : (
        <BlogSearch posts={posts} />
      )}
    </div>
  );
}
