/* KonyaGo kur + altin paneli
   USD/EUR: frankfurter + open.er-api yedek
   Altin: gold-api.com XAU (ons) + TRY cevrimi
*/
(function (w, d) {
  "use strict";
  if (d.getElementById("kgKurDone")) return;
  var meta = d.createElement("meta");
  meta.id = "kgKurDone";
  d.head.appendChild(meta);

  var OZ_GRAM = 31.1034768;

  function fmt(n, dig) {
    dig = dig == null ? 2 : dig;
    n = Number(n);
    if (!isFinite(n)) return "—";
    try {
      return n.toLocaleString("tr-TR", {
        minimumFractionDigits: dig,
        maximumFractionDigits: dig
      });
    } catch (e) {
      return n.toFixed(dig);
    }
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store", mode: "cors" }).then(function (r) {
      if (!r.ok) throw new Error("http");
      return r.json();
    });
  }

  function loadFx() {
    return fetchJson("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR")
      .then(function (j) {
        var usdtry = j.rates && j.rates.TRY;
        var eurUsd = j.rates && j.rates.EUR;
        if (!usdtry) throw new Error("fx");
        var eurtry = eurUsd ? usdtry / eurUsd : null;
        return { usdtry: usdtry, eurtry: eurtry, date: j.date || "" };
      })
      .catch(function () {
        return fetchJson("https://open.er-api.com/v6/latest/USD").then(function (j) {
          var r = j.rates || {};
          if (!r.TRY) throw new Error("fx2");
          return {
            usdtry: r.TRY,
            eurtry: r.EUR ? r.TRY / r.EUR : null,
            date: j.time_last_update_utc || ""
          };
        });
      });
  }

  function loadGoldUsd() {
    return fetchJson("https://api.gold-api.com/price/XAU").then(function (j) {
      var p = j.price != null ? j.price : j.price_usd;
      if (!p || !isFinite(Number(p))) throw new Error("gold");
      return Number(p);
    });
  }

  function ensureCss() {
    if (d.getElementById("kgKurCss")) return;
    var s = d.createElement("style");
    s.id = "kgKurCss";
    s.textContent =
      ".kg-kur{margin:14px 0;padding:14px 16px;border-radius:16px;border:1px solid var(--border,rgba(13,122,79,.18));background:var(--white,#fff);box-shadow:var(--shadow,0 8px 24px rgba(6,61,40,.08))}" +
      "[data-theme=dark] .kg-kur{background:#12261c;border-color:rgba(255,255,255,.08)}" +
      ".kg-kur h3{margin:0 0 10px;font-size:1rem;color:var(--green-dark,#0a5c3a)}" +
      "[data-theme=dark] .kg-kur h3{color:#8fd4b0}" +
      ".kg-kur-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}" +
      "@media(min-width:640px){.kg-kur-grid{grid-template-columns:repeat(4,1fr)}}" +
      ".kg-kur-item{padding:10px 12px;border-radius:12px;background:var(--green-soft,#e8f5ee)}" +
      "[data-theme=dark] .kg-kur-item{background:#1a3328}" +
      ".kg-kur-item span{display:block;font-size:.72rem;color:var(--muted,#5a7264);font-weight:600;margin-bottom:2px}" +
      ".kg-kur-item strong{font-size:1.05rem;color:var(--green-deep,#063d28)}" +
      "[data-theme=dark] .kg-kur-item strong{color:#e6f2eb}" +
      ".kg-kur-foot{margin:8px 0 0;font-size:.72rem;color:var(--muted,#5a7264)}";
    d.head.appendChild(s);
  }

  function host() {
    var existing = d.getElementById("kgKurHost");
    if (existing) return existing;
    var anchor =
      d.getElementById("weatherBox") ||
      d.getElementById("todayPlan") ||
      d.querySelector(".feat-grid") ||
      d.getElementById("main");
    if (!anchor) return null;
    var el = d.createElement("div");
    el.id = "kgKurHost";
    el.innerHTML =
      '<div class="kg-kur"><h3>Kur & altın</h3><p class="kg-kur-foot">Yükleniyor…</p></div>';
    if (anchor.id === "weatherBox" || anchor.id === "todayPlan") {
      anchor.parentNode.insertBefore(el, anchor.nextSibling);
    } else {
      anchor.parentNode.insertBefore(el, anchor);
    }
    return el;
  }

  function render(box, data) {
    var items = [
      { k: "USD", v: fmt(data.usdtry, 2), s: "TL" },
      { k: "EUR", v: data.eurtry != null ? fmt(data.eurtry, 2) : "—", s: "TL" },
      { k: "Gram altın", v: data.gram != null ? fmt(data.gram, 0) : "—", s: "TL" },
      { k: "Ons altın", v: data.ons != null ? fmt(data.ons, 0) : "—", s: "TL" }
    ];
    var html =
      '<div class="kg-kur"><h3>Kur & altın</h3><div class="kg-kur-grid">';
    items.forEach(function (it) {
      html +=
        '<div class="kg-kur-item"><span>' +
        it.k +
        "</span><strong>" +
        it.v +
        "</strong> <span>" +
        it.s +
        "</span></div>";
    });
    html +=
      "</div><p class=\"kg-kur-foot\">Canlı yaklaşık değer · Kaynak: piyasa API · bilgilendirme amaçlı" +
      (data.date ? " · " + data.date : "") +
      "</p></div>";
    box.innerHTML = html;
  }

  function boot() {
    ensureCss();
    var box = host();
    if (!box) return;

    Promise.all([
      loadFx(),
      loadGoldUsd().catch(function () {
        return null;
      })
    ])
      .then(function (res) {
        var fx = res[0];
        var xauUsd = res[1];
        var gram = null;
        var ons = null;
        if (xauUsd != null && fx.usdtry) {
          ons = xauUsd * fx.usdtry;
          gram = ons / OZ_GRAM;
        }
        render(box, {
          usdtry: fx.usdtry,
          eurtry: fx.eurtry,
          gram: gram,
          ons: ons,
          date: fx.date || ""
        });
      })
      .catch(function () {
        box.innerHTML =
          '<div class="kg-kur"><h3>Kur & altın</h3><p class="kg-kur-foot">Veri alınamadı, biraz sonra yenileyin.</p></div>';
      });
  }

  /* WhatsApp kisisel buton kaldir, kanal kalsin */
  function stripWa() {
    d.querySelectorAll('a.social-btn.wa:not(.wac)').forEach(function (a) {
      a.remove();
    });
    d.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
      a.remove();
    });
    /* footer duz metin linkleri */
    d.querySelectorAll("a[href*='wa.me'], a[title='WhatsApp']").forEach(function (a) {
      if ((a.getAttribute("href") || "").indexOf("channel") === -1) a.remove();
    });
  }

  function run() {
    stripWa();
    boot();
    setTimeout(stripWa, 800);
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", run);
  else setTimeout(run, 60);
})(window, document);
