/* KonyaGo SW v9 */
var CACHE = "konyago-v9";
var PRECACHE = [
  "./",
  "./index.html",
  "./assets/css/app.css",
  "./assets/js/app.js",
  "./assets/img/eagle.svg",
  "./manifest.json"
];

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

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = (e.notification && e.notification.data && e.notification.data.url) || "./duyurular.html";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url && "focus" in list[i]) {
          list[i].navigate(url);
          return list[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
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
