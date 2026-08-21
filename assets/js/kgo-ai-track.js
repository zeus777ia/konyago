/**
 * KonyaGo AI analytics — non-blocking Mixpanel beacon
 * Safe no-op on failure; does not affect AI request flow.
 */
(function () {
  "use strict";
  if (window.kgoTrackAI) return;

  var TOKEN = "579a0a89b147340515db46c34844a82f";
  var API = "https://api-eu.mixpanel.com/track";

  function did() {
    try {
      var k = "kgo_mp_did";
      var v = localStorage.getItem(k);
      if (v) return v;
      v = "kgo_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(k, v);
      return v;
    } catch (e) {
      return "anon_" + String(Date.now());
    }
  }

  function payload(name, props) {
    var p = {
      token: TOKEN,
      distinct_id: did(),
      time: Math.floor(Date.now() / 1000),
      platform: "web",
      page_path: (location.pathname || "/").slice(0, 120)
    };
    if (props) {
      for (var k in props) {
        if (Object.prototype.hasOwnProperty.call(props, k) && props[k] != null && props[k] !== "") {
          p[k] = props[k];
        }
      }
    }
    return [{ event: name, properties: p }];
  }

  window.kgoTrackAI = function (name, props) {
    try {
      if (window.mixpanel && typeof window.mixpanel.track === "function") {
        try { window.mixpanel.track(name, props || {}); return; } catch (e1) {}
      }
      var data = btoa(unescape(encodeURIComponent(JSON.stringify(payload(name, props)))));
      var url = API + "?data=" + encodeURIComponent(data) + "&ip=1";
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
      } else {
        var img = new Image();
        img.src = url;
      }
    } catch (e) {}
  };

  // Optional: intercept fetch(kgo_ai_ask) once for shortcode/pages without inline hooks
  if (!window.__KGO_AI_FETCH_HOOK) {
    window.__KGO_AI_FETCH_HOOK = true;
    if (typeof window.fetch === "function") {
      var _fetch = window.fetch;
      window.fetch = function (input, init) {
        var body = init && init.body != null ? String(init.body) : "";
        var isAi = body.indexOf("kgo_ai_ask") !== -1;
        var qLen = 0;
        if (isAi) {
          try {
            var m = body.match(/(?:^|&)question=([^&]*)/);
            if (m) qLen = decodeURIComponent(m[1].replace(/\+/g, " ")).trim().length;
          } catch (e2) {}
          window.kgoTrackAI("kgo_ai_ask", {
            source: window.__KGO_AI_SOURCE || "fetch",
            question_len: qLen
          });
        }
        var p = _fetch.apply(this, arguments);
        if (isAi && p && typeof p.then === "function") {
          return p.then(function (res) {
            try {
              var clone = res.clone();
              clone.json().then(function (j) {
                if (j && j.success) {
                  window.kgoTrackAI("kgo_ai_success", {
                    source: window.__KGO_AI_SOURCE || "fetch",
                    question_len: qLen
                  });
                } else {
                  window.kgoTrackAI("kgo_ai_fail", {
                    source: window.__KGO_AI_SOURCE || "fetch",
                    reason: "api"
                  });
                }
              }).catch(function () {
                window.kgoTrackAI("kgo_ai_fail", {
                  source: window.__KGO_AI_SOURCE || "fetch",
                  reason: "parse"
                });
              });
            } catch (e3) {}
            return res;
          }, function (err) {
            window.kgoTrackAI("kgo_ai_fail", {
              source: window.__KGO_AI_SOURCE || "fetch",
              reason: "network"
            });
            throw err;
          });
        }
        return p;
      };
    }
  }
})();
