(function () {
  "use strict";

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

  try {
    if (!localStorage.getItem("konyago_cookie_choice") && !document.getElementById("cookieBar")) {
      var bar = document.createElement("div");
      bar.id = "cookieBar";
      bar.className = "cookie-bar";
      bar.setAttribute("role", "dialog");
      bar.setAttribute("aria-label", "Çerez ve gizlilik bilgilendirmesi");
      bar.innerHTML =
        '<div class="cookie-bar-inner">' +
        "<p><strong>Çerez ve gizlilik</strong> — Site, temel işlev için cihazınızda zorunlu depolama kullanabilir. " +
        'Detay: <a href="gizlilik.html">Gizlilik & KVKK</a>. Bildirimler ayrıca ve isteğe bağlıdır.</p>' +
        '<div class="cookie-bar-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" id="cookieAccept">Kabul</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="cookieReject">Reddet</button>' +
        "</div></div>";
      document.body.appendChild(bar);
      document.getElementById("cookieAccept").onclick = function () {
        localStorage.setItem("konyago_cookie_choice", "accepted");
        bar.remove();
        maybeAskNotif();
      };
      document.getElementById("cookieReject").onclick = function () {
        localStorage.setItem("konyago_cookie_choice", "rejected");
        bar.remove();
      };
    } else if (localStorage.getItem("konyago_cookie_choice") === "accepted") {
      setTimeout(maybeAskNotif, 1200);
    }
  } catch (e) {}

  function maybeAskNotif() {
    try {
      if (!("Notification" in window)) return;
      if (localStorage.getItem("konyago_notif_pref")) return;
      if (sessionStorage.getItem("konyago_notif_prompted")) return;
      if (document.getElementById("notifPrompt")) return;
      sessionStorage.setItem("konyago_notif_prompted", "1");
      var p = document.createElement("div");
      p.id = "notifPrompt";
      p.className = "notif-prompt";
      p.innerHTML =
        "<p><strong>Duyuru bildirimi</strong> — Yeni duyuru olduğunda tarayıcı bildirimi almak ister misiniz? " +
        "İsteğe bağlıdır; reddedebilirsiniz. <a href=\"gizlilik.html\">Aydınlatma</a></p>" +
        '<div class="cookie-bar-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" id="npYes">İzin ver</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="npNo">Hayır</button>' +
        "</div>";
      document.body.appendChild(p);
      document.getElementById("npYes").onclick = function () {
        Notification.requestPermission().then(function (perm) {
          localStorage.setItem("konyago_notif_pref", perm === "granted" ? "on" : "denied");
          p.remove();
          checkDuyuruNotify();
        });
      };
      document.getElementById("npNo").onclick = function () {
        localStorage.setItem("konyago_notif_pref", "off");
        p.remove();
      };
    } catch (e) {}
  }

  function checkDuyuruNotify() {
    try {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      if (localStorage.getItem("konyago_notif_pref") !== "on") return;
      function run(D) {
        if (!D || !D.latestId) return;
        var seen = localStorage.getItem("konyago_duyuru_seen");
        if (seen === D.latestId) return;
        var item = (D.items && D.items[0]) || { title: "KonyaGo duyuru", body: "Yeni duyuru var." };
        localStorage.setItem("konyago_duyuru_seen", D.latestId);
        var opts = {
          body: item.body || "Yeni duyuru yayınlandı.",
          icon: "./assets/img/eagle.svg",
          data: { url: "./duyurular.html" },
          tag: "konyago-duyuru-" + D.latestId
        };
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(function (reg) {
            if (reg.showNotification) reg.showNotification(item.title || "KonyaGo", opts);
            else new Notification(item.title || "KonyaGo", opts);
          });
        } else {
          new Notification(item.title || "KonyaGo", opts);
        }
      }
      if (window.KONYAGO_DUYURULAR) run(window.KONYAGO_DUYURULAR);
      else {
        var s = document.createElement("script");
        s.src = "assets/js/duyurular.js";
        s.onload = function () { run(window.KONYAGO_DUYURULAR); };
        document.head.appendChild(s);
      }
    } catch (e) {}
  }

  if (localStorage.getItem("konyago_notif_pref") === "on") {
    setTimeout(checkDuyuruNotify, 800);
  }

  // =====================================================================
  // PAYLAŞIMLI ZİYARET SAYAÇLARI — günlük + toplam
  // Oturum başına 1 kez artar; tüm tarayıcılarda aynı değer.
  // =====================================================================
  (function sharedVisitCounter() {
    var elDay = document.getElementById("visitCount");
    var elTotal = document.getElementById("visitTotal");
    if (!elDay && !elTotal) return;

    if (elDay) elDay.textContent = "…";
    if (elTotal) elTotal.textContent = "…";

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
    var ns = "konyago.com.tr";
    var keyDay = "visits-" + day;
    var keyTotal = "visits-total";
    var sessionFlag = "konyago_shared_hit_" + day;
    var alreadyHit = false;
    try {
      alreadyHit = sessionStorage.getItem(sessionFlag) === "1";
    } catch (e) {}

    function parseCount(data) {
      if (data == null) return null;
      if (typeof data === "number" && isFinite(data)) return Math.floor(data);
      if (typeof data === "string" && /^\d+$/.test(data.trim())) return parseInt(data.trim(), 10);
      if (typeof data === "object") {
        if (typeof data.value === "number") return data.value;
        if (typeof data.count === "number") return data.count;
        if (typeof data.hits === "number") return data.hits;
      }
      return null;
    }

    function showDay(n) {
      if (!elDay) return;
      if (n == null || !isFinite(n) || n < 0) { elDay.textContent = "—"; return; }
      elDay.textContent = String(n);
      try {
        localStorage.setItem("konyago_shared_last", JSON.stringify({ day: day, count: n, t: Date.now() }));
      } catch (e) {}
    }

    function showTotal(n) {
      if (!elTotal) return;
      if (n == null || !isFinite(n) || n < 0) { elTotal.textContent = "—"; return; }
      elTotal.textContent = String(n);
      try {
        localStorage.setItem("konyago_shared_total", JSON.stringify({ count: n, t: Date.now() }));
      } catch (e) {}
    }

    function markHit() {
      try { sessionStorage.setItem(sessionFlag, "1"); } catch (e) {}
    }

    function fetchKey(key, hit) {
      function viaCountApi() {
        var url = hit
          ? "https://api.countapi.xyz/hit/" + encodeURIComponent(ns) + "/" + encodeURIComponent(key)
          : "https://api.countapi.xyz/get/" + encodeURIComponent(ns) + "/" + encodeURIComponent(key);
        return fetch(url, { method: "GET", mode: "cors", cache: "no-store" }).then(function (r) {
          if (!r.ok) throw new Error("countapi");
          return r.json();
        }).then(function (data) {
          var n = parseCount(data);
          if (n == null) throw new Error("parse");
          return n;
        });
      }
      function viaCounterApiDev() {
        var base = "https://api.counterapi.dev/v1/" + encodeURIComponent(ns) + "/" + encodeURIComponent(key);
        var url = hit ? base + "/up" : base;
        return fetch(url, { method: "GET", mode: "cors", cache: "no-store" }).then(function (r) {
          if (!r.ok) throw new Error("counterapi");
          return r.json();
        }).then(function (data) {
          var n = parseCount(data);
          if (n == null) throw new Error("parse");
          return n;
        });
      }
      function viaAbacus() {
        var path = hit ? "hit" : "get";
        var url = "https://abacus.jasoncameron.dev/" + path + "/" +
          encodeURIComponent(ns) + "/" + encodeURIComponent(key);
        return fetch(url, { method: "GET", mode: "cors", cache: "no-store" }).then(function (r) {
          if (!r.ok) throw new Error("abacus");
          return r.text();
        }).then(function (txt) {
          var n = parseCount(txt);
          if (n == null) {
            try { n = parseCount(JSON.parse(txt)); } catch (e) {}
          }
          if (n == null) throw new Error("parse");
          return n;
        });
      }
      return viaCountApi()
        .catch(function () { return viaCounterApiDev(); })
        .catch(function () { return viaAbacus(); });
    }

    var doHit = !alreadyHit;

    Promise.all([
      elDay ? fetchKey(keyDay, doHit).catch(function () { return null; }) : Promise.resolve(null),
      elTotal ? fetchKey(keyTotal, doHit).catch(function () { return null; }) : Promise.resolve(null)
    ]).then(function (results) {
      var dayN = results[0];
      var totalN = results[1];
      if (doHit && (dayN != null || totalN != null)) markHit();

      if (dayN != null) showDay(dayN);
      else {
        try {
          var last = JSON.parse(localStorage.getItem("konyago_shared_last") || "null");
          if (last && last.day === day && typeof last.count === "number") showDay(last.count);
          else showDay(null);
        } catch (e) { showDay(null); }
      }

      if (totalN != null) showTotal(totalN);
      else {
        try {
          var lastT = JSON.parse(localStorage.getItem("konyago_shared_total") || "null");
          if (lastT && typeof lastT.count === "number") showTotal(lastT.count);
          else showTotal(null);
        } catch (e) { showTotal(null); }
      }
    });
  })();

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
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
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
      var note = "";
      try { if (document.referrer) note = "ref: " + String(document.referrer).slice(0, 80); } catch (e2) {}
      data.events.push({ t: new Date().toISOString().replace("T", " ").slice(0, 19), path: path, note: note });
      if (data.events.length > 300) data.events = data.events.slice(-300);
      localStorage.setItem("konyago_analytics", JSON.stringify(data));
    }
  } catch (e) {}

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").then(function (reg) {
        reg.update();
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }).catch(function () {});
      if (window.caches) {
        caches.keys().then(function (keys) {
          keys.forEach(function (k) {
            if (k.indexOf("konyago") === 0 && k !== "konyago-v7") caches.delete(k);
          });
        });
      }
    });
  }
})();
