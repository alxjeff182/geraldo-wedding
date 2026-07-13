export function absoluteUrl(siteUrl: string, path: string): string {
  if (!path) return siteUrl.replace(/\/$/, "");
  if (/^https?:\/\//i.test(path)) return path;

  const base = siteUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
