(function () {
  "use strict";

  function onIdle(fn) {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(fn, { timeout: 2500 });
    } else {
      setTimeout(fn, 400);
    }
  }

  function afterLoad(fn) {
    if (document.readyState === "complete") fn();
    else window.addEventListener("load", fn, { once: true });
  }

  /* Reklam şeridi — hızlı, hafif */
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
      var html = "";
      for (var i = 0; i < items.length; i++) {
        html += '<span class="ad-ticker-item"><span class="ad-ticker-dot" aria-hidden="true"></span>' +
          items[i] + ' · <a href="' + mail + '">Teklif al</a></span>';
      }
      var ticker = document.createElement("div");
      ticker.className = "ad-ticker";
      ticker.setAttribute("role", "complementary");
      ticker.innerHTML = '<div class="ad-ticker-track">' + html + html + "</div>";
      document.body.insertBefore(ticker, document.body.firstChild);
    }
  } catch (e) {}

  /* Ağır scriptler: sayfa yüklendikten + idle sonra */
  afterLoad(function () {
    onIdle(function () {
      try {
        if (!document.querySelector("script[data-nobetci]")) {
          var ns = document.createElement("script");
          ns.src = "assets/js/nobetci.js";
          ns.defer = true;
          ns.setAttribute("data-nobetci", "1");
          document.body.appendChild(ns);
        }
      } catch (e) {}
      try {
        if (!document.querySelector("script[data-borsa]")) {
          var bs = document.createElement("script");
          bs.src = "assets/js/borsa.js";
          bs.defer = true;
          bs.setAttribute("data-borsa", "1");
          document.body.appendChild(bs);
        }
      } catch (e) {}
    });
  });

  /* Çerez — gecikmeli (ilk boyamayı engellemesin) */
  afterLoad(function () {
    setTimeout(function () {
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
    }, 1500);
  });

  /* Sayaç — inline yoksa yerel */
  (function visitCounter() {
    if (window.__konyagoVisitDone) return;
    var elDay = document.getElementById("visitCount");
    var elTotal = document.getElementById("visitTotal");
    if (!elDay && !elTotal) return;
    function istanbulDay() {
      try {
        return new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Istanbul",
          year: "numeric", month: "2-digit", day: "2-digit"
        }).format(new Date());
      } catch (e) {
        return new Date().toISOString().slice(0, 10);
      }
    }
    var day = istanbulDay();
    var KEY = "konyago_visits_v3";
    var sess = "konyago_v3_" + day;
    var dayN = 0, totalN = 0;
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || "{}");
      totalN = typeof o.total === "number" ? o.total : 0;
      if (o.day === day && typeof o.dayCount === "number") dayN = o.dayCount;
    } catch (e) {}
    var hit = false;
    try { hit = sessionStorage.getItem(sess) === "1"; } catch (e) {}
    if (!hit) {
      dayN += 1;
      totalN += 1;
      try {
        localStorage.setItem(KEY, JSON.stringify({ day: day, dayCount: dayN, total: totalN, t: Date.now() }));
        sessionStorage.setItem(sess, "1");
      } catch (e) {}
    }
    if (elDay) elDay.textContent = String(dayN);
    if (elTotal) elTotal.textContent = String(totalN);
  })();

  /* Analitik — idle */
  onIdle(function () {
    try {
      var path = (location.pathname || "/").replace(/\\/g, "/");
      if (path.indexOf("admin") === -1) {
        var raw = localStorage.getItem("konyago_analytics");
        var data = raw ? JSON.parse(raw) : { events: [], pages: {}, days: {} };
        if (!data.events) data.events = [];
        if (!data.pages) data.pages = {};
        if (!data.days) data.days = {};
        var dayKey;
        try {
          dayKey = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Europe/Istanbul",
            year: "numeric", month: "2-digit", day: "2-digit"
          }).format(new Date());
        } catch (e) {
          dayKey = new Date().toISOString().slice(0, 10);
        }
        if (!data.days[dayKey]) data.days[dayKey] = { hits: 0, sessions: 0 };
        data.days[dayKey].hits += 1;
        if (!sessionStorage.getItem("konyago_analytics_session")) {
          data.days[dayKey].sessions += 1;
          sessionStorage.setItem("konyago_analytics_session", "1");
        }
        data.pages[path] = (data.pages[path] || 0) + 1;
        data.events.push({ t: new Date().toISOString().replace("T", " ").slice(0, 19), path: path });
        if (data.events.length > 200) data.events = data.events.slice(-200);
        localStorage.setItem("konyago_analytics", JSON.stringify(data));
      }
    } catch (e) {}
  });

  /* Service worker — load sonrası */
  if ("serviceWorker" in navigator) {
    afterLoad(function () {
      navigator.serviceWorker.register("./sw.js").then(function (reg) {
        reg.update();
        if (reg.waiting) {
          try { reg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (e) {}
        }
      }).catch(function () {});
      if (window.caches) {
        caches.keys().then(function (keys) {
          keys.forEach(function (k) {
            if (k.indexOf("konyago") === 0 && k !== "konyago-v10") caches.delete(k);
          });
        });
      }
    });
  }
})();
