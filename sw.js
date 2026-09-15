// Service worker for offline use. GENERATED from this file into ./sw.js by
// tools/build-web.mjs, which stamps 2d25dadabe with a hash of
// dist/app.js so every deploy that changes the app ships a new SW script.
// Browsers only check a SW for updates by comparing script bytes, so without
// a version that moves on every real change, a new deployment would never
// be noticed and old caches would never be cleared.
const CACHE_VERSION = "2d25dadabe";
const CACHE_NAME = `wfd-shell-${CACHE_VERSION}`;

// Everything is same-origin now — React is bundled into dist/app.js rather
// than loaded from a CDN — so a plain cache.addAll covers the whole shell.
const SHELL_URLS = ["./", "./index.html", "./manifest.json", "./icon.svg", "./dist/app.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isAppBundle = url.pathname.endsWith("/dist/app.js");
  const isNavigation = request.mode === "navigate";

  if (isAppBundle || isNavigation) {
    // Network-first: a new deployment always wins over the cache. Only
    // fall back to whatever's cached if the network is actually down.
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (manifest, icon): cache-first, since these rarely
  // change and a version bump already invalidates them.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return res;
      });
    })
  );
});
