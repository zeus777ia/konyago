/**
 * KonyaGo Mixpanel — simple, reliable init
 * Token must belong to KonyaGo EU project
 */
(function () {
  "use strict";

  if (window.__konyagoMixpanelLoaded) return;
  window.__konyagoMixpanelLoaded = true;

  var TOKEN = "579a0a89b147340515db46c34844a82f";
  var tracked = false;

  function getPageType() {
    var path = (window.location.pathname || "/").toLowerCase();
    if (path === "/" || path === "" || /index\.html$/.test(path)) return "home";
    if (/gezilecek|sille|mutfak|rotalar|semtler|tarihce|ilceler|etli-ekmek|mevlana|kesfet/.test(path)) return "content";
    if (path.indexOf("ara") !== -1) return "search";
    if (path.indexOf("ai") !== -1) return "ai";
    if (/reklam|iletisim/.test(path)) return "business";
    return "other";
  }

  function getContentType() {
    var path = (window.location.pathname || "").toLowerCase();
    if (/gezilecek|sille|mevlana/.test(path)) return "mekan";
    if (/mutfak|etli-ekmek/.test(path)) return "yemek";
    if (/rotalar|konya-1-gun/.test(path)) return "rota";
    if (path.indexOf("ai") !== -1) return "ai";
    return "yazi";
  }

  function trackAll() {
    if (tracked) return;
    if (!window.mixpanel || typeof window.mixpanel.track !== "function") return;
    tracked = true;

    try {
      var pageType = getPageType();
      var path = window.location.pathname || "/";
      var title = document.title || "";

      mixpanel.track("page_view", {
        page_path: path,
        page_title: title,
        page_type: pageType,
        platform: "web"
      });

      if (pageType === "content" || pageType === "ai") {
        mixpanel.track("content_view", {
          content_title: title,
          content_type: getContentType(),
          page_path: path,
          platform: "web"
        });
      }

      document.addEventListener(
        "click",
        function (e) {
          var el = e.target && e.target.closest ? e.target.closest("a, button") : null;
          if (!el) return;

          var href = (el.getAttribute("href") || "").trim();
          var text = ((el.innerText || el.textContent || "") + "").toLowerCase();

          if (href.indexOf("tel:") === 0) {
            mixpanel.track("cta_click", { cta_type: "phone", content_title: title, page_path: path });
            return;
          }
          if (
            href.indexOf("google.com/maps") !== -1 ||
            href.indexOf("maps.apple.com") !== -1 ||
            href.indexOf("maps.google") !== -1 ||
            text.indexOf("yol tarifi") !== -1 ||
            text.indexOf("harita") !== -1
          ) {
            mixpanel.track("cta_click", {
              cta_type: "map",
              content_title: title,
              page_path: path,
              destination_url: href.slice(0, 200)
            });
            return;
          }
          if (href.indexOf("instagram.com") !== -1) {
            mixpanel.track("cta_click", { cta_type: "instagram", content_title: title, page_path: path });
            return;
          }
          if (href.indexOf("wa.me") !== -1 || href.indexOf("whatsapp") !== -1) {
            mixpanel.track("cta_click", { cta_type: "whatsapp", content_title: title, page_path: path });
            return;
          }
          if (href.indexOf("http") === 0 && href.indexOf(window.location.hostname) === -1) {
            mixpanel.track("outbound_click", {
              url: href.slice(0, 300),
              page_path: path,
              content_title: title
            });
          }
        },
        true
      );

      var forms = document.querySelectorAll('form[action*="ara"], form[role="search"]');
      for (var i = 0; i < forms.length; i++) {
        forms[i].addEventListener("submit", function (ev) {
          try {
            var input = ev.target.querySelector('input[type="search"], input[name="q"]');
            var term = input ? (input.value || "").trim() : "";
            if (term) mixpanel.track("search", { search_term: term.slice(0, 120), page_path: path });
          } catch (err) {}
        });
      }

      if (typeof console !== "undefined" && console.log) {
        console.log("[KonyaGo Mixpanel] tracking active");
      }
    } catch (err) {
      if (typeof console !== "undefined" && console.warn) console.warn("[KonyaGo Mixpanel]", err);
    }
  }

  function boot() {
    try {
      mixpanel.init(TOKEN, {
        api_host: "https://api-eu.mixpanel.com",
        track_pageview: false,
        persistence: "localStorage",
        ignore_dnt: true,
        batch_requests: true,
        loaded: function () {
          trackAll();
        }
      });
      // Fallback if loaded never fires
      setTimeout(trackAll, 1200);
      setTimeout(trackAll, 3000);
    } catch (err) {
      if (typeof console !== "undefined" && console.warn) console.warn("[KonyaGo Mixpanel] init failed", err);
    }
  }

  // Load full library, then init
  if (window.mixpanel && typeof window.mixpanel.init === "function" && !window.mixpanel.__SV) {
    boot();
    return;
  }

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
  s.onload = function () {
    boot();
  };
  s.onerror = function () {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[KonyaGo Mixpanel] SDK failed to load");
    }
  };
  (document.head || document.documentElement).appendChild(s);
})();
