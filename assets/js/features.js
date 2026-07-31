/* KonyaGo — hava, bugün planı, sesli anlatım yardımcıları */
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

  function todayPlan(targetId) {
    var el = document.getElementById(targetId || "todayPlan");
    if (!el) return;
    var h = new Date().getHours();
    var m = new Date().getMonth(); // 0-11
    var season = (m >= 5 && m <= 8) ? "yaz" : ((m >= 11 || m <= 1) ? "kis" : "gecis");
    var title, steps, tip;
    if (h < 11) {
      title = "Sabah planı";
      steps = [
        "Mevlana Müzesi — açılışa yakın git, kalabalıktan kaç",
        "Kısa yürüyüş: müzeden çarşıya doğru",
        "Öğle için etli ekmek noktası seç (merkez)"
      ];
    } else if (h < 16) {
      title = "Öğleden sonra planı";
      steps = [
        "Alaaddin Tepesi + çevre müzeler (İnce Minare / Karatay)",
        "Gölge ve su molası",
        "İstersen Sille’ye yarım gün kaydır"
      ];
    } else {
      title = "Akşam planı";
      steps = [
        "Meram veya Japon Parkı yürüyüşü",
        "Hafif akşam yemeği — fırın kebabı veya tirit",
        "Yarın için Mevlana’yı sabaha bırak"
      ];
    }
    if (season === "yaz") tip = "Sıcak: şapka, su, öğlen dış mekânı kısalt.";
    else if (season === "kis") tip = "Soğuk: katmanlı giyin; buzlu kaldırımlara dikkat.";
    else tip = "Mevsim geçişi: ince mont + yürüyüş ayakkabısı ideal.";

    var html = "<h2>" + title + "</h2><ul>";
    steps.forEach(function (s) { html += "<li>" + s + "</li>"; });
    html += "</ul><p><strong>İpucu:</strong> " + tip + "</p>" +
      '<div class="link-row">' +
      '<a class="btn btn-primary btn-sm" href="rotalar.html">Tüm rotalar</a>' +
      '<a class="btn btn-ghost btn-sm" href="rota-yazdir.html">Yazdır / PDF</a>' +
      '<a class="btn btn-ghost btn-sm" href="ai.html">AI ile plan</a></div>';
    el.innerHTML = html;
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

  w.KonyaGoFeatures = { loadWeather: loadWeather, todayPlan: todayPlan, speak: speak };
  w.addEventListener("DOMContentLoaded", function () {
    loadWeather("weatherBox");
    todayPlan("todayPlan");
  });
})(window);
