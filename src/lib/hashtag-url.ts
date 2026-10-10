/** Instagram explore URL for a wedding hashtag (with or without leading #). */
export function hashtagExploreUrl(tag: string): string {
  const clean = tag.replace(/^#/, "").trim();
  return `https://www.instagram.com/explore/tags/${encodeURIComponent(clean)}/`;
}
