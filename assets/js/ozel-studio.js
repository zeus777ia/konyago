/* KonyaGo ozel studio — menude yok, noindex
   API key sadece sessionStorage; asla repo'ya yazilmaz.
*/
(function (w, d) {
  "use strict";

  // Basit erisim kapisi (istemci tarafli). Herkese acma.
  // Degistirmek istersen bu degeri guncelle.
  var ACCESS_PIN = "konyago-studio";
  var GATE_KEY = "kg_studio_ok_v1";
  var API_KEY_STORE = "kg_meta_api_key_sess";

  var gate = d.getElementById("gate");
  var app = d.getElementById("app");
  var chat = d.getElementById("chat");
  var runBtn = d.getElementById("runBtn");
  var busy = false;

  function unlocked() {
    try {
      return sessionStorage.getItem(GATE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function showApp(on) {
    if (gate) gate.style.display = on ? "none" : "block";
    if (app) app.style.display = on ? "block" : "none";
  }

  function bubble(role, text) {
    if (!chat) return null;
    var el = d.createElement("div");
    el.className = "bubble " + role;
    el.textContent = text;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  }

  function getKey() {
    var input = d.getElementById("apiKey");
    var v = (input && input.value) || "";
    v = v.trim();
    if (!v) {
      try {
        v = sessionStorage.getItem(API_KEY_STORE) || "";
      } catch (e) {}
    }
    return v;
  }

  function saveKey(v) {
    try {
      if (v) sessionStorage.setItem(API_KEY_STORE, v);
    } catch (e) {}
  }

  function extractDelta(event) {
    if (!event || typeof event !== "object") return "";
    if (event.type === "response.output_text.delta" && event.delta) return String(event.delta);
    if (typeof event.delta === "string") return event.delta;
    if (typeof event.output_text === "string") return event.output_text;
    if (typeof event.text === "string") return event.text;
    // bazi surumler choices benzeri donebilir
    try {
      var c = event.choices && event.choices[0];
      if (c && c.delta && c.delta.content) return String(c.delta.content);
    } catch (e) {}
    return "";
  }

  async function runMuse() {
    if (busy) return;
    var key = getKey();
    var promptEl = d.getElementById("prompt");
    var prompt = (promptEl && promptEl.value) || "";
    prompt = prompt.trim();
    if (!key) {
      bubble("err", "API anahtarı yok. Meta Model API key gir.");
      return;
    }
    if (!prompt) {
      bubble("err", "İstek boş olamaz.");
      return;
    }

    saveKey(key);
    busy = true;
    if (runBtn) runBtn.disabled = true;
    bubble("user", prompt);
    var bot = bubble("bot", "…");

    // Duzeltilmis payload: bos assistant mesaji YOK
    var payload = {
      model: "muse-spark-1.2",
      input: prompt,
      stream: true,
      temperature: 0.6,
      max_output_tokens: 2048,
      top_p: 0.9,
      reasoning: { effort: "medium" }
    };

    try {
      var res = await fetch("https://api.meta.ai/v1/responses", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
          Accept: "text/event-stream"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        var errText = await res.text();
        if (bot) bot.className = "bubble err";
        if (bot) bot.textContent = "HTTP " + res.status + " — " + errText.slice(0, 500);
        return;
      }

      // CORS/stream destekleniyorsa SSE oku
      if (!res.body || !res.body.getReader) {
        var json = await res.json();
        var text =
          (json.output_text) ||
          (json.output && JSON.stringify(json.output)) ||
          JSON.stringify(json).slice(0, 4000);
        if (bot) bot.textContent = text;
        return;
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";
      var out = "";
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var parts = buffer.split("\n");
        buffer = parts.pop() || "";
        for (var i = 0; i < parts.length; i++) {
          var line = parts[i].trim();
          if (!line.indexOf || line.indexOf("data:") !== 0) continue;
          var data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            var event = JSON.parse(data);
            var delta = extractDelta(event);
            if (delta) {
              out += delta;
              if (bot) bot.textContent = out;
              if (chat) chat.scrollTop = chat.scrollHeight;
            }
          } catch (e) {
            // ham satır
            if (data && data.charAt(0) !== "{") {
              out += data;
              if (bot) bot.textContent = out;
            }
          }
        }
      }
      if (!out && bot) bot.textContent = "(Boş yanıt veya stream parse edilemedi)";
    } catch (err) {
      if (bot) {
        bot.className = "bubble err";
        bot.textContent =
          "İstek başarısız: " +
          (err && err.message ? err.message : String(err)) +
          "\n\nMuhtemel sebep: tarayıcı CORS engeli. Lokal script kullan: scripts/meta_responses.py";
      }
    } finally {
      busy = false;
      if (runBtn) runBtn.disabled = false;
    }
  }

  function boot() {
    if (unlocked()) showApp(true);
    else showApp(false);

    try {
      var saved = sessionStorage.getItem(API_KEY_STORE);
      var keyInput = d.getElementById("apiKey");
      if (saved && keyInput) keyInput.value = saved;
    } catch (e) {}

    d.getElementById("unlockBtn") &&
      d.getElementById("unlockBtn").addEventListener("click", function () {
        var pw = (d.getElementById("pw") || {}).value || "";
        if (pw === ACCESS_PIN) {
          try {
            sessionStorage.setItem(GATE_KEY, "1");
          } catch (e) {}
          showApp(true);
        } else {
          alert("Şifre hatalı");
        }
      });

    d.getElementById("lockBtn") &&
      d.getElementById("lockBtn").addEventListener("click", function () {
        try {
          sessionStorage.removeItem(GATE_KEY);
          sessionStorage.removeItem(API_KEY_STORE);
        } catch (e) {}
        showApp(false);
      });

    runBtn && runBtn.addEventListener("click", runMuse);

    d.getElementById("clearChat") &&
      d.getElementById("clearChat").addEventListener("click", function () {
        if (chat) chat.innerHTML = "";
      });

    d.getElementById("fillPreview") &&
      d.getElementById("fillPreview").addEventListener("click", function () {
        bubble(
          "bot",
          "Önizleme zaten bu sayfanın altında taslak olarak duruyor. Beğenirsen ana siteye taşırız; şimdilik gizli."
        );
      });

    var pw = d.getElementById("pw");
    if (pw) {
      pw.addEventListener("keydown", function (e) {
        if (e.key === "Enter") d.getElementById("unlockBtn").click();
      });
    }
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
