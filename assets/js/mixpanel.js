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

  function getQueryParam(name) {
    try {
      var params = new URLSearchParams(window.location.search || "");
      return params.get(name) || "";
    } catch (e) {
      return "";
    }
  }

  function detectAcquisition() {
    var utmSource = (getQueryParam("utm_source") || "").toLowerCase();
    var utmMedium = (getQueryParam("utm_medium") || "").toLowerCase();
    var utmCampaign = getQueryParam("utm_campaign") || "";
    var ref = "";
    try {
      ref = (document.referrer || "").toLowerCase();
    } catch (e) {}

    var source = "direct";
    if (utmSource) {
      source = utmSource;
    } else if (ref.indexOf("instagram.com") !== -1 || ref.indexOf("l.instagram.com") !== -1) {
      source = "instagram";
    } else if (ref.indexOf("t.co") !== -1 || ref.indexOf("twitter.com") !== -1 || ref.indexOf("x.com") !== -1) {
      source = "twitter";
    } else if (ref.indexOf("facebook.com") !== -1 || ref.indexOf("fb.com") !== -1 || ref.indexOf("l.facebook.com") !== -1) {
      source = "facebook";
    } else if (ref.indexOf("google.") !== -1 || ref.indexOf("bing.com") !== -1 || ref.indexOf("yandex.") !== -1) {
      source = "organic_search";
    } else if (ref) {
      source = "referral";
    }

    // Instagram-specific mediums from ads/reels links
    if (!utmSource && (utmMedium === "social" || utmMedium === "story" || utmMedium === "reel")) {
      if (utmMedium) source = utmMedium === "reel" ? "instagram" : source;
    }

    return {
      acquisition_source: source,
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined,
      referrer: ref ? ref.slice(0, 300) : undefined,
      is_instagram: source === "instagram" || utmSource === "instagram" || utmSource === "ig"
    };
  }

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
      var acq = detectAcquisition();

      // Super properties for all future events in this session
      var superProps = {
        acquisition_source: acq.acquisition_source,
        platform: "web"
      };
      if (acq.utm_source) superProps.utm_source = acq.utm_source;
      if (acq.utm_medium) superProps.utm_medium = acq.utm_medium;
      if (acq.utm_campaign) superProps.utm_campaign = acq.utm_campaign;
      if (acq.is_instagram) superProps.is_instagram = true;
      mixpanel.register(superProps);

      var pageProps = {
        page_path: path,
        page_title: title,
        page_type: pageType,
        platform: "web",
        acquisition_source: acq.acquisition_source
      };
      if (acq.utm_source) pageProps.utm_source = acq.utm_source;
      if (acq.utm_medium) pageProps.utm_medium = acq.utm_medium;
      if (acq.utm_campaign) pageProps.utm_campaign = acq.utm_campaign;
      if (acq.referrer) pageProps.referrer = acq.referrer;

      mixpanel.track("page_view", pageProps);

      if (pageType === "content" || pageType === "ai") {
        mixpanel.track("content_view", {
          content_title: title,
          content_type: getContentType(),
          page_path: path,
          platform: "web",
          acquisition_source: acq.acquisition_source
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
            mixpanel.track("cta_click", {
              cta_type: "instagram",
              content_title: title,
              page_path: path,
              destination_url: href.slice(0, 200)
            });
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
        console.log("[KonyaGo Mixpanel] tracking active", acq.acquisition_source);
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
      setTimeout(trackAll, 1200);
      setTimeout(trackAll, 3000);
    } catch (err) {
      if (typeof console !== "undefined" && console.warn) console.warn("[KonyaGo Mixpanel] init failed", err);
    }
  }

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
