/* kgo-live-ai-home.js — homepage AI panel with nonce bootstrap */
(function(){
  if (window.__KGO_LIVE_AI_HOME) return;
  window.__KGO_LIVE_AI_HOME = true;
  window.__KGO_AI_SOURCE = window.__KGO_AI_SOURCE || "home";

  var fab = document.getElementById("kgoLiveAiFab");
  var panel = document.getElementById("kgoLiveAiPanel");
  if (!fab || !panel) return;

  var body = document.getElementById("kgoLiveAiBody");
  var input = document.getElementById("kgoLiveAiInput");
  var send = document.getElementById("kgoLiveAiSend");
  var suggests = document.getElementById("kgoLiveAiSuggests");
  var closeBtn = panel.querySelector(".close");
  var opened = false;
  var cfg = null;

  function loadCfg(cb) {
    if (cfg && cfg.nonce) { cb(cfg); return; }
    if (window.kgo_ai && window.kgo_ai.nonce) { cfg = window.kgo_ai; cb(cfg); return; }
    fetch("/konyago-ai/", { credentials: "same-origin" })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var m = html.match(/var config=\{"endpoint":"([^"]+)","nonce":"([^"]+)"\}/);
        if (m) {
          cfg = { endpoint: m[1].replace(/\\\//g, "/"), nonce: m[2] };
        } else {
          cfg = { endpoint: "/wp-admin/admin-ajax.php", nonce: "" };
        }
        cb(cfg);
      })
      .catch(function () {
        cfg = { endpoint: "/wp-admin/admin-ajax.php", nonce: "" };
        cb(cfg);
      });
  }

  function open(force) {
    if (opened && !force) return;
    opened = true;
    panel.classList.add("open");
    if (body && !body.children.length) {
      var m = document.createElement("div");
      m.className = "kgo-msg bot";
      m.textContent = "Merhaba! Konya gezisi, mekân, etkinlik ve pratik bilgiler için buradayım.";
      body.appendChild(m);
      if (suggests) {
        ["Mevlana nerede?", "Bugün nereye gidilir?", "En iyi et restoran", "Otopark nerede?"].forEach(function (t) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = t;
          b.addEventListener("click", function () { input.value = t; ask(); });
          suggests.appendChild(b);
        });
      }
    }
    setTimeout(function () { if (input) input.focus(); }, 80);
    loadCfg(function () {});
  }

  function close() {
    panel.classList.remove("open");
    opened = false;
  }

  function ask() {
    var q = (input && input.value || "").trim();
    if (!q) return;
    input.value = "";
    var u = document.createElement("div");
    u.className = "kgo-msg user";
    u.textContent = q;
    body.appendChild(u);
    var bot = document.createElement("div");
    bot.className = "kgo-msg bot";
    bot.textContent = "Düşünüyorum…";
    body.appendChild(bot);
    body.scrollTop = body.scrollHeight;
    if (window.kgoTrackAI) {
      try { window.kgoTrackAI("kgo_ai_ask", { q: q, source: window.__KGO_AI_SOURCE || "home" }); } catch (e) {}
    }

    loadCfg(function (c) {
      var params = {
        action: "kgo_ai_ask",
        question: q,
        source: window.__KGO_AI_SOURCE || "home"
      };
      if (c && c.nonce) params.nonce = c.nonce;
      var endpoint = (c && c.endpoint) || "/wp-admin/admin-ajax.php";
      fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams(params).toString()
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.success === false) {
            bot.textContent = (d.data && d.data.message) || "Yanıt alınamadı. Sayfayı yenileyip tekrar dene.";
            if (window.kgoTrackAI) {
              try { window.kgoTrackAI("kgo_ai_fail", { source: window.__KGO_AI_SOURCE || "home", reason: "api" }); } catch (e) {}
            }
            return;
          }
          var ans = (d && d.data && (d.data.answer || d.data.text)) || (d && d.answer) || "Şu an yanıt alınamadı. Tekrar dener misin?";
          if (/<[a-z][\s\S]*>/i.test(ans)) bot.innerHTML = ans;
          else bot.textContent = ans;
          body.scrollTop = body.scrollHeight;
          if (window.kgoTrackAI) {
            try { window.kgoTrackAI("kgo_ai_success", { source: window.__KGO_AI_SOURCE || "home" }); } catch (e) {}
          }
        })
        .catch(function () {
          bot.textContent = "Bağlantı hatası. Lütfen tekrar dene.";
          if (window.kgoTrackAI) {
            try { window.kgoTrackAI("kgo_ai_fail", { source: window.__KGO_AI_SOURCE || "home", reason: "network" }); } catch (e) {}
          }
        });
    });
  }

  fab.addEventListener("click", function () {
    if (panel.classList.contains("open")) close();
    else open(true);
  });
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (send) send.addEventListener("click", ask);
  if (input) input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); ask(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("open")) close();
  });
  document.querySelectorAll("[data-kgo-open-ai]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(true); });
  });
  window.kgoOpenLiveAI = function (force) { open(force); };
})();
