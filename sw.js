/* KonyaGo SW v25 */
var CACHE = "konyago-v25";
var PRECACHE = ["./", "./index.html", "./assets/css/app.css", "./assets/js/app.js", "./assets/img/eagle.svg", "./manifest.json"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(PRECACHE).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  var path = url.pathname || "";
  var isHTML = e.request.mode === "navigate" ||
    (e.request.headers.get("accept") || "").indexOf("text/html") !== -1 ||
    /\.html?$/.test(path) || path === "/" || path === "";
  var isCode = /\.(js|css)$/i.test(path);
  if (isHTML || isCode) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        try {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        } catch (err) {}
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (c) {
          return c || (isHTML ? caches.match("./index.html") : undefined);
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var net = fetch(e.request).then(function (res) {
        try {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        } catch (err) {}
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
