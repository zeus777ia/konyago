/**
 * KonyaGo Mixpanel tracking
 * Project: KonyaGo (EU)
 * Token: 579a0a89b147340515db46c34844a82f
 */
(function () {
  "use strict";

  if (window.__konyagoMixpanelLoaded) return;
  window.__konyagoMixpanelLoaded = true;

  var TOKEN = "579a0a89b147340515db46c34844a82f";

  function loadSdk(cb) {
    if (window.mixpanel && typeof window.mixpanel.init === "function") {
      cb();
      return;
    }
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
    s.onload = function () {
      try {
        cb();
      } catch (e) {}
    };
    s.onerror = function () {};
    (document.head || document.documentElement).appendChild(s);
  }

  function getPageType() {
    var path = (window.location.pathname || "/").toLowerCase();
    if (path === "/" || path === "" || path.endsWith("/index.html") || path === "/index.html") return "home";
    if (path.indexOf("gezilecek") !== -1 || path.indexOf("sille") !== -1 || path.indexOf("mutfak") !== -1 ||
        path.indexOf("rotalar") !== -1 || path.indexOf("semtler") !== -1 || path.indexOf("tarihce") !== -1 ||
        path.indexOf("ilceler") !== -1 || path.indexOf("etli-ekmek") !== -1 || path.indexOf("mevlana") !== -1 ||
        path.indexOf("kesfet") !== -1) return "content";
    if (path.indexOf("ara") !== -1) return "search";
    if (path.indexOf("ai") !== -1) return "ai";
    if (path.indexOf("reklam") !== -1 || path.indexOf("iletisim") !== -1) return "business";
    return "other";
  }

  function getContentType() {
    var path = (window.location.pathname || "").toLowerCase();
    if (path.indexOf("gezilecek") !== -1 || path.indexOf("sille") !== -1 || path.indexOf("mevlana") !== -1) return "mekan";
    if (path.indexOf("mutfak") !== -1 || path.indexOf("etli-ekmek") !== -1) return "yemek";
    if (path.indexOf("rotalar") !== -1 || path.indexOf("konya-1-gun") !== -1) return "rota";
    if (path.indexOf("etkinlik") !== -1) return "etkinlik";
    if (path.indexOf("ai") !== -1) return "ai";
    return "yazi";
  }

  function init() {
    try {
      mixpanel.init(TOKEN, {
        api_host: "https://api-eu.mixpanel.com",
        track_pageview: false,
        persistence: "localStorage",
        ignore_dnt: true,
        batch_requests: true
      });

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

      // CTA / outbound clicks
      document.addEventListener("click", function (e) {
        var el = e.target && e.target.closest ? e.target.closest("a, button") : null;
        if (!el) return;

        var href = (el.getAttribute("href") || "").trim();
        var text = ((el.innerText || el.textContent || "") + "").toLowerCase();

        if (href.indexOf("tel:") === 0) {
          mixpanel.track("cta_click", {
            cta_type: "phone",
            content_title: title,
            page_path: path
          });
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

        if (href.indexOf("instagram.com") !== -1 || href.indexOf("instagram.com/konyago") !== -1) {
          mixpanel.track("cta_click", {
            cta_type: "instagram",
            content_title: title,
            page_path: path
          });
          return;
        }

        if (href.indexOf("wa.me") !== -1 || href.indexOf("whatsapp") !== -1) {
          mixpanel.track("cta_click", {
            cta_type: "whatsapp",
            content_title: title,
            page_path: path
          });
          return;
        }

        if (href.indexOf("http") === 0 && href.indexOf(window.location.hostname) === -1) {
          mixpanel.track("outbound_click", {
            url: href.slice(0, 300),
            page_path: path,
            content_title: title
          });
        }
      }, true);

      // Search form (home + ara.html)
      var searchForms = document.querySelectorAll('form[action*="ara"], form[role="search"]');
      for (var i = 0; i < searchForms.length; i++) {
        searchForms[i].addEventListener("submit", function (ev) {
          try {
            var form = ev.target;
            var input = form.querySelector('input[type="search"], input[name="q"]');
            var term = input ? (input.value || "").trim() : "";
            if (term) {
              mixpanel.track("search", {
                search_term: term.slice(0, 120),
                page_path: path
              });
            }
          } catch (err) {}
        });
      }
    } catch (err) {
      // silent fail — analytics must never break the site
    }
  }

  loadSdk(init);
})();
