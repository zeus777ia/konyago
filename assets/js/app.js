(function () {
  "use strict";

  // --- Üst kayan reklam şeridi (tüm sayfalar, web + mobil) ---
  try {
    if (!document.querySelector(".ad-ticker")) {
      var mail = "mailto:cnrtech@outlook.com.tr?subject=KonyaGo%20Reklam";
      var items = [
        "📢 Reklam & iş birliği — KonyaGo’da yerinizi alın",
        "🏨 Otel · restoran · tur — görünürlük için yazın",
        "🛍️ Marka ortaklığı ve sponsorluk fırsatları",
        "✉️ " + "cnrtech@outlook.com.tr",
        "🤝 Yerel işletmeler için özel paketler"
      ];
      function buildItems() {
        var html = "";
        for (var i = 0; i < items.length; i++) {
          html += '<span class="ad-ticker-item"><span class="ad-ticker-dot" aria-hidden="true"></span>' +
            items[i] + ' · <a href="' + mail + '">Teklif al</a></span>';
        }
        return html;
      }
      var ticker = document.createElement("div");
      ticker.className = "ad-ticker";
      ticker.setAttribute("role", "complementary");
      ticker.setAttribute("aria-label", "Reklam şeridi");
      // Çift kopya = kesintisiz döngü
      ticker.innerHTML = '<div class="ad-ticker-track">' + buildItems() + buildItems() + "</div>";
      document.body.insertBefore(ticker, document.body.firstChild);
    }
  } catch (e) {}

  // Daily visitor counter
  try {
    var key = "konyago_visit_day";
    var countKey = "konyago_visit_count";
    var today = new Date().toISOString().slice(0, 10);
    var storedDay = localStorage.getItem(key);
    var count = parseInt(localStorage.getItem(countKey) || "0", 10);
    if (storedDay !== today) {
      count = 1;
      localStorage.setItem(key, today);
      localStorage.setItem(countKey, "1");
    } else if (!sessionStorage.getItem("konyago_hit")) {
      count += 1;
      localStorage.setItem(countKey, String(count));
      sessionStorage.setItem("konyago_hit", "1");
    }
    var el = document.getElementById("visitCount");
    if (el) el.textContent = String(count);
  } catch (e) {}

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").then(function (reg) {
        reg.update();
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      }).catch(function () {});

      if (window.caches) {
        caches.keys().then(function (keys) {
          keys.forEach(function (k) {
            if (k.indexOf("konyago") === 0 && k !== "konyago-v5") {
              caches.delete(k);
            }
          });
        });
      }
    });
  }
})();
