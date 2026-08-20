/* Offline support.

   The whole tool is one HTML file, so caching that file is enough to make the app
   work with no connection at all. The job search is the only thing that needs the
   network, and it fails politely when there is none.

   Strategy: serve from cache first so it opens instantly, then quietly fetch a fresh
   copy in the background for next time. */

const CACHE = "resume-rubric-v1";
const CORE = [
  "./",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* job board APIs live on other hosts and must never be cached or intercepted */
  if (url.origin !== self.location.origin) return;

  /* the counter should always hit the network, never a stale number */
  if (url.pathname.endsWith("/stats")) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const fresh = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);

      return hit || fresh;
    })
  );
});
