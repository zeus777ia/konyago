/* KonyaGo ziyaretçi sayacı v2
   - Tek birincil API (miles) → tüm tarayıcılarda aynı sayı
   - Oturumda günde 1 kez artar
   - API kısmen düşünce eski doğru değeri silmez
*/
(function () {
  "use strict";

  var elDay = document.getElementById("visitCount");
  var elTotal = document.getElementById("visitTotal");
  var elWrap = document.getElementById("visitStats");
  if (!elDay && !elTotal) return;

  window.__konyagoVisitDone = true;

  var NS = "konyago-com-tr";
  var HISTORIC_BASE = 186; /* sayaç öncesi birleşik geçmiş */
  var CACHE_KEY = "konyago_visit_cache_v2";

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

  function fmt(n) {
    n = Math.max(0, Math.floor(Number(n) || 0));
    try {
      return n.toLocaleString("tr-TR");
    } catch (e) {
      return String(n);
    }
  }

  function parseN(data) {
    if (data == null) return null;
    if (typeof data === "number" && isFinite(data)) return Math.floor(data);
    if (typeof data === "string") {
      var m = String(data).match(/-?\d+/);
      if (m) return parseInt(m[0], 10);
    }
    if (typeof data === "object") {
      if (typeof data.value === "number") return Math.floor(data.value);
      if (typeof data.value === "string" && /^-?\d+$/.test(data.value))
        return parseInt(data.value, 10);
      if (typeof data.count === "number") return Math.floor(data.count);
      if (typeof data.hits === "number") return Math.floor(data.hits);
    }
    return null;
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function writeCache(dayN, totalN) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          day: istanbulDay(),
          dayCount: dayN,
          total: totalN,
          t: Date.now()
        })
      );
    } catch (e) {}
  }

  function show(dayN, totalN) {
    if (elDay) elDay.textContent = fmt(dayN);
    if (elTotal) elTotal.textContent = fmt(totalN);
    if (elWrap) elWrap.setAttribute("data-ready", "1");
    writeCache(dayN, totalN);
  }

  function showCacheOrDash() {
    var c = readCache();
    if (c && typeof c.total === "number") {
      var d = c.day === istanbulDay() ? c.dayCount || 0 : 0;
      show(d, c.total);
      return true;
    }
    if (elDay) elDay.textContent = "…";
    if (elTotal) elTotal.textContent = "…";
    return false;
  }

  /* Birincil: miles (stabil, paylaşımlı) */
  function miles(path, key) {
    var url =
      "https://countapi.mileshilliard.com/api/v1/" +
      path +
      "/" +
      encodeURIComponent(NS + "_" + key);
    return fetch(url, { method: "GET", mode: "cors", cache: "no-store" }).then(
      function (r) {
        if (!r.ok) throw new Error("miles");
        return r.json();
      }
    ).then(function (j) {
      var n = parseN(j);
      if (n == null) throw new Error("parse");
      return n;
    });
  }

  /* Yedek: counterapi */
  function capi(path, key) {
    var url =
      "https://api.counterapi.dev/v1/" +
      encodeURIComponent(NS) +
      "/" +
      encodeURIComponent(key) +
      (path === "hit" ? "/up" : "");
    return fetch(url, { method: "GET", mode: "cors", cache: "no-store" }).then(
      function (r) {
        if (!r.ok) throw new Error("capi");
        return r.json();
      }
    ).then(function (j) {
      var n = parseN(j);
      if (n == null) throw new Error("parse");
      return n;
    });
  }

  function hit(key) {
    return miles("hit", key).catch(function () {
      return capi("hit", key);
    });
  }

  function get(key) {
    return miles("get", key).catch(function () {
      return capi("get", key);
    });
  }

  var day = istanbulDay();
  var dayKey = "day-" + day;
  var totalKey = "visits-total";
  var sessFlag = "konyago_pv_v2_" + day;

  var already = false;
  try {
    already = sessionStorage.getItem(sessFlag) === "1";
  } catch (e) {}

  showCacheOrDash();

  var pDay = already ? get(dayKey) : hit(dayKey);
  var pTot = already ? get(totalKey) : hit(totalKey);

  Promise.all([
    pDay.catch(function () {
      return null;
    }),
    pTot.catch(function () {
      return null;
    })
  ]).then(function (res) {
    var d = res[0];
    var t = res[1];
    var c = readCache() || {};

    /* Kısmi başarıda eski doğru değeri koru — sıfırlama yok */
    var dayN;
    if (d != null) dayN = d;
    else if (c.day === day && typeof c.dayCount === "number") dayN = c.dayCount;
    else dayN = 0;

    var totalN;
    if (t != null) totalN = t + HISTORIC_BASE;
    else if (typeof c.total === "number") totalN = c.total;
    else totalN = HISTORIC_BASE;

    if (d != null || t != null) {
      if (!already) {
        try {
          sessionStorage.setItem(sessFlag, "1");
        } catch (e) {}
      }
      show(dayN, totalN);
      return;
    }

    /* API tamamen yok — oturum fallback (paylaşımsız) */
    if (!already) {
      dayN = (c.day === day && c.dayCount ? c.dayCount : 0) + 1;
      totalN = (typeof c.total === "number" ? c.total : HISTORIC_BASE) + 1;
      try {
        sessionStorage.setItem(sessFlag, "1");
      } catch (e) {}
      show(dayN, totalN);
    } else {
      show(dayN, totalN);
    }
  });
})();
