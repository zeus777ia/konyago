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

  // Official Mixpanel async snippet (correct variable scoping)
  (function (document, mixpanel) {
    if (mixpanel.__SV) return;
    var script, firstScript, methods, i;
    window.mixpanel = mixpanel;
    mixpanel._i = [];
    mixpanel.init = function (token, config, name) {
      var target = mixpanel;
      if (typeof name !== "undefined") {
        target = mixpanel[name] = [];
      } else {
        name = "mixpanel";
      }
      target.people = target.people || [];
      target.toString = function (notStub) {
        var str = "mixpanel";
        if (name !== "mixpanel") str += "." + name;
        if (!notStub) str += " (stub)";
        return str;
      };
      target.people.toString = function () {
        return target.toString(1) + ".people (stub)";
      };
      methods =
        "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
          " "
        );
      function stub(obj, method) {
        var parts = method.split(".");
        if (parts.length === 2) {
          obj = obj[parts[0]];
          method = parts[1];
        }
        obj[method] = function () {
          obj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      }
      for (i = 0; i < methods.length; i++) {
        stub(target, methods[i]);
      }
      mixpanel._i.push([token, config, name]);
    };
    mixpanel.__SV = 1.2;
    script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
    firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      (document.head || document.documentElement).appendChild(script);
    }
  })(document, window.mixpanel || []);

  function getPageType() {
    var path = (window.location.pathname || "/").toLowerCase();
    if (path === "/" || path === "" || /\/index\.html$/.test(path)) return "home";
    if (
      /gezilecek|sille|mutfak|rotalar|semtler|tarihce|ilceler|etli-ekmek|mevlana|kesfet/.test(path)
    )
      return "content";
    if (path.indexOf("ara") !== -1) return "search";
    if (path.indexOf("ai") !== -1) return "ai";
    if (path.indexOf("reklam") !== -1 || path.indexOf("iletisim") !== -1) return "business";
    return "other";
  }

  function getContentType() {
    var path = (window.location.pathname || "").toLowerCase();
    if (/gezilecek|sille|mevlana/.test(path)) return "mekan";
    if (/mutfak|etli-ekmek/.test(path)) return "yemek";
    if (/rotalar|konya-1-gun/.test(path)) return "rota";
    if (path.indexOf("etkinlik") !== -1) return "etkinlik";
    if (path.indexOf("ai") !== -1) return "ai";
    return "yazi";
  }

  var tracked = false;
  function trackAll() {
    if (tracked) return;
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
      for (var si = 0; si < searchForms.length; si++) {
        searchForms[si].addEventListener("submit", function (ev) {
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
  } catch (err) {}

  // Safety fallback
  setTimeout(function () {
    try {
      if (!tracked && window.mixpanel && typeof window.mixpanel.track === "function") {
        trackAll();
      }
    } catch (e) {}
  }, 2000);
})();
