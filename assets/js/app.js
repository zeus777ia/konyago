(function () {
  "use strict";

  try { document.documentElement.setAttribute("data-theme", "dark"); } catch (e) {}

  function onIdle(fn) {
    if (typeof requestIdleCallback === "function") requestIdleCallback(fn, { timeout: 2800 });
    else setTimeout(fn, 500);
  }
  function afterLoad(fn) {
    if (document.readyState === "complete") fn();
    else window.addEventListener("load", fn, { once: true });
  }

  /* Kayan reklam seridi */
  try {
    var mail = "mailto:info@konyago.com.tr?subject=KonyaGo%20Reklam";
    var items = [
      { t: "AysaTekin — En sik abiye modelleri · Kalite ve zarafet", href: "https://aysatekin.com", cta: "Kesfet" },
      { t: "HOSGELDIN10 kodu ile yeni uyelere %10 indirim — AysaTekin", href: "https://aysatekin.com", cta: "Alisverise basla" },
      { t: "Ozel gunlerinize yakisan abiye ve takimlar — aysatekin.com", href: "https://aysatekin.com", cta: "Koleksiyon" },
      { t: "Reklam & is birligi — KonyaGo'da yerinizi alin", href: mail, cta: "Teklif al" },
      { t: "Otel · restoran · tur — gorunurluk icin yazin", href: mail, cta: "Iletisim" }
    ];
    var html = "";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      html += '<span class="ad-ticker-item"><span class="ad-ticker-dot" aria-hidden="true"></span>' + it.t + ' · <a href="' + it.href + '" target="_blank" rel="noopener sponsored">' + it.cta + "</a></span>";
    }
    var existing = document.querySelector(".ad-ticker");
    if (existing) {
      var track = existing.querySelector(".ad-ticker-track");
      if (track) {
        if (!track.children.length) track.innerHTML = html + html;
      } else {
        existing.innerHTML = '<div class="ad-ticker-track">' + html + html + "</div>";
      }
    } else {
      var ticker = document.createElement("div");
      ticker.className = "ad-ticker";
      ticker.setAttribute("role", "complementary");
      ticker.setAttribute("aria-label", "Reklam seridi");
      ticker.innerHTML = '<div class="ad-ticker-track">' + html + html + "</div>";
      if (document.body.firstChild) document.body.insertBefore(ticker, document.body.firstChild);
      else document.body.appendChild(ticker);
    }
  } catch (e) {}

  /* Skyscraper: ekstra kutu ekleme */
  try {
    var aysaUrl = "https://aysatekin.com";
    function aysaBox(title, sub, cta) {
      return '<div class="ad-box ad-box-gold ad-sponsor-aysa" data-fixed="1"><span class="ad-label">Sponsor</span><strong>' + title + '</strong>' + (sub ? '<span class="ad-sub">' + sub + '</span>' : '') + '<a href="' + aysaUrl + '" target="_blank" rel="noopener sponsored">' + cta + '</a></div>';
    }
    document.querySelectorAll(".ad-rail-left, .ad-rail-right").forEach(function (rail) {
      if (rail.querySelector(".ad-sky") || rail.querySelector(".ad-sponsor-aysa") || rail.querySelector('[data-fixed="1"]')) return;
      rail.insertAdjacentHTML("afterbegin", aysaBox("AysaTekin", "En sik abiye · Kalite · %10 indirim", "aysatekin.com"));
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

  /* Vercel analytics */
  try {
    if (!document.querySelector('script[src*="/_vercel/insights"]')) {
      var s1 = document.createElement("script");
      s1.textContent = 'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};';
      document.head.appendChild(s1);
      var s2 = document.createElement("script");
      s2.defer = true;
      s2.src = "/_vercel/insights/script.js";
      document.head.appendChild(s2);
    }
    if (!document.querySelector('script[src*="/_vercel/speed-insights"]')) {
      var s3 = document.createElement("script");
      s3.textContent = 'window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments);};';
      document.head.appendChild(s3);
      var s4 = document.createElement("script");
      s4.defer = true;
      s4.src = "/_vercel/speed-insights/script.js";
      document.head.appendChild(s4);
    }
  } catch (e) {}
})();
