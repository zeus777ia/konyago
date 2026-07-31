/* KonyaGo AI — Yerel + Gemini (AIza ve AQ. key destekli) */
(function () {
  "use strict";

  var chat = document.getElementById("aiChat");
  var form = document.getElementById("aiForm");
  var input = document.getElementById("aiInput");
  var sendBtn = document.getElementById("aiSend");
  if (!chat || !form || !input) return;

  var KEY_LS = "konyago_gemini_key";
  var MODE_LS = "konyago_ai_mode";
  var mode = "local";
  try {
    var savedMode = localStorage.getItem(MODE_LS);
    if (savedMode === "gemini" || savedMode === "local") mode = savedMode;
  } catch (e) {}

  var history = [];
  var geminiHistory = [];
  var lastTopics = [];
  var turn = 0;

  var btnLocal = document.getElementById("modeLocal");
  var btnGemini = document.getElementById("modeGemini");
  var titleEl = document.getElementById("aiTitle");
  var subEl = document.getElementById("aiSubtitle");
  var keyInput = document.getElementById("geminiKeyInput");
  var keySave = document.getElementById("geminiKeySave");
  var keyClear = document.getElementById("geminiKeyClear");
  var statusEl = document.getElementById("geminiStatus");

  function getKey() {
    try { return (localStorage.getItem(KEY_LS) || "").trim(); } catch (e) { return ""; }
  }

  function setKey(k) {
    try {
      if (k) localStorage.setItem(KEY_LS, k);
      else localStorage.removeItem(KEY_LS);
    } catch (e) { throw e; }
  }

  /* 2026: Google AQ. (auth) + eski AIza (standard) */
  function looksLikeGeminiKey(k) {
    k = (k || "").trim();
    if (k.length < 20) return false;
    if (/^AIza[0-9A-Za-z_-]{10,}$/.test(k)) return true;
    if (/^AQ\.[0-9A-Za-z_-]{15,}$/.test(k)) return true;
    if (/^AQAb[0-9A-Za-z_-]{15,}$/.test(k)) return true;
    return false;
  }

  function updateStatus() {
    var k = getKey();
    if (!statusEl) return;
    if (k) {
      var ok = looksLikeGeminiKey(k);
      statusEl.className = "gemini-status " + (ok ? "ok" : "err");
      statusEl.textContent = ok
        ? "Anahtar kayıtlı (" + k.slice(0, 6) + "…" + k.slice(-4) + "). Gemini seçebilirsin."
        : "Anahtar kayıtlı ama format şüpheli (" + k.slice(0, 6) + "…). Yine de dene veya yeni key al.";
    } else {
      statusEl.className = "gemini-status";
      statusEl.textContent = "Anahtar yok — Yerel motor kullanılabilir.";
    }
  }

  function setMode(m) {
    mode = m === "gemini" ? "gemini" : "local";
    try { localStorage.setItem(MODE_LS, mode); } catch (e) {}
    if (btnLocal) btnLocal.classList.toggle("active", mode === "local");
    if (btnGemini) btnGemini.classList.toggle("active", mode === "gemini");
    if (titleEl) titleEl.textContent = mode === "gemini" ? "KonyaGo · Gemini" : "KonyaGo AI";
    if (subEl) {
      subEl.textContent = mode === "gemini"
        ? "Google Gemini · Konya-only"
        : "Yerel motor · sınırsız · Konya-only";
    }
  }

  function saveFromInput() {
    var v = (keyInput && keyInput.value || "").trim().replace(/\s+/g, "");
    if (!v || v.length < 20) {
      if (statusEl) {
        statusEl.className = "gemini-status err";
        statusEl.textContent = "API anahtarı eksik veya çok kısa.";
      }
      alert("API anahtarı eksik veya çok kısa.\nAI Studio → Create API key → Copy key");
      return false;
    }
    try { setKey(v); } catch (e) {
      alert("Kayıt başarısız (gizli sekme / depolama kapalı olabilir).");
      return false;
    }
    if (keyInput) keyInput.value = "";
    updateStatus();
    addMsg("Anahtar kaydedildi. Üstten «Gemini» seç, soru sor.", "bot");
    alert("Kaydedildi! Üstteki Gemini butonuna bas.");
    return true;
  }

  if (btnLocal) btnLocal.addEventListener("click", function () { setMode("local"); });
  if (btnGemini) btnGemini.addEventListener("click", function () {
    if (!getKey()) {
      addMsg("Önce API key kaydet (AQ. veya AIza ile başlar).", "bot");
      setMode("local");
      var box = document.getElementById("geminiSetup");
      if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setMode("gemini");
    addMsg("Gemini modu açık. Konya hakkında sorabilirsin.", "bot");
  });

  if (keySave) keySave.addEventListener("click", function (e) {
    e.preventDefault();
    saveFromInput();
  });
  if (keyClear) keyClear.addEventListener("click", function () {
    try { setKey(""); } catch (e) {}
    updateStatus();
    setMode("local");
    geminiHistory = [];
    addMsg("Anahtar silindi. Yerel motor.", "bot");
  });

  updateStatus();
  setMode(mode === "gemini" && getKey() ? "gemini" : "local");

  /* ===== Yerel motor (özet) ===== */
  function norm(s) {
    return (s || "").toLowerCase()
      .replace(/ı/g, "i").replace(/İ/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
      .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function hasAny(t, words) {
    for (var i = 0; i < words.length; i++) if (t.indexOf(words[i]) !== -1) return true;
    return false;
  }
  var OFF = ["bitcoin", "kripto", "python ders", "siyaset", "futbol skor", "istanbulda ne gezilir", "ankara gezi"];
  var KONYA_SIGNALS = ["konya", "mevlana", "rumi", "sille", "meram", "catalhoyuk", "alaaddin", "etli", "bamya", "tirit", "arabasi", "atus", "konyakart", "beysehir", "seydisehir", "esref", "aksehir", "nasreddin", "karatay", "selcuk"];
  var FOLLOW = ["oraya", "nasil giderim", "saat kac", "daha fazla", "anlat", "detay", "peki"];
  var CARDS = [
    { id: "mevlana", keys: ["mevlana", "rumi", "sema"], w: 12, a: function () { return "Mevlana Müzesi: genelde ücretsiz, kapanış ~17:00 (doğrula). Sabah git."; } },
    { id: "etli", keys: ["etli ekmek", "etliekmek"], w: 14, a: function () { return "Etli ekmek Konya imzası. Taş fırın, yanına ayran."; } },
    { id: "sille", keys: ["sille"], w: 11, a: function () { return "Sille yarım gün: taş evler, Aya Eleni."; } },
    { id: "plan2", keys: ["hafta sonu", "2 gun", "iki gun"], w: 13, a: function () { return "Cts: Mevlana+merkez. Paz: Sille veya Beyşehir."; } },
    { id: "yemek", keys: ["bamya", "arabasi", "tirit", "yemek", "mutfak"], w: 9, a: function (t) {
      if (hasAny(t, ["bamya"])) return "Bamya çorbası Konya usulü.";
      if (hasAny(t, ["arabasi"])) return "Arabaşı kış klasiği.";
      return "Etli ekmek, fırın kebabı, tirit, bamya, arabaşı, hoşmerim.";
    } },
    { id: "self", keys: ["sen kimsin", "konyago"], w: 10, a: function () { return "KonyaGo AI — Yerel veya Gemini. Sadece Konya."; } }
  ];
  function answerLocal(q) {
    var t = norm(q);
    if (!t) return "Konya hakkında sor.";
    if (hasAny(t, ["merhaba", "selam"])) return "Merhaba! Yerel veya Gemini ile Konya sor.";
    if (hasAny(t, OFF) && !hasAny(t, KONYA_SIGNALS)) return "Sadece Konya konuları.";
    var scored = [];
    for (var i = 0; i < CARDS.length; i++) {
      var s = 0, keys = CARDS[i].keys;
      for (var j = 0; j < keys.length; j++) if (t.indexOf(keys[j]) !== -1) s += CARDS[i].w + keys[j].length;
      if (s > 0) scored.push({ c: CARDS[i], s: s });
    }
    scored.sort(function (a, b) { return b.s - a.s; });
    if (!scored.length) return "Konya gezi / yemek / tarih sorabilirsin.";
    lastTopics = [scored[0].c.id];
    return typeof scored[0].c.a === "function" ? scored[0].c.a(t) : String(scored[0].c.a);
  }

  /* ===== Gemini ===== */
  var SYSTEM = "Sen KonyaGo AI’sın. Yalnızca Konya (Türkiye) ili/ilçeleri: gezi, tarih, mutfak, ulaşım. Konya dışı reddet. Türkçe, samimi, kısa-orta. Uydurma adres/telefon yok. Saat-ücret için resmî kaynak de.";

  var GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash"
  ];

  function callGemini(userText) {
    var key = getKey();
    if (!key) return Promise.reject(new Error("no-key"));

    geminiHistory.push({ role: "user", parts: [{ text: userText }] });
    if (geminiHistory.length > 12) geminiHistory = geminiHistory.slice(-12);

    var body = {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: geminiHistory,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    };

    var errors = [];

    function tryModel(idx) {
      if (idx >= GEMINI_MODELS.length) {
        return Promise.reject(new Error("all-models-failed: " + errors.slice(0, 2).join(" | ")));
      }
      var model = GEMINI_MODELS[idx];
      var base = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

      // 1) header (AQ. auth key için önerilen)
      // 2) query param yedek
      function doFetch(useHeader) {
        var url = useHeader ? base : (base + "?key=" + encodeURIComponent(key));
        var headers = { "Content-Type": "application/json" };
        if (useHeader) headers["x-goog-api-key"] = key;
        return fetch(url, { method: "POST", headers: headers, body: JSON.stringify(body) });
      }

      return doFetch(true)
        .then(function (r) {
          if (r.status === 400 || r.status === 401 || r.status === 403) {
            return doFetch(false).then(function (r2) { return { r: r2, via: "query" }; });
          }
          return { r: r, via: "header" };
        })
        .then(function (pack) {
          var r = pack.r;
          return r.json().then(function (j) {
            if (!r.ok) {
              var msg = (j && j.error && j.error.message) || ("HTTP " + r.status);
              errors.push(model + ": " + String(msg).slice(0, 100));
              // key tamamen bozuksa erken çık
              if (/API key not valid|INVALID_ARGUMENT.*key|PERMISSION_DENIED/i.test(msg) && idx >= 1) {
                throw new Error(msg);
              }
              return tryModel(idx + 1);
            }
            var text = "";
            try {
              var parts = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
              if (parts) text = parts.map(function (p) { return p.text || ""; }).join("");
            } catch (e) {}
            if (!text) {
              errors.push(model + ": empty");
              return tryModel(idx + 1);
            }
            geminiHistory.push({ role: "model", parts: [{ text: text }] });
            return text;
          });
        })
        .catch(function (err) {
          if (err && err.message && /API key not valid|PERMISSION_DENIED|INVALID_ARGUMENT/i.test(err.message)) {
            throw err;
          }
          errors.push(model + ": " + String(err && err.message || err).slice(0, 80));
          if (idx + 1 < GEMINI_MODELS.length) return tryModel(idx + 1);
          throw new Error("all-models-failed: " + errors.slice(0, 2).join(" | "));
        });
    }

    return tryModel(0);
  }

  /* ===== UI ===== */
  function addMsg(text, who, meta) {
    var div = document.createElement("div");
    div.className = "ai-msg ai-" + who;
    div.textContent = text;
    if (meta) {
      var m = document.createElement("div");
      m.className = "ai-meta";
      m.textContent = meta;
      div.appendChild(m);
    }
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function typeOut(text, meta, cb) {
    var div = document.createElement("div");
    div.className = "ai-msg ai-bot";
    chat.appendChild(div);
    var i = 0, step = Math.max(2, Math.floor(text.length / 50));
    (function tick() {
      i = Math.min(text.length, i + step);
      div.textContent = text.slice(0, i);
      chat.scrollTop = chat.scrollHeight;
      if (i < text.length) setTimeout(tick, 12);
      else {
        if (meta) {
          var m = document.createElement("div");
          m.className = "ai-meta";
          m.textContent = meta;
          div.appendChild(m);
        }
        if (cb) cb();
      }
    })();
  }

  function addTyping() {
    var tip = document.createElement("div");
    tip.className = "ai-msg ai-bot ai-typing";
    tip.textContent = mode === "gemini" ? "Gemini düşünüyor…" : "Düşünüyor…";
    chat.appendChild(tip);
    chat.scrollTop = chat.scrollHeight;
    return tip;
  }

  addMsg("Merhaba! Yerel (anahtarsız) veya Gemini (AQ./AIza key).\nKey: aistudio.google.com/apikey → Copy key → Kaydet → Gemini.", "bot");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = (input.value || "").trim();
    if (!q) return;
    addMsg(q, "user");
    input.value = "";
    if (sendBtn) sendBtn.disabled = true;
    var tip = addTyping();

    function done(text, meta) {
      tip.remove();
      typeOut(text, meta, function () {
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      });
    }

    function fail(err) {
      tip.remove();
      var raw = (err && err.message) || "";
      var msg;
      if (/no-key/i.test(raw)) msg = "Key yok. Yukarıdan kaydet.";
      else if (/API key not valid|invalid.*key/i.test(raw)) {
        msg = "API key geçersiz.\n1) AI Studio’da Delete key\n2) Yeni Create API key\n3) Copy key → sitede Sil → yapıştır → Kaydet\n\nKey ekran görüntüsüne düştüyse mutlaka yenile.";
      } else if (/429|quota|RESOURCE/i.test(raw)) msg = "Kota doldu. Biraz bekle veya Yerel kullan.";
      else msg = "Gemini: " + String(raw).slice(0, 240) + "\n\nYerel moda geçebilirsin.";
      done(msg, "hata");
    }

    if (mode === "gemini") {
      callGemini(q).then(function (t) { done(t, "Gemini"); }).catch(fail);
    } else {
      setTimeout(function () { done(answerLocal(q), "Yerel"); }, 220);
    }
  });
})();
