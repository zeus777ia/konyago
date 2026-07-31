(function () {
  "use strict";

  // --- Üst kayan reklam şeridi ---
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

  // --- Çerez / depolama onayı (KVKK bilgilendirme) ---
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

  // --- Duyuru bildirimi (izin + yeni id) ---
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

  // --- Kamu ziyaretçi sayacı ---
  try {
    var key = "konyago_visit_day";
    var countKey = "konyago_visit_count";
    var today = new Date().toISOString().slice(0, 10);
    var storedDay = localStorage.getItem(key);
    var count = parseInt(localStorage.getItem(countKey) || "0", 10);
    if (storedDay !== today) {
      count = 1;
      localStorage.setItem(key, today);
      localStorage.setItem(countKey, "1");
    } else if (!sessionStorage.getItem("konyago_hit")) {
      count += 1;
      localStorage.setItem(countKey, String(count));
      sessionStorage.setItem("konyago_hit", "1");
    }
    var el = document.getElementById("visitCount");
    if (el) el.textContent = String(count);
  } catch (e) {}

  // --- Analitik (admin) ---
  try {
    var path = (location.pathname || "/").replace(/\\/g, "/");
    if (path.indexOf("admin") === -1) {
      var raw = localStorage.getItem("konyago_analytics");
      var data = raw ? JSON.parse(raw) : { events: [], pages: {}, days: {} };
      if (!data.events) data.events = [];
      if (!data.pages) data.pages = {};
      if (!data.days) data.days = {};
      var dayKey = new Date().toISOString().slice(0, 10);
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
            if (k.indexOf("konyago") === 0 && k !== "konyago-v6") caches.delete(k);
          });
        });
      }
    });
  }
})();
