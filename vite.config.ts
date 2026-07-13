import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

function htmlMetaPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, "");

  return {
    name: "html-meta",
    transformIndexHtml(html) {
      return html
        .replace(/content="\/assets/g, `content="${base}/assets`)
        .replace(/"image": "\/assets/g, `"image": "${base}/assets`);
    },
  };
}

function sitemapPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, "");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  return {
    name: "sitemap",
    closeBundle() {
      writeFileSync(resolve("dist", "sitemap.xml"), xml);
      writeFileSync(resolve("public", "sitemap.xml"), xml);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL || "https://your-domain.com";

  return {
    plugins: [react(), tailwindcss(), htmlMetaPlugin(siteUrl), sitemapPlugin(siteUrl)],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            motion: ["framer-motion"],
            supabase: ["@supabase/supabase-js"],
          },
        },
      },
    },
  };
});
