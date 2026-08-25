/* kgo-gold-ticker.js — inject live gold into [data-kgo-market] every 5 min */
(function () {
  if (window.__KGO_GOLD_TICKER) return;
  window.__KGO_GOLD_TICKER = true;

  var OZ_GRAM = 31.1034768;
  var URL = "https://api.frankfurter.dev/v2/rates?base=XAU&quotes=TRY";

  function fmt(value, digits) {
    var n = Number(value);
    if (!isFinite(n)) return "—";
    return n.toLocaleString("tr-TR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function inject() {
    var track = document.querySelector("[data-kgo-market]");
    var meta = document.querySelector("[data-kgo-market-meta]");
    if (!track) return;

    fetch(URL, { cache: "no-store", credentials: "omit" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (rows) {
        if (!Array.isArray(rows) || !rows.length) return;
        var oz = Number(rows[0].rate);
        if (!(oz > 0)) return;
        var gram = oz / OZ_GRAM;
        var goldItems = [
          "Ons Altın · " + fmt(oz, 0) + " ₺",
          "Gram Altın · " + fmt(gram, 2) + " ₺",
          "Çeyrek (yaklaşık) · " + fmt(gram * 1.754, 0) + " ₺"
        ];

        var existing = [];
        track.querySelectorAll(".kgo-ticker-item").forEach(function (el) {
          var t = (el.textContent || "").trim();
          if (!t) return;
          if (/altın/i.test(t)) return;
          if (existing.indexOf(t) === -1) existing.push(t);
        });

        var unique = goldItems.concat(existing);
        track.replaceChildren();
        track.style.setProperty(
          "--kgo-duration",
          Math.max(32, Math.round(unique.length * 3.2)) + "s"
        );
        unique.concat(unique).forEach(function (item) {
          var span = document.createElement("span");
          span.className = "kgo-ticker-item";
          span.textContent = item;
          track.appendChild(span);
        });

        if (meta) {
          var base = (meta.textContent || "")
            .replace(/\s*·\s*altın.*$/i, "")
            .trim();
          meta.textContent =
            (base || "TCMB") + " · altın anlık · " + (rows[0].date || "güncel");
        }
      })
      .catch(function () {});
  }

  // Run after header rates, then every 5 minutes
  function start() {
    inject();
    setTimeout(inject, 3500);
    setInterval(inject, 5 * 60 * 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
