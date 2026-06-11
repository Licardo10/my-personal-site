const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SITE_URL = "https://l1ka.me";
const SITE_TITLE = "YuMo";
const SITE_DESC = "技术笔记 · 摄影记录 · 个人博客";

function formatDate(d) {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return new Date(d).toISOString();
  return new Date().toISOString();
}

const postsDir = path.join(__dirname, "..", "content", "posts");
const outDir = path.join(__dirname, "..", "out");

if (!fs.existsSync(postsDir)) {
  console.log("No posts directory, skipping RSS");
  process.exit(0);
}

const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

const items = files
  .map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(raw);
    const slug = data.slug || file.replace(/\.md$/, "");
    const excerpt = data.excerpt || content.slice(0, 200).replace(/[#*`\[\]()\n]/g, " ").trim();
    return {
      title: data.title || slug,
      date: formatDate(data.date),
      slug,
      excerpt,
      tags: data.tags || [],
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${SITE_TITLE}</title>
  <link>${SITE_URL}</link>
  <description>${SITE_DESC}</description>
  <language>zh-CN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `  <item>
    <title>${item.title}</title>
    <link>${SITE_URL}/blog/${item.slug}/</link>
    <guid isPermaLink="true">${SITE_URL}/blog/${item.slug}/</guid>
    <pubDate>${item.date}</pubDate>
    <description><![CDATA[${item.excerpt}]]></description>
    ${item.tags.map((t) => `<category>${t}</category>`).join("\n    ")}
  </item>`
  )
  .join("\n")}
</channel>
</rss>`;

fs.writeFileSync(path.join(outDir, "rss.xml"), rss);
console.log(`RSS generated: ${items.length} items`);

