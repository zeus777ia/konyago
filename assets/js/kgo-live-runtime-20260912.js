/* KonyaGo consolidated live data + UI runtime — 2026-09-12. */
(function () {
  "use strict";
  if (window.__KGO_LIVE_RUNTIME_20260912) return;
  window.__KGO_LIVE_RUNTIME_20260912 = true;

  var OZ_GRAM = 31.1034768;
  var PHARMACY_API = "https://eczaneadresi.com/api/public/v1/duty-pharmacies?city=konya&limit=200";
  var KEO_DAILY_URL = "https://www.konyanobetcieczaneleri.com/";
  var EDEVLET_PHARMACY_URL = "https://www.turkiye.gov.tr/saglik-titck-nobetci-eczane-sorgulama";
  var marketState = { rates: [], rateDate: "", gold: [], goldDate: "" };

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

  function daysBetween(older, newer) {
    var a = Date.parse(older + "T00:00:00Z");
    var b = Date.parse(newer + "T00:00:00Z");
    return isFinite(a) && isFinite(b) ? Math.floor((b - a) / 86400000) : 999;
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
      headers: { Accept: "application/json" }
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

  function setOfficialPharmacyLinks() {
    var root = document.querySelector(".kgo-ticker--pharmacy");
    if (!root) return;
    var external = root.querySelector(":scope > span:not(.kgo-ticker-meta)");
    if (external) {
      var links = external.querySelectorAll("a");
      if (links[0]) {
        links[0].href = KEO_DAILY_URL;
        links[0].textContent = "KEO günlük liste";
      }
      if (links[1]) {
        links[1].href = EDEVLET_PHARMACY_URL;
        links[1].textContent = "e-Devlet sorgula";
      }
    }
    root.querySelectorAll("[data-kgo-pharmacy] .kgo-ticker-item").forEach(function (item) {
      if (!/KEO.*e-Devlet/i.test(item.textContent || "") || item.dataset.kgoOfficialLinks === "1") return;
      item.dataset.kgoOfficialLinks = "1";
      item.replaceChildren();
      var keo = document.createElement("a");
      keo.href = KEO_DAILY_URL;
      keo.target = "_blank";
      keo.rel = "noopener noreferrer";
      keo.textContent = "KEO günlük liste";
      var edevlet = document.createElement("a");
      edevlet.href = EDEVLET_PHARMACY_URL;
      edevlet.target = "_blank";
      edevlet.rel = "noopener noreferrer";
      edevlet.textContent = "e-Devlet nöbetçi eczane";
      item.append(keo, document.createTextNode(" · "), edevlet);
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
        items.push("Veri: Eczane Adresi · CC BY 4.0 · Yola çıkmadan önce teyit edin");
        items.push("Doğrula: KEO ve e-Devlet");
        setItems(track, items, 100);
        if (meta) meta.textContent = todayLabel() + " · " + (items.length - 2) + " eczane · " + districts.size + " ilçe · aynı gün doğrulandı";
        setOfficialPharmacyLinks();
      })
      .catch(function () {
        setItems(track, [
          "Güncel nöbetçi eczane adları güvenle doğrulanamadı",
          "Resmî KEO ve e-Devlet bağlantılarından bugünün listesini açın"
        ], 2);
        if (meta) meta.textContent = todayLabel() + " · doğrulanmamış isim gösterilmiyor";
        setOfficialPharmacyLinks();
      });
  }

  function renderMarket() {
    var track = document.querySelector("[data-kgo-market]");
    var meta = document.querySelector("[data-kgo-market-meta]");
    if (!track) return;
    var items = marketState.gold.concat(marketState.rates);
    if (!items.length) {
      setItems(track, ["Güncel kur verisi kısa süre içinde yenilenecek"], 1);
      if (meta) meta.textContent = "Kur verisi bekleniyor";
      return;
    }
    setItems(track, items, 36);
    if (meta) {
      var parts = [];
      if (marketState.rateDate) parts.push("TCMB (Frankfurter aktarımı) " + marketState.rateDate + " · gösterge kuru");
      if (marketState.goldDate) parts.push("XAU/TRY değerleme " + marketState.goldDate + " · canlı işlem fiyatı değildir");
      meta.textContent = parts.join(" · ") || "Günlük referans verileri";
    }
  }

  function loadRates() {
    var today = dateKey();
    var url = "https://api.frankfurter.dev/v2/rates?base=TRY&quotes=USD,EUR,GBP,CHF,CAD,AUD,JPY&providers=TCMB";
    withTimeout(url, 12000)
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (rows) {
        if (!Array.isArray(rows) || rows.length < 7) throw new Error("rate-empty");
        var byCode = {}, dates = new Set();
        rows.forEach(function (row) {
          var rate = Number(row.rate), quote = String(row.quote || "").toUpperCase();
          if (rate > 0 && quote) byCode[quote] = rate;
          if (row.date) dates.add(String(row.date));
        });
        if (dates.size !== 1) throw new Error("rate-date-mismatch");
        var date = Array.from(dates)[0];
        var age = daysBetween(date, today);
        if (age < 0 || age > 7) throw new Error("rate-date");
        var required = ["AUD", "CAD", "CHF", "EUR", "GBP", "JPY", "USD"];
        if (required.some(function (code) { return !(byCode[code] > 0); })) throw new Error("rate-incomplete");
        marketState.rates = [
          "AUD/TRY · " + fmt(1 / byCode.AUD, 4) + " ₺",
          "CAD/TRY · " + fmt(1 / byCode.CAD, 4) + " ₺",
          "CHF/TRY · " + fmt(1 / byCode.CHF, 4) + " ₺",
          "EUR/TRY · " + fmt(1 / byCode.EUR, 4) + " ₺",
          "GBP/TRY · " + fmt(1 / byCode.GBP, 4) + " ₺",
          "100 JPY/TRY · " + fmt(100 / byCode.JPY, 4) + " ₺",
          "USD/TRY · " + fmt(1 / byCode.USD, 4) + " ₺",
          "EUR/USD · " + fmt(byCode.USD / byCode.EUR, 4),
          "GBP/USD · " + fmt(byCode.USD / byCode.GBP, 4),
          "EUR/GBP · " + fmt(byCode.GBP / byCode.EUR, 4),
          "EUR/CHF · " + fmt(byCode.CHF / byCode.EUR, 4),
          "Kaynak: TCMB · Frankfurter aktarımı · " + date
        ];
        marketState.rateDate = date;
        renderMarket();
      })
      .catch(function () {
        marketState.rates = [];
        marketState.rateDate = "";
        renderMarket();
      });
  }

  function loadGold() {
    var today = dateKey();
    var url = "https://api.frankfurter.dev/v2/rates?date=" + encodeURIComponent(today) + "&base=XAU&quotes=TRY&expand=providers";
    withTimeout(url, 12000)
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (rows) {
        if (!Array.isArray(rows) || !rows.length) throw new Error("gold-empty");
        var row = rows[0];
        var valuationDate = String(row.date || "");
        var age = daysBetween(valuationDate, today);
        var ounce = Number(row.rate);
        if (!(ounce > 0) || age < 0 || age > 7) throw new Error("gold-date");
        marketState.gold = [
          "Ons altın (Frankfurter günlük harman) · " + fmt(ounce, 0) + " ₺",
          "24 ayar gram metal karşılığı · " + fmt(ounce / OZ_GRAM, 2) + " ₺",
          "Kaynak: Frankfurter · değerleme tarihi " + valuationDate
        ];
        marketState.goldDate = valuationDate;
        renderMarket();
      })
      .catch(function () {
        marketState.gold = [];
        marketState.goldDate = "";
        renderMarket();
      });
  }

  function installPauseButtons() {
    document.querySelectorAll(".kgo-ticker-pause").forEach(function (button) {
      if (button.dataset.kgoReleasePause === "1") return;
      button.dataset.kgoReleasePause = "1";
      var labelBase = (button.getAttribute("aria-label") || "Şerit").replace(/ duraklat$/i, "");
      button.addEventListener("click", function () {
        var row = button.closest(".kgo-ticker");
        var paused = row && row.classList.toggle("is-paused");
        button.setAttribute("aria-pressed", String(!!paused));
        button.setAttribute("aria-label", labelBase + " " + (paused ? "oynat" : "duraklat"));
        button.textContent = paused ? "Oynat" : "Duraklat";
      });
    });
  }

  function installIntroFilm() {
    var gate = document.querySelector("[data-kgo-intro-film]");
    if (!gate) return;
    if (!document.body.classList.contains("home")) { gate.remove(); return; }
    var video = gate.querySelector("[data-kgo-intro-video]");
    var skip = gate.querySelector("[data-kgo-intro-skip]");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var saveData = navigator.connection && navigator.connection.saveData;
    var hasSeen = false;
    try { hasSeen = sessionStorage.getItem("kgo-intro-seen-v1") === "1"; } catch (error) {}
    if (reduceMotion || saveData || hasSeen || !video || !skip) { gate.remove(); return; }
    function closeIntro() {
      if (!gate || gate.classList.contains("is-leaving")) return;
      try { sessionStorage.setItem("kgo-intro-seen-v1", "1"); } catch (error) {}
      gate.classList.add("is-leaving");
      video.pause();
      window.setTimeout(function () { if (gate) gate.remove(); }, 460);
    }
    gate.hidden = false;
    skip.addEventListener("click", closeIntro);
    video.addEventListener("ended", closeIntro);
    video.addEventListener("error", closeIntro);
    window.setTimeout(closeIntro, 9000);
    window.requestAnimationFrame(function () {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") promise.catch(closeIntro);
    });
  }

  function installUiRepairs() {
    if (!document.getElementById("kgo-release-repairs-20260912")) {
      var style = document.createElement("style");
      style.id = "kgo-release-repairs-20260912";
      style.textContent =
        "body.directorist-content-active .wp-block-post-content .directorist-listing-category__popup__content a[href]{color:#10262f!important}" +
        "body.directorist-content-active .directorist-header-found-title{color:#e7ecee!important}" +
        ".kgo-ticker-item a{color:inherit!important;text-decoration:underline;text-underline-offset:2px}" +
        "@media(max-width:782px){body .kgo-site-header .wp-block-navigation__responsive-container.is-menu-open{z-index:100000!important}.kgo-ticker--pharmacy>span:not(.kgo-ticker-meta){display:none!important}body:has(.wp-block-navigation__responsive-container.is-menu-open) .kgo-mobile-dock,body:has(.wp-block-navigation__responsive-container.is-menu-open) #kgoLiveAiFab,body:has(.wp-block-navigation__responsive-container.is-menu-open) .kgo-notify-fab,body:has(.wp-block-navigation__responsive-container.is-menu-open) #kgoHomeMapFab,body:has(.wp-block-navigation__responsive-container.is-menu-open) .kgo-plan-fab{visibility:hidden!important;opacity:0!important;pointer-events:none!important}body.home #kgoHomeMapFab,body.home .kgo-plan-fab.is-empty{display:none!important}}" +
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
    document.querySelectorAll(".directorist-sorting select option,.directorist-header-bar select option,.directorist-advanced-filter select option").forEach(function (option) {
      var text = (option.textContent || "").trim();
      if (translations[text]) option.textContent = translations[text];
    });
  }

  function start() {
    installUiRepairs();
    installPauseButtons();
    installIntroFilm();
    setOfficialPharmacyLinks();
    loadPharmacies();
    loadRates();
    loadGold();
    setTimeout(loadPharmacies, 60000);
    setInterval(loadPharmacies, 15 * 60 * 1000);
    setInterval(loadRates, 30 * 60 * 1000);
    setInterval(loadGold, 30 * 60 * 1000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();

