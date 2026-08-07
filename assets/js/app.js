(function () {
  "use strict";

  try {
    if (!document.querySelector("link[data-elite-css]")) {
      var el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = "assets/css/elite.css?v=1";
      el.media = "print";
      el.onload = function () { this.media = "all"; };
      el.setAttribute("data-elite-css", "1");
      document.head.appendChild(el);
    }
  } catch (e) {}

  try {
    if (!document.querySelector("link[data-sponsor-css]")) {
      var sp = document.createElement("link");
      sp.rel = "stylesheet";
      sp.href = "assets/css/sponsor.css?v=2";
      sp.setAttribute("data-sponsor-css", "1");
      document.head.appendChild(sp);
    }
  } catch (e) {}

  try {
    if (!document.querySelector("script[data-theme-js]")) {
      var ts = document.createElement("script");
      ts.src = "assets/js/theme.js?v=2";
      ts.defer = true;
      ts.setAttribute("data-theme-js", "1");
      document.head.appendChild(ts);
    }
  } catch (e) {}

  function onIdle(fn) {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(fn, { timeout: 2800 });
    } else {
      setTimeout(fn, 500);
    }
  }

  function afterLoad(fn) {
    if (document.readyState === "complete") fn();
    else window.addEventListener("load", fn, { once: true });
  }

  try {
    document.addEventListener("visibilitychange", function () {
      var paused = document.hidden;
      document.querySelectorAll(".ad-ticker-track,.eczane-ticker-track,.borsa-ticker-track").forEach(function (t) {
        t.style.animationPlayState = paused ? "paused" : "running";
      });
    }, { passive: true });
  } catch (e) {}

  try {
    var mail = "mailto:info@konyago.com.tr?subject=KonyaGo%20Reklam";
    var items = [
      { t: "✨ AysaTekin — En şık abiye modelleri · Kalite ve zarafet", href: "https://aysatekin.com", cta: "Keşfet" },
      { t: "👗 HOSGELDİN10 kodu ile yeni üyelere %10 indirim — AysaTekin", href: "https://aysatekin.com", cta: "Alışverişe başla" },
      { t: "💎 Özel günlerinize yakışan abiye ve takımlar — aysatekin.com", href: "https://aysatekin.com", cta: "Koleksiyon" },
      { t: "📢 Reklam & iş birliği — KonyaGo’da yerinizi alın", href: mail, cta: "Teklif al" },
      { t: "🏨 Otel · restoran · tur — görünürlük için yazın", href: mail, cta: "İletişim" }
    ];
    var html = "";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      html +=
        '<span class="ad-ticker-item"><span class="ad-ticker-dot" aria-hidden="true"></span>' +
        it.t +
        ' · <a href="' +
        it.href +
        '" target="_blank" rel="noopener sponsored">' +
        it.cta +
        "</a></span>";
    }
    var existing = document.querySelector(".ad-ticker");
    if (existing) {
      var track = existing.querySelector(".ad-ticker-track");
      if (track && !track.children.length) {
        track.innerHTML = html + html;
      }
    } else {
      var ticker = document.createElement("div");
      ticker.className = "ad-ticker";
      ticker.setAttribute("role", "complementary");
      ticker.setAttribute("aria-label", "Reklam şeridi");
      ticker.innerHTML = '<div class="ad-ticker-track">' + html + html + "</div>";
      document.body.insertBefore(ticker, document.body.firstChild);
    }
  } catch (e) {}

  /* Yan reklam kutularını düzgün yapıya çevir (metin/link çakışmasın) */
  try {
    document.querySelectorAll(".ad-rail .ad-box").forEach(function (box) {
      if (box.getAttribute("data-fixed") === "1") return;
      var strong = box.querySelector("strong");
      var link = box.querySelector("a");
      if (!strong || !link) return;
      var title = (strong.textContent || "").trim();
      var href = link.getAttribute("href") || "#";
      var cta = (link.textContent || "").trim();
      var clone = box.cloneNode(true);
      var rm = clone.querySelectorAll("strong, a, .ad-label, .ad-sub");
      for (var r = 0; r < rm.length; r++) rm[r].remove();
      var sub = (clone.textContent || "").replace(/\s+/g, " ").trim();
      var isSponsor = box.classList.contains("ad-sponsor-aysa") || /aysatekin|hosgeldin/i.test(title + href);
      var label = isSponsor ? '<span class="ad-label">Sponsor</span>' : "";
      box.innerHTML =
        label +
        "<strong>" +
        title +
        "</strong>" +
        (sub ? '<span class="ad-sub">' + sub + "</span>" : "") +
        '<a href="' +
        href +
        '"' +
        (href.indexOf("http") === 0 ? ' target="_blank" rel="noopener sponsored"' : "") +
        ">" +
        cta +
        "</a>";
      box.setAttribute("data-fixed", "1");
      if (isSponsor) box.classList.add("ad-box-gold", "ad-sponsor-aysa");
    });
  } catch (e) {}

  try {
    var aysaUrl = "https://aysatekin.com";
    function aysaBox(title, sub, cta) {
      return (
        '<div class="ad-box ad-box-gold ad-sponsor-aysa" data-fixed="1">' +
        '<span class="ad-label">Sponsor</span>' +
        "<strong>" +
        title +
        "</strong>" +
        (sub ? '<span class="ad-sub">' + sub + "</span>" : "") +
        '<a href="' +
        aysaUrl +
        '" target="_blank" rel="noopener sponsored">' +
        cta +
        "</a></div>"
      );
    }
    document.querySelectorAll(".ad-rail-left").forEach(function (rail) {
      if (!rail.querySelector(".ad-sponsor-aysa")) {
        rail.insertAdjacentHTML("afterbegin", aysaBox("AysaTekin", "En şık abiye · Kalite · %10 indirim", "aysatekin.com"));
      }
    });
    document.querySelectorAll(".ad-rail-right").forEach(function (rail) {
      if (!rail.querySelector(".ad-sponsor-aysa")) {
        rail.insertAdjacentHTML("afterbegin", aysaBox("HOSGELDİN10", "Yeni üyelere %10 indirim · Abiye & takım", "Alışverişe git"));
      }
    });
    if (!document.querySelector(".ad-sponsor-card") && document.getElementById("main")) {
      var banner =
        '<div class="ad-mobile ad-sponsor-card" role="complementary" aria-label="Sponsor reklam">' +
        '<span class="ad-label">Sponsor</span>' +
        "<strong>AysaTekin — En şık abiye elbise modelleri</strong>" +
        '<span class="ad-sub">Kaliteli kumaş · zarif kesim · özel günleriniz için</span>' +
        '<span class="ad-offer">Yeni üyelere <b>HOSGELDİN10</b> ile %10 indirim</span>' +
        '<a href="' +
        aysaUrl +
        '" target="_blank" rel="noopener sponsored">Koleksiyonu incele →</a></div>' +
        '<div class="ad-banner-wide ad-sponsor-wide" role="complementary" aria-label="Sponsor reklam">' +
        "<span>✨ <strong>AysaTekin</strong> — Zarafetin adresi · En şık abiye & takım · <em>HOSGELDİN10</em> ile %10 indirim</span>" +
        '<a href="' +
        aysaUrl +
        '" target="_blank" rel="noopener sponsored">aysatekin.com</a></div>';
      var main = document.getElementById("main");
      var trust = main.querySelector(".trust-strip");
      if (trust) trust.insertAdjacentHTML("afterend", banner);
      else main.insertAdjacentHTML("afterbegin", banner);
    }
  } catch (e) {}

  afterLoad(function () {
    onIdle(function () {
      try {
        if (!document.querySelector("script[data-nobetci]")) {
          var ns = document.createElement("script");
          ns.src = "assets/js/nobetci.js?v=2";
          ns.defer = true;
          ns.setAttribute("data-nobetci", "1");
          document.body.appendChild(ns);
        }
      } catch (e) {}
      try {
        if (!document.querySelector("script[data-borsa]")) {
          var bs = document.createElement("script");
          bs.src = "assets/js/borsa.js?v=4";
          bs.defer = true;
          bs.setAttribute("data-borsa", "1");
          document.body.appendChild(bs);
        }
      } catch (e) {}
    });
  });

  afterLoad(function () {
    setTimeout(function () {
      try {
        if (!localStorage.getItem("konyago_cookie_choice") && !document.getElementById("cookieBar")) {
          var bar = document.createElement("div");
          bar.id = "cookieBar";
          bar.className = "cookie-bar";
          bar.setAttribute("role", "dialog");
          bar.setAttribute("aria-modal", "false");
          bar.setAttribute("aria-label", "Çerez ve gizlilik bilgilendirmesi");
          bar.innerHTML =
            '<div class="cookie-bar-inner">' +
            '<p id="cookieBarTitle"><strong>Çerez ve gizlilik</strong> — Site temel işlev için cihazınızda zorunlu depolama kullanabilir. ' +
            '<a href="gizlilik.html">Gizlilik & KVKK</a></p>' +
            '<div class="cookie-bar-actions">' +
            '<button type="button" class="btn btn-primary btn-sm" id="cookieAccept">Kabul</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" id="cookieReject">Reddet</button>' +
            "</div></div>";
          bar.setAttribute("aria-describedby", "cookieBarTitle");
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
    }, 2200);
  });

  (function visitCounter() {
    if (window.__konyagoVisitDone) return;
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
    var KEY = "konyago_visits_v3";
    var sess = "konyago_v3_" + day;
    var dayN = 0,
      totalN = 0;
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || "{}");
      totalN = typeof o.total === "number" ? o.total : 0;
      if (o.day === day && typeof o.dayCount === "number") dayN = o.dayCount;
    } catch (e) {}
    var hit = false;
    try {
      hit = sessionStorage.getItem(sess) === "1";
    } catch (e) {}
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
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
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

  if ("serviceWorker" in navigator) {
    afterLoad(function () {
      navigator.serviceWorker
        .register("./sw.js")
        .then(function (reg) {
          reg.update();
          if (reg.waiting) {
            try {
              reg.waiting.postMessage({ type: "SKIP_WAITING" });
            } catch (e) {}
          }
        })
        .catch(function () {});
    });
  }
})();
