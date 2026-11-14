const CACHE = "fittrackr-offline-v1";
const PAGES = ["/", "/workouts/A", "/workouts/B", "/workouts/C"];

self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  await Promise.all((await caches.keys()).filter((key) => key.startsWith("fittrackr-offline-") && key !== CACHE).map((key) => caches.delete(key)));
  await self.clients.claim();
})()));

async function cachePage(path) {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store" });
  if (!response.ok || response.redirected || !response.headers.get("content-type")?.includes("text/html")) return;
  const cache = await caches.open(CACHE);
  await cache.put(path, response.clone());
  const html = await response.text();
  const assets = [...html.matchAll(/(?:src|href)="([^"\s]+)"/g)]
    .map((match) => match[1].replaceAll("&amp;", "&"))
    .filter((url) => url.startsWith("/_next/static/"));
  await Promise.allSettled(assets.map(async (url) => {
    const asset = await fetch(url);
    if (asset.ok) await cache.put(url, asset);
  }));
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_WORKOUTS") event.waitUntil(Promise.allSettled(PAGES.map(cachePage)));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate" && PAGES.includes(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && !response.redirected && response.headers.get("content-type")?.includes("text/html")) {
          const cache = await caches.open(CACHE);
          await cache.put(url.pathname, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(url.pathname)) || Response.error();
      }
    })());
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
      return response;
    })());
  }
});
