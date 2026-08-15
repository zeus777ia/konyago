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

  // Official Mixpanel snippet (stub + async lib load)
  (function (e, a) {
    if (!a.__SV) {
      var b, c, f, d;
      window.mixpanel = a;
      a._i = [];
      a.init = function (b, c, g) {
        function h(a, d) {
          var b = d.split(".");
          2 == b.length && ((a = a[b[0]]), (d = b[1]));
          a[d] = function () {
            a.push([d].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        var e = a;
        "undefined" !== typeof g ? (e = a[g] = []) : (g = "mixpanel");
        e.people = e.people || [];
        e.toString = function (a) {
          var b = "mixpanel";
          "mixpanel" !== g && (b += "." + g);
          a || (b += " (stub)");
          return b;
        };
        e.people.toString = function () {
          return e.toString(1) + ".people (stub)";
        };
        b =
          "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
            " "
          );
        for (c = 0; c < b.length; c++) h(e, b[c]);
        a._i.push([b, c, g]);
      };
      a.__SV = 1.2;
      b = e.createElement("script");
      b.type = "text/javascript";
      b.async = true;
      b.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
      c = e.getElementsByTagName("script")[0];
      c.parentNode.insertBefore(b, c);
    }
  })(document, window.mixpanel || []);

  function getPageType() {
    var path = (window.location.pathname || "/").toLowerCase();
    if (path === "/" || path === "" || path.endsWith("/index.html") || path === "/index.html") return "home";
    if (
      path.indexOf("gezilecek") !== -1 ||
      path.indexOf("sille") !== -1 ||
      path.indexOf("mutfak") !== -1 ||
      path.indexOf("rotalar") !== -1 ||
      path.indexOf("semtler") !== -1 ||
      path.indexOf("tarihce") !== -1 ||
      path.indexOf("ilceler") !== -1 ||
      path.indexOf("etli-ekmek") !== -1 ||
      path.indexOf("mevlana") !== -1 ||
      path.indexOf("kesfet") !== -1
    )
      return "content";
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

  function trackAll() {
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

          if (href.indexOf("instagram.com") !== -1) {
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
        },
        true
      );

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
    } catch (err) {}
  }

  // Init with EU host, then track
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
    // Fallback if loaded callback is slow / already ready
    setTimeout(function () {
      try {
        if (window.mixpanel && typeof window.mixpanel.track === "function") {
          trackAll();
        }
      } catch (e) {}
    }, 1500);
  } catch (err) {}
})();
