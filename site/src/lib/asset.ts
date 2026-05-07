/**
 * Prepend the configured basePath to an absolute asset URL.
 * Used for static assets in /public (images, videos, audio) so they
 * resolve correctly when the site is served under a subpath
 * (e.g. GitHub Pages at /data.emotion).
 */
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!path.startsWith("/")) return path;
  return `${base}${path}`;
}
