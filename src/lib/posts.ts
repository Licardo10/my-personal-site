import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

function formatDate(d: unknown): string {
  if (typeof d === "string") return d;
  if (d instanceof Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return "";
}

function estimateReadTime(content: string): number {
  const words = content.replace(/[#*`\[\]()>!|_~+\-=$]/g, "").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 300));
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  pinned: boolean;
  readingTime: number;
}

function parsePost(fileName: string): Post {
  const fileSlug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    slug: data.slug || fileSlug,
    title: data.title || fileSlug,
    date: formatDate(data.date),
    tags: data.tags || [],
    excerpt: data.excerpt || "",
    content,
    pinned: data.pinned === true,
    readingTime: estimateReadTime(content),
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory).filter((fn) => fn.endsWith(".md"));
  const allPosts = fileNames.map(parsePost);
  return allPosts.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.date < b.date ? 1 : -1;
  });
}

export function getPostBySlug(slug: string): Post | null {
  try {
    // Search by slug first
    const all = getAllPosts();
    const bySlug = all.find((p) => p.slug === slug);
    if (bySlug) return bySlug;

    // Fallback: try filename matching
    const fileName = `${slug}.md`;
    const fullPath = path.join(postsDirectory, fileName);
    if (!fs.existsSync(fullPath)) return null;
    return parsePost(fileName);
  } catch {
    return null;
  }
}
