/* KonyaGo baraj doluluk (KOSKI) v2 */
(function (w, d) {
  "use strict";
  if (d.getElementById("kgBarajDone")) return;
  var flag = d.createElement("meta");
  flag.id = "kgBarajDone";
  d.head.appendChild(flag);

  var SOURCES = [
    { name: "Altinapa", url: "https://www.koski.gov.tr/koski/altinapa-baraj-degerleri" },
    { name: "Afsar", url: "https://www.koski.gov.tr/koski/afsar-baraj-degerleri" },
    { name: "Bagbasi", url: "https://www.koski.gov.tr/koski/bagbasi-baraj-degerleri" },
    { name: "Bozkir", url: "https://www.koski.gov.tr/koski/bozkir-baraj-degerleri" }
  ];

  var DISPLAY = {
    Altinapa: "Alt\u0131napa",
    Afsar: "Af\u015far",
    Bagbasi: "Ba\u011fba\u015f\u0131",
    Bozkir: "Bozk\u0131r"
  };

  function parseKoski(html, name) {
    var re = /<tr[^>]*>\s*<td[^>]*>\s*(\d{2}\/\d{2}\/\d{4})\s*<\/td>\s*<td[^>]*>\s*([^<]+)<\/td>\s*<td[^>]*>\s*([^<]+)<\/td>\s*<td[^>]*>\s*([^<]+)<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>/i;
    var m = html.match(re);
    if (!m) return null;
    var vol = String(m[4]).replace(/\D/g, "");
    return {
      name: name,
      date: m[1].trim(),
      volume_m3: vol ? parseInt(vol, 10) : 0,
      pct: parseInt(m[5], 10),
      source: "KOSKI"
    };
  }

  function proxyFetch(url) {
    var proxies = [
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
      "https://corsproxy.io/?" + encodeURIComponent(url)
    ];
    function tryOne(i) {
      if (i >= proxies.length) return Promise.reject(new Error("proxy"));
      return fetch(proxies[i], { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("http");
          return r.text();
        })
        .catch(function () {
          return tryOne(i + 1);
        });
    }
    return tryOne(0);
  }

  function loadLive() {
    return Promise.all(
      SOURCES.map(function (s) {
        return proxyFetch(s.url)
          .then(function (html) {
            return parseKoski(html, s.name);
          })
          .catch(function () {
            return null;
          });
      })
    ).then(function (rows) {
      var ok = rows.filter(Boolean);
      if (ok.length < 2) throw new Error("sparse");
      return { items: ok, live: true, updated: ok[0].date };
    });
  }

  function loadFallback() {
    return fetch("assets/data/barajlar.json?v=" + Date.now(), { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("json");
        return r.json();
      })
      .then(function (j) {
        return { items: j.items || [], live: false, updated: j.updated || "" };
      });
  }

  function fmtVol(n) {
    if (!n) return "-";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",") + " milyon m\u00b3";
    return Math.round(n / 1000).toLocaleString("tr-TR") + " bin m\u00b3";
  }

  function color(pct) {
    if (pct >= 70) return "#0d7a4f";
    if (pct >= 40) return "#c9a227";
    return "#c45c26";
  }

  function label(name) {
    return DISPLAY[name] || name;
  }

  function render(data, host) {
    if (!host || !data || !data.items || !data.items.length) return;
    var avg =
      data.items.reduce(function (s, x) {
        return s + (x.pct || 0);
      }, 0) / data.items.length;

    var parts = [];
    parts.push("<div class=\"kg-block\" id=\"kgBarajBox\">");
    parts.push("<h3>Konya baraj doluluklar\u0131</h3>");
    parts.push("<p style=\"margin-bottom:10px\">");
    parts.push(data.live ? "Canl\u0131 KOSK\u0130 verisi \u00b7 " : "Son kay\u0131tl\u0131 KOSK\u0130 verisi \u00b7 ");
    parts.push(data.updated || "");
    parts.push(" \u00b7 Ort. <strong>");
    parts.push(String(Math.round(avg)));
    parts.push("%</strong></p>");
    parts.push("<div class=\"kg-baraj-list\">");

    data.items.forEach(function (it) {
      var pct = Math.max(0, Math.min(100, it.pct || 0));
      var nm = label(it.name);
      var col = color(pct);
      parts.push("<div class=\"kg-baraj-row\">");
      parts.push("<div class=\"kg-baraj-meta\">");
      parts.push("<strong>" + nm + "</strong>");
      parts.push("<span>" + fmtVol(it.volume_m3) + "</span>");
      parts.push("<b style=\"color:" + col + \">" + pct + "%</b>");
      parts.push("</div>");
      parts.push("<div class=\"kg-baraj-track\" role=\"img\" aria-label=\"" + nm + " " + pct + "%\">");
      parts.push("<div class=\"kg-baraj-fill\" style=\"width:" + pct + "%;background:" + col + "\"></div>");
      parts.push("</div></div>");
    });

    parts.push("</div>");
    parts.push("<p class=\"wx-src\" style=\"margin-top:10px;font-size:.75rem\">Kaynak: <a href=\"https://www.koski.gov.tr\" target=\"_blank\" rel=\"noopener\">KOSK\u0130</a> \u00b7 Bilgilendirme ama\u00e7l\u0131 \u00b7 Bey\u015fehir G\u00f6l\u00fc i\u00e7in resmi g\u00fcnl\u00fck % yay\u0131nlanm\u0131yor</p>");
    parts.push("</div>");
    host.innerHTML = parts.join("");
  }

  function injectHost() {
    var existing = d.getElementById("kgBarajHost");
    if (existing) return existing;
    var anchor =
      d.getElementById("kgRoutes") ||
      d.getElementById("todayPlan") ||
      d.querySelector(".feat-grid");
    if (!anchor) return null;
    var host = d.createElement("div");
    host.id = "kgBarajHost";
    host.innerHTML = "<div class=\"kg-block\"><p>Baraj doluluklar\u0131 y\u00fckleniyor\u2026</p></div>";
    anchor.parentNode.insertBefore(host, anchor.nextSibling);
    return host;
  }

  if (!d.getElementById("kgBarajCss")) {
    var style = d.createElement("style");
    style.id = "kgBarajCss";
    style.textContent =
      ".kg-baraj-list{display:flex;flex-direction:column;gap:12px}" +
      ".kg-baraj-meta{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:.9rem;margin-bottom:4px}" +
      ".kg-baraj-meta span{color:var(--muted,#5a7264);font-size:.8rem;flex:1;text-align:right}" +
      ".kg-baraj-track{height:12px;border-radius:999px;background:rgba(13,122,79,.12);overflow:hidden}" +
      "[data-theme=dark] .kg-baraj-track{background:rgba(255,255,255,.08)}" +
      ".kg-baraj-fill{height:100%;border-radius:999px;transition:width .6s ease}";
    d.head.appendChild(style);
  }

  function boot() {
    var host = injectHost();
    if (!host) return;
    loadLive()
      .catch(function () {
        return loadFallback();
      })
      .then(function (data) {
        render(data, host);
      })
      .catch(function () {
        host.innerHTML =
          "<div class=\"kg-block\"><p>Baraj verisi al\u0131namad\u0131. <a href=\"https://www.koski.gov.tr\" target=\"_blank\" rel=\"noopener\">KOSK\u0130</a></p></div>";
      });
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 80);
})(window, document);
