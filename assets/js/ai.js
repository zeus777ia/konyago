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
  var mode = "local"; // local | gemini
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
    } catch (e) {}
  }

  function updateStatus() {
    var k = getKey();
    if (!statusEl) return;
    if (k) {
      statusEl.className = "gemini-status ok";
      statusEl.textContent = "Anahtar kayıtlı (" + k.slice(0, 6) + "…" + k.slice(-4) + "). Gemini modunu seçebilirsin.";
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

  if (btnLocal) btnLocal.addEventListener("click", function () { setMode("local"); });
  if (btnGemini) btnGemini.addEventListener("click", function () {
    if (!getKey()) {
      addMsg("Gemini için önce yukarıya API anahtarını kaydet. Anahtar yokken Yerel motoru kullanabilirsin.", "bot");
      setMode("local");
      var box = document.getElementById("geminiSetup");
      if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setMode("gemini");
  });

  if (keySave) keySave.addEventListener("click", function () {
    var v = (keyInput && keyInput.value || "").trim();
    if (!v || v.length < 20) {
      if (statusEl) {
        statusEl.className = "gemini-status err";
        statusEl.textContent = "Geçerli bir API anahtarı yapıştır (aistudio.google.com/apikey).";
      }
      return;
    }
    setKey(v);
    if (keyInput) keyInput.value = "";
    updateStatus();
    addMsg("Gemini anahtarı kaydedildi. Üstten «Gemini» butonuna basarak gerçek modele geçebilirsin.", "bot");
  });

  if (keyClear) keyClear.addEventListener("click", function () {
    setKey("");
    updateStatus();
    setMode("local");
    addMsg("Gemini anahtarı silindi. Yerel motora döndün.", "bot");
  });

  updateStatus();
  setMode(mode === "gemini" && getKey() ? "gemini" : "local");

  /* ========== YEREL MOTOR (önceki v2) ========== */
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

  function hourTR() {
    try {
      return parseInt(new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Istanbul", hour: "numeric", hour12: false
      }).format(new Date()), 10);
    } catch (e) {
      return new Date().getHours();
    }
  }

  function monthTR() {
    try {
      return parseInt(new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Istanbul", month: "numeric"
      }).format(new Date()), 10);
    } catch (e) {
      return new Date().getMonth() + 1;
    }
  }

  var OFF = [
    "bitcoin", "kripto", "borsa", "python ders", "javascript ogren", "yazilim kurs",
    "siyaset", "secim", "parti propaganda", "futbol skor", "mac sonucu", "netflix dizi",
    "diyet listesi", "ilac dozu", "hastalik teshis", "hack", "sifre kir", "silah yap",
    "uyusturucu", "istanbulda ne gezilir", "ankara gezi", "izmir tatil"
  ];

  var KONYA_SIGNALS = [
    "konya", "mevlana", "rumi", "sille", "meram", "catalhoyuk", "alaaddin", "alaeddin",
    "selcuk", "etli", "bamya", "tirit", "arabasi", "atus", "konyakart", "sebi", "seb i",
    "hosmerim", "cezerye", "karatay", "ince minare", "beysehir", "meke", "kilistra",
    "eflatun", "muze", "sema", "seydisehir", "seyit", "harun", "kugulu", "tinaztepe",
    "esref", "beylik", "aksehir", "nasreddin", "japon parki", "kelebek", "firin kebabi",
    "tandir", "yesil kubbe", "mesnevi", "mevlevi", "iconium"
  ];

  var FOLLOW = [
    "oraya", "orasi", "nasil giderim", "yol tarifi", "ne kadar surer", "ucreti ne",
    "acik mi", "saat kac", "daha fazla", "anlat", "detay", "peki", "baska",
    "yaninda ne var", "ne yenir orada", "yakinda"
  ];

  var CARDS = [
    { id: "mevlana", keys: ["mevlana", "rumi", "yesil kubbe", "sema", "mesnevi", "celaleddin", "mevlevi"], w: 12,
      a: function () {
        return "Mevlana Celaleddin Rumi’nin makamı bugün Mevlana Müzesi olarak ziyaret edilir.\n\n• Giriş: ücretsiz (resmî uygulama değişebilir)\n• Kapanış: genelde 17:00 — sabah veya öğleden önce git\n• Yeşil kubbe, semahane, Mevlevî kültürü\n\nHarita ve Rotalar sayfalarına bakabilirsin.";
      }},
    { id: "etli", keys: ["etli ekmek", "etliekmek", "etli pide", "konya pide"], w: 14,
      a: function () {
        return "Etli ekmek Konya’nın imza lezzeti.\n\nİnce hamur, kıyma-soğan-baharat, taş fırın. Yanına ayran.\n• Merkez / Mevlana çevresi öğle 11:30–14:00 yoğun\n• Alternatif: fırın kebabı, tirit\n\nLezzet Haritası sayfasına bak.";
      }},
    { id: "sille", keys: ["sille", "aya eleni"], w: 11,
      a: function () {
        return "Sille, merkeze yakın tarihi yerleşim — yarım gün ideal.\n• Taş evler, Aya Eleni Kilisesi, fotoğraf noktaları\nSabah Mevlana + öğleden sonra Sille dengeli bir 1–1,5 günlük plandır.";
      }},
    { id: "alaaddin", keys: ["alaaddin", "alaeddin"], w: 10,
      a: function () {
        return "Alaaddin Tepesi Konya’nın tarihî çekirdeği. Yakınında İnce Minareli ve Karatay medreseleri var.";
      }},
    { id: "medrese", keys: ["ince minare", "karatay", "medrese"], w: 10,
      a: function () {
        return "İnce Minareli Medrese taş işçiliği, Karatay Medresesi çini koleksiyonu ile öne çıkar. Alaaddin çevresinde aynı öğleden sonraya sığar.";
      }},
    { id: "catal", keys: ["catalhoyuk", "unesco", "neolitik"], w: 11,
      a: function () {
        return "Çatalhöyük UNESCO Dünya Mirası — Neolitik. Merkeze göre araç/tur gerekir; sabah planı iyi olur.";
      }},
    { id: "beysehir", keys: ["beysehir", "esrefoglu camii"], w: 11,
      a: function () {
        return "Beyşehir: göl + Eşrefoğlu Camii. Günübirlik araç rotası. İlçeler sayfasına bak.";
      }},
    { id: "esref", keys: ["esrefoglu", "esrefogullari", "esref oglu"], w: 12,
      a: function () {
        return "Eşrefoğulları Beyliği (~1280–1326), Beyşehir–Seydişehir hattında. Kurucu Eşrefoğlu Seyfeddin Süleyman Bey. Miras: Eşrefoğlu Camii. Detay Tarihçe sayfasında.";
      }},
    { id: "seydi", keys: ["seydisehir", "seyit harun", "seyid harun", "kugulu", "tinaztepe"], w: 11,
      a: function () {
        return "Seydişehir: Seyyid Harun Veli Külliyesi, Tınaztepe Mağarası, Kuğulu Park. Araçla günübirlik.";
      }},
    { id: "aksehir", keys: ["aksehir", "nasreddin"], w: 11,
      a: function () {
        return "Akşehir, Nasreddin Hoca’nın şehri — türbe, Gülmece Parkı, müze. İlçeler sayfasına bak.";
      }},
    { id: "meram", keys: ["meram", "meram baglari"], w: 9,
      a: function () {
        return "Meram Bağları yeşil vadi ve akşam yürüyüşü için tercih edilir.";
      }},
    { id: "yemek", keys: ["firin kebabi", "tandir", "bamya", "arabasi", "tirit", "hosmerim", "cezerye", "ne yenir", "yemek", "mutfak"], w: 9,
      a: function (t) {
        if (hasAny(t, ["bamya"])) return "Bamya çorbası Konya usulünde ekşili; kış ve ramazan sofralarında sevilir.";
        if (hasAny(t, ["arabasi"])) return "Arabaşı: unlu/kıvamlı kısım + et suyu — İç Anadolu kış klasiği.";
        if (hasAny(t, ["tirit"])) return "Tirit: ekmek, et suyu, kıyma/kuşbaşı; yoğurt-tereyağı ile.";
        if (hasAny(t, ["firin", "tandir"])) return "Fırın kebabı uzun pişen kuşbaşı et; tandır aynı aileden.";
        return "Konya mutfağı: etli ekmek, fırın kebabı/tandır, tirit, bamya, arabaşı, hoşmerim, cezerye. Mutfak sayfasına bak.";
      }},
    { id: "ulasim", keys: ["ulasim", "atus", "konyakart", "otobus", "tramvay", "dolmus"], w: 10,
      a: function () {
        return "ATUS + Konyakart şehir içi temel. Hat/saat: atus.konya.bel.tr. İlçeler için otogar veya araç.";
      }},
    { id: "plan1", keys: ["1 gun", "bir gun", "tek gun"], w: 13,
      a: function () {
        return "1 günlük merkez:\n1) Mevlana (ücretsiz, ~17:00 kapanış)\n2) Etli ekmek\n3) Alaaddin + medreseler\n4) Akşam Meram / park\n\nrota-yazdir.html";
      }},
    { id: "plan2", keys: ["2 gun", "iki gun", "hafta sonu", "haftasonu"], w: 13,
      a: function () {
        return "2 gün:\nCts: Mevlana → etli ekmek → Alaaddin → Meram\nPaz: Sille veya Beyşehir (araç) veya aile park rotası.";
      }},
    { id: "tarih", keys: ["tarih", "tarihce", "selcuklu", "osmanli"], w: 9,
      a: function () {
        return "Çatalhöyük → İkonion → Anadolu Selçuklu başkenti → Mevlana → Eşrefoğulları → Osmanlı → Cumhuriyet. Detay: Tarihçe sayfası.";
      }},
    { id: "self", keys: ["konyago", "sen kimsin", "yapay zeka", "ai misin"], w: 10,
      a: function () {
        return "Ben KonyaGo AI. Yerel Konya motoru veya (anahtarlı) Gemini ile çalışırım. Sadece Konya odaklıyım.";
      }}
  ];

  function isOffTopic(t) {
    return hasAny(t, OFF) && !hasAny(t, KONYA_SIGNALS);
  }

  function isKonyaRelated(t) {
    if (hasAny(t, KONYA_SIGNALS)) return true;
    if (hasAny(t, ["gez", "turist", "rota", "plan", "tavsiye", "nerede", "ne yenir", "muze", "yemek", "ulasim"])) return true;
    if (hasAny(t, ["merhaba", "selam", "gunaydin", "tesekkur", "sagol"])) return true;
    if (hasAny(t, FOLLOW) && lastTopics.length) return true;
    return false;
  }

  function scoreCard(card, t) {
    var score = 0;
    for (var i = 0; i < card.keys.length; i++) {
      var k = card.keys[i];
      if (t.indexOf(k) !== -1) score += (card.w || 8) + k.length;
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
    if (hasAny(t, ["tesekkur", "sagol"])) return "Rica ederim. Başka Konya sorun olursa buradayım.";
    if (hasAny(t, ["merhaba", "selam", "gunaydin"])) {
      return "Merhaba! Yerel KonyaGo AI veya Gemini seçebilirsin. Örnek: «1 günde ne gezilir?»";
    }
    if (isOffTopic(t)) {
      return "Bu konu alanım değil. Yalnızca Konya (gezi, mutfak, tarih, ulaşım).";
    }
    if (hasAny(t, FOLLOW) && lastTopics.length && !hasAny(t, KONYA_SIGNALS)) {
      t = norm(t + " " + lastTopics.join(" "));
    }
    if (!isKonyaRelated(t) && t.split(" ").length > 3) {
      return "Sadece Konya odaklıyım. «Mevlana», «2 günlük plan», «Arabaşı» dene.";
    }
    var tops = topCards(t, 2);
    if (!tops.length) {
      return "Konya ile ilgili görünüyor ama net bağlayamadım. İlçe / gün / yemek mi tarih mi netleştir.";
    }
    lastTopics = tops.map(function (x) { return x.card.id; });
    var parts = [];
    for (var i = 0; i < tops.length; i++) {
      if (i > 0 && tops[i].s < tops[0].s * 0.45) break;
      parts.push(typeof tops[i].card.a === "function" ? tops[i].card.a(t) : String(tops[i].card.a));
    }
    return parts.length > 1 ? parts[0] + "\n\n———\n\n" + parts[1] : parts[0];
  }

  /* ========== GEMINI ========== */
  var SYSTEM = [
    "Sen KonyaGo AI’sın. Yalnızca Konya (Türkiye) ili ve ilçeleri hakkında yardımcı olursun.",
    "Konular: gezi, tarih, mutfak, ulaşım, konaklama, etkinlik, ilçeler (Selçuklu, Meram, Karatay, Beyşehir, Seydişehir, Akşehir vb.).",
    "Konya dışı sorularda nazikçe reddet ve Konya’ya yönlendir.",
    "Türkçe, samimi, kısa-orta uzunlukta cevap ver. Madde işaretleri kullanabilirsin.",
    "Bilinmeyen saat/ücret için ‘resmî kaynaktan doğrula’ de. Uydurma telefon/adres verme.",
    "Mevlana Müzesi genelde ücretsiz ve kapanış ~17:00 olabilir; değişebilir diye belirt.",
    "Sen bir rehber asistanısın; tıbbi/hukuki/yatırım tavsiyesi verme."
  ].join(" ");

  var GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
  ];

  function callGemini(userText) {
    var key = getKey();
    if (!key) return Promise.reject(new Error("no-key"));

    geminiHistory.push({ role: "user", parts: [{ text: userText }] });
    if (geminiHistory.length > 16) geminiHistory = geminiHistory.slice(-16);

    var body = {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: geminiHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    };

    function tryModel(idx) {
      if (idx >= GEMINI_MODELS.length) {
        return Promise.reject(new Error("all-models-failed"));
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
            // kota / model yoksa sonraki modele
            if (r.status === 404 || r.status === 429 || /not found|quota|RESOURCE_EXHAUSTED/i.test(msg)) {
              return tryModel(idx + 1);
            }
            throw new Error(msg);
          }
          var text = "";
          try {
            var cands = j.candidates || [];
            if (cands[0] && cands[0].content && cands[0].content.parts) {
              text = cands[0].content.parts.map(function (p) { return p.text || ""; }).join("");
            }
          } catch (e) {}
          if (!text) throw new Error("Boş cevap");
          geminiHistory.push({ role: "model", parts: [{ text: text }] });
          return text;
        });
      }).catch(function (err) {
        if (idx + 1 < GEMINI_MODELS.length) return tryModel(idx + 1);
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
    "Merhaba! Aynı sohbette iki motor var:\n\n• Yerel — anahtarsız, anında Konya motoru\n• Gemini — Google AI (yukarıya ücretsiz API key)\n\nÜstten motor seç, sorunu yaz.",
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
      var msg = "Gemini yanıt veremedi.";
      if (err && err.message) {
        if (/no-key/i.test(err.message)) msg = "Gemini anahtarı yok. Yukarıdan kaydet veya Yerel moda geç.";
        else if (/API_KEY|invalid|403/i.test(err.message)) msg = "API anahtarı geçersiz veya kısıtlı. AI Studio’dan yeni key dene.";
        else if (/429|quota|RESOURCE/i.test(err.message)) msg = "Gemini kotası doldu. Biraz bekle veya Yerel moda geç — Yerel her zaman çalışır.";
        else msg = "Gemini hatası: " + String(err.message).slice(0, 180) + "\n\nYerel moda geçip soruyu tekrarlayabilirsin.";
      }
      done(msg, "hata · yerel motora geçebilirsin");
    }

    if (mode === "gemini") {
      callGemini(q).then(function (text) {
        done(text, "Gemini · KonyaGo");
      }).catch(fail);
    } else {
      setTimeout(function () {
        done(answerLocal(q), "Yerel motor");
      }, 200 + Math.random() * 300);
    }
  });
})();
