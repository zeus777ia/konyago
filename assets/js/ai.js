/* KonyaGo AI — sadece Konya; sinirsiz; istemci tarafi bilgi bankasi */
(function () {
  "use strict";

  var chat = document.getElementById("aiChat");
  var form = document.getElementById("aiForm");
  var input = document.getElementById("aiInput");
  var sendBtn = document.getElementById("aiSend");
  if (!chat || !form || !input) return;

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
    "bitcoin", "kripto", "borsa", "yazilim ogren", "python", "javascript ders",
    "siyaset", "secim", "parti", "futbol skor", "mac sonucu", "netflix",
    "yemek tarifi evde", "diyet program", "doktor", "ilac", "hastalik teshis",
    "hack", "sifre kir", "silah", "uyusturucu"
  ];

  var WEEKEND =
    "Hafta sonu Konya planı (esnek):\n\n" +
    "CUMARTESİ\n" +
    "• Sabah: Mevlana Müzesi (ücretsiz; kapanış genelde 17:00 — sabah git)\n" +
    "• Öğle: merkezde etli ekmek + ayran\n" +
    "• Öğleden sonra: Alaaddin Tepesi + İnce Minare / Karatay\n" +
    "• Akşam: Meram veya park yürüyüşü\n\n" +
    "PAZAR (seç birini)\n" +
    "• Sille yarım gün (köy + kilise + fotoğraf)\n" +
    "• veya araç varsa Beyşehir Gölü + Eşrefoğlu Camii\n" +
    "• veya aile: Kelebek / park + hafif tempo\n\n" +
    "Yazın öğleni kapalı mekâna kaydır; kışın tirit–bamya–arabaşı dene. Yazdırılabilir rota: rota-yazdir.html";

  var KB = [
    {
      keys: ["hafta sonu", "haftasonu", "cumartesi", "pazar plan", "weekend"],
      a: WEEKEND
    },
    {
      keys: ["mevlana", "mevlevi", "yesil kubbe", "sema", "mesnevi", "celaleddin", "ucretsiz", "kapanis", "saat kac"],
      a: "Mevlana Müzesi ücretsizdir. Genelde 17:00’de kapanır; sabah veya öğleden önce gitmek kalabalıktan kaçmak için iyi olur. Yeşil kubbe Konya’nın simgesi, sema ve Mevlevî kültürünün merkezidir. Kıyafet ve sessizlik kurallarına dikkat et. Yol tarifi: Gezilecek / Harita."
    },
    {
      keys: ["esrefoglu", "esref oglu", "esrefogullari", "esrefogullari", "suleyman bey", "mubarizuddin", "esrefoglu camii", "esrefoglu cami"],
      a: "Eşrefoğulları Beyliği (yaklaşık 1280–1326), Beyşehir–Seydişehir hattında kurulan Anadolu beyliğidir.\n• Kurucu: Eşrefoğlu Seyfeddin Süleyman Bey (başkent Beyşehir)\n• 1326’da İlhanlı müdahalesiyle fiilen biter\n• Mimari miras: Beyşehir Eşrefoğlu Camii\nDetay: Tarihçe sayfası."
    },
    {
      keys: ["seyit harun", "seyid harun", "harun veli", "seydisehir", "kugulu", "tinaztepe"],
      a: "Seydişehir: Seyyid Harun Veli külliyesi, Kuğulu Park, Tınaztepe Mağarası. Araçlı günübirlik planlanır. İlçeler sayfasına bak."
    },
    {
      keys: ["aksehir", "nasreddin"],
      a: "Akşehir: Nasreddin Hoca türbesi, Gülmece Parkı, müze ve göl efsaneleri. İlçeler sayfasında özet var."
    },
    {
      keys: ["etli ekmek", "etliekmek", "pide konya"],
      a: "Etli ekmek Konya’nın imza lezzetidir: ince hamur, kıyma, soğan ve baharat; taş fırında pişer. Genelde dilim dilim, ayran ile yenir. Lezzet haritası: lezzet-haritasi.html"
    },
    {
      keys: ["firin kebabi", "firin kebab", "tandir"],
      a: "Fırın kebabı kuşbaşı etin soğan ve domatesle uzun süre pişmesiyle yapılır; sosu ekmekle yenir."
    },
    {
      keys: ["bamya", "arabasi", "tirit", "hosmerim", "cezerye"],
      a: "Bamya çorbası, arabaşı (kış), tirit, hoşmerim ve cezerye Konya sofrasının parçasıdır. Mutfak sayfasında detay var."
    },
    {
      keys: ["sille"],
      a: "Sille, merkeze yakın tarihi yerleşim: taş evler, Aya Eleni, mağaralar. Yarım gün ideal."
    },
    {
      keys: ["catalhoyuk", "unesco"],
      a: "Çatalhöyük Neolitik yerleşim ve UNESCO mirasıdır. Araç veya tur ile planlanır."
    },
    {
      keys: ["alaaddin", "alaeddin", "ince minare", "karatay"],
      a: "Alaaddin Tepesi + İnce Minare + Karatay, merkez kültür aksıdır."
    },
    {
      keys: ["ulasim", "atus", "konyakart", "otobus"],
      a: "ATUS ve Konyakart şehir içi ulaşımın omurgasıdır. Güncel hat: atus.konya.bel.tr"
    },
    {
      keys: ["kac gun", "1 gun", "2 gun", "rota", "plan"],
      a: "Merkez 1 gün yetebilir. Sille / ilçe / Çatalhöyük için 2 gün daha rahat. Hafta sonu planı için «hafta sonu planı» yaz."
    },
    {
      keys: ["konaklama", "otel"],
      a: "Merkez/Mevlana yakını pratik; Selçuklu daha yeni stok; Meram sakin. Yoğun dönemde erken rezervasyon."
    },
    {
      keys: ["seb i arus", "sebi arus", "etkinlik"],
      a: "Şeb-i Arus genelde aralıkta yoğunlaşır. Etkinlikler sayfasına ve resmî duyurulara bak."
    },
    {
      keys: ["tarih", "selcuklu", "tarihce"],
      a: "Konya: Çatalhöyük → Selçuklu başkenti → Mevlana → Eşrefoğulları → Osmanlı–Cumhuriyet. Tarihçe sayfası derinlemesine anlatır."
    },
    {
      keys: ["hava", "mevsim"],
      a: "İlkbahar–sonbahar gezi için ılımandır. Ana sayfada Konya hava durumu kutusu var (Open-Meteo)."
    },
    {
      keys: ["acil", "112"],
      a: "Acil: 112. Pratik sayfada tüm numaralar."
    },
    {
      keys: ["hediye", "hediyelik"],
      a: "Cezerye, çini, Mevlana temalı ürünler. Hediyelik sayfasına bak."
    },
    {
      keys: ["harita", "yol tarifi"],
      a: "Harita sayfasında noktalar ve yol tarifi bağlantıları var."
    },
    {
      keys: ["aile", "cocuk", "kelebek"],
      a: "Aile: Mevlana (kısa), parklar, Kelebek; tempo düşük tut."
    },
    {
      keys: ["konyago", "sen kimsin", "ai"],
      a: "Ben KonyaGo AI — sadece Konya. Limit yok."
    },
    {
      keys: ["merhaba", "selam", "gunaydin"],
      a: "Merhaba! Konya hakkında ne sormak istersin? «Hafta sonu planı» yazabilirsin."
    },
    {
      keys: ["tesekkur", "sagol"],
      a: "Rica ederim. İyi geziler!"
    }
  ];

  function isKonyaRelated(t) {
    if (hasAny(t, [
      "konya", "mevlana", "sille", "meram", "catal", "alaaddin", "selcuk",
      "etli", "bamya", "tirit", "arabasi", "atus", "konyakart", "sebi",
      "hosmerim", "cezerye", "karatay", "ince minare", "beysehir", "meke",
      "kilistra", "gez", "turist", "otel", "konak", "harita", "rota",
      "mutfak", "yemek", "lezzet", "muze", "sema", "seydisehir", "seyit",
      "harun", "kugulu", "ucretsiz", "tinaztepe", "esref", "beylik",
      "hafta sonu", "haftasonu", "cumartesi", "pazar", "aksehir", "nasreddin"
    ])) return true;
    if (hasAny(t, ["nerede", "ne yenir", "ne gezilir", "kac gun", "nasil gider", "tavsiye", "plan"])) return true;
    if (hasAny(t, ["merhaba", "selam", "tesekkur", "konyago", "sen kimsin"])) return true;
    return false;
  }

  function answer(q) {
    var t = norm(q);
    if (!t) return "Bir şey yaz, Konya hakkında yardımcı olayım.";
    if (hasAny(t, OFF) && !isKonyaRelated(t)) {
      return "Bu konuda yardımcı olamıyorum. Ben yalnızca Konya ile ilgili sorulara cevap veriyorum.";
    }
    if (!isKonyaRelated(t) && t.split(" ").length > 2) {
      return "KonyaGo AI sadece Konya odaklıdır. Örnek: «Hafta sonu planı», «Mevlana ücretsiz mi?», «Akşehir’de ne gezilir?»";
    }
    var best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var score = 0, keys = KB[i].keys;
      for (var k = 0; k < keys.length; k++) {
        if (t.indexOf(keys[k]) !== -1) score += keys[k].length;
      }
      if (score > bestScore) { bestScore = score; best = KB[i]; }
    }
    if (best && bestScore > 0) return best.a;
    return "Konya ile ilgili anladım ama net eşleştiremedim. «Hafta sonu planı», Mevlana, etli ekmek, Sille, Beyşehir dene.";
  }

  function addMsg(text, who) {
    var div = document.createElement("div");
    div.className = "ai-msg ai-" + who;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function addTyping(cb) {
    var tip = document.createElement("div");
    tip.className = "ai-msg ai-bot ai-typing";
    tip.textContent = "Yazıyor…";
    chat.appendChild(tip);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(function () { tip.remove(); cb(); }, 400 + Math.random() * 500);
  }

  addMsg("Merhaba! Ben KonyaGo AI. Sadece Konya — limit yok.\n\nHızlı: «Hafta sonu planı» · «Mevlana» · «Etli ekmek»", "bot");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = (input.value || "").trim();
    if (!q) return;
    addMsg(q, "user");
    input.value = "";
    if (sendBtn) sendBtn.disabled = true;
    addTyping(function () {
      addMsg(answer(q), "bot");
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    });
  });
})();
