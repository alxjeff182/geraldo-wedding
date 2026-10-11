/** Secret WA desk path: /k/<token> (token 32–128 url-safe chars). */
const WA_DESK_PATH_RE = /^\/k\/([A-Za-z0-9_-]{32,128})\/?$/;

export type AppRoute = { kind: "admin" } | { kind: "wa-desk"; token: string } | { kind: "invite" };

export function parseAppRoute(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/admin") return { kind: "admin" };

  const match = path.match(WA_DESK_PATH_RE);
  if (match?.[1]) return { kind: "wa-desk", token: match[1] };

  return { kind: "invite" };
}

export function buildWaDeskPath(token: string): string {
  return `/k/${token}`;
}
