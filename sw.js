const CACHE_NAME = "flightdrop-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/add.html",
  "/watch.html",
  "/settings.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API calls, cache-first for the app shell.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return; // never cache API responses

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && event.request.method === "GET") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ---- Push notifications ---------------------------------------------------

self.addEventListener("push", (event) => {
  let data = { title: "FlightDrop", body: "A tracked fare just changed.", url: "/" };
  try {
    if (event.data) {
      const raw = event.data.json();
      // FCM's wire format wraps custom fields under a top-level "data" key
      // (alongside "from", "fcmMessageId", etc). Support that shape as well
      // as a flat payload, in case the transport ever changes.
      const payload = raw && typeof raw === "object" && raw.data ? raw.data : raw;
      data = { ...data, ...payload };
    }
  } catch (err) {
    // Non-JSON payload fallback.
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    data: { url: data.url || "/" },
    tag: data.watchId ? `watch-${data.watchId}` : undefined,
    renotify: true,
    vibrate: [80, 40, 80],
  };

  event.waitUntil(self.registration.showNotification(data.title || "FlightDrop", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
