/**
 * The site's public base URL, used for absolute links in metadata, robots.txt
 * and sitemap.xml. Override with NEXT_PUBLIC_SITE_URL; defaults to the domain.
 */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://dristitimes.com").replace(/\/$/, "");
}
