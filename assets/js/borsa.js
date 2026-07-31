/* KonyaGo — döviz & altın kayan şerit
   Öncelik: Truncgil (TR) → open.er-api + goldprice → fawaz xau
   Bilgilendirme amaçlıdır.
*/
(function () {
  "use strict";

  if (document.querySelector(".borsa-ticker")) return;

  var REFRESH_MS = 60 * 1000;
  var OZ_TO_GRAM = 31.1034768;
  var last = null;

  function fmt(n, dig) {
    if (n == null || !isFinite(n)) return "—";
    dig = dig == null ? 2 : dig;
    try {
      return Number(n).toLocaleString("tr-TR", {
        minimumFractionDigits: dig,
        maximumFractionDigits: dig
      });
    } catch (e) {
      return Number(n).toFixed(dig);
    }
  }

  function parseTrNumber(s) {
    if (typeof s === "number" && isFinite(s)) return s;
    if (s == null) return null;
    var t = String(s).trim().replace(/\s/g, "");
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) {
      t = t.replace(/\./g, "").replace(",", ".");
    } else if (t.indexOf(",") !== -1 && t.indexOf(".") === -1) {
      t = t.replace(",", ".");
    }
    var n = parseFloat(t);
    return isFinite(n) ? n : null;
  }

  function pickPrice(obj) {
    if (!obj || typeof obj !== "object") return null;
    var keys = [
      "Satış", "satis", "Satis", "Selling", "selling",
      "Alış", "alis", "Alis", "Buying", "buying",
      "Fiyat", "fiyat", "price", "Price"
    ];
    for (var i = 0; i < keys.length; i++) {
      if (obj[keys[i]] != null) {
        var n = parseTrNumber(obj[keys[i]]);
        if (n != null) return n;
      }
    }
    return null;
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

  function buildTrack(data) {
    var items = [
      { icon: "💵", label: "Dolar", text: data.usd == null ? "—" : fmt(data.usd, 2) + " ₺" },
      { icon: "💶", label: "Euro", text: data.eur == null ? "—" : fmt(data.eur, 2) + " ₺" },
      { icon: "💷", label: "Sterlin", text: data.gbp == null ? "—" : fmt(data.gbp, 2) + " ₺" },
      { icon: "🥇", label: "Gram Altın", text: data.goldGram == null ? "—" : fmt(data.goldGram, 2) + " ₺" },
      { icon: "🥈", label: "Ons Altın", text: data.goldOz == null ? "—" : "$" + fmt(data.goldOz, 2) }
    ];
    var parts = [];
    for (var i = 0; i < items.length; i++) {
      parts.push(
        '<span class="borsa-ticker-item">' +
        '<span class="borsa-ticker-dot" aria-hidden="true"></span>' +
        items[i].icon + " " + items[i].label + ": " + items[i].text +
        "</span>"
      );
    }
    parts.push(
      '<span class="borsa-ticker-item"><span class="borsa-ticker-dot"></span>⏱ ' +
      (data.t || "") + "</span>"
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
      '<span class="borsa-ticker-item">Kurlar yükleniyor…</span></div></div>';
    var after = document.querySelector(".eczane-ticker") || document.querySelector(".ad-ticker");
    if (after && after.parentNode) after.parentNode.insertBefore(bar, after.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);
    return bar;
  }

  function render(data) {
    last = data;
    var track = ensureBar().querySelector(".borsa-ticker-track");
    if (track) track.innerHTML = buildTrack(data);
  }

  function completeGold(data) {
    if (!data) return data;
    if (data.goldGram == null && data.goldOz != null && data.usd != null) {
      data.goldGram = (data.goldOz * data.usd) / OZ_TO_GRAM;
    }
    if (data.goldOz == null && data.goldGram != null && data.usd != null) {
      data.goldOz = (data.goldGram * OZ_TO_GRAM) / data.usd;
    }
    return data;
  }

  function mergePreferGold(a, b) {
    if (!a) return b;
    if (!b) return a;
    return {
      usd: a.usd != null ? a.usd : b.usd,
      eur: a.eur != null ? a.eur : b.eur,
      gbp: a.gbp != null ? a.gbp : b.gbp,
      goldGram: a.goldGram != null ? a.goldGram : b.goldGram,
      goldOz: a.goldOz != null ? a.goldOz : b.goldOz
    };
  }

  /* 1) Truncgil — TR piyasası */
  function viaTruncgil() {
    return fetch("https://finans.truncgil.com/v4/today.json", {
      method: "GET", mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("truncgil");
      return r.json();
    }).then(function (j) {
      if (!j || typeof j !== "object") throw new Error("empty");

      var usd = pickPrice(j.USD);
      var eur = pickPrice(j.EUR);
      var gbp = pickPrice(j.GBP) || pickPrice(j.STERLIN);

      var gramKeys = [
        "gram-altin", "GRAMALTIN", "Gram Altın", "gram_altin",
        "GA", "altin", "ALTIN", "Gramaltın", "gramaltin"
      ];
      var goldGram = null;
      for (var i = 0; i < gramKeys.length; i++) {
        if (j[gramKeys[i]]) {
          goldGram = pickPrice(j[gramKeys[i]]);
          if (goldGram != null) break;
        }
      }

      var onsKeys = ["ons", "ONS", "ons-altin", "XAU", "xau", "ONSALTIN", "ons_altin"];
      var goldOzTry = null;
      var goldOzUsd = null;
      for (var k = 0; k < onsKeys.length; k++) {
        if (j[onsKeys[k]]) {
          var p = pickPrice(j[onsKeys[k]]);
          if (p != null) {
            if (p > 5000) goldOzTry = p;
            else goldOzUsd = p;
            break;
          }
        }
      }

      if (goldGram == null && goldOzTry != null) goldGram = goldOzTry / OZ_TO_GRAM;
      if (goldOzUsd == null && goldOzTry != null && usd) goldOzUsd = goldOzTry / usd;
      if (goldOzUsd == null && goldGram != null && usd) goldOzUsd = (goldGram * OZ_TO_GRAM) / usd;

      if (usd == null && eur == null && goldGram == null) throw new Error("parse");

      return { usd: usd, eur: eur, gbp: gbp, goldGram: goldGram, goldOz: goldOzUsd };
    });
  }

  /* 2) Altın ons USD */
  function fetchGoldOzUsd() {
    function goldpriceOrg() {
      return fetch("https://data-asg.goldprice.org/dbXRates/USD", {
        mode: "cors", cache: "no-store"
      }).then(function (r) {
        if (!r.ok) throw new Error("gp");
        return r.json();
      }).then(function (j) {
        var item = j && j.items && j.items[0];
        var p = item && item.xauPrice;
        if (p == null || !isFinite(Number(p))) throw new Error("gp parse");
        return Number(p);
      });
    }
    function goldApiCom() {
      return fetch("https://api.gold-api.com/price/XAU", {
        mode: "cors", cache: "no-store"
      }).then(function (r) {
        if (!r.ok) throw new Error("ga");
        return r.json();
      }).then(function (j) {
        var p = j && j.price;
        if (p == null || !isFinite(Number(p))) throw new Error("ga parse");
        return Number(p);
      });
    }
    function metalsLive() {
      return fetch("https://api.metals.live/v1/spot/gold", {
        mode: "cors", cache: "no-store"
      }).then(function (r) {
        if (!r.ok) throw new Error("metals");
        return r.json();
      }).then(function (arr) {
        if (Array.isArray(arr) && arr.length >= 2) return Number(arr[1]);
        if (arr && typeof arr.price === "number") return arr.price;
        throw new Error("metals parse");
      });
    }
    return goldpriceOrg()
      .catch(function () { return goldApiCom(); })
      .catch(function () { return metalsLive(); });
  }

  /* 3) open.er-api + gold */
  function viaOpenEr() {
    return fetch("https://open.er-api.com/v6/latest/USD", {
      method: "GET", mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("er");
      return r.json();
    }).then(function (json) {
      var rates = (json && json.rates) || {};
      var usdTry = rates.TRY;
      if (!usdTry) throw new Error("no TRY");
      var base = {
        usd: usdTry,
        eur: rates.EUR ? usdTry / rates.EUR : null,
        gbp: rates.GBP ? usdTry / rates.GBP : null,
        goldGram: null,
        goldOz: null
      };
      return fetchGoldOzUsd()
        .then(function (ozUsd) {
          base.goldOz = ozUsd;
          base.goldGram = (ozUsd * usdTry) / OZ_TO_GRAM;
          return base;
        })
        .catch(function () { return base; });
    });
  }

  /* 4) fawaz — xau.json doğrudan */
  function viaFawaz() {
    var base = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/";
    var alt = "https://latest.currency-api.pages.dev/v1/currencies/";

    function get(path) {
      return fetch(base + path, { mode: "cors", cache: "no-store" })
        .catch(function () {
          return fetch(alt + path, { mode: "cors", cache: "no-store" });
        })
        .then(function (r) {
          if (!r.ok) throw new Error("fawaz");
          return r.json();
        });
    }

    return Promise.all([
      get("usd.min.json"),
      get("xau.min.json").catch(function () { return null; })
    ]).then(function (pair) {
      var usdMap = (pair[0] && pair[0].usd) || {};
      var xauMap = (pair[1] && pair[1].xau) || null;
      var usdTry = usdMap.try;
      if (!usdTry) throw new Error("no try");

      var goldOzUsd = null;
      var goldGram = null;

      // 1 ons altın = xau.try TRY
      if (xauMap && xauMap.try != null && isFinite(Number(xauMap.try))) {
        var xauTry = Number(xauMap.try);
        goldGram = xauTry / OZ_TO_GRAM;
        goldOzUsd = xauTry / usdTry;
      } else if (usdMap.xau != null && Number(usdMap.xau) > 0) {
        // usd.xau = 1 USD kaç ons
        goldOzUsd = 1 / Number(usdMap.xau);
        goldGram = (goldOzUsd * usdTry) / OZ_TO_GRAM;
      }

      return {
        usd: usdTry,
        eur: usdMap.eur ? usdTry / usdMap.eur : null,
        gbp: usdMap.gbp ? usdTry / usdMap.gbp : null,
        goldGram: goldGram,
        goldOz: goldOzUsd
      };
    });
  }

  function load() {
    ensureBar();

    viaTruncgil()
      .catch(function () { return null; })
      .then(function (primary) {
        if (primary && primary.goldGram != null && primary.goldOz != null) {
          return primary;
        }
        return viaOpenEr()
          .catch(function () { return viaFawaz(); })
          .then(function (sec) {
            return mergePreferGold(primary, sec);
          })
          .catch(function () {
            if (primary) return primary;
            return viaFawaz();
          });
      })
      .then(function (data) {
        if (!data) throw new Error("all failed");
        data = completeGold(data);
        data.t = nowLabel();
        render(data);
      })
      .catch(function () {
        if (last) {
          last.t = nowLabel() + " (önbellek)";
          render(last);
        } else {
          render({
            usd: null, eur: null, gbp: null,
            goldGram: null, goldOz: null,
            t: "veri alınamadı"
          });
        }
      });
  }

  load();
  setInterval(load, REFRESH_MS);
})();
