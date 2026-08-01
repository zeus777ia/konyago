/* KonyaGo — canlı döviz & altın şeridi
   Kaynak: finans.truncgil.com (TR piyasa) + open.er-api / gold-api yedek
   Her 30 sn yenilenir. Bilgilendirme amaçlıdır.
*/
(function () {
  "use strict";

  try {
    if (!document.querySelector('link[data-borsa-css]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'assets/css/borsa.css?v=1';
      l.setAttribute('data-borsa-css', '1');
      document.head.appendChild(l);
    }
  } catch (e) {}

  if (document.querySelector(".borsa-ticker")) return;

  var REFRESH_MS = 30 * 1000;
  var OZ_TO_GRAM = 31.1034768;
  var last = null;
  var bar = null;
  var track = null;

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

  function num(v) {
    if (typeof v === "number" && isFinite(v)) return v;
    if (v == null) return null;
    var t = String(v).trim().replace(/\s/g, "");
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, "").replace(",", ".");
    else if (t.indexOf(",") !== -1 && t.indexOf(".") === -1) t = t.replace(",", ".");
    var n = parseFloat(t);
    return isFinite(n) ? n : null;
  }

  function selling(obj) {
    if (!obj || typeof obj !== "object") return null;
    return num(obj.Selling != null ? obj.Selling : obj.satis != null ? obj.satis : obj.Satış);
  }

  function changeOf(obj) {
    if (!obj || typeof obj !== "object") return null;
    return num(obj.Change != null ? obj.Change : obj.change);
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

  function chSpan(ch) {
    if (ch == null || !isFinite(ch)) return "";
    var cls = ch > 0 ? "up" : ch < 0 ? "down" : "flat";
    var arrow = ch > 0 ? "▲" : ch < 0 ? "▼" : "•";
    return '<span class="borsa-ch ' + cls + '">' + arrow + " " + fmt(Math.abs(ch), 2) + "%</span>";
  }

  function ensureBar() {
    if (bar && document.body.contains(bar)) return;
    bar = document.createElement("div");
    bar.className = "borsa-ticker";
    bar.setAttribute("role", "complementary");
    bar.setAttribute("aria-label", "Döviz ve altın kurları");
    bar.innerHTML =
      '<div class="borsa-ticker-label"><span class="borsa-live" aria-hidden="true"></span> Kur</div>' +
      '<div class="borsa-ticker-viewport"><div class="borsa-ticker-track"></div></div>';
    track = bar.querySelector(".borsa-ticker-track");

    var anchor = document.querySelector(".eczane-ticker") || document.querySelector(".ad-ticker");
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    } else if (document.body) {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  function render(data) {
    ensureBar();
    if (!track) return;
    last = data;

    var rows = [
      { icon: "💵", label: "Dolar", val: data.usd, dig: 2, ch: data.usdCh },
      { icon: "💶", label: "Euro", val: data.eur, dig: 2, ch: data.eurCh },
      { icon: "💷", label: "Sterlin", val: data.gbp, dig: 2, ch: data.gbpCh },
      { icon: "🥇", label: "Gram Altın", val: data.goldGram, dig: 2, ch: data.goldCh },
      { icon: "🪙", label: "Ons Altın", val: data.goldOz, dig: 2, usd: true, ch: null }
    ];

    var parts = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var text = r.val == null ? "—" : (r.usd ? ("$" + fmt(r.val, r.dig)) : (fmt(r.val, r.dig) + " ₺"));
      parts.push(
        '<span class="borsa-ticker-item">' +
        '<span class="borsa-ticker-dot" aria-hidden="true"></span>' +
        r.icon + " <strong>" + r.label + ":</strong> " + text + " " + chSpan(r.ch) +
        "</span>"
      );
    }
    parts.push(
      '<span class="borsa-ticker-item borsa-meta">⏱ ' + (data.t || nowLabel()) +
      (data.src ? " · " + data.src : "") + "</span>"
    );

    track.innerHTML = parts.join("") + parts.join("");
    track.style.animation = "none";
    void track.offsetWidth;
    track.style.animation = "";
  }

  function viaTruncgil() {
    return fetch("https://finans.truncgil.com/v4/today.json", {
      mode: "cors",
      cache: "no-store",
      credentials: "omit"
    }).then(function (r) {
      if (!r.ok) throw new Error("truncgil " + r.status);
      return r.json();
    }).then(function (d) {
      if (!d || !d.USD) throw new Error("truncgil empty");
      var usd = selling(d.USD);
      var eur = selling(d.EUR);
      var gbp = selling(d.GBP);
      var gram = selling(d.HAS);
      var oz = selling(d.ONS);
      if ((!oz || oz <= 0) && gram != null && usd != null && usd > 0) {
        oz = (gram * OZ_TO_GRAM) / usd;
      }
      return {
        usd: usd,
        eur: eur,
        gbp: gbp,
        goldGram: gram,
        goldOz: oz && oz > 0 ? oz : null,
        usdCh: changeOf(d.USD),
        eurCh: changeOf(d.EUR),
        gbpCh: changeOf(d.GBP),
        goldCh: changeOf(d.HAS),
        src: "Truncgil",
        updated: d.Update_Date || null
      };
    });
  }

  function viaOpenEr() {
    return fetch("https://open.er-api.com/v6/latest/USD", {
      mode: "cors",
      cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("er-api");
      return r.json();
    }).then(function (d) {
      var rates = d && d.rates;
      if (!rates || !rates.TRY) throw new Error("no TRY");
      var usd = rates.TRY;
      return {
        usd: usd,
        eur: rates.EUR ? usd / rates.EUR : null,
        gbp: rates.GBP ? usd / rates.GBP : null,
        goldGram: null,
        goldOz: null,
        usdCh: null, eurCh: null, gbpCh: null, goldCh: null,
        src: "ER-API"
      };
    });
  }

  function viaGoldApi() {
    return fetch("https://api.gold-api.com/price/XAU", {
      mode: "cors",
      cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("gold-api");
      return r.json();
    }).then(function (d) {
      var oz = num(d && d.price);
      if (!oz) throw new Error("no gold");
      return { goldOz: oz };
    });
  }

  function viaFawaz() {
    return fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json", {
      mode: "cors",
      cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("fawaz");
      return r.json();
    }).then(function (d) {
      var u = (d && d.usd) || {};
      var usdTry = num(u.try);
      if (!usdTry) throw new Error("no try");
      var goldOz = u.xau && num(u.xau) > 0 ? 1 / num(u.xau) : null;
      var goldGram = goldOz != null ? (goldOz * usdTry) / OZ_TO_GRAM : null;
      return {
        usd: usdTry,
        eur: u.eur ? usdTry / num(u.eur) : null,
        gbp: u.gbp ? usdTry / num(u.gbp) : null,
        goldGram: goldGram,
        goldOz: goldOz,
        usdCh: null, eurCh: null, gbpCh: null, goldCh: null,
        src: "Fawaz"
      };
    });
  }

  function mergeGold(base, gold) {
    if (!base) return null;
    if (gold && gold.goldOz != null) {
      base.goldOz = gold.goldOz;
      if (base.goldGram == null && base.usd) {
        base.goldGram = (gold.goldOz * base.usd) / OZ_TO_GRAM;
      }
    }
    return base;
  }

  function load() {
    ensureBar();
    viaTruncgil()
      .then(function (data) {
        if (data.goldOz == null) {
          return viaGoldApi()
            .then(function (g) { return mergeGold(data, g); })
            .catch(function () { return data; });
        }
        return data;
      })
      .catch(function () {
        return viaOpenEr()
          .then(function (data) {
            return viaGoldApi()
              .then(function (g) { return mergeGold(data, g); })
              .catch(function () { return data; });
          })
          .catch(function () { return viaFawaz(); });
      })
      .then(function (data) {
        if (!data) throw new Error("empty");
        data.t = nowLabel();
        if (data.updated && /\d{2}:\d{2}/.test(data.updated)) {
          var m = data.updated.match(/(\d{2}:\d{2}:\d{2})/);
          if (m) data.t = m[1];
        }
        render(data);
      })
      .catch(function () {
        if (last) {
          last.t = nowLabel() + " (önbellek)";
          last.src = (last.src || "") + "*";
          render(last);
        } else {
          render({
            usd: null, eur: null, gbp: null,
            goldGram: null, goldOz: null,
            t: "veri yok", src: ""
          });
        }
      });
  }

  load();
  setInterval(load, REFRESH_MS);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") load();
  });
})();
