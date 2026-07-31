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

  var KB = [
    {
      keys: ["mevlana", "mevlevi", "yesil kubbe", "sema", "mesnevi", "celaleddin", "ucretsiz", "kapanis", "saat kac"],
      a: "Mevlana Müzesi ücretsizdir. Genelde 17:00’de kapanır; sabah veya öğleden önce gitmek kalabalıktan kaçmak için iyi olur. Yeşil kubbe Konya’nın simgesi, sema ve Mevlevî kültürünün merkezidir. Kıyafet ve sessizlik kurallarına dikkat et. Yol tarifi: Gezilecek / Harita."
    },
    {
      keys: ["esrefoglu", "esref oglu", "esrefogullari", "esrefogullari", "suleyman bey", "mubarizuddin", "esrefoglu camii", "esrefoglu cami"],
      a: "Eşrefoğulları Beyliği (yaklaşık 1280–1326), Beyşehir–Seydişehir hattında kurulan Anadolu beyliğidir.\n• Kurucu: Eşrefoğlu Seyfeddin Süleyman Bey (başkent Beyşehir)\n• Sonra: Mübârizüddin Mehmed Bey; ardından II. Süleyman\n• 1326’da İlhanlı emiri Demirtaş müdahalesiyle fiilen biter; topraklar Hamîdoğulları vb. arasında paylaşılır\n• Mimari miras: Beyşehir Eşrefoğlu Camii (ahşap direkli, Anadolu’nun önemli örneklerinden)\n• Seydişehir / Seyyid Harun külliyesi ile aynı coğrafyada; Mehmed Bey döneminde destek/vakıf ilişkisi anlatılır\nDetaylı metin: Tarihçe sayfası → Eşrefoğulları bölümü."
    },
    {
      keys: ["seyit harun", "seyid harun", "harun veli", "seydisehir", "kugulu", "kugulu park", "tinaztepe", "tinaz tepe", "ferzene", "seydisehir kale", "halife sultan", "ilica seydisehir"],
      a: "Seydişehir tarihi özeti:\n• Seyyid Harun Veli Camii & Türbesi (~1310) — Halife Sultan, Rüstem Bey–Sultan Hatun türbeleri\n• Seydişehir Kalesi\n• Kuğulu Park\n• Tınaztepe Mağarası\n• Ferzene / Güvercinlik mağaraları\nBölge Eşrefoğulları toprakları içindeydi. Detay: Gezilecek + Tarihçe."
    },
    {
      keys: ["etli ekmek", "etliekmek", "pide konya"],
      a: "Etli ekmek Konya’nın imza lezzetidir: ince hamur, kıyma, soğan ve baharat; taş fırında pişer. Genelde dilim dilim, ayran ile yenir. Öğle 11–14 arası birçok fırında taze çıkar. Detay: Mutfak sayfası."
    },
    {
      keys: ["firin kebabi", "firin kebab", "tandir"],
      a: "Fırın kebabı kuşbaşı etin soğan ve domatesle uzun süre fırın/tencerede pişmesiyle yapılır; sosu ekmekle yenir. Tandır ve sac kavurma da Konya et kültüründe yaygındır."
    },
    {
      keys: ["bamya", "bamya corbasi"],
      a: "Bamya çorbası Konya usulüyle ekşili, etli veya sade yapılır. Özellikle kış ve ramazan sofralarında sevilir."
    },
    {
      keys: ["arabasi", "araba si"],
      a: "Arabaşı, İç Anadolu’nun kış yemeğidir; unlu/kıvamlı kısım ve et suyu veya etli harçla yenir."
    },
    {
      keys: ["tirit", "tirid"],
      a: "Tirit: ekmek dilimleri, et suyu ve kıyma/kuşbaşı; üzerine yoğurt ve tereyağı. Düğün ve özel gün sofralarının klasiğidir."
    },
    {
      keys: ["hosmerim", "cezerye", "tatli"],
      a: "Hoşmerim (peynir–irmik–şeker) sıcak servis edilen yöresel tatlıdır. Cezerye ise havuçlu, fıstıklı; hediyelik olarak da alınır."
    },
    {
      keys: ["sille"],
      a: "Sille, merkeze yakın tarihi bir yerleşimdir: taş evler, Aya Eleni Kilisesi, mağaralar. Yarım günlük gezi için idealdir."
    },
    {
      keys: ["catalhoyuk", "catal hoyuk", "unesco"],
      a: "Çatalhöyük, Neolitik dönem yerleşimi ve UNESCO dünya mirasıdır. Araç veya tur ile günübirlik planlanır."
    },
    {
      keys: ["alaaddin", "alaeddin", "tepe"],
      a: "Alaaddin Tepesi, Selçuklu döneminin simge noktalarındandır; cami, park ve şehir manzarası sunar."
    },
    {
      keys: ["ince minare", "karatay", "medrese", "cini"],
      a: "İnce Minareli Medrese taş işçiliğiyle; Karatay Medresesi çini eserleriyle bilinir. Merkez kültür aksındadır."
    },
    {
      keys: ["meram", "baglar"],
      a: "Meram Bağları yeşil vadi, mesire ve yürüyüş alanlarıyla bilinir. Yaz akşamları serinlemek için tercih edilir."
    },
    {
      keys: ["beysehir", "gol", "meke", "kilistra", "eflatun"],
      a: "Günübirlik: Beyşehir Gölü + Eşrefoğlu Camii, Meke, Kilistra, Eflatunpınar, Seydişehir (külliye, Tınaztepe). Araç planı gerekir."
    },
    {
      keys: ["ulasim", "otobus", "tramvay", "atus", "konyakart", "toplu tasima", "dolmus"],
      a: "Şehir içi ulaşımda ATUS ve Konyakart kullanılır. Güncel hat için belediye ATUS uygulaması/sitesi en doğru kaynaktır."
    },
    {
      keys: ["kac gun", "ne kadar kal", "1 gun", "2 gun", "rota", "plan"],
      a: "Merkez için 1 gün yetebilir (Mevlana ücretsiz, ~17:00). Sille, Seydişehir, Beyşehir (Eşrefoğlu Camii) veya Çatalhöyük için 2 gün daha rahat."
    },
    {
      keys: ["konaklama", "otel", "nerede kal", "pansiyon"],
      a: "Merkez/Mevlana yürüme mesafesi için pratik; Selçuklu daha yeni; Meram sakin. Yoğun dönemlerde erken rezervasyon."
    },
    {
      keys: ["seb i arus", "sebi arus", "aralik etkinlik", "etkinlik"],
      a: "Şeb-i Arus, Mevlana’nın vuslat yıldönümü etkinlikleridir (genelde aralık). Şehir yoğunlaşır; konaklamayı erken ayarla."
    },
    {
      keys: ["tarih", "selcuklu", "tarihce", "osmanli", "beylik"],
      a: "Konya: Çatalhöyük → İkonium → Selçuklu başkenti → Mevlana → Eşrefoğulları (Beyşehir–Seydişehir, 1280–1326) → Osmanlı–Cumhuriyet. Detay: Tarihçe sayfası."
    },
    {
      keys: ["hava", "mevsim", "ne zaman gel", "yaz", "kis"],
      a: "İlkbahar ve sonbahar gezi için daha ılımandır. Yaz öğlenleri sıcak olur. Kışın tirit, bamya, arabaşı ayrı güzeldir."
    },
    {
      keys: ["acil", "polis", "itfaiye", "112", "hastane"],
      a: "Acil Çağrı: 112. Polis 155, jandarma 156, itfaiye 110. Pratik sayfada linkler var."
    },
    {
      keys: ["hediye", "hediyelik", "ne al"],
      a: "Cezerye, çini/seramik, Mevlana temalı ürünler, el işi. Mevlana çevresi ve çarşılarda seçenek boldur."
    },
    {
      keys: ["harita", "yol tarifi", "nasil giderim", "konum"],
      a: "Harita sayfasında Mevlana, Sille, Seydişehir, Tınaztepe vb. işaretli; Gezilecek’te Google yol tarifi butonları var."
    },
    {
      keys: ["kelebek", "japon parki", "aile", "cocuk"],
      a: "Aile: Mevlana (ücretsiz, 17:00 öncesi), Kelebek Bahçesi, parklar; Seydişehir Kuğulu Park. Sonra etli ekmek."
    },
    {
      keys: ["konyago", "bu site", "sen kimsin", "yapay zeka", "ai"],
      a: "Ben KonyaGo AI — sadece Konya ile ilgili sorulara yardımcı olurum. Soru sınırın yok."
    },
    {
      keys: ["merhaba", "selam", "gunaydin", "iyi gunler", "hey"],
      a: "Merhaba! Ben KonyaGo AI. Konya hakkında ne sormak istersin? Limit yok."
    },
    {
      keys: ["tesekkur", "sagol", "eyvallah"],
      a: "Rica ederim. Başka Konya sorusun olursa yaz. İyi geziler!"
    }
  ];

  function isKonyaRelated(t) {
    if (hasAny(t, [
      "konya", "mevlana", "sille", "meram", "catal", "alaaddin", "selcuk",
      "etli", "bamya", "tirit", "arabasi", "atus", "konyakart", "sebi",
      "hosmerim", "cezerye", "karatay", "ince minare", "beysehir", "meke",
      "kilistra", "gez", "turist", "otel", "konak", "harita", "rota",
      "mutfak", "yemek", "lezzet", "muze", "sema", "seydisehir", "seyit",
      "harun", "kugulu", "ucretsiz", "tinaztepe", "ferzene", "esref",
      "beylik", "suleyman bey"
    ])) return true;
    if (hasAny(t, ["nerede", "ne yenir", "ne gezilir", "kac gun", "nasil gider", "ne yapilir", "tavsiye"])) return true;
    if (hasAny(t, ["merhaba", "selam", "tesekkur", "konyago", "sen kimsin"])) return true;
    return false;
  }

  function answer(q) {
    var t = norm(q);
    if (!t) return "Bir şey yaz, Konya hakkında yardımcı olayım.";

    if (hasAny(t, OFF) && !isKonyaRelated(t)) {
      return "Bu konuda yardımcı olamıyorum. Ben yalnızca Konya ile ilgili sorulara cevap veriyorum."
    }

    if (!isKonyaRelated(t) && t.split(" ").length > 2) {
      return "KonyaGo AI sadece Konya odaklıdır. Örneğin: «Eşrefoğulları nedir?», «Mevlana ücretsiz mi?», «Seydişehir’de ne gezilir?»"
    }

    var best = null;
    var bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var score = 0;
      var keys = KB[i].keys;
      for (var k = 0; k < keys.length; k++) {
        if (t.indexOf(keys[k]) !== -1) score += keys[k].length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = KB[i];
      }
    }

    if (best && bestScore > 0) return best.a;

    return "Konya ile ilgili anladım ama net eşleştiremedim. Deneyebilirsin:\n• Eşrefoğulları Beyliği\n• Mevlana / Seydişehir / Beyşehir\n• Etli ekmek, rota, ATUS\n\nSorunu biraz daha aç."
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
    setTimeout(function () {
      tip.remove();
      cb();
    }, 400 + Math.random() * 500);
  }

  addMsg("Merhaba! Ben KonyaGo AI. Sadece Konya — limit yok.\n\nÖrnek: «Eşrefoğulları nedir?» · «Mevlana ücretsiz mi?» · «Seydişehir tarihi»", "bot");

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
