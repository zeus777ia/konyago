/* KonyaGo live data and release UI repairs — 2026-09-12. */
(function () {
  "use strict";
  if (window.__KGO_RELEASE_REPAIRS_20260912) return;
  window.__KGO_RELEASE_REPAIRS_20260912 = true;

  var OZ_GRAM = 31.1034768;
  var PHARMACY_API = "https://eczaneadresi.com/api/public/v1/duty-pharmacies?city=konya&limit=200";

  function dateKey() {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit"
      }).formatToParts(new Date());
      var out = {};
      parts.forEach(function (part) { out[part.type] = part.value; });
      return out.year + "-" + out.month + "-" + out.day;
    } catch (error) { return ""; }
  }

  function todayLabel() {
    try {
      return new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul", day: "numeric", month: "long", weekday: "long"
      }).format(new Date());
    } catch (error) { return new Date().toLocaleDateString("tr-TR"); }
  }

  function fmt(value, digits) {
    var number = Number(value);
    if (!isFinite(number)) return "—";
    return number.toLocaleString("tr-TR", {
      minimumFractionDigits: digits, maximumFractionDigits: digits
    });
  }

  function withTimeout(url, timeout) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeout || 10000);
    return fetch(url, {
      cache: "no-store", credentials: "omit", signal: controller.signal,
      headers: { "Accept": "application/json" }
    }).finally(function () { clearTimeout(timer); });
  }

  function setItems(track, items, maxItems) {
    if (!track) return;
    var safe = Array.from(new Set(items.filter(Boolean))).slice(0, maxItems || 100);
    track.replaceChildren();
    track.style.setProperty("--kgo-duration", Math.max(32, Math.round(safe.length * 3.2)) + "s");
    safe.concat(safe).forEach(function (item) {
      var span = document.createElement("span");
      span.className = "kgo-ticker-item";
      span.textContent = item;
      track.appendChild(span);
    });
  }

  function loadPharmacies() {
    var track = document.querySelector("[data-kgo-pharmacy]");
    var meta = document.querySelector("[data-kgo-pharmacy-meta]");
    if (!track) return;
    var today = dateKey();
    withTimeout(PHARMACY_API, 12000)
      .then(function (response) {
        if (!response.ok) throw new Error("pharmacy-http");
        return response.json();
      })
      .then(function (data) {
        if (!data || data.date !== today || !Array.isArray(data.pharmacies) || !data.pharmacies.length) {
          throw new Error("pharmacy-unverified");
        }
        var districts = new Set();
        var items = data.pharmacies.map(function (pharmacy) {
          var district = String(pharmacy.district || "Konya").trim().toLocaleUpperCase("tr-TR");
          var name = String(pharmacy.name || "").trim().toLocaleUpperCase("tr-TR");
          if (!name) return "";
          districts.add(district);
          return district + " · " + name + (/ECZANES[İI]$/i.test(name) ? "" : " ECZANESİ");
        }).filter(Boolean);
        if (!items.length) throw new Error("pharmacy-empty");
        var pharmacyCount = items.length;
        items.push("Veri: Eczane Adresi · CC BY 4.0 · Yola çıkmadan önce teyit edin");
        setItems(track, items, 100);
        if (meta) meta.textContent = todayLabel() + " · " + pharmacyCount + " eczane · " + districts.size + " ilçe · aynı gün doğrulandı";
      })
      .catch(function () {
        setItems(track, [
          "Güncel nöbetçi eczane adları güvenle doğrulanamadı",
          "Resmî KEO ve e-Devlet bağlantılarından bugünün listesini açın"
        ], 2);
        if (meta) meta.textContent = todayLabel() + " · doğrulanmamış isim gösterilmiyor";
      });
  }

  function daysBetween(older, newer) {
    var a = Date.parse(older + "T00:00:00Z");
    var b = Date.parse(newer + "T00:00:00Z");
    return isFinite(a) && isFinite(b) ? Math.floor((b - a) / 86400000) : 999;
  }

  function loadGold() {
    var track = document.querySelector("[data-kgo-market]");
    var meta = document.querySelector("[data-kgo-market-meta]");
    if (!track) return;
    var today = dateKey();
    var url = "https://api.frankfurter.dev/v2/rates?date=" + encodeURIComponent(today) + "&base=XAU&quotes=TRY";
    withTimeout(url, 12000)
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (rows) {
        if (!Array.isArray(rows) || !rows.length) throw new Error("gold-empty");
        var row = rows[0];
        var observation = String(row.date || "");
        var age = daysBetween(observation, today);
        var ounce = Number(row.rate);
        if (!(ounce > 0) || age < 0 || age > 7) throw new Error("gold-date");

        var existing = [];
        track.querySelectorAll(".kgo-ticker-item").forEach(function (element) {
          var text = (element.textContent || "").trim();
          if (!text || /altın|çeyrek|24 ayar|xau\/try/i.test(text)) return;
          if (existing.indexOf(text) === -1) existing.push(text);
        });
        var items = [
          "Ons altın (günlük referans) · " + fmt(ounce, 0) + " ₺",
          "24 ayar gram metal karşılığı · " + fmt(ounce / OZ_GRAM, 2) + " ₺"
        ].concat(existing);
        setItems(track, items, 32);
        if (meta) {
          var current = (meta.textContent || "").replace(/\s*·\s*altın.*$/i, "").trim();
          meta.textContent = (current || "Kur bilgileri") + " · XAU/TRY " + observation + " · günlük referans";
        }
      })
      .catch(function () {
        var keep = [];
        track.querySelectorAll(".kgo-ticker-item").forEach(function (element) {
          var text = (element.textContent || "").trim();
          if (!text || /altın|çeyrek|24 ayar|xau\/try/i.test(text)) return;
          if (keep.indexOf(text) === -1) keep.push(text);
        });
        if (keep.length) setItems(track, keep, 28);
        if (meta) meta.textContent = (meta.textContent || "Kur bilgileri").replace(/\s*·\s*altın.*$/i, "").trim();
      });
  }

  function installUiRepairs() {
    if (!document.getElementById("kgo-release-repairs-20260912")) {
      var style = document.createElement("style");
      style.id = "kgo-release-repairs-20260912";
      style.textContent =
        "body.directorist-content-active .wp-block-post-content .directorist-listing-category__popup__content a[href]{color:#10262f!important}" +
        "@media(max-width:782px){body .kgo-site-header .wp-block-navigation__responsive-container.is-menu-open{z-index:100000!important}.kgo-ticker--pharmacy>span:not(.kgo-ticker-meta){display:none!important}}" +
        "@media(max-width:760px){body.home .kgo-pro .hero-grid{flex-direction:column!important}body.home .kgo-pro .hero-photo{min-height:300px!important}}";
      document.head.appendChild(style);
    }
    var nav = document.querySelector("nav.kgo-main-nav");
    if (nav && !nav.getAttribute("aria-label")) nav.setAttribute("aria-label", "Ana menü");
    document.querySelectorAll("h1").forEach(function (heading) {
      Array.prototype.forEach.call(heading.childNodes, function (node) {
        if (node.nodeType === 3 && /Geçmiş,$/.test(node.nodeValue || "")) node.nodeValue += " ";
      });
    });
    var translations = {
      "A to Z (title)": "A’dan Z’ye (başlık)",
      "Z to A (title)": "Z’den A’ya (başlık)",
      "Latest listings": "En yeni mekânlar",
      "Oldest listings": "En eski mekânlar",
      "Popular listings": "Popüler mekânlar",
      "Random listings": "Rastgele mekânlar"
    };
    document.querySelectorAll(".directorist-sortby-dropdown .directorist-dropdown__links__single").forEach(function (link) {
      var text = (link.textContent || "").trim();
      if (translations[text]) link.textContent = translations[text];
    });
  }

  function start() {
    installUiRepairs();
    loadPharmacies();
    loadGold();
    setTimeout(installUiRepairs, 2000);
    setTimeout(loadPharmacies, 12000);
    setTimeout(loadPharmacies, 48000);
    setTimeout(loadGold, 5000);
    new MutationObserver(function () { window.requestAnimationFrame(installUiRepairs); })
      .observe(document.documentElement, { childList: true, subtree: true });
    setInterval(loadPharmacies, 10 * 60 * 1000);
    setInterval(loadGold, 30 * 60 * 1000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();

