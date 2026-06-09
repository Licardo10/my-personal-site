import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { Calendar, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 pt-28 pb-20">
      <Link href="/blog" className="inline-flex items-center gap-2 text-dark-400 hover:text-accent transition-colors mb-8 text-sm">
        <ArrowLeft size={16} />返回博客列表
      </Link>
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500">
          <span className="flex items-center gap-1.5"><Calendar size={14} />{post.date}</span>
          {post.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-dark-700 rounded-full text-dark-400"><Tag size={12} />{tag}</span>
          ))}
        </div>
      </header>
      <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent-light prose-code:text-accent-light prose-code:bg-dark-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-dark-800 prose-pre:border prose-pre:border-dark-700 prose-blockquote:border-accent prose-blockquote:text-dark-300 prose-strong:text-white prose-img:rounded-lg prose-hr:border-dark-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
