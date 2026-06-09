import Link from "next/link";
import { ArrowRight, BookOpen, Camera, User } from "lucide-react";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="min-h-[80vh] flex flex-col justify-center py-20">
        <p className="text-accent font-mono text-sm mb-4">你好，我是</p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="gradient-text">Licardo</span>
        </h1>
        <p className="text-xl md:text-2xl text-dark-300 mb-4 max-w-2xl">
          一名热爱技术的开发者
        </p>
        <p className="text-dark-400 text-lg mb-8 max-w-xl leading-relaxed">
          记录技术学习的点滴，分享阅读笔记与心得体会，也用镜头捕捉生活中的美好瞬间。
        </p>
        <div className="flex gap-4">
          <Link href="/blog" className="btn-primary inline-flex items-center gap-2">
            阅读博客 <ArrowRight size={18} />
          </Link>
          <Link href="/about"
            className="px-6 py-3 border border-dark-600 text-dark-300 rounded-lg
                       hover:border-accent hover:text-accent transition-all duration-300">
            了解更多
          </Link>
        </div>
      </section>

      <section className="py-16">
        <h2 className="section-title">探索我的站点</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/blog" className="card-hover group">
            <BookOpen className="text-accent mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-accent transition-colors">技术博客</h3>
            <p className="text-dark-400 text-sm leading-relaxed">阅读笔记、技术思考、学习心得</p>
          </Link>
          <Link href="/gallery" className="card-hover group">
            <Camera className="text-accent mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-accent transition-colors">影集</h3>
            <p className="text-dark-400 text-sm leading-relaxed">用照片和视频记录生活点滴</p>
          </Link>
          <Link href="/about" className="card-hover group">
            <User className="text-accent mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-accent transition-colors">关于我</h3>
            <p className="text-dark-400 text-sm leading-relaxed">了解我的经历与技能</p>
          </Link>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title mb-0">最新文章</h2>
            <Link href="/blog"
              className="text-accent hover:text-accent-light transition-colors text-sm font-medium flex items-center gap-1">
              查看全部 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card-hover block">
                <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                <p className="text-dark-400 text-sm mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-dark-500">
                  <span>{post.date}</span>
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-dark-700 rounded-full text-dark-400">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
