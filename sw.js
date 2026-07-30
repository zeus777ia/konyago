var CACHE = "konyago-v3";
var ASSETS = ["./","./index.html","./tarihce.html","./gezilecek.html","./harita.html","./ulasim.html","./pratik.html","./assets/css/app.css","./assets/js/app.js","./manifest.json","./icon.svg"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(function (r) {
    return r || fetch(e.request).catch(function () { return caches.match("./index.html"); });
  }));
});
