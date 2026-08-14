/* KonyaGo açık / koyu tema — luxury dark default */
(function () {
  "use strict";
  var KEY = "konyago_theme";

  function getPreferred() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === "dark" || s === "light") return s;
    } catch (e) {}
    // Default: dark (luxury theme)
    return "dark";
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    var btn = document.getElementById("themeToggle");
    if (btn) {
      var dark = theme === "dark";
      btn.setAttribute("aria-label", dark ? "Açık temaya geç" : "Koyu temaya geç");
      btn.setAttribute("title", dark ? "Açık tema" : "Koyu tema");
      btn.textContent = dark ? "☀️" : "🌙";
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0A1628" : "#0d7a4f");
  }

  apply(getPreferred());

  function ensureCss() {
    if (document.querySelector('link[data-theme-css]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "assets/css/theme.css?v=1";
    link.setAttribute("data-theme-css", "1");
    document.head.appendChild(link);
  }

  function ensureBtn() {
    if (document.getElementById("themeToggle")) return;
    var header = document.querySelector(".header-inner");
    if (!header) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "themeToggle";
    btn.className = "theme-toggle";
    btn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      apply(cur === "dark" ? "light" : "dark");
    });
    header.appendChild(btn);
    apply(getPreferred());
  }

  ensureCss();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureBtn);
  } else {
    ensureBtn();
  }
})();
