(function () {
  "use strict";

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

  // Service worker: register + force update (eski cache temizlensin)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").then(function (reg) {
        reg.update();
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      }).catch(function () {});

      // Eski cache isimlerini temizle
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
