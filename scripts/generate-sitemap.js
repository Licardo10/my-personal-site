const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SITE_URL = "https://l1ka.me";

function formatDate(d) {
  if (d instanceof Date) return d.toISOString().split("T")[0];
  if (typeof d === "string") return d.slice(0, 10);
  return new Date().toISOString().split("T")[0];
}

const outDir = path.join(__dirname, "..", "out");
const postsDir = path.join(__dirname, "..", "content", "posts");

// Static pages
const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/blog/", priority: "0.9", changefreq: "weekly" },
  { loc: "/gallery/", priority: "0.6", changefreq: "monthly" },
  { loc: "/about/", priority: "0.7", changefreq: "monthly" },
];

// Blog posts
const blogPages = [];
if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data } = matter(raw);
    const slug = data.slug || file.replace(/\.md$/, "");
    blogPages.push({
      loc: "/blog/" + slug + "/",
      priority: "0.8",
      changefreq: "monthly",
      lastmod: formatDate(data.date),
    });
  });
}

const allPages = [...staticPages, ...blogPages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml);
console.log(`Sitemap generated: ${allPages.length} URLs`);
