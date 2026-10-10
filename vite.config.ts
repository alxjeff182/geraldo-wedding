import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const PLACEHOLDER_SITE = "https://your-domain.com";

function htmlMetaPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, "");

  return {
    name: "html-meta",
    transformIndexHtml(html) {
      let out = html
        .replace(/content="\/assets/g, `content="${base}/assets`)
        .replace(/"image": "\/assets/g, `"image": "${base}/assets`)
        .replace(/property="og:url" content="[^"]*"/, `property="og:url" content="${base}/"`);

      if (!out.includes('rel="canonical"')) {
        out = out.replace("</head>", `    <link rel="canonical" href="${base}/" />\n  </head>`);
      } else {
        out = out.replace(
          /<link rel="canonical" href="[^"]*"\s*\/>/,
          `<link rel="canonical" href="${base}/" />`,
        );
      }

      return out;
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
  const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${base}/sitemap.xml
`;

  return {
    name: "sitemap",
    closeBundle() {
      writeFileSync(resolve("dist", "sitemap.xml"), xml);
      writeFileSync(resolve("public", "sitemap.xml"), xml);
      writeFileSync(resolve("dist", "robots.txt"), robots);
      writeFileSync(resolve("public", "robots.txt"), robots);
    },
  };
}

function serviceWorkerCacheVersionPlugin(version: string): Plugin {
  return {
    name: "sw-cache-version",
    closeBundle() {
      const swPath = resolve("dist", "sw.js");
      if (!existsSync(swPath)) return;
      const raw = readFileSync(swPath, "utf8");
      writeFileSync(swPath, raw.replace(/__CACHE_VERSION__/g, version));
    },
  };
}

function resolveSiteUrl(mode: string, env: Record<string, string>): string {
  const siteUrl = env.VITE_SITE_URL?.trim();
  if (mode === "production") {
    if (!siteUrl || siteUrl === PLACEHOLDER_SITE) {
      throw new Error(
        "VITE_SITE_URL must be set to your production URL for production builds (not https://your-domain.com).",
      );
    }
    return siteUrl;
  }
  return siteUrl || "http://localhost:5173";
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = resolveSiteUrl(mode, env);
  const cacheVersion =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
    createHash("sha256").update(`${siteUrl}-${Date.now()}`).digest("hex").slice(0, 12);

  return {
    plugins: [
      react(),
      tailwindcss(),
      htmlMetaPlugin(siteUrl),
      sitemapPlugin(siteUrl),
      serviceWorkerCacheVersionPlugin(cacheVersion),
    ],
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
