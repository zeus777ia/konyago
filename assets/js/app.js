(function () {
  "use strict";

  // Load SEO helpers early (OG + Organization JSON-LD, no Twitter/X)
  try {
    if (!document.querySelector('script[data-konyago-seo]')) {
      var seo = document.createElement("script");
      seo.src = "assets/js/seo.js?v=2";
      seo.setAttribute("data-konyago-seo", "1");
      document.head.appendChild(seo);
    }
  } catch (e) {}

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
        "@media(min-width:1100px){main.container,.container:not(.header-inner){max-width:1180px!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important;padding-left:16px!important;padding-right:16px!important}}",
        ".ad-rail .ad-box:not(.ad-sponsor-aysa){background:#152A42!important;border-color:rgba(201,162,39,.25)!important;color:#D4DBE6!important}",
        ".ad-rail .ad-box:not(.ad-sponsor-aysa) strong{color:#F5F2EB!important}",
        ".ad-rail .ad-box:not(.ad-sponsor-aysa) a{color:#0A1628!important;background:#C9A227!important;border-radius:999px!important;padding:7px 14px!important;display:inline-block!important;text-decoration:none!important}",
        ".place-visual .pv-label{color:#F5F2EB!important;opacity:0.95!important}",
        ".hero{text-align:center!important;display:flex!important;flex-direction:column!important;align-items:center!important;width:100%!important;padding:clamp(40px,7vw,72px) clamp(24px,6vw,64px)!important}",
        ".hero h1{text-align:center!important;margin-left:auto!important;margin-right:auto!important;max-width:min(22ch,100%)!important}",
        ".hero p{text-align:center!important;margin-left:auto!important;margin-right:auto!important;max-width:min(52ch,100%)!important}",
        ".hero .actions{justify-content:center!important}",
        ".hero-badge{justify-content:center!important;margin-left:auto!important;margin-right:auto!important}",
        ".btn-primary,a.btn-primary,.btn.btn-primary{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:12px 22px!important;border:1.5px solid #C9A227!important;border-radius:6px!important;color:#E8C84A!important;background:transparent!important;font-weight:700!important;text-decoration:none!important;white-space:nowrap!important;box-sizing:border-box!important;line-height:1.2!important}",
        ".btn-ghost,a.btn-ghost,.btn.btn-ghost{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:12px 22px!important;border:1.5px solid rgba(197,205,216,.45)!important;border-radius:6px!important;color:#D4DBE6!important;background:transparent!important;font-weight:600!important;text-decoration:none!important;white-space:nowrap!important;box-sizing:border-box!important;line-height:1.2!important}",
        ".biz-actions{display:flex!important;flex-wrap:wrap!important;gap:12px!important;justify-content:center!important;align-items:center!important}",
        "a.card{display:block!important;padding:18px 16px!important;text-decoration:none!important;color:#F5F2EB!important;background:#152A42!important;border:1px solid rgba(201,162,39,.28)!important;border-radius:14px!important}",
        "a.card,a.card *,a.card h3,a.card p{text-decoration:none!important}",
        "a.card h3{color:#F5F2EB!important;font-size:1.15rem!important;font-weight:600!important;margin:8px 0 6px!important}",
        "a.card p{color:#C5D0DE!important;font-size:.9rem!important;opacity:1!important;margin:0!important}",
        "a.card:hover{border-color:rgba(201,162,39,.55)!important;background:#1A3050!important}",
        "a.card:hover h3{color:#E8C84A!important}"
      ].join("");
      document.head.appendChild(s);
    }
  } catch (e) {}

  try {
    if (!document.querySelector("link[data-app-css-v32]")) {
      var ac = document.createElement("link");
      ac.rel = "stylesheet";
      ac.href = "assets/css/app.css?v=32";
      ac.setAttribute("data-app-css-v32", "1");
      document.head.appendChild(ac);
    }
  } catch (e) {}

  try {
    var lux = document.querySelector("link[data-luxury-css]");
    if (!lux) {
      lux = document.createElement("link");
      lux.rel = "stylesheet";
      lux.setAttribute("data-luxury-css", "1");
      document.head.appendChild(lux);
    }
    lux.href = "assets/css/luxury.css?v=12";
  } catch (e) {}

  try {
    if (!document.querySelector("link[data-cards-fix]")) {
      var cf = document.createElement("link");
      cf.rel = "stylesheet";
      cf.href = "assets/css/cards-fix.css?v=1";
      cf.setAttribute("data-cards-fix", "1");
      document.head.appendChild(cf);
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
    } catch (e) {}
  }, 120);

  function onIdle(fn) {
    if (typeof requestIdleCallback === "function") requestIdleCallback(fn, { timeout: 2800 });
    else setTimeout(fn, 500);
  }
  function afterLoad(fn) {
    if (document.readyState === "complete") fn();
    else window.addEventListener("load", fn, { once: true });
  }

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
      html += '<span class="ad-ticker-item"><span class="ad-ticker-dot" aria-hidden="true"></span>' + it.t + ' · <a href="' + it.href + '" target="_blank" rel="noopener sponsored">' + it.cta + "</a></span>";
    }
    var existing = document.querySelector(".ad-ticker");
    if (existing) {
      var track = existing.querySelector(".ad-ticker-track");
      if (track && !track.children.length) track.innerHTML = html + html;
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
      box.innerHTML = label + "<strong>" + title + "</strong>" + (sub ? '<span class="ad-sub">' + sub + "</span>' : "") + '<a href="' + href + '"' + (href.indexOf("http") === 0 ? ' target="_blank" rel="noopener sponsored"' : "") + ">" + cta + "</a>";
      box.setAttribute("data-fixed", "1");
      if (isSponsor) box.classList.add("ad-box-gold", "ad-sponsor-aysa");
    });
  } catch (e) {}

  try {
    var aysaUrl = "https://aysatekin.com";
    function aysaBox(title, sub, cta) {
      return '<div class="ad-box ad-box-gold ad-sponsor-aysa" data-fixed="1"><span class="ad-label">Sponsor</span><strong>' + title + '</strong>' + (sub ? '<span class="ad-sub">' + sub + '</span>' : '') + '<a href="' + aysaUrl + '" target="_blank" rel="noopener sponsored">' + cta + '</a></div>';
    }
    document.querySelectorAll(".ad-rail-left").forEach(function (rail) {
      if (!rail.querySelector(".ad-sponsor-aysa")) rail.insertAdjacentHTML("afterbegin", aysaBox("AysaTekin", "En şık abiye · Kalite · %10 indirim", "aysatekin.com"));
    });
    document.querySelectorAll(".ad-rail-right").forEach(function (rail) {
      if (!rail.querySelector(".ad-sponsor-aysa")) rail.insertAdjacentHTML("afterbegin", aysaBox("HOSGELDİN10", "Yeni üyelere %10 indirim · Abiye & takım", "Alışverişe git"));
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

  (function visitCounter() {
    if (window.__konyagoVisitDone) return;
    var elDay = document.getElementById("visitCount");
    var elTotal = document.getElementById("visitTotal");
    if (!elDay && !elTotal) return;
    function istanbulDay() {
      try {
        return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
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

  if ("serviceWorker" in navigator) {
    afterLoad(function () {
      navigator.serviceWorker.register("./sw.js").then(function (reg) {
        reg.update();
        if (reg.waiting) { try { reg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (e) {} }
      }).catch(function () {});
    });
  }
})();
