/* KonyaGo — döviz & altın kayan şerit (anlık, periyodik güncelleme)
   Kaynaklar: open.er-api.com + yedekler. Bilgilendirme amaçlıdır.
*/
(function () {
  "use strict";

  if (document.querySelector(".borsa-ticker")) return;

  var REFRESH_MS = 60 * 1000;
  var last = null;

  function fmt(n, dig) {
    if (n == null || !isFinite(n)) return "—";
    dig = dig == null ? 2 : dig;
    try {
      return n.toLocaleString("tr-TR", {
        minimumFractionDigits: dig,
        maximumFractionDigits: dig
      });
    } catch (e) {
      return n.toFixed(dig);
    }
  }

  function buildTrack(data) {
    var items = [
      { icon: "💵", label: "Dolar", val: data.usd },
      { icon: "💶", label: "Euro", val: data.eur },
      { icon: "💷", label: "Sterlin", val: data.gbp },
      { icon: "🥇", label: "Gram Altın", val: data.goldGram, unit: "₺" },
      { icon: "🥈", label: "Ons Altın", val: data.goldOz, unit: "$" }
    ];
    var parts = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var unit = it.unit || "₺";
      var text =
        it.icon + " " + it.label + ": " +
        (it.val == null ? "—" : unit === "$" ? "$" + fmt(it.val, 2) : fmt(it.val, 2) + " ₺");
      parts.push(
        '<span class="borsa-ticker-item">' +
        '<span class="borsa-ticker-dot" aria-hidden="true"></span>' +
        text +
        "</span>"
      );
    }
    var time = data.t || "";
    parts.push(
      '<span class="borsa-ticker-item"><span class="borsa-ticker-dot"></span>⏱ ' + time + "</span>"
    );
    return parts.join("") + parts.join("");
  }

  function ensureBar() {
    var bar = document.querySelector(".borsa-ticker");
    if (bar) return bar;
    bar = document.createElement("div");
    bar.className = "borsa-ticker";
    bar.setAttribute("role", "complementary");
    bar.setAttribute("aria-label", "Döviz ve altın");
    bar.innerHTML =
      '<div class="borsa-ticker-label">📈 Kur</div>' +
      '<div class="borsa-ticker-viewport"><div class="borsa-ticker-track">' +
      '<span class="borsa-ticker-item">Kurlar yükleniyor…</span>' +
      "</div></div>";
    var after = document.querySelector(".eczane-ticker") || document.querySelector(".ad-ticker");
    if (after && after.parentNode) {
      after.parentNode.insertBefore(bar, after.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
    return bar;
  }

  function render(data) {
    last = data;
    var bar = ensureBar();
    var track = bar.querySelector(".borsa-ticker-track");
    if (!track) return;
    track.innerHTML = buildTrack(data);
  }

  function parseRatesFromUsdBase(json) {
    var rates = (json && json.rates) || {};
    var usdTry = rates.TRY;
    if (!usdTry || !isFinite(usdTry)) throw new Error("no TRY");
    var eurTry = rates.EUR ? usdTry / rates.EUR : null;
    var gbpTry = rates.GBP ? usdTry / rates.GBP : null;
    return { usd: usdTry, eur: eurTry, gbp: gbpTry };
  }

  function fetchOpenEr() {
    return fetch("https://open.er-api.com/v6/latest/USD", {
      method: "GET",
      mode: "cors",
      cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("er-api");
      return r.json();
    }).then(parseRatesFromUsdBase);
  }

  function fetchFawaz() {
    var url =
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json";
    return fetch(url, { mode: "cors", cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("fawaz");
      return r.json();
    }).then(function (j) {
      var usd = (j && j.usd) || {};
      var usdTry = usd.try;
      if (!usdTry) throw new Error("no try");
      return {
        usd: usdTry,
        eur: usd.eur ? usdTry / usd.eur : null,
        gbp: usd.gbp ? usdTry / usd.gbp : null,
        xauTry: usd.xau ? usdTry / usd.xau : null // 1 ons altın ≈ TRY
      };
    });
  }

  function fetchGoldUsd() {
    return fetch("https://api.metals.live/v1/spot/gold", {
      mode: "cors",
      cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("metals");
      return r.json();
    }).then(function (arr) {
      // [timestamp, price] or object
      if (Array.isArray(arr) && arr.length >= 2) return Number(arr[1]);
      if (arr && typeof arr.price === "number") return arr.price;
      throw new Error("gold parse");
    });
  }

  function nowLabel() {
    try {
      return new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date());
    } catch (e) {
      return new Date().toLocaleTimeString("tr-TR");
    }
  }

  function load() {
    ensureBar();
    var fx = null;

    fetchOpenEr()
      .catch(function () { return fetchFawaz(); })
      .then(function (rates) {
        fx = rates;
        // Altın: fawaz xau veya metals.live
        if (rates.xauTry && isFinite(rates.xauTry)) {
          return {
            goldOzUsd: null,
            goldGramTry: rates.xauTry / 31.1034768,
            goldOzTry: rates.xauTry
          };
        }
        return fetchGoldUsd()
          .then(function (ozUsd) {
            return {
              goldOzUsd: ozUsd,
              goldGramTry: rates.usd ? (ozUsd * rates.usd) / 31.1034768 : null,
              goldOzTry: rates.usd ? ozUsd * rates.usd : null
            };
          })
          .catch(function () {
            return { goldOzUsd: null, goldGramTry: null, goldOzTry: null };
          });
      })
      .then(function (gold) {
        if (!fx) throw new Error("no fx");
        render({
          usd: fx.usd,
          eur: fx.eur,
          gbp: fx.gbp,
          goldGram: gold.goldGramTry,
          goldOz: gold.goldOzUsd,
          t: nowLabel()
        });
      })
      .catch(function () {
        if (last) {
          last.t = nowLabel() + " (önbellek)";
          render(last);
        } else {
          render({
            usd: null,
            eur: null,
            gbp: null,
            goldGram: null,
            goldOz: null,
            t: "veri alınamadı"
          });
        }
      });
  }

  load();
  setInterval(load, REFRESH_MS);
})();
