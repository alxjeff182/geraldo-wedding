const CACHE_NAME = "geraldo-wedding-__CACHE_VERSION__";

function isHashedAsset(pathname) {
  return /^\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.(js|css|woff2?)$/i.test(pathname);
}

function isBallroomAsset(pathname) {
  return pathname.startsWith("/assets/ballroom/");
}

function isHtmlRequest(request) {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached ?? network;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error("offline");
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isHashedAsset(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (isBallroomAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  if (isHtmlRequest(event.request)) {
    event.respondWith(networkFirst(event.request));
  }
});
