/* KonyaGo AI v2 — baglamli, cok niyetli, Konya-only akilli asistan */
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

  function tokens(t) {
    return t.split(" ").filter(function (w) { return w.length > 1; });
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
    "tandir", "yesil kubbe", "mesnevi", "mevlevi", "iconium", "konyakart"
  ];

  var FOLLOW = [
    "oraya", "orasi", "nasil giderim", "yol tarifi", "ne kadar surer", "ucreti ne",
    "acik mi", "saat kac", "daha fazla", "anlat", "detay", "peki", "ya", "baska",
    "yaninda ne var", "ne yenir orada", "yakinda"
  ];

  /* Bilgi kartlari: id, keys, weight, answer builder */
  var CARDS = [
    {
      id: "mevlana",
      keys: ["mevlana", "rumi", "yesil kubbe", "sema", "mesnevi", "celaleddin", "mevlevi", "turbe mevlana"],
      w: 12,
      a: function () {
        return "Mevlana Celaleddin Rumi’nin makamı bugün Mevlana Müzesi olarak ziyaret edilir; Konya’nın en bilinen duraklarından.\n\n" +
          "• Giriş: ücretsiz (resmî uygulama değişebilir)\n" +
          "• Kapanış: genelde 17:00 — sabah veya öğleden önce git, kalabalıktan kaç\n" +
          "• Ne beklemeli: Yeşil kubbe, semahane atmosferi, Mevlevî kültürü\n" +
          "• İpucu: kıyafet ve sessizlik kurallarına uy; fotoğraf kısıtları olabilir\n\n" +
          "Yol tarifi için Harita sayfasına, çevre planı için Rotalar’a bakabilirsin.";
      }
    },
    {
      id: "etli",
      keys: ["etli ekmek", "etliekmek", "etli pide", "konya pide"],
      w: 14,
      a: function () {
        return "Etli ekmek Konya’nın imza lezzeti.\n\n" +
          "İnce açılmış hamur üzerine kıyma, soğan ve baharat; taş fırında kısa sürede pişer. Genelde dilim dilim kesilir, yanına ayran yakışır.\n\n" +
          "• En pratik: Mevlana / merkez çevresi (öğle 11:30–14:00 yoğun)\n" +
          "• Porsiyon: tek kişi için yarım veya dilim dilim paylaşmak yaygın\n" +
          "• Alternatif: fırın kebabı, tirit\n\n" +
          "Semt önerileri için Lezzet Haritası sayfasına bak.";
      }
    },
    {
      id: "sille",
      keys: ["sille", "aya eleni", "sille koy"],
      w: 11,
      a: function () {
        return "Sille, merkeze yakın tarihi bir yerleşim — yarım günlük gezi için ideal.\n\n" +
          "• Taş evler ve sokak dokusu\n" +
          "• Aya Eleni Kilisesi\n" +
          "• Mağara / fotoğraf noktaları\n\n" +
          "Sabah Mevlana + öğleden sonra Sille, 1–1,5 günlük planın en dengeli hali. Ulaşım için toplu taşıma veya kısa taksi/araç pratik olur; güncel hat için ATUS’a bak.";
      }
    },
    {
      id: "alaaddin",
      keys: ["alaaddin", "alaeddin", "alaaddin tepesi"],
      w: 10,
      a: function () {
        return "Alaaddin Tepesi, Konya’nın tarihî çekirdeği. Selçuklu izleri, cami ve şehir manzarası bir arada.\n\n" +
          "Yakınında İnce Minareli Medrese ve Karatay Medresesi ile merkez kültür aksını tamamlar. Öğleden sonra için ideal; yazın gölge ve su molası planla.";
      }
    },
    {
      id: "medrese",
      keys: ["ince minare", "karatay", "medrese", "cini"],
      w: 10,
      a: function () {
        return "İnce Minareli Medrese taş işçiliğiyle, Karatay Medresesi çini koleksiyonuyla öne çıkar. İkisi de Alaaddin çevresinde; aynı öğleden sonraya sığdırılabilir.\n\nMüze saatleri dönemsel değişir — kapıda veya resmî kanaldan doğrula.";
      }
    },
    {
      id: "catal",
      keys: ["catalhoyuk", "catal hoyuk", "unesco", "neolitik"],
      w: 11,
      a: function () {
        return "Çatalhöyük, Neolitik dönemin en önemli yerleşimlerinden ve UNESCO Dünya Mirası Listesi’nde.\n\n" +
          "Merkeze göre araç veya tur gerekir; sabah çıkıp öğleden önce bitirmek iyi plan. Sadece müze vitrini değil, höyük alanı da hikâyenin parçası — rahat ayakkabı al.";
      }
    },
    {
      id: "beysehir",
      keys: ["beysehir", "beysehir gol", "esrefoglu camii"],
      w: 11,
      a: function () {
        return "Beyşehir: göl + Eşrefoğlu Camii kombinasyonu.\n\n" +
          "Türkiye’nin büyük tatlı su göllerinden; kıyı yürüyüşü ve kuş gözlemi mümkün. Eşrefoğlu Camii ahşap direkli mimarisiyle Anadolu’nun önemli örneklerinden.\n\n" +
          "Günübirlik araç rotası. Detay: İlçeler sayfası.";
      }
    },
    {
      id: "esref",
      keys: ["esrefoglu", "esref oglu", "esrefogullari", "esrefogullari", "suleyman bey"],
      w: 12,
      a: function () {
        return "Eşrefoğulları Beyliği (yaklaşık 1280–1326), Beyşehir–Seydişehir hattında kurulmuş bir Anadolu beyliğidir.\n\n" +
          "• Kurucu: Eşrefoğlu Seyfeddin Süleyman Bey (başkent Beyşehir)\n" +
          "• 1326 civarı İlhanlı müdahalesiyle fiilen sona erer\n" +
          "• Mimari miras: Beyşehir Eşrefoğlu Camii\n\n" +
          "Daha derin metin Tarihçe sayfasında.";
      }
    },
    {
      id: "seydi",
      keys: ["seydisehir", "seyit harun", "seyid harun", "harun veli", "kugulu", "tinaztepe", "tinaz tepe"],
      w: 11,
      a: function () {
        return "Seydişehir günübirlik doğa + inanç rotası:\n\n" +
          "• Seyyid Harun Veli Külliyesi\n" +
          "• Tınaztepe Mağarası (saatleri kontrol et)\n" +
          "• Kuğulu Park — aile / dinlenme\n\n" +
          "Araçla planlamak en rahatı. İlçeler sayfasında özet var.";
      }
    },
    {
      id: "aksehir",
      keys: ["aksehir", "nasreddin", "nasreddin hoca", "gulmece"],
      w: 11,
      a: function () {
        return "Akşehir, Nasreddin Hoca’nın şehri.\n\n" +
          "Türbe, Gülmece Parkı, müze ve göl efsaneleriyle kültür ağırlıklı bir ilçe günü çıkar. Mizah + tarih arayanlara birebir.\n\nİlçeler sayfasına bak.";
      }
    },
    {
      id: "meram",
      keys: ["meram", "meram baglari", "baglar"],
      w: 9,
      a: function () {
        return "Meram Bağları yeşil vadi, mesire ve akşam yürüyüşü için tercih edilir. Yaz sıcağında öğleni merkeze, akşamı Meram’a kaydırmak klasik Konya planıdır.";
      }
    },
    {
      id: "yemek",
      keys: ["firin kebabi", "tandir", "bamya", "arabasi", "tirit", "hosmerim", "cezerye", "ne yenir", "yemek", "lezzet", "mutfak"],
      w: 9,
      a: function (t) {
        if (hasAny(t, ["bamya"])) return "Bamya çorbası Konya usulünde ekşili, etli veya sade yapılır; özellikle kış ve ramazan sofralarında sevilir.";
        if (hasAny(t, ["arabasi"])) return "Arabaşı İç Anadolu’nun kış yemeğidir: unlu/kıvamlı kısım + et suyu veya etli harç. Soğuk akşamlara yakışır.";
        if (hasAny(t, ["tirit"])) return "Tirit: ekmek, et suyu ve kıyma/kuşbaşı; üzerine yoğurt-tereyağı. Düğün ve özel gün klasiği.";
        if (hasAny(t, ["firin", "tandir"])) return "Fırın kebabı kuşbaşı etin soğan-domatesle uzun pişmesiyle yapılır; sosu ekmekle yenir. Tandır da aynı aileden.";
        if (hasAny(t, ["hosmerim", "cezerye", "tatli"])) return "Tatlıda hoşmerim (peynir–irmik–şeker, sıcak) ve cezerye (havuçlu, hediyelik) öne çıkar.";
        return "Konya mutfağı özeti:\n• Etli ekmek (imza)\n• Fırın kebabı / tandır\n• Tirit, bamya, arabaşı (mevsim)\n• Hoşmerim, cezerye\n\nDetay: Mutfak + Lezzet Haritası sayfaları.";
      }
    },
    {
      id: "ulasim",
      keys: ["ulasim", "atus", "konyakart", "otobus", "tramvay", "toplu tasima", "dolmus", "nasil gider"],
      w: 10,
      a: function () {
        return "Şehir içi ulaşımda ATUS ve Konyakart temel araçtır.\n\n" +
          "• Hat / saat: atus.konya.bel.tr veya ATUS uygulaması\n" +
          "• İlçe (Beyşehir, Seydişehir, Akşehir) için genelde otogar + otobüs veya özel araç\n" +
          "• Merkez müzeleri yürüme / kısa toplu taşıma ile bağlanır\n\nUlaşım sayfasında da özet var.";
      }
    },
    {
      id: "konak",
      keys: ["konaklama", "otel", "nerede kal", "pansiyon", "hotel"],
      w: 9,
      a: function () {
        return "Konaklama ipucu:\n\n" +
          "• Merkez / Mevlana yakını → yürüme mesafesi, pratik\n" +
          "• Selçuklu tarafı → daha yeni stok, araçlı geziler için uygun\n" +
          "• Meram → sakin, akşam yürüyüşü sevenlere\n\n" +
          "Şeb-i Arus (aralık) ve bayramlarda erken rezervasyon şart.";
      }
    },
    {
      id: "plan1",
      keys: ["1 gun", "bir gun", "tek gun", "gunubirlik merkez"],
      w: 13,
      a: function () {
        var h = hourTR();
        var tip = h < 11
          ? "Şu an sabah — Mevlana ile başla."
          : (h < 16 ? "Öğleden sonra için Alaaddin + medrese aksına kayabilirsin." : "Akşam için Meram veya park yürüyüşü mantıklı.");
        return "1 günlük merkez planı:\n\n" +
          "1) Mevlana Müzesi (ücretsiz, genelde 17:00 kapanış — erken git)\n" +
          "2) Öğle: etli ekmek + ayran\n" +
          "3) Alaaddin Tepesi + İnce Minare / Karatay\n" +
          "4) Akşam: Meram veya Japon Parkı\n\n" +
          tip + "\nYazdırılabilir sürüm: rota-yazdir.html";
      }
    },
    {
      id: "plan2",
      keys: ["2 gun", "iki gun", "hafta sonu", "haftasonu", "cumartesi", "pazar plan", "weekend"],
      w: 13,
      a: function () {
        return "2 gün / hafta sonu planı:\n\n" +
          "CUMARTESİ\n• Sabah Mevlana → öğle etli ekmek → Alaaddin + medreseler → akşam Meram\n\n" +
          "PAZAR (birini seç)\n• Sille yarım gün\n• Araç varsa Beyşehir Gölü + Eşrefoğlu\n• Aile: park / Kelebek + hafif tempo\n\n" +
          "Yazın öğleni kapalı mekâna al; kışın tirit–bamya–arabaşı dene.";
      }
    },
    {
      id: "aile",
      keys: ["aile", "cocuk", "kelebek", "japon parki", "cocuklu"],
      w: 10,
      a: function () {
        return "Aile / çocuklu plan:\n\n" +
          "• Mevlana’yı kısa tut\n" +
          "• Kelebek Bahçesi veya park molası\n" +
          "• Öğle yemeğinde sade porsiyon\n" +
          "• Müze yığınından kaçın; dinlenme aralığı bırak\n\nSeydişehir Kuğulu Park da iyi bir günübirlik seçenek.";
      }
    },
    {
      id: "tarih",
      keys: ["tarih", "tarihce", "selcuklu", "osmanli", "beylik", "iconium"],
      w: 9,
      a: function () {
        return "Konya tarih çizgisi (özet):\n\n" +
          "Çatalhöyük (Neolitik) → antik İkonion → Anadolu Selçuklu başkenti → Mevlana ve Mevlevîlik → Eşrefoğulları (Beyşehir–Seydişehir) → Osmanlı → Cumhuriyet.\n\n" +
          "Derin anlatım Tarihçe sayfasında; Selçuklu mimarisi için Alaaddin, İnce Minare, Karatay.";
      }
    },
    {
      id: "sebi",
      keys: ["seb i arus", "sebi arus", "aralik etkinlik", "vuslat"],
      w: 11,
      a: function () {
        return "Şeb-i Arus, Mevlana’nın vuslat yıldönümü etkinlikleridir; genelde aralık ayında yoğunlaşır.\n\n" +
          "Sema, konser ve kültür programları artar; konaklama ve merkez doluluğu yükselir. Biletli etkinlikleri yalnızca resmî kanallardan takip et. Etkinlikler sayfasında dönem notları var.";
      }
    },
    {
      id: "hava",
      keys: ["hava", "mevsim", "ne zaman gel", "sicak", "soguk", "yagmur"],
      w: 8,
      a: function () {
        var m = monthTR();
        var s = (m >= 6 && m <= 8) ? "Yaz: öğlen dış mekânı kısalt, su ve şapka şart."
          : (m === 12 || m <= 2) ? "Kış: katmanlı giyin; arabaşı–tirit–bamya zamanı."
          : "İlkbahar/sonbahar gezi için genelde en rahat dönemler.";
        return s + "\n\nAna sayfada Konya anlık hava kutusu var (Open-Meteo). Resmî tahmin: mgm.gov.tr";
      }
    },
    {
      id: "acil",
      keys: ["acil", "112", "polis", "itfaiye", "hastane", "afad"],
      w: 12,
      a: function () {
        return "Acil durum:\n\n• Tek numara: 112\n• Polis 155 · Jandarma 156 · İtfaiye 110 · AFAD 122\n\nPratik sayfada tel: linkleri var. KonyaGo acil çağrı merkezi değildir.";
      }
    },
    {
      id: "hediye",
      keys: ["hediye", "hediyelik", "ne al", "cezerye al"],
      w: 8,
      a: function () {
        return "Hediyelik: cezerye, çini/seramik, Mevlana temalı ürünler, el işi. Mevlana çevresi ve çarşılarda seçenek fazla. Hediyelik sayfasına bak.";
      }
    },
    {
      id: "harita",
      keys: ["harita", "konum", "haritada", "google maps"],
      w: 8,
      a: function () {
        return "Harita sayfasında Mevlana, Sille, ilçe noktaları ve yol tarifi bağlantıları var. Gezilecek kartlarında da Google/Yandex yönlendirmesi bulunur.";
      }
    },
    {
      id: "self",
      keys: ["konyago", "sen kimsin", "yapay zeka", "ai misin", "ne is yaparsin"],
      w: 10,
      a: function () {
        return "Ben KonyaGo AI — yalnızca Konya odaklı gezi asistanıyım.\n\n" +
          "Soru limiti yok, üyelik yok. Gezi, mutfak, tarih, ulaşım, rota ve ilçeler hakkında yardımcı olurum. Konya dışı konularda yönlendirmem.\n\n" +
          "Resmî belediye/müze sitesi değilim; saat ve ücret için güncel resmî kaynakları kontrol et.";
      }
    }
  ];

  function isOffTopic(t) {
    if (hasAny(t, OFF) && !hasAny(t, KONYA_SIGNALS)) return true;
    return false;
  }

  function isKonyaRelated(t) {
    if (hasAny(t, KONYA_SIGNALS)) return true;
    if (hasAny(t, ["gez", "turist", "rota", "plan", "tavsiye", "nerede", "ne yenir", "ne gezilir", "kac gun", "nasil", "otel", "konak", "muze", "yemek", "lezzet", "mutfak", "ulasim", "harita"])) return true;
    if (hasAny(t, ["merhaba", "selam", "gunaydin", "iyi gunler", "tesekkur", "sagol", "eyvallah", "nasilsin"])) return true;
    if (hasAny(t, FOLLOW) && lastTopics.length) return true;
    return false;
  }

  function scoreCard(card, t) {
    var score = 0;
    var keys = card.keys;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (t.indexOf(k) !== -1) {
        score += (card.w || 8) + k.length;
        if (t === k || t.indexOf(k) === 0) score += 4;
      }
    }
    // baglam: onceki konuyla ayni kart
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

  function greet(t) {
    if (hasAny(t, ["tesekkur", "sagol", "eyvallah"])) {
      return "Rica ederim. Başka bir Konya sorusun olursa buradayım — iyi geziler!";
    }
    if (hasAny(t, ["nasilsin", "naber"])) {
      return "İyiyim, teşekkürler! Konya planın için hazırım. Mevlana, etli ekmek, rota veya ilçe sorabilirsin.";
    }
    if (hasAny(t, ["merhaba", "selam", "gunaydin", "iyi gunler", "hey"])) {
      var h = hourTR();
      var part = h < 12 ? "Günaydın" : (h < 18 ? "Merhaba" : "İyi akşamlar");
      return part + "! Ben KonyaGo AI. Konya gezi, yemek, tarih ve ulaşımda yardımcı olurum — limit yok.\n\nÖrnek: «1 günde ne gezilir?», «Etli ekmek», «Hafta sonu planı»";
    }
    return null;
  }

  function answer(q) {
    var t = norm(q);
    turn++;

    if (!t) return "Bir şey yazman yeterli — Konya hakkında ne merak ediyorsan sor.";

    var g = greet(t);
    if (g) return g;

    if (isOffTopic(t)) {
      return "Bu konu benim alanım değil. Ben yalnızca Konya ile ilgili sorulara cevap veriyorum.\n\nGezi, mutfak, rota, Mevlana, Sille, Beyşehir… bunlardan sorabilirsin.";
    }

    // takip sorusu: net anahtar yoksa son konulara bagla
    if (hasAny(t, FOLLOW) && lastTopics.length && !hasAny(t, KONYA_SIGNALS)) {
      var synthetic = t + " " + lastTopics.join(" ");
      t = norm(synthetic + " " + lastTopics.map(function (id) {
        for (var i = 0; i < CARDS.length; i++) if (CARDS[i].id === id) return CARDS[i].keys[0];
        return id;
      }).join(" "));
    }

    if (!isKonyaRelated(t) && tokens(t).length > 3) {
      return "KonyaGo AI sadece Konya odaklı çalışır.\n\nŞunu dene:\n• «Mevlana ücretsiz mi?»\n• «2 günlük plan»\n• «Seydişehir’de ne gezilir?»\n• «Arabaşı nedir?»";
    }

    var tops = topCards(t, 2);
    if (!tops.length) {
      // zayif sinyal ama konya baglamı
      if (lastTopics.length) {
        tops = lastTopics.slice(0, 1).map(function (id) {
          for (var i = 0; i < CARDS.length; i++) {
            if (CARDS[i].id === id) return { card: CARDS[i], s: 5 };
          }
          return null;
        }).filter(Boolean);
      }
    }

    if (!tops.length) {
      return "Soru Konya ile ilgili görünüyor ama net bağlayamadım. Biraz daha açabilir misin?\n\nÖrneğin: hangi ilçe, kaç gün, yemek mi tarih mi?";
    }

    lastTopics = tops.map(function (x) { return x.card.id; });

    var parts = [];
    for (var i = 0; i < tops.length; i++) {
      if (i > 0 && tops[i].s < tops[0].s * 0.45) break;
      var fn = tops[i].card.a;
      parts.push(typeof fn === "function" ? fn(t) : String(fn));
    }

    var out = parts[0];
    if (parts.length > 1) {
      out += "\n\n———\n\nİlgili not:\n" + parts[1];
    }

    // kisa takip onerisi
    if (turn < 8 && tops[0].card.id === "mevlana") {
      out += "\n\nİstersen yanına «etli ekmek» veya «1 günlük plan» da sorabilirsin.";
    } else if (tops[0].card.id === "plan1" || tops[0].card.id === "plan2") {
      out += "\n\nHava ve anlık öneri için ana sayfadaki «Bugün ne yapmalı?» kutusuna da bak.";
    }

    return out;
  }

  function addMsg(text, who) {
    var div = document.createElement("div");
    div.className = "ai-msg ai-" + who;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  function typeOut(text, cb) {
    var div = document.createElement("div");
    div.className = "ai-msg ai-bot";
    chat.appendChild(div);
    var i = 0;
    var step = Math.max(2, Math.floor(text.length / 40));
    function tick() {
      i = Math.min(text.length, i + step);
      div.textContent = text.slice(0, i);
      chat.scrollTop = chat.scrollHeight;
      if (i < text.length) {
        setTimeout(tick, 16);
      } else if (cb) cb();
    }
    tick();
  }

  function addTyping(then) {
    var tip = document.createElement("div");
    tip.className = "ai-msg ai-bot ai-typing";
    tip.textContent = "Düşünüyor…";
    chat.appendChild(tip);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(function () {
      tip.remove();
      then();
    }, 280 + Math.random() * 420);
  }

  addMsg(
    "Merhaba! Ben KonyaGo AI — Konya’ya özel asistanın.\n\n" +
    "Gezi rotası, Mevlana, etli ekmek, ilçeler, tarih ve ulaşım… hepsini sorabilirsin. Soru limiti yok.\n\n" +
    "Hızlı başla: «Hafta sonu planı» · «Mevlana» · «Sille»",
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
    addTyping(function () {
      var a = answer(q);
      history.push({ role: "bot", text: a });
      if (history.length > 24) history = history.slice(-24);
      typeOut(a, function () {
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      });
    });
  });
})();
