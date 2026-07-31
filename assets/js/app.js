(function () {
  "use strict";

  /* —— Reklam şeridi —— */
  try {
    if (!document.querySelector(".ad-ticker")) {
      var mail = "mailto:cnrtech@outlook.com.tr?subject=KonyaGo%20Reklam";
      var items = [
        "📢 Reklam & iş birliği — KonyaGo’da yerinizi alın",
        "🏨 Otel · restoran · tur — görünürlük için yazın",
        "🛍️ Marka ortaklığı ve sponsorluk fırsatları",
        "✉️ cnrtech@outlook.com.tr",
        "🤝 Yerel işletmeler için özel paketler"
      ];
      function buildItems() {
        var html = "";
        for (var i = 0; i < items.length; i++) {
          html += '<span class="ad-ticker-item"><span class="ad-ticker-dot" aria-hidden="true"></span>' +
            items[i] + ' · <a href="' + mail + '">Teklif al</a></span>';
        }
        return html;
      }
      var ticker = document.createElement("div");
      ticker.className = "ad-ticker";
      ticker.setAttribute("role", "complementary");
      ticker.setAttribute("aria-label", "Reklam şeridi");
      ticker.innerHTML = '<div class="ad-ticker-track">' + buildItems() + buildItems() + "</div>";
      document.body.insertBefore(ticker, document.body.firstChild);
    }
  } catch (e) {}

  /* —— Nöbetçi + borsa —— */
  try {
    if (!document.querySelector("script[data-nobetci]")) {
      var ns = document.createElement("script");
      ns.src = "assets/js/nobetci.js";
      ns.defer = true;
      ns.setAttribute("data-nobetci", "1");
      document.head.appendChild(ns);
    }
  } catch (e) {}
  try {
    if (!document.querySelector("script[data-borsa]")) {
      var bs = document.createElement("script");
      bs.src = "assets/js/borsa.js";
      bs.defer = true;
      bs.setAttribute("data-borsa", "1");
      document.head.appendChild(bs);
    }
  } catch (e) {}

  /* —— Çerez —— */
  try {
    if (!localStorage.getItem("konyago_cookie_choice") && !document.getElementById("cookieBar")) {
      var bar = document.createElement("div");
      bar.id = "cookieBar";
      bar.className = "cookie-bar";
      bar.setAttribute("role", "dialog");
      bar.innerHTML =
        '<div class="cookie-bar-inner">' +
        "<p><strong>Çerez ve gizlilik</strong> — Site temel işlev için cihazınızda zorunlu depolama kullanabilir. " +
        '<a href="gizlilik.html">Gizlilik & KVKK</a></p>' +
        '<div class="cookie-bar-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" id="cookieAccept">Kabul</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="cookieReject">Reddet</button>' +
        "</div></div>";
      document.body.appendChild(bar);
      document.getElementById("cookieAccept").onclick = function () {
        localStorage.setItem("konyago_cookie_choice", "accepted");
        bar.remove();
      };
      document.getElementById("cookieReject").onclick = function () {
        localStorage.setItem("konyago_cookie_choice", "rejected");
        bar.remove();
      };
    }
  } catch (e) {}

  /* —— Ziyaretçi sayacı (yerel + paylaşımlı yedekler) —— */
  (function visitCounter() {
    var elDay = document.getElementById("visitCount");
    var elTotal = document.getElementById("visitTotal");
    if (!elDay && !elTotal) return;

    function istanbulDay() {
      try {
        return new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Istanbul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(new Date());
      } catch (e) {
        return new Date().toISOString().slice(0, 10);
      }
    }

    var day = istanbulDay();
    var sessKey = "konyago_hit_" + day;
    var already = false;
    try { already = sessionStorage.getItem(sessKey) === "1"; } catch (e) {}

    function parseN(data) {
      if (data == null) return null;
      if (typeof data === "number" && isFinite(data) && data >= 0) return Math.floor(data);
      if (typeof data === "string") {
        var m = data.match(/\d+/);
        if (m) return parseInt(m[0], 10);
      }
      if (typeof data === "object") {
        if (typeof data.value === "number") return Math.floor(data.value);
        if (typeof data.count === "number") return Math.floor(data.count);
        if (typeof data.hits === "number") return Math.floor(data.hits);
        if (data.data && typeof data.data.value === "number") return Math.floor(data.data.value);
      }
      return null;
    }

    function readLocal() {
      var dayN = 0, totalN = 0;
      try {
        var raw = localStorage.getItem("konyago_visits_v2");
        var o = raw ? JSON.parse(raw) : null;
        if (o && typeof o === "object") {
          totalN = typeof o.total === "number" ? o.total : 0;
          if (o.day === day && typeof o.dayCount === "number") dayN = o.dayCount;
        }
      } catch (e) {}
      return { day: dayN, total: totalN };
    }

    function writeLocal(dayN, totalN) {
      try {
        localStorage.setItem("konyago_visits_v2", JSON.stringify({
          day: day,
          dayCount: dayN,
          total: totalN,
          t: Date.now()
        }));
      } catch (e) {}
    }

    function show(dayN, totalN) {
      if (elDay) elDay.textContent = dayN == null ? "—" : String(dayN);
      if (elTotal) elTotal.textContent = totalN == null ? "—" : String(totalN);
    }

    // 1) Yerel — her zaman çalışır
    var local = readLocal();
    if (!already) {
      local.day += 1;
      local.total += 1;
      writeLocal(local.day, local.total);
      try { sessionStorage.setItem(sessKey, "1"); } catch (e) {}
      already = true;
    }
    show(local.day, local.total);

    // 2) Paylaşımlı API’ler (başarılı olursa üzerine yazar)
    function tryShared() {
      var namespace = "konyago-com-tr";
      var dayKey = "d-" + day.replace(/-/g, "");
      var totalKey = "total";

      function hitCounterApi(key) {
        var url = "https://api.counterapi.dev/v1/" + namespace + "/" + key + "/up";
        return fetch(url, { mode: "cors", cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("capi");
            return r.json();
          })
          .then(function (j) {
            var n = parseN(j);
            if (n == null) throw new Error("parse");
            return n;
          });
      }

      function hitCountApiXyz(key) {
        var url = "https://api.countapi.xyz/hit/" + namespace + "/" + key;
        return fetch(url, { mode: "cors", cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("xyz");
            return r.json();
          })
          .then(function (j) {
            var n = parseN(j);
            if (n == null) throw new Error("parse");
            return n;
          });
      }

      function hitAbacus(key) {
        var url = "https://abacus.jasoncameron.dev/hit/" + namespace + "/" + key;
        return fetch(url, { mode: "cors", cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("abacus");
            return r.text();
          })
          .then(function (t) {
            var n = parseN(t);
            if (n == null) {
              try { n = parseN(JSON.parse(t)); } catch (e) {}
            }
            if (n == null) throw new Error("parse");
            return n;
          });
      }

      function anyHit(key) {
        return hitCounterApi(key)
          .catch(function () { return hitCountApiXyz(key); })
          .catch(function () { return hitAbacus(key); });
      }

      function anyGet(key) {
        // get variants
        function getCapi() {
          return fetch("https://api.counterapi.dev/v1/" + namespace + "/" + key, {
            mode: "cors", cache: "no-store"
          }).then(function (r) {
            if (!r.ok) throw new Error("g");
            return r.json();
          }).then(parseN).then(function (n) {
            if (n == null) throw new Error("p");
            return n;
          });
        }
        function getXyz() {
          return fetch("https://api.countapi.xyz/get/" + namespace + "/" + key, {
            mode: "cors", cache: "no-store"
          }).then(function (r) {
            if (!r.ok) throw new Error("g");
            return r.json();
          }).then(parseN).then(function (n) {
            if (n == null) throw new Error("p");
            return n;
          });
        }
        return getCapi().catch(function () { return getXyz(); });
      }

      // Oturumda bir kez hit, değilse get
      var doHit = true;
      try {
        if (sessionStorage.getItem("konyago_shared_hit_" + day) === "1") doHit = false;
      } catch (e) {}

      var pDay = doHit ? anyHit(dayKey) : anyGet(dayKey);
      var pTot = doHit ? anyHit(totalKey) : anyGet(totalKey);

      Promise.all([
        pDay.catch(function () { return null; }),
        pTot.catch(function () { return null; })
      ]).then(function (res) {
        var d = res[0], t = res[1];
        if (doHit && (d != null || t != null)) {
          try { sessionStorage.setItem("konyago_shared_hit_" + day, "1"); } catch (e) {}
        }
        // Paylaşımlı değer varsa göster (daha gerçekçi global sayı)
        if (d != null || t != null) {
          show(d != null ? d : local.day, t != null ? t : local.total);
          if (d != null && t != null) {
            try {
              localStorage.setItem("konyago_shared_cache", JSON.stringify({
                day: day, dayCount: d, total: t, t: Date.now()
              }));
            } catch (e) {}
          }
        } else {
          // API yok — önbellek paylaşılmış sayı
          try {
            var c = JSON.parse(localStorage.getItem("konyago_shared_cache") || "null");
            if (c && c.day === day && typeof c.dayCount === "number") {
              show(Math.max(c.dayCount, local.day), Math.max(c.total || 0, local.total));
            }
          } catch (e) {}
        }
      });
    }

    tryShared();
  })();

  /* —— Basit sayfa analitigi (admin) —— */
  try {
    var path = (location.pathname || "/").replace(/\\/g, "/");
    if (path.indexOf("admin") === -1) {
      var raw = localStorage.getItem("konyago_analytics");
      var data = raw ? JSON.parse(raw) : { events: [], pages: {}, days: {} };
      if (!data.events) data.events = [];
      if (!data.pages) data.pages = {};
      if (!data.days) data.days = {};
      var dayKey = (function () {
        try {
          return new Intl.DateTimeFormat("en-CA", {
            timeZone: "Europe/Istanbul",
            year: "numeric", month: "2-digit", day: "2-digit"
          }).format(new Date());
        } catch (e) {
          return new Date().toISOString().slice(0, 10);
        }
      })();
      if (!data.days[dayKey]) data.days[dayKey] = { hits: 0, sessions: 0 };
      data.days[dayKey].hits += 1;
      if (!sessionStorage.getItem("konyago_analytics_session")) {
        data.days[dayKey].sessions += 1;
        sessionStorage.setItem("konyago_analytics_session", "1");
      }
      data.pages[path] = (data.pages[path] || 0) + 1;
      data.events.push({
        t: new Date().toISOString().replace("T", " ").slice(0, 19),
        path: path
      });
      if (data.events.length > 300) data.events = data.events.slice(-300);
      localStorage.setItem("konyago_analytics", JSON.stringify(data));
    }
  } catch (e) {}

  /* —— Service worker —— */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").then(function (reg) {
        reg.update();
        if (reg.waiting) {
          try { reg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (e) {}
        }
      }).catch(function () {});
      if (window.caches) {
        caches.keys().then(function (keys) {
          keys.forEach(function (k) {
            if (k.indexOf("konyago") === 0 && k !== "konyago-v9") {
              caches.delete(k);
            }
          });
        });
      }
    });
  }
})();
