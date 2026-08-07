/* KonyaGo — hava, bugün planı, rastgele öneri, sesli anlatım */
(function (w) {
  "use strict";
  var KONYA = { lat: 37.8746, lon: 32.4932, tz: "Europe/Istanbul" };

  var WMO = {
    0: "Açık", 1: "Çoğunlukla açık", 2: "Parçalı bulutlu", 3: "Bulutlu",
    45: "Sis", 48: "Kırağılı sis", 51: "Hafif çisenti", 61: "Hafif yağmur",
    63: "Yağmur", 65: "Kuvvetli yağmur", 71: "Kar", 80: "Sağanak", 95: "Gök gürültülü"
  };

  function weatherCode(c) { return WMO[c] || "Değişken"; }

  function loadWeather(targetId) {
    var el = document.getElementById(targetId || "weatherBox");
    if (!el) return;
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + KONYA.lat +
      "&longitude=" + KONYA.lon +
      "&current=temperature_2m,weather_code,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=" + encodeURIComponent(KONYA.tz) +
      "&forecast_days=3";
    el.innerHTML = "<p class=\"wx-loading\">Hava durumu yükleniyor…</p>";
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var cur = d.current || {};
      var daily = d.daily || {};
      var html = '<div class="wx-now">' +
        '<div class="wx-temp">' + Math.round(cur.temperature_2m) + "°</div>" +
        '<div class="wx-meta"><strong>Konya</strong><span>' + weatherCode(cur.weather_code) +
        "</span><span>Rüzgâr " + Math.round(cur.wind_speed_10m || 0) + " km/s</span></div></div>";
      html += '<div class="wx-days">';
      var days = daily.time || [];
      for (var i = 0; i < Math.min(3, days.length); i++) {
        var label = i === 0 ? "Bugün" : (i === 1 ? "Yarın" : "Öbür gün");
        html += '<div class="wx-day"><span class="wx-dlabel">' + label + "</span>" +
          "<span>" + weatherCode(daily.weather_code[i]) + "</span>" +
          "<strong>" + Math.round(daily.temperature_2m_max[i]) + "° / " +
          Math.round(daily.temperature_2m_min[i]) + "°</strong></div>";
      }
      html += "</div><p class=\"wx-src\">Kaynak: Open-Meteo · bilgilendirme amaçlı</p>";
      el.innerHTML = html;
    }).catch(function () {
      el.innerHTML = '<p>Hava alınamadı. <a href="https://www.mgm.gov.tr" target="_blank" rel="noopener">MGM</a></p>';
    });
  }

  /* Sabit yedek listeler (kesfet-data yüklenmezse) */
  var FALLBACK_GEZI = [
    { name: "Mevlana Müzesi", tag: "Ücretsiz · simge", href: "gezilecek.html", desc: "Yeşil kubbe ve Mevlevî kültürünün merkezi." },
    { name: "Alaaddin Tepesi", tag: "Selçuklu", href: "gezilecek.html", desc: "Tarihî çekirdek ve manzara." },
    { name: "Sille", tag: "Yarım gün", href: "sille.html", desc: "Taş sokaklar, Aya Eleni, fotoğraf rotası." },
    { name: "Japon Parkı", tag: "Aile", href: "gezilecek.html", desc: "Japon bahçesi temalı park; gölet ve yürüyüş." },
    { name: "İnce Minareli Medrese", tag: "Taş işi", href: "gezilecek.html", desc: "Selçuklu taş işçiliğinin öne çıkan örneği." },
    { name: "Karatay Medresesi", tag: "Çini", href: "gezilecek.html", desc: "Çini eserleri ve medrese mimarisi." },
    { name: "Meram Bağları", tag: "Akşam", href: "gezilecek.html", desc: "Yeşil vadi, yürüyüş ve serin akşam." },
    { name: "Sahip Ata Külliyesi", tag: "Selçuklu", href: "gezilecek.html", desc: "Külliye ve vakıf eserleri; Mevlana yakını." }
  ];
  var FALLBACK_YEMEK = [
    { name: "Etli ekmek", tag: "İmza lezzet", href: "etli-ekmek.html", desc: "İnce hamur, kıyma, taş fırın — ayran ile klasik." },
    { name: "Fırın kebabı", tag: "Et", href: "mutfak.html", desc: "Uzun pişen kuşbaşı; sosu ekmekle." },
    { name: "Tirit", tag: "Geleneksel", href: "mutfak.html", desc: "Konya usulü tirit — doyurucu ve sade." },
    { name: "Bamya çorbası", tag: "Çorba", href: "mutfak.html", desc: "Konya sofasının klasik başlangıcı." }
  ];
  var TIPS = [
    "Sabah Mevlana’ya erken git, kalabalıktan kaç.",
    "Sille’yi öğleden sonra + kahvaltı ile birleştir.",
    "Yazın şapka ve su; öğlen dış mekânı kısalt.",
    "Kışın katmanlı giyin; buzlu kaldırımlara dikkat.",
    "Etli ekmek için yerel önerilen fırınlara bak.",
    "Alaaddin + İnce Minare aynı yürüyüş rotasında.",
    "Akşam için Meram veya Japon Parkı ideal.",
    "ATUŞ / Konyakart ile toplu taşıma pratik."
  ];

  function pick(arr) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getPools() {
    var data = w.KONYAGO_KESFET || [];
    var gezi = data.filter(function (x) {
      return x.cat === "muze" || x.cat === "gezi" || x.cat === "ilce";
    });
    var yemek = data.filter(function (x) { return x.cat === "yemek"; });
    if (gezi.length < 3) gezi = FALLBACK_GEZI;
    if (yemek.length < 1) yemek = FALLBACK_YEMEK;
    return { gezi: gezi, yemek: yemek };
  }

  function renderSuggestion(el) {
    var pools = getPools();
    var g = pick(pools.gezi);
    var y = pick(pools.yemek);
    var tip = pick(TIPS);
    if (!g) g = FALLBACK_GEZI[0];
    if (!y) y = FALLBACK_YEMEK[0];

    var html =
      '<div class="bugun-header">' +
      "<h2>Bugün nereye gideyim?</h2>" +
      '<button type="button" class="btn btn-primary btn-sm" id="bugunYenile" aria-label="Yeni öneri">🎲 Yeniden öner</button>' +
      "</div>" +
      '<div class="bugun-grid">' +
      '<a class="bugun-card" href="' + (g.href || "gezilecek.html") + '">' +
      '<span class="bugun-label">🕌 Gezi</span>' +
      "<strong>" + g.name + "</strong>" +
      "<span>" + (g.tag || g.ilce || "") + "</span>" +
      (g.desc ? "<p>" + g.desc + "</p>" : "") +
      "</a>" +
      '<a class="bugun-card" href="' + (y.href || "mutfak.html") + '">' +
      '<span class="bugun-label">🍽️ Yemek</span>' +
      "<strong>" + y.name + "</strong>" +
      "<span>" + (y.tag || y.ilce || "") + "</span>" +
      (y.desc ? "<p>" + y.desc + "</p>" : "") +
      "</a>" +
      "</div>" +
      '<p class="bugun-tip"><strong>İpucu:</strong> ' + tip + "</p>" +
      '<div class="link-row">' +
      '<a class="btn btn-ghost btn-sm" href="rotalar.html">Tüm rotalar</a>' +
      '<a class="btn btn-ghost btn-sm" href="semtler.html">Semt rehberleri</a>' +
      '<a class="btn btn-ghost btn-sm" href="ai.html">AI ile plan</a>' +
      "</div>";

    el.innerHTML = html;
    var btn = document.getElementById("bugunYenile");
    if (btn) {
      btn.addEventListener("click", function () {
        renderSuggestion(el);
      });
    }
  }

  function todayPlan(targetId) {
    var el = document.getElementById(targetId || "todayPlan");
    if (!el) return;
    /* İlk yüklemede rastgele öneri göster */
    renderSuggestion(el);
  }

  function speak(text, btn) {
    if (!w.speechSynthesis) {
      alert("Bu tarayıcı sesli anlatımı desteklemiyor.");
      return;
    }
    w.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "tr-TR";
    u.rate = 0.95;
    if (btn) {
      btn.disabled = true;
      u.onend = function () { btn.disabled = false; };
      u.onerror = function () { btn.disabled = false; };
    }
    w.speechSynthesis.speak(u);
  }

  w.KonyaGoFeatures = { loadWeather: loadWeather, todayPlan: todayPlan, speak: speak, renderSuggestion: renderSuggestion };
  w.addEventListener("DOMContentLoaded", function () {
    loadWeather("weatherBox");
    todayPlan("todayPlan");
  });
})(window);
