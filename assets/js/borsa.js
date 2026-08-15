/* KonyaGo — canlı döviz & altın
   Truncgil + open.er-api + fawaz + gold-api
   20 sn yenileme · saniye saniye saat · hafta sonu uyarısı
*/
(function () {
  "use strict";

  try {
    if (!document.querySelector("link[data-borsa-css]")) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "assets/css/borsa.css?v=2";
      l.setAttribute("data-borsa-css", "1");
      document.head.appendChild(l);
    }
  } catch (e) {}

  if (document.querySelector(".borsa-ticker")) return;

  var REFRESH_MS = 20 * 1000;
  var OZ_TO_GRAM = 31.1034768;
  var last = null;
  var prev = null;
  var bar = null;
  var track = null;
  var clockEl = null;
  var statusEl = null;
  var loading = false;

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

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function selling(obj) {
    if (!obj || typeof obj !== "object") return null;
    return num(obj.Selling != null ? obj.Selling : obj.satis != null ? obj.satis : obj.Satış);
  }
  function buying(obj) {
    if (!obj || typeof obj !== "object") return null;
    return num(obj.Buying != null ? obj.Buying : obj.alis != null ? obj.alis : obj.Alış);
  }
  function changeOf(obj) {
    if (!obj || typeof obj !== "object") return null;
    return num(obj.Change != null ? obj.Change : obj.change);
  }

  function istanbulNow() {
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

  function istanbulWeekday() {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Istanbul",
        weekday: "short"
      }).format(new Date());
    } catch (e) {
      return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
    }
  }

  function isWeekend() {
    var d = istanbulWeekday();
    return d === "Sat" || d === "Sun";
  }

  function chSpan(ch) {
    if (ch == null || !isFinite(ch)) return "";
    var cls = ch > 0 ? "up" : ch < 0 ? "down" : "flat";
    var arrow = ch > 0 ? "▲" : ch < 0 ? "▼" : "•";
    return '<span class="borsa-ch ' + cls + '">' + arrow + " " + fmt(Math.abs(ch), 2) + "%</span>";
  }

  function deltaClass(key, val) {
    if (prev == null || val == null || prev[key] == null) return "";
    if (val > prev[key]) return " flash-up";
    if (val < prev[key]) return " flash-down";
    return "";
  }

  function ensureBar() {
    if (bar && document.body.contains(bar)) return;
    bar = document.createElement("div");
    bar.className = "borsa-ticker";
    bar.setAttribute("role", "complementary");
    bar.setAttribute("aria-label", "Döviz ve altın kurları");
    bar.innerHTML =
      '<div class="borsa-ticker-label">' +
        '<span class="borsa-live" aria-hidden="true"></span> Kur ' +
        '<span class="borsa-clock" id="borsaClock"></span>' +
      "</div>" +
      '<div class="borsa-ticker-viewport"><div class="borsa-ticker-track"></div></div>';
    track = bar.querySelector(".borsa-ticker-track");
    clockEl = bar.querySelector("#borsaClock");

    var anchor = document.querySelector(".eczane-ticker") || document.querySelector(".ad-ticker");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    else if (document.body) document.body.insertBefore(bar, document.body.firstChild);

    // Saniye saniye canlı saat — “donmuş” hissini kırar
    setInterval(function () {
      if (clockEl) clockEl.textContent = istanbulNow();
    }, 1000);
    if (clockEl) clockEl.textContent = istanbulNow();
  }

  function render(data) {
    ensureBar();
    if (!track) return;

    prev = last ? {
      usd: last.usd, eur: last.eur, gbp: last.gbp,
      goldGram: last.goldGram, goldOz: last.goldOz
    } : null;
    last = data;

    var weekendNote = isWeekend()
      ? '<span class="borsa-ticker-item borsa-meta">⏸ Hafta sonu — piyasa kapalı, kurlar Cuma kapanışına yakın</span>'
      : "";

    var rows = [
      {
        key: "usd", icon: "💵", label: "USD",
        text: data.usd == null ? "—" :
          (data.usdBuy != null
            ? fmt(data.usdBuy, 4) + " / " + fmt(data.usd, 4) + " ₺"
            : fmt(data.usd, 4) + " ₺"),
        ch: data.usdCh
      },
      {
        key: "eur", icon: "💶", label: "EUR",
        text: data.eur == null ? "—" :
          (data.eurBuy != null
            ? fmt(data.eurBuy, 4) + " / " + fmt(data.eur, 4) + " ₺"
            : fmt(data.eur, 4) + " ₺"),
        ch: data.eurCh
      },
      {
        key: "gbp", icon: "💷", label: "GBP",
        text: data.gbp == null ? "—" : fmt(data.gbp, 4) + " ₺",
        ch: data.gbpCh
      },
      {
        key: "goldGram", icon: "🥇", label: "Gram Altın",
        text: data.goldGram == null ? "—" : fmt(data.goldGram, 2) + " ₺",
        ch: data.goldCh
      },
      {
        key: "goldOz", icon: "🪙", label: "Ons",
        text: data.goldOz == null ? "—" : "$" + fmt(data.goldOz, 2),
        ch: null
      }
    ];

    var parts = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      parts.push(
        '<span class="borsa-ticker-item' + deltaClass(r.key, data[r.key]) + '">' +
        '<span class="borsa-ticker-dot" aria-hidden="true"></span>' +
        r.icon + " <strong>" + r.label + ":</strong> " + r.text + " " + chSpan(r.ch) +
        "</span>"
      );
    }
    parts.push(
      '<span class="borsa-ticker-item borsa-meta">↻ ' +
      (data.fetchedAt || istanbulNow()) +
      (data.src ? " · " + data.src : "") +
      (data.apiTime ? " · API " + escapeHtml(data.apiTime) : "") +
      "</span>"
    );
    if (weekendNote) parts.push(weekendNote);

    track.innerHTML = parts.join("") + parts.join("");
    // animasyonu sıfırla ki uzun şerit akmaya devam etsin
    track.style.animation = "none";
    void track.offsetWidth;
    track.style.animation = "";
  }

  function bust(url) {
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "_=" + Date.now();
  }

  function viaTruncgil() {
    return fetch(bust("https://finans.truncgil.com/v4/today.json"), {
      mode: "cors", cache: "no-store", credentials: "omit"
    }).then(function (r) {
      if (!r.ok) throw new Error("truncgil");
      return r.json();
    }).then(function (d) {
      if (!d || !d.USD) throw new Error("empty");
      var usd = selling(d.USD);
      var eur = selling(d.EUR);
      var gbp = selling(d.GBP);
      var gram = selling(d.HAS);
      var oz = selling(d.ONS);
      if ((!oz || oz <= 0) && gram != null && usd > 0) oz = (gram * OZ_TO_GRAM) / usd;
      return {
        usd: usd,
        usdBuy: buying(d.USD),
        eur: eur,
        eurBuy: buying(d.EUR),
        gbp: gbp,
        goldGram: gram,
        goldOz: oz && oz > 0 ? oz : null,
        usdCh: changeOf(d.USD),
        eurCh: changeOf(d.EUR),
        gbpCh: changeOf(d.GBP),
        goldCh: changeOf(d.HAS),
        src: "Truncgil",
        apiTime: d.Update_Date || null
      };
    });
  }

  function viaOpenEr() {
    return fetch(bust("https://open.er-api.com/v6/latest/USD"), {
      mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("er");
      return r.json();
    }).then(function (d) {
      var rates = d && d.rates;
      if (!rates || !rates.TRY) throw new Error("no TRY");
      var usd = rates.TRY;
      return {
        usd: usd,
        eur: rates.EUR ? usd / rates.EUR : null,
        gbp: rates.GBP ? usd / rates.GBP : null,
        goldGram: null, goldOz: null,
        usdCh: null, eurCh: null, gbpCh: null, goldCh: null,
        src: "ER-API",
        apiTime: d.time_last_update_utc || null
      };
    });
  }

  function viaFawaz() {
    return fetch(bust("https://latest.currency-api.pages.dev/v1/currencies/usd.min.json"), {
      mode: "cors", cache: "no-store"
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
        src: "Fawaz",
        apiTime: d.date || null
      };
    });
  }

  function viaGoldApi() {
    return fetch(bust("https://api.gold-api.com/price/XAU"), {
      mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("gold");
      return r.json();
    }).then(function (d) {
      var oz = num(d && d.price);
      if (!oz) throw new Error("no oz");
      return { goldOz: oz, goldUpdated: d.updatedAt || null };
    });
  }

  function merge(primary, secondary, gold) {
    var out = primary || secondary || {};
    if (!primary && secondary) out = secondary;
    if (primary && secondary) {
      // Altın yoksa diğer kaynaktan tamamla
      if (out.goldGram == null && secondary.goldGram != null) out.goldGram = secondary.goldGram;
      if (out.goldOz == null && secondary.goldOz != null) out.goldOz = secondary.goldOz;
      if (out.gbp == null && secondary.gbp != null) out.gbp = secondary.gbp;
      if (out.eur == null && secondary.eur != null) out.eur = secondary.eur;
      if (primary.src && secondary.src && primary.src !== secondary.src) {
        out.src = primary.src + "+" + secondary.src;
      }
    }
    if (gold && gold.goldOz != null) {
      out.goldOz = gold.goldOz;
      if (out.goldGram == null && out.usd) {
        out.goldGram = (gold.goldOz * out.usd) / OZ_TO_GRAM;
      }
    }
    // Ons hâlâ yoksa gramdan üret
    if ((out.goldOz == null || out.goldOz <= 0) && out.goldGram != null && out.usd > 0) {
      out.goldOz = (out.goldGram * OZ_TO_GRAM) / out.usd;
    }
    return out;
  }

  function load() {
    if (loading) return;
    loading = true;
    ensureBar();

    // Paralel: Truncgil (TR satış), ER-API, Fawaz, Gold
    Promise.all([
      viaTruncgil().catch(function () { return null; }),
      viaOpenEr().catch(function () { return null; }),
      viaFawaz().catch(function () { return null; }),
      viaGoldApi().catch(function () { return null; })
    ])
      .then(function (res) {
        var trunc = res[0];
        var er = res[1];
        var fawaz = res[2];
        var gold = res[3];
        var data = merge(trunc, er || fawaz, gold);
        if (!data || data.usd == null) {
          data = merge(er, fawaz, gold);
        }
        if (!data || data.usd == null) throw new Error("all failed");
        data.fetchedAt = istanbulNow();
        render(data);
      })
      .catch(function () {
        if (last) {
          last.fetchedAt = istanbulNow() + " (önbellek)";
          render(last);
        } else {
          render({
            usd: null, eur: null, gbp: null,
            goldGram: null, goldOz: null,
            fetchedAt: istanbulNow(),
            src: "veri yok"
          });
        }
      })
      .then(function () { loading = false; });
  }

  load();
  setInterval(load, REFRESH_MS);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") load();
  });
})();
