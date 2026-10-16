/* Cement Calc - opens with no signal. Everything is static: the network first, the saved copy when there is none. */
var C = "cement-calc-3";             /* 16 Oct 2026: new wording, WellDesk colours */
var FILES = ["./", "index.html", "app.js", "app.css", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(FILES); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok && new URL(e.request.url).origin === location.origin) { var cp = r.clone(); caches.open(C).then(function (c) { c.put(e.request, cp); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
