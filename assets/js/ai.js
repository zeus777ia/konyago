/* KonyaGo AI — Yerel motor + Google Gemini (ayni sohbet) */
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
  var lastGeminiError = "";

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
    } catch (e) {
      throw e;
    }
  }

  function looksLikeGeminiKey(k) {
    // Google AI Studio API keys genelde AIza ile baslar
    return /^AIza[0-9A-Za-z_-]{20,}$/.test(k || "");
  }

  function updateStatus() {
    var k = getKey();
    if (!statusEl) return;
    if (k) {
      var warn = looksLikeGeminiKey(k) ? "" : " ⚠️ Bu key AIza ile başlamıyor — muhtemelen yanlış kopyalandı.";
      statusEl.className = "gemini-status " + (looksLikeGeminiKey(k) ? "ok" : "err");
      statusEl.textContent = "Anahtar kayıtlı (" + k.slice(0, 6) + "…" + k.slice(-4) + ")." + warn;
    } else {
      statusEl.className = "gemini-status";
      statusEl.textContent = "Anahtar yok — şimdilik Yerel motor kullanılabilir.";
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
        ? "Google Gemini · Konya-only · ücretsiz kota"
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
      alert("API anahtarı eksik veya çok kısa.\n\nDoğru key aistudio.google.com/apikey adresinden alınır ve genelde AIza ile başlar.");
      return false;
    }
    if (!looksLikeGeminiKey(v)) {
      if (statusEl) {
        statusEl.className = "gemini-status err";
        statusEl.textContent = "Uyarı: Key AIza ile başlamıyor. Yine de kaydedildi — genelde çalışmaz.";
      }
      alert("Dikkat: Yapıştırdığın metin klasik Gemini API key formatında değil.\n\nDoğru key genelde şöyle başlar: AIzaSy...\n\naistudio.google.com/apikey → Create API key → kopyala.\nYine de kaydediyorum; denemek istersen Gemini’ye geç.");
    }
    try {
      setKey(v);
    } catch (e) {
      alert("Kayıt başarısız (gizli mod / depolama kapalı olabilir).");
      return false;
    }
    if (keyInput) keyInput.value = "";
    updateStatus();
    addMsg("Gemini anahtarı kaydedildi. Üstten «Gemini» butonuna bas.", "bot");
    return true;
  }

  if (btnLocal) btnLocal.addEventListener("click", function () { setMode("local"); });
  if (btnGemini) btnGemini.addEventListener("click", function () {
    if (!getKey()) {
      addMsg("Gemini için önce API anahtarını kaydet (AIzaSy… ile başlar).", "bot");
      setMode("local");
      var box = document.getElementById("geminiSetup");
      if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!looksLikeGeminiKey(getKey())) {
      addMsg("Kayıtlı anahtar AIza ile başlamıyor. AI Studio’dan yeni key alıp kaydet — şu anki büyük ihtimalle çalışmaz.", "bot");
    }
    setMode("gemini");
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
    addMsg("Gemini anahtarı silindi. Yerel motora döndün.", "bot");
  });

  updateStatus();
  setMode(mode === "gemini" && getKey() ? "gemini" : "local");

  /* ========== YEREL MOTOR ========== */
  function norm(s) {
    return (s || "")
      .toLowerCase()
      .replace(/ı/g, "i").replace(/İ/g, "i")
      .replace(/ğ/g, "g").replace(/ü/g, "u")
      .replace(/ş/g, "s").replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasAny(t, words) {
    for (var i = 0; i < words.length; i++) {
      if (t.indexOf(words[i]) !== -1) return true;
    }
    return false;
  }

  var OFF = [
    "bitcoin", "kripto", "borsa", "python ders", "javascript ogren",
    "siyaset", "futbol skor", "netflix dizi", "ilac dozu", "hack",
    "istanbulda ne gezilir", "ankara gezi", "izmir tatil"
  ];
  var KONYA_SIGNALS = [
    "konya", "mevlana", "rumi", "sille", "meram", "catalhoyuk", "alaaddin", "alaeddin",
    "selcuk", "etli", "bamya", "tirit", "arabasi", "atus", "konyakart", "sebi",
    "hosmerim", "cezerye", "karatay", "ince minare", "beysehir", "seydisehir",
    "esref", "aksehir", "nasreddin", "kelebek", "firin kebabi", "tandir", "iconium"
  ];
  var FOLLOW = ["oraya", "orasi", "nasil giderim", "yol tarifi", "ucreti ne", "acik mi", "saat kac", "daha fazla", "anlat", "detay", "peki", "baska"];

  var CARDS = [
    { id: "mevlana", keys: ["mevlana", "rumi", "yesil kubbe", "sema", "mesnevi"], w: 12,
      a: function () { return "Mevlana Müzesi: genelde ücretsiz, kapanış ~17:00 (doğrula). Sabah git. Harita/Rotalar sayfalarına bak."; } },
    { id: "etli", keys: ["etli ekmek", "etliekmek", "etli pide"], w: 14,
      a: function () { return "Etli ekmek Konya imzası. Taş fırın, yanına ayran. Merkez öğle yoğun."; } },
    { id: "sille", keys: ["sille", "aya eleni"], w: 11,
      a: function () { return "Sille yarım gün ideal: taş evler, Aya Eleni. Mevlana sabah + Sille öğleden sonra iyi plan."; } },
    { id: "alaaddin", keys: ["alaaddin", "alaeddin", "ince minare", "karatay", "medrese"], w: 10,
      a: function () { return "Alaaddin Tepesi + İnce Minareli / Karatay medreseleri merkez kültür aksı."; } },
    { id: "catal", keys: ["catalhoyuk", "unesco"], w: 11,
      a: function () { return "Çatalhöyük UNESCO — araç/tur gerekir."; } },
    { id: "beysehir", keys: ["beysehir", "esrefoglu", "esrefogullari"], w: 11,
      a: function () { return "Beyşehir: göl + Eşrefoğlu Camii. Eşrefoğulları ~1280–1326. İlçeler sayfası."; } },
    { id: "seydi", keys: ["seydisehir", "seyit harun", "kugulu", "tinaztepe"], w: 11,
      a: function () { return "Seydişehir: Seyyid Harun Veli, Tınaztepe, Kuğulu Park."; } },
    { id: "yemek", keys: ["firin kebabi", "tandir", "bamya", "arabasi", "tirit", "hosmerim", "cezerye", "yemek", "mutfak"], w: 9,
      a: function (t) {
        if (hasAny(t, ["bamya"])) return "Bamya çorbası Konya usulü ekşili.";
        if (hasAny(t, ["arabasi"])) return "Arabaşı: kış klasiği, unlu + et suyu.";
        if (hasAny(t, ["tirit"])) return "Tirit: ekmek + et suyu + kıyma.";
        return "Mutfak: etli ekmek, fırın kebabı, tirit, bamya, arabaşı, hoşmerim, cezerye.";
      } },
    { id: "ulasim", keys: ["ulasim", "atus", "konyakart", "otobus"], w: 10,
      a: function () { return "ATUS + Konyakart. atus.konya.bel.tr"; } },
    { id: "plan1", keys: ["1 gun", "bir gun", "tek gun"], w: 13,
      a: function () { return "1 gün: Mevlana → etli ekmek → Alaaddin/medrese → Meram/park."; } },
    { id: "plan2", keys: ["2 gun", "iki gun", "hafta sonu", "haftasonu"], w: 13,
      a: function () { return "2 gün: Cts merkez+Mevlana; Paz Sille veya Beyşehir."; } },
    { id: "self", keys: ["konyago", "sen kimsin", "ai misin"], w: 10,
      a: function () { return "KonyaGo AI — Yerel veya Gemini. Sadece Konya."; } }
  ];

  function isOffTopic(t) { return hasAny(t, OFF) && !hasAny(t, KONYA_SIGNALS); }
  function isKonyaRelated(t) {
    if (hasAny(t, KONYA_SIGNALS)) return true;
    if (hasAny(t, ["gez", "rota", "plan", "nerede", "ne yenir", "muze", "yemek", "ulasim", "merhaba", "selam", "tesekkur"])) return true;
    if (hasAny(t, FOLLOW) && lastTopics.length) return true;
    return false;
  }
  function scoreCard(card, t) {
    var score = 0;
    for (var i = 0; i < card.keys.length; i++) {
      if (t.indexOf(card.keys[i]) !== -1) score += (card.w || 8) + card.keys[i].length;
    }
    if (lastTopics.indexOf(card.id) !== -1 && hasAny(t, FOLLOW)) score += 15;
    return score;
  }
  function topCards(t, n) {
    var scored = [];
    for (var i = 0; i < CARDS.length; i++) {
      var s = scoreCard(CARDS[i], t);
      if (s > 0) scored.push({ card: CARDS[i], s: s });
    }
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, n || 2);
  }

  function answerLocal(q) {
    var t = norm(q);
    turn++;
    if (!t) return "Bir şey yaz — Konya hakkında sor.";
    if (hasAny(t, ["tesekkur", "sagol"])) return "Rica ederim.";
    if (hasAny(t, ["merhaba", "selam", "gunaydin"])) return "Merhaba! Yerel veya Gemini seç, Konya sor.";
    if (isOffTopic(t)) return "Sadece Konya (gezi, mutfak, tarih, ulaşım).";
    if (hasAny(t, FOLLOW) && lastTopics.length && !hasAny(t, KONYA_SIGNALS)) t = norm(t + " " + lastTopics.join(" "));
    if (!isKonyaRelated(t) && t.split(" ").length > 3) return "Sadece Konya. «Mevlana», «2 günlük plan» dene.";
    var tops = topCards(t, 2);
    if (!tops.length) return "Biraz netleştir: ilçe / gün / yemek mi tarih mi?";
    lastTopics = tops.map(function (x) { return x.card.id; });
    var parts = [];
    for (var i = 0; i < tops.length; i++) {
      if (i > 0 && tops[i].s < tops[0].s * 0.45) break;
      parts.push(typeof tops[i].card.a === "function" ? tops[i].card.a(t) : String(tops[i].card.a));
    }
    return parts.length > 1 ? parts[0] + "\n\n———\n\n" + parts[1] : parts[0];
  }

  /* ========== GEMINI ========== */
  var SYSTEM = "Sen KonyaGo AI’sın. Yalnızca Konya (Türkiye) ili ve ilçeleri hakkında yardımcı ol. Gezi, tarih, mutfak, ulaşım, konaklama, etkinlik. Konya dışı sorularda nazikçe reddet. Türkçe, samimi, kısa-orta cevap. Uydurma telefon/adres verme. Saat/ücret için resmî kaynak de. Tıbbi/hukuki/yatırım tavsiyesi verme. Mevlana Müzesi genelde ücretsiz, kapanış ~17:00 olabilir (değişebilir).";

  var GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ];

  function callGemini(userText) {
    var key = getKey();
    if (!key) return Promise.reject(new Error("no-key"));
    if (!looksLikeGeminiKey(key)) {
      return Promise.reject(new Error("bad-key-format"));
    }

    geminiHistory.push({ role: "user", parts: [{ text: userText }] });
    if (geminiHistory.length > 16) geminiHistory = geminiHistory.slice(-16);

    var body = {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: geminiHistory,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    };

    var errors = [];

    function tryModel(idx) {
      if (idx >= GEMINI_MODELS.length) {
        lastGeminiError = errors.slice(0, 3).join(" | ");
        return Promise.reject(new Error("all-models-failed: " + lastGeminiError));
      }
      var model = GEMINI_MODELS[idx];
      var url = "https://generativelanguage.googleapis.com/v1beta/models/" +
        model + ":generateContent?key=" + encodeURIComponent(key);

      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) {
            var msg = (j && j.error && j.error.message) || ("HTTP " + r.status);
            errors.push(model + ": " + String(msg).slice(0, 80));
            if (r.status === 400 || r.status === 403) {
              // key hatasi — diger model ayni key ile yine duser, yine de dene
              if (/API[_ ]?key|invalid|permission|expired/i.test(msg) && idx >= 1) {
                throw new Error(msg);
              }
            }
            return tryModel(idx + 1);
          }
          var text = "";
          try {
            var cands = j.candidates || [];
            if (cands[0] && cands[0].content && cands[0].content.parts) {
              text = cands[0].content.parts.map(function (p) { return p.text || ""; }).join("");
            }
          } catch (e) {}
          if (!text) {
            errors.push(model + ": empty");
            return tryModel(idx + 1);
          }
          geminiHistory.push({ role: "model", parts: [{ text: text }] });
          return text;
        });
      }).catch(function (err) {
        errors.push(model + ": " + String(err && err.message || err).slice(0, 60));
        if (idx + 1 < GEMINI_MODELS.length) return tryModel(idx + 1);
        lastGeminiError = errors.slice(0, 3).join(" | ");
        throw err;
      });
    }

    return tryModel(0);
  }

  /* ========== UI ========== */
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
    return div;
  }

  function typeOut(text, meta, cb) {
    var div = document.createElement("div");
    div.className = "ai-msg ai-bot";
    chat.appendChild(div);
    var i = 0;
    var step = Math.max(2, Math.floor(text.length / 50));
    function tick() {
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
    }
    tick();
  }

  function addTyping() {
    var tip = document.createElement("div");
    tip.className = "ai-msg ai-bot ai-typing";
    tip.textContent = mode === "gemini" ? "Gemini düşünüyor…" : "Düşünüyor…";
    chat.appendChild(tip);
    chat.scrollTop = chat.scrollHeight;
    return tip;
  }

  addMsg(
    "Merhaba! İki motor: Yerel (anahtarsız) · Gemini (AIzaSy… key).\n\nKey: aistudio.google.com/apikey → Create API key → buraya yapıştır → Kaydet → Gemini.",
    "bot"
  );

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = (input.value || "").trim();
    if (!q) return;
    addMsg(q, "user");
    history.push({ role: "user", text: q });
    input.value = "";
    if (sendBtn) sendBtn.disabled = true;

    var tip = addTyping();

    function done(text, meta) {
      tip.remove();
      history.push({ role: "bot", text: text });
      if (history.length > 30) history = history.slice(-30);
      typeOut(text, meta, function () {
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      });
    }

    function fail(err) {
      tip.remove();
      var raw = (err && err.message) || "";
      var msg = "Gemini yanıt veremedi.";
      if (/no-key/i.test(raw)) msg = "Anahtar yok. Yukarıdan AIzaSy… key kaydet.";
      else if (/bad-key-format/i.test(raw)) {
        msg = "Kayıtlı anahtar yanlış formatta.\n\nGemini key genelde AIzaSy ile başlar.\n1) Sil’e bas\n2) aistudio.google.com/apikey → Create API key\n3) Tamamını kopyala → Kaydet\n4) Gemini seç\n\nŞimdilik Yerel motora geçebilirsin.";
      } else if (/API[_ ]?key|invalid|403|permission|expired/i.test(raw)) {
        msg = "API anahtarı geçersiz veya yetkisiz.\nYeni key al (AIzaSy…), Sil → Kaydet.\n\nDetay: " + raw.slice(0, 120);
      } else if (/429|quota|RESOURCE/i.test(raw)) {
        msg = "Gemini kotası doldu. Biraz bekle veya Yerel kullan.";
      } else {
        msg = "Gemini hatası: " + String(raw).slice(0, 220) + "\n\nYerel moda geçebilirsin.";
      }
      done(msg, "hata");
    }

    if (mode === "gemini") {
      callGemini(q).then(function (text) {
        done(text, "Gemini · KonyaGo");
      }).catch(fail);
    } else {
      setTimeout(function () {
        done(answerLocal(q), "Yerel motor");
      }, 200 + Math.random() * 280);
    }
  });
})();
