/* KonyaGo profesyonel ziyaretçi sayacı
   - Tüm tarayıcılarda aynı sayı (paylaşımlı API)
   - Oturumda 1 kez sayar
   - Bugün + toplam (geçmiş ziyaretler dahil)
*/
(function () {
  "use strict";

  var elDay = document.getElementById("visitCount");
  var elTotal = document.getElementById("visitTotal");
  var elWrap = document.getElementById("visitStats");
  if (!elDay && !elTotal) return;

  window.__konyagoVisitDone = true;

  var NS = "konyago-com-tr";
  /* Sayaç öncesi dönem (site kurulum + test ziyaretleri) — tahmini birleşik sayı */
  var HISTORIC_BASE = 186;

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
      if (typeof data.value === "string" && /^-?\d+$/.test(data.value)) return parseInt(data.value, 10);
      if (typeof data.count === "number") return Math.floor(data.count);
      if (typeof data.hits === "number") return Math.floor(data.hits);
      if (data.data && typeof data.data.value === "number") return Math.floor(data.data.value);
    }
    return null;
  }

  function show(dayN, totalN) {
    if (elDay) elDay.textContent = fmt(dayN);
    if (elTotal) elTotal.textContent = fmt(totalN);
    if (elWrap) elWrap.setAttribute("data-ready", "1");
    try {
      localStorage.setItem("konyago_visit_cache", JSON.stringify({
        day: istanbulDay(),
        dayCount: dayN,
        total: totalN,
        t: Date.now()
      }));
    } catch (e) {}
  }

  function showFromCache() {
    try {
      var c = JSON.parse(localStorage.getItem("konyago_visit_cache") || "null");
      if (c && typeof c.total === "number") {
        var d = c.day === istanbulDay() ? c.dayCount : 0;
        show(d || 0, c.total);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function milesHit(key) {
    return fetch("https://countapi.mileshilliard.com/api/v1/hit/" + encodeURIComponent(NS + "_" + key), {
      method: "GET", mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("miles");
      return r.json();
    }).then(function (j) {
      var n = parseN(j);
      if (n == null) throw new Error("parse");
      return n;
    });
  }

  function milesGet(key) {
    return fetch("https://countapi.mileshilliard.com/api/v1/get/" + encodeURIComponent(NS + "_" + key), {
      method: "GET", mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("miles");
      return r.json();
    }).then(function (j) {
      var n = parseN(j);
      if (n == null) throw new Error("parse");
      return n;
    });
  }

  function counterApiHit(key) {
    return fetch("https://api.counterapi.dev/v1/" + encodeURIComponent(NS) + "/" + encodeURIComponent(key) + "/up", {
      method: "GET", mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("capi");
      return r.json();
    }).then(function (j) {
      var n = parseN(j);
      if (n == null) throw new Error("parse");
      return n;
    });
  }

  function counterApiGet(key) {
    return fetch("https://api.counterapi.dev/v1/" + encodeURIComponent(NS) + "/" + encodeURIComponent(key), {
      method: "GET", mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("capi");
      return r.json();
    }).then(function (j) {
      var n = parseN(j);
      if (n == null) throw new Error("parse");
      return n;
    });
  }

  function abacusHit(key) {
    return fetch("https://abacus.jasoncameron.dev/hit/" + encodeURIComponent(NS) + "/" + encodeURIComponent(key), {
      method: "GET", mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("abacus");
      return r.text();
    }).then(function (t) {
      var n = parseN(t);
      if (n == null) { try { n = parseN(JSON.parse(t)); } catch (e) {} }
      if (n == null) throw new Error("parse");
      return n;
    });
  }

  function abacusGet(key) {
    return fetch("https://abacus.jasoncameron.dev/get/" + encodeURIComponent(NS) + "/" + encodeURIComponent(key), {
      method: "GET", mode: "cors", cache: "no-store"
    }).then(function (r) {
      if (!r.ok) throw new Error("abacus");
      return r.text();
    }).then(function (t) {
      var n = parseN(t);
      if (n == null) { try { n = parseN(JSON.parse(t)); } catch (e) {} }
      if (n == null) throw new Error("parse");
      return n;
    });
  }

  function anyHit(key) {
    return milesHit(key)
      .catch(function () { return counterApiHit(key); })
      .catch(function () { return abacusHit(key); });
  }

  function anyGet(key) {
    return milesGet(key)
      .catch(function () { return counterApiGet(key); })
      .catch(function () { return abacusGet(key); });
  }

  var day = istanbulDay();
  var dayKey = "day-" + day;
  var totalKey = "visits-total";
  var sessFlag = "konyago_pv_" + day;

  var already = false;
  try { already = sessionStorage.getItem(sessFlag) === "1"; } catch (e) {}

  showFromCache();

  function applyLive(dayRaw, totalRaw) {
    var dayN = dayRaw != null ? dayRaw : 0;
    /* Toplam = canlı sayaç + sayaç öncesi birleşik geçmiş */
    var totalN = (totalRaw != null ? totalRaw : 0) + HISTORIC_BASE;
    show(dayN, totalN);
  }

  var pDay = already ? anyGet(dayKey) : anyHit(dayKey);
  var pTot = already ? anyGet(totalKey) : anyHit(totalKey);

  Promise.all([
    pDay.catch(function () { return null; }),
    pTot.catch(function () { return null; })
  ]).then(function (res) {
    var d = res[0];
    var t = res[1];
    if (!already && (d != null || t != null)) {
      try { sessionStorage.setItem(sessFlag, "1"); } catch (e) {}
    }
    if (d != null || t != null) {
      applyLive(d, t);
    } else if (!showFromCache()) {
      var localDay = 1;
      var localTot = HISTORIC_BASE + 1;
      try {
        var o = JSON.parse(localStorage.getItem("konyago_visits_fallback") || "{}");
        if (o.day === day && typeof o.dayCount === "number") localDay = already ? o.dayCount : o.dayCount + 1;
        else localDay = 1;
        localTot = (typeof o.total === "number" ? o.total : HISTORIC_BASE) + (already ? 0 : 1);
        localStorage.setItem("konyago_visits_fallback", JSON.stringify({
          day: day, dayCount: localDay, total: localTot
        }));
        sessionStorage.setItem(sessFlag, "1");
      } catch (e) {}
      show(localDay, localTot);
    }
  });
})();
