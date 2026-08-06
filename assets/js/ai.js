/* KonyaGo AI — Yerel Konya motoru (API key yok) */
(function () {
  "use strict";

  var chat = document.getElementById("aiChat");
  var form = document.getElementById("aiForm");
  var input = document.getElementById("aiInput");
  var sendBtn = document.getElementById("aiSend");
  if (!chat || !form || !input) return;

  var history = [];
  var lastTopics = [];
  var turn = 0;

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
  var CARDS = [
    { id: "mevlana", keys: ["mevlana", "rumi", "sema"], w: 12, a: function () { return "Mevlana Müzesi genelde ücretsiz; kapanış çoğu gün ~17:00 civarı (resmî kaynaktan doğrula). Sabah veya öğleden önce gitmek kalabalıktan kaçınmak için iyi olur."; } },
    { id: "etli", keys: ["etli ekmek", "etliekmek"], w: 14, a: function () { return "Etli ekmek Konya’nın imza lezzeti. İnce hamur, kıymalı harç, taş fırın — yanına ayran yakışır. Merkez ve Mevlana çevresinde öğle saatleri yoğun olur."; } },
    { id: "sille", keys: ["sille"], w: 11, a: function () { return "Sille, merkeze yakın tarihi bir durak. Taş evler ve Aya Eleni ile yarım günlük gezi için ideal. Sabah Mevlana, öğleden sonra Sille dengeli bir plan."; } },
    { id: "plan2", keys: ["hafta sonu", "2 gun", "iki gun", "1 gun", "bir gun"], w: 13, a: function () { return "Kısa plan önerisi:\n• 1 gün: Mevlana → etli ekmek → Alaaddin / medreseler → akşam Meram\n• 2 gün: ilk gün merkez, ikinci gün Sille veya Beyşehir (araçla)"; } },
    { id: "yemek", keys: ["bamya", "arabasi", "tirit", "yemek", "mutfak", "lezzet"], w: 9, a: function (t) {
      if (hasAny(t, ["bamya"])) return "Bamya çorbası Konya usulünde ekşili ve doyurucu; özellikle kış sofralarında sevilir.";
      if (hasAny(t, ["arabasi"])) return "Arabaşı İç Anadolu’nun kış klasiği: unlu kısım ve et suyu bir arada.";
      if (hasAny(t, ["tirit"])) return "Tirit; ekmek, et suyu ve kıyma/kuşbaşı ile yapılır — doyurucu bir Konya tabağı.";
      return "Konya mutfağında öne çıkanlar: etli ekmek, fırın kebabı, tirit, bamya, arabaşı, hoşmerim ve cezerye.";
    } },
    { id: "self", keys: ["sen kimsin", "konyago"], w: 10, a: function () { return "Ben KonyaGo asistanıyım. Gezi, lezzet, tarih ve ulaşımda Konya için yardımcı olurum."; } }
  ];
  function answerLocal(q) {
    var t = norm(q);
    if (!t) return "Ne merak ediyorsun? Gezi, yemek veya tarih yazman yeterli.";
    if (hasAny(t, ["merhaba", "selam", "gunaydin", "iyi gunler"])) {
      return "Merhaba! Konya için buradayım. Mevlana, etli ekmek, hafta sonu planı veya bir ilçe sorabilirsin.";
    }
    if (hasAny(t, ["tesekkur", "sagol"])) return "Rica ederim. İyi geziler!";
    if (hasAny(t, OFF) && !hasAny(t, KONYA_SIGNALS)) {
      return "Ben Konya odaklıyım. Gezi rotası, lezzet veya tarih sorarsan hemen yardımcı olurum.";
    }
    var scored = [];
    for (var i = 0; i < CARDS.length; i++) {
      var s = 0, keys = CARDS[i].keys;
      for (var j = 0; j < keys.length; j++) if (t.indexOf(keys[j]) !== -1) s += CARDS[i].w + keys[j].length;
      if (s > 0) scored.push({ c: CARDS[i], s: s });
    }
    scored.sort(function (a, b) { return b.s - a.s; });
    if (!scored.length) {
      return "Konya ile ilgili daha net sorabilirsin. Örneğin: «1 günde ne gezilir?», «Etli ekmek», «Sille».";
    }
    lastTopics = [scored[0].c.id];
    return typeof scored[0].c.a === "function" ? scored[0].c.a(t) : String(scored[0].c.a);
  }

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
    tip.textContent = "Düşünüyor…";
    chat.appendChild(tip);
    chat.scrollTop = chat.scrollHeight;
    return tip;
  }

  addMsg(
    "Merhaba! Ben KonyaGo asistanıyım.\n\n" +
    "Konya’da ne gezilir, nerede ne yenir, nasıl bir rota çıkarılır — sor, birlikte planlayalım.\n\n" +
    "Hızlı başlamak için alttaki önerilere de dokunabilirsin.",
    "bot"
  );

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = (input.value || "").trim();
    if (!q) return;
    addMsg(q, "user");
    input.value = "";
    if (sendBtn) sendBtn.disabled = true;
    var tip = addTyping();

    setTimeout(function () {
      tip.remove();
      typeOut(answerLocal(q), null, function () {
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      });
    }, 220);
  });
})();
