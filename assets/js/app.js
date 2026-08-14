(function () {
  "use strict";

  /* Force dark + readable tokens immediately */
  try {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.setProperty("--green-deep", "#F5F2EB", "important");
    document.documentElement.style.setProperty("--muted", "#D4DBE6", "important");
    document.documentElement.style.setProperty("--text", "#F5F2EB", "important");
    document.documentElement.style.setProperty("--green", "#C9A227", "important");
    document.documentElement.style.setProperty("--white", "#152A42", "important");
    document.documentElement.style.setProperty("--cream", "#0A1628", "important");
    document.documentElement.style.setProperty("--bg", "#0A1628", "important");
    document.documentElement.style.setProperty("--bg-card", "#152A42", "important");
  } catch (e) {}

  /* Inline nuclear styles — always last, always wins. Covers every page text + layout */
  try {
    if (!document.getElementById("konyago-readable")) {
      var s = document.createElement("style");
      s.id = "konyago-readable";
      s.textContent = [
        "html,body{background:#0A1628!important;color:#F5F2EB!important}",
        ".page-head h1,main h1,h1,.section-title{color:#F5F2EB!important;font-family:'Cormorant Garamond',Georgia,serif!important}",
        ".page-head p,.page-head .lead,.page-head .sub,.page-head a{color:#D4DBE6!important;opacity:1!important}",
        ".page-head a,a.back-link,.breadcrumb a{color:#E8C84A!important}",
        ".info,.info.warn,.ad-banner{background:#152A42!important;border:1px solid rgba(201,162,39,.25)!important;color:#F5F2EB!important}",
        ".info h2,.info p,.info li,.ad-banner,.ad-banner *{color:#D4DBE6!important}",
        ".info h2{color:#F5F2EB!important}",
        ".ad-banner a{color:#E8C84A!important}",
        ".prose,.prose p,.prose li{color:#D4DBE6!important;background:transparent!important}",
        ".prose h2,.prose h3{color:#F5F2EB!important}",
        ".place,.place-body,.place-body p,.place-body *{color:#D4DBE6!important}",
        ".place-body h2{color:#F5F2EB!important}",
        ".card p,.kesfet-card p,.about-card p,.content p,.note{color:#D4DBE6!important}",
        ".card h2,.card h3,.kesfet-card h3{color:#F5F2EB!important}",
        "main h2,main h3,.section h2,.section-title{color:#F5F2EB!important}",
        ".filter-bar button,.chip,.tag{color:#D4DBE6!important}",
        "input,select,textarea{background:#152A42!important;color:#F5F2EB!important;border-color:rgba(201,162,39,.25)!important}",
        "p,li,label,small,.muted,.meta,.desc,.note{color:#D4DBE6!important}",
        "strong,b,h1,h2,h3,h4{color:#F5F2EB!important}",
        "@media(min-width:1100px){main.container,.container:not(.header-inner){padding-left:170px!important;padding-right:170px!important;max-width:1180px!important;box-sizing:border-box!important}.ad-rail{width:150px!important;z-index:5!important}.page-head{margin-left:0!important;padding-left:0!important}}",
        ".ad-rail .ad-box:not(.ad-sponsor-aysa){background:#152A42!important;border-color:rgba(201,162,39,.25)!important;color:#D4DBE6!important}",
        ".ad-rail .ad-box:not(.ad-sponsor-aysa) strong{color:#F5F2EB!important}",
        ".ad-rail .ad-box:not(.ad-sponsor-aysa) a{color:#E8C84A!important}",
        ".place-visual .pv-label{color:#F5F2EB!important;opacity:0.95!important}"
      ].join("");
      document.head.appendChild(s);
    }
  } catch (e) {}

  try {
    if (!document.querySelector("link[data-app-css-v30]")) {
      var ac = document.createElement("link");
      ac.rel = "stylesheet";
      ac.href = "assets/css/app.css?v=30";
      ac.setAttribute("data-app-css-v30", "1");
      document.head.appendChild(ac);
    }
  } catch (e) {}

  /* Ticker layout restore — overflow + marquee (navy+gold) */
  try {
    if (!document.getElementById("konyago-ticker-css")) {
      var tss = document.createElement("style");
      tss.id = "konyago-ticker-css";
      tss.textContent = [
        ":root{--safe-t:env(safe-area-inset-top,0px);--ticker-h:36px;--eczane-h:32px;--borsa-h:32px}",
        ".ad-ticker{position:sticky;top:0;z-index:110;height:var(--ticker-h);overflow:hidden;background:linear-gradient(90deg,#0A1628 0%,#12243A 40%,#0F1E32 70%,#0A1628 100%);color:#F5F2EB;border-bottom:1px solid rgba(201,162,39,.35);box-shadow:0 2px 10px rgba(0,0,0,.25);padding-top:var(--safe-t);min-height:calc(var(--ticker-h) + var(--safe-t))}",
        ".ad-ticker-track{display:flex;width:max-content;align-items:center;height:var(--ticker-h);animation:tickerScroll 28s linear infinite;will-change:transform}",
        ".ad-ticker:hover .ad-ticker-track{animation-play-state:paused}",
        ".ad-ticker-item{display:inline-flex;align-items:center;gap:10px;white-space:nowrap;padding:0 28px;font-size:.78rem;font-weight:600;color:#E8ECF0}",
        ".ad-ticker-item a{color:#E8C84A;font-weight:800;text-decoration:underline;text-underline-offset:2px}",
        ".ad-ticker-dot{width:5px;height:5px;border-radius:50%;background:#C9A227;flex-shrink:0}",
        "@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}",
        ".eczane-ticker{position:sticky;top:calc(var(--ticker-h) + var(--safe-t));z-index:109;display:flex;align-items:stretch;min-height:var(--eczane-h);height:var(--eczane-h);overflow:hidden;background:linear-gradient(90deg,#0D1A2C 0%,#152A42 45%,#12243A 100%);color:#F5F2EB;font-size:.76rem;font-weight:600;border-bottom:1px solid rgba(201,162,39,.28)}",
        ".eczane-ticker-label{flex:0 0 auto;padding:0 12px;background:rgba(201,162,39,.18);color:#E8C84A;white-space:nowrap;display:flex;align-items:center;gap:4px;font-size:.72rem;font-weight:700}",
        ".eczane-ticker-label a{color:#E8C84A;text-decoration:underline;font-weight:800}",
        ".eczane-ticker-viewport{flex:1;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}",
        ".eczane-ticker-track{display:inline-flex;white-space:nowrap;align-items:center;animation:eczaneMarquee 70s linear infinite;height:100%;width:max-content}",
        ".eczane-ticker:hover .eczane-ticker-track{animation-play-state:paused}",
        ".eczane-ticker-item{display:inline-flex;align-items:center;gap:6px;padding:0 16px;white-space:nowrap;color:#E8ECF0}",
        ".eczane-ticker-dot{width:5px;height:5px;border-radius:50%;background:#C9A227;flex-shrink:0}",
        "@keyframes eczaneMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}",
        ".borsa-ticker{position:sticky;top:calc(var(--ticker-h) + var(--eczane-h) + var(--safe-t));z-index:108;display:flex;align-items:stretch;min-height:var(--borsa-h);height:var(--borsa-h);overflow:hidden;background:linear-gradient(90deg,#0A1628 0%,#1A3050 40%,#12243A 100%);color:#F5F2EB;font-size:.76rem;font-weight:600;border-bottom:1px solid rgba(201,162,39,.32);box-shadow:0 2px 8px rgba(0,0,0,.12)}",
        ".borsa-ticker-label{flex:0 0 auto;padding:0 12px;background:rgba(201,162,39,.22);color:#E8C84A;white-space:nowrap;display:flex;align-items:center;font-size:.72rem;font-weight:800}",
        ".borsa-ticker-viewport{flex:1;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}",
        ".borsa-ticker-track{display:inline-flex;white-space:nowrap;align-items:center;animation:borsaMarquee 40s linear infinite;height:100%;width:max-content}",
        ".borsa-ticker:hover .borsa-ticker-track{animation-play-state:paused}",
        ".borsa-ticker-item{display:inline-flex;align-items:center;gap:6px;padding:0 18px;white-space:nowrap;color:#E8ECF0}",
        ".borsa-ticker-item strong{color:#F5F2EB;font-weight:700}",
        ".borsa-ticker-dot{width:5px;height:5px;border-radius:50%;background:#C9A227;flex-shrink:0}",
        "@keyframes borsaMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}",
        "@media (prefers-reduced-motion:reduce){.ad-ticker-track,.eczane-ticker-track,.borsa-ticker-track{animation:none!important}}",
        "body:has(.ad-ticker) .site-header{top:calc(var(--ticker-h) + var(--safe-t))}",
        "body:has(.eczane-ticker):not(:has(.borsa-ticker)) .site-header{top:calc(var(--ticker-h) + var(--eczane-h) + var(--safe-t))}",
        "body:has(.borsa-ticker) .site-header{top:calc(var(--ticker-h) + var(--eczane-h) + var(--borsa-h) + var(--safe-t))}",
        "body:has(.borsa-ticker):not(:has(.eczane-ticker)) .site-header{top:calc(var(--ticker-h) + var(--borsa-h) + var(--safe-t))}",
        "body:has(.borsa-ticker):not(:has(.eczane-ticker)) .borsa-ticker{top:calc(var(--ticker-h) + var(--safe-t))}",
        "@media(max-width:480px){.eczane-ticker,.borsa-ticker{font-size:.7rem}.eczane-ticker-label,.borsa-ticker-label{padding:0 8px;font-size:.65rem}.ad-ticker-item{font-size:.72rem;padding:0 18px}}"
      ].join("");
      document.head.appendChild(tss);
    }
  } catch (e) {}

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
    if (!document.querySelector("link[data-luxury-css]")) {
      var lux = document.createElement("link");
      lux.rel = "stylesheet";
      lux.href = "assets/css/luxury.css?v=7";
      lux.setAttribute("data-luxury-css", "1");
      document.head.appendChild(lux);
    }
  } catch (e) {}

  try {
    document.querySelectorAll("img.logo-mark, img.hero-eagle").forEach(function(el){
      el.src = "assets/img/IMG_0510.jpeg";
      el.style.borderRadius = el.style.borderRadius || "10px";
      el.style.objectFit = "cover";
      el.alt = el.alt || "KonyaGo";
    });
  } catch (e) {}

  try {
    if (!document.querySelector("link[data-sponsor-css]")) {
      var sp = document.createElement("link");
      sp.rel = "stylesheet";
      sp.href = "assets/css/sponsor.css?v=3";
      sp.setAttribute("data-sponsor-css", "1");
      document.head.appendChild(sp);
    }
  } catch (e) {}

  try {
    if (!document.querySelector("script[data-theme-js]")) {
      var ts = document.createElement("script");
      ts.src = "assets/js/theme.js?v=3";
      ts.defer = true;
      ts.setAttribute("data-theme-js", "1");
      document.head.appendChild(ts);
    }
  } catch (e) {}

  setTimeout(function () {
    try {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.style.setProperty("--green-deep", "#F5F2EB", "important");
      document.documentElement.style.setProperty("--muted", "#D4DBE6", "important");
      document.documentElement.style.setProperty("--text", "#F5F2EB", "important");
      document.documentElement.style.setProperty("--green", "#C9A227", "important");
    } catch (e) {}
  }, 120);

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
    document.querySelectorAll(".site-footer .container").forEach(function (el) {
      var html = el.innerHTML || "";
      if (html.indexOf("info@konyago.com.tr") !== -1) return;
      if (/©\s*2026\s*KonyaGo/i.test(html)) {
        el.innerHTML = html.replace(
          /©\s*2026\s*KonyaGo/i,
          '© 2026 KonyaGo · <a href="mailto:info@konyago.com.tr">info@konyago.com.tr</a>'
        );
      } else if (html.trim()) {
        el.innerHTML = html + ' · <a href="mailto:info@konyago.com.tr">info@konyago.com.tr</a>';
      }
    });
  } catch (e) {}

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
            try { reg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (e) {}
          }
        })
        .catch(function () {});
    });
  }
})();
