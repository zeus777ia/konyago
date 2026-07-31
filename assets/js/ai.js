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
      keys: ["seyit harun", "seyid harun", "harun veli", "sey disehir", "sey disehir", "seydisehir", "kugulu", "kugulu park"],
      a: "Seydişehir’de Seyit Harun Veli Hazretleri türbesi ilçenin manevi duraklarındandır. Aynı gezide Kuğulu Park’a uğrayabilirsin — yürüyüş ve aile molası için uygun. İkisi de Seydişehir merkezine yakın; araçla günübirlik planlanabilir. Gezilecek ve Harita sayfalarında konumlar var."
    },
    {
      keys: ["etli ekmek", "etliekmek", "pide konya"],
      a: "Etli ekmek Konya’nın imza lezzetidir: ince hamur, kıyma, soğan ve baharat; taş fırında pişer. Genelde dilim dilim, ayran ile yenir. Öğle 11–14 arası birçok fırında taze çıkar. Merkez ve Mevlana çevresinde çok sayıda taş fırın bulunur. Detay: Mutfak sayfası."
    },
    {
      keys: ["firin kebabi", "firin kebab", "tandir"],
      a: "Fırın kebabı kuşbaşı etin soğan ve domatesle uzun süre fırın/tencerede pişmesiyle yapılır; sosu ekmekle yenir. Tandır ve sac kavurma da Konya et kültüründe yaygındır. Mutfak bölümünde diğer lezzetlere de bakabilirsin."
    },
    {
      keys: ["bamya", "bamya corbasi"],
      a: "Bamya çorbası Konya usulüyle ekşili, etli veya sade yapılır. Özellikle kış ve ramazan sofralarında sevilir. Yöresel lokantalarda ve ev yemeklerinde sık görülür."
    },
    {
      keys: ["arabasi", "araba si"],
      a: "Arabaşı, İç Anadolu’nun kış yemeğidir; unlu/kıvamlı kısım ve et suyu veya etli harçla yenir. Konya ve çevre illerde kış menülerinde yer alır."
    },
    {
      keys: ["tirit", "tirid"],
      a: "Tirit: ekmek dilimleri, et suyu ve kıyma/kuşbaşı; üzerine yoğurt ve tereyağı. Düğün ve özel gün sofralarının klasiğidir."
    },
    {
      keys: ["hosmerim", "cezerye", "tatli"],
      a: "Hoşmerim (peynir–irmik–şeker) sıcak servis edilen yöresel tatlıdır. Cezerye ise havuçlu, fıstıklı; hediyelik olarak da alınır. Hediyelik ve Mutfak sayfalarına göz at."
    },
    {
      keys: ["sille"],
      a: "Sille, merkeze yakın tarihi bir yerleşimdir: taş evler, Aya Eleni Kilisesi, mağaralar ve fotoğraf için uygun sokaklar. Yarım günlük gezi için idealdir. Harita ve Gezilecek’ten yol tarifi alabilirsin."
    },
    {
      keys: ["catalhoyuk", "catal hoyuk", "unesco"],
      a: "Çatalhöyük, Neolitik dönem yerleşimi ve UNESCO dünya mirasıdır. Merkeze göre daha uzaktır; pratikte araç veya tur ile günübirlik planlanır. Ziyaretçi merkezi vardır."
    },
    {
      keys: ["alaaddin", "alaeddin", "tepe"],
      a: "Alaaddin Tepesi, Selçuklu döneminin simge noktalarındandır; cami, park ve şehir manzarası sunar. Akşam yürüyüşü için sık tercih edilir."
    },
    {
      keys: ["ince minare", "karatay", "medrese", "cini"],
      a: "İnce Minareli Medrese taş işçiliği ve müze koleksiyonuyla ünlüdür (çift başlı kartal kabartmaları). Karatay Medresesi çini eserleriyle bilinir. İkisi de merkez kültür aksındadır."
    },
    {
      keys: ["meram", "baglar"],
      a: "Meram Bağları yeşil vadi, mesire ve yürüyüş alanlarıyla bilinir. Yaz akşamları serinlemek için tercih edilir; merkeze biraz uzaktır."
    },
    {
      keys: ["beysehir", "gol", "meke", "kilistra", "eflatun"],
      a: "Günübirlik öneriler: Beyşehir Gölü, Meke Gölü, Kilistra, Eflatunpınar ve Seydişehir (Seyit Harun Veli + Kuğulu Park). Araç planı gerekir. Rotalar ve Harita sayfalarına bak."
    },
    {
      keys: ["ulasim", "otobus", "tramvay", "atus", "konyakart", "toplu tasima", "dolmus"],
      a: "Şehir içi ulaşımda ATUS (otobüs/tramvay bilgisi) ve Konyakart ödeme sistemi kullanılır. Güncel hat ve saat için belediyenin ATUS uygulaması/sitesi en doğru kaynaktır. Sitede Ulaşım sayfasında bağlantılar var."
    },
    {
      keys: ["kac gun", "ne kadar kal", "1 gun", "2 gun", "rota", "plan"],
      a: "Merkez (Mevlana ücretsiz, ~17:00 kapanış + müzeler + etli ekmek) için 1 tam gün yetebilir; Mevlana’ya erken uğra. Sille, Seydişehir veya Çatalhöyük ekleyeceksen 2 gün daha rahat. Rotalar sayfasında planlar var."
    },
    {
      keys: ["konaklama", "otel", "nerede kal", "pansiyon"],
      a: "Merkez/Mevlana çevresi yürüme mesafesi için pratik. Selçuklu tarafı daha yeni ve AVM’li. Meram daha sakin ve yeşil. KonyaGo otel satmaz; bölge seçimi için Konaklama sayfasına bak. Yoğun dönemlerde (Şeb-i Arus, bayram) erken rezervasyon iyi olur."
    },
    {
      keys: ["seb i arus", "sebi arus", "aralik etkinlik", "etkinlik"],
      a: "Şeb-i Arus, Mevlana’nın vuslat yıldönümü etkinlikleridir; genelde aralık ayında sema ve kültür programları yoğunlaşır. Şehir ve konaklama doluluğu artar. Bilet ve program için resmi duyuruları takip et. Etkinlikler sayfasına da bakabilirsin."
    },
    {
      keys: ["tarih", "selcuklu", "tarihce", "osmanli"],
      a: "Konya; Çatalhöyük’ten Roma/Bizans’a, Anadolu Selçuklu başkentliğine ve Mevlana mirasına uzanan derin bir tarihe sahiptir. Özet için sitede Tarihçe sayfası var."
    },
    {
      keys: ["hava", "mevsim", "ne zaman gel", "yaz", "kis"],
      a: "İlkbahar ve sonbahar gezi için daha ılımandır. Yaz öğlenleri sıcak olur; dış mekânı sabah/akşam planla. Kışın tirit, bamya, arabaşı gibi lezzetler ayrı güzeldir. Güncel hava için MGM’ye bak (Pratik sayfada link var)."
    },
    {
      keys: ["acil", "polis", "itfaiye", "112", "hastane"],
      a: "Türkiye genelinde Acil Çağrı: 112. Ayrıca polis 155, jandarma 156, itfaiye 110. Pratik sayfada numaralar ve faydalı linkler listeleniyor."
    },
    {
      keys: ["hediye", "hediyelik", "ne al"],
      a: "Klasik hediyelikler: cezerye, çini/seramik, Mevlana temalı ürünler, el işi. Mevlana çevresi ve çarşılarda bol seçenek vardır. Hediyelik sayfasına bak."
    },
    {
      keys: ["harita", "yol tarifi", "nasil giderim", "konum"],
      a: "Sitede Harita sayfasında önemli noktalar işaretli (Mevlana, Sille, Seydişehir vb.); Gezilecek kartlarında Google yol tarifi butonları var."
    },
    {
      keys: ["kelebek", "japon parki", "aile", "cocuk"],
      a: "Aile için: kısa Mevlana turu (ücretsiz, 17:00 öncesi bitir), Tropikal Kelebek Bahçesi, parklar; Seydişehir’de Kuğulu Park da uygun. Ardından etli ekmek molası. Rotalar sayfasında aile planı var."
    },
    {
      keys: ["konyago", "bu site", "sen kimsin", "yapay zeka", "ai"],
      a: "Ben KonyaGo AI — sadece Konya ile ilgili sorulara yardımcı olmak için tasarlandım. Gezi, mutfak, tarih, ulaşım, konaklama ve pratik bilgilerde yol gösteririm. Resmi kurum sitesi değilim. Soru sınırın yok."
    },
    {
      keys: ["merhaba", "selam", "gunaydin", "iyi gunler", "hey"],
      a: "Merhaba! Ben KonyaGo AI. Konya hakkında ne sormak istersin? Gezi, yemek, ulaşım, tarih, konaklama… hepsi serbest, limit yok."
    },
    {
      keys: ["tesekkur", "sagol", "eyvallah"],
      a: "Rica ederim. Başka bir Konya sorusun olursa yazman yeterli. İyi geziler!"
    }
  ];

  function isKonyaRelated(t) {
    if (hasAny(t, [
      "konya", "mevlana", "sille", "meram", "catal", "alaaddin", "selcuk",
      "etli", "bamya", "tirit", "arabasi", "atus", "konyakart", "sebi",
      "hosmerim", "cezerye", "karatay", "ince minare", "beysehir", "meke",
      "kilistra", "gez", "turist", "otel", "konak", "harita", "rota",
      "mutfak", "yemek", "lezzet", "muze", "sema", "seydisehir", "seyit",
      "harun", "kugulu", "ucretsiz"
    ])) return true;
    if (hasAny(t, ["nerede", "ne yenir", "ne gezilir", "kac gun", "nasil gider", "ne yapilir", "tavsiye"])) return true;
    if (hasAny(t, ["merhaba", "selam", "tesekkur", "konyago", "sen kimsin"])) return true;
    return false;
  }

  function answer(q) {
    var t = norm(q);
    if (!t) return "Bir şey yaz, Konya hakkında yardımcı olayım.";

    if (hasAny(t, OFF) && !isKonyaRelated(t)) {
      return "Bu konuda yardımcı olamıyorum. Ben yalnızca Konya ile ilgili sorulara cevap veriyorum — gezi, yemek, tarih, ulaşım, konaklama gibi. Konya’ya dair sorunu yazabilirsin.";
    }

    if (!isKonyaRelated(t) && t.split(" ").length > 2) {
      return "KonyaGo AI sadece Konya odaklıdır. Örneğin: «Mevlana ücretsiz mi?», «Etli ekmek nerede yenir?», «Seydişehir’de ne gezilir?» — bu tarz sorulara sınırsız cevap verebilirim.";
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

    return "Konya ile ilgili anladım ama net eşleştiremedim. Şunlardan birini deneyebilirsin:\n• Mevlana (ücretsiz, ~17:00)\n• Sille / Seydişehir (Seyit Harun, Kuğulu Park)\n• Etli ekmek, bamya, tirit\n• 1–2 günlük rota, ATUS\n\nSorunu biraz daha açarsan yardımcı olayım.";
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

  addMsg("Merhaba! Ben KonyaGo AI. Sadece Konya hakkında sorulara cevap veririm — limit yok.\n\nÖrnek: «Mevlana ücretsiz mi?» · «Seydişehir’de ne var?» · «1 günde ne gezilir?»", "bot");

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
