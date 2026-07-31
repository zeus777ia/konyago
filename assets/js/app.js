(function () {
  "use strict";

  // Daily visitor counter (per browser, resets each calendar day)
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
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }
})();
