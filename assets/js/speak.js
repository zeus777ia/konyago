/* KonyaGo sesli anlatim - daha uzun, daha dogal */
(function (w) {
  "use strict";

  var AUDIO = {
    mevlana:
      "Merhaba. Simdi Mevlana Muzesi ndesiniz. Yesil kubbe, Konya siluetinin en bilinen parcasi. Muze aslinda eski bir dergah. Iceride Mevlana Celaleddin Rumi nin turbesi ve dervis hucreleri var. Giris ucretsiz. Sabah erken saatlerde ya da ogleden sonra daha sakin oluyor. Iceride yuksek sesle konusmayin. Fotografda flas kullanmayin. Avluda kisa bir mola verip turbe yonune yuruyun. Cikista carsi tarafina birkac dakika yurumek kolay. Yaninizda su olsun. Yazin avlu sicak olabiliyor. Toplam ziyaret icin kirk dakikadan bir saate kadar zaman ayirin. Cikista etli ekmek icin merkez cok yakin.",
    sille:
      "Sille ye hos geldiniz. Merkeze yaklasik sekiz kilometre. Burası tas evleri, dar sokaklari ve sakin temposuyla farkli bir Konya. Aya Eleni Kilisesi en bilinen duraklardan biri. Sokaklarda yavas yuruyun. Fotograf icin en guzel isik sabah veya ikindi. Kucuk kafelerde kisa mola iyi gider. Yarim gun ayirmak ideal. Donuste isterseniz Meram yonune sapabilirsiniz. Aracla geliyorsaniz park yerini onceden planlayin. Cocukluysaniz yokushara dikkat edin. Sille yi acele etmeden gezmek daha keyifli. Donus yolunda manzara molasi da yapabilirsiniz.",
    alaaddin:
      "Alaaddin Tepesi, eski Konya nin kalbi gibi. Selcuklu doneminden kalan cami ve cevresi parkla birlesiyor. Tepeden sehre bakmak icin birkac dakika ayirin. Yani sira Ince Minareli ve Karatay medreseleri ayni gune sigdirilabilir. Ogle sicaginda golge alanlari tercih edin. Aksamustu isik manzara icin daha yumusak. Kisa bir yuruyus rotasi cikarin. Tepe, cami cevresi, sonra merkeze inis. Aileyle geliyorsaniz park kismi rahat. Toplam yarim saat ile kirk bes dakika arasi yeter. Muzelerle birlestirirseniz sure uzar. Buradan carsiya inmek de kolay."
  };

  /* Turkce karakterli metinler - TTS icin daha dogal */
  AUDIO.mevlana =
    "Merhaba. Şimdi Mevlana Müzesi’ndesiniz. Yeşil kubbe, Konya siluetinin en bilinen parçası. Müze aslında eski bir dergâh. İçeride Mevlana Celaleddin Rumi’nin türbesi ve derviş hücreleri var. Giriş ücretsiz. Sabah erken saatlerde ya da öğleden sonra daha sakin oluyor. İçeride yüksek sesle konuşmayın. Fotoğrafta flaş kullanmayın. Avluda kısa bir mola verip türbe yönüne yürüyün. Çıkışta çarşı tarafına birkaç dakika yürümek kolay. Yanınızda su olsun. Yazın avlu sıcak olabiliyor. Toplam ziyaret için kırk dakikadan bir saate kadar zaman ayırın. Çıkışta etli ekmek için merkez çok yakın.";
  AUDIO.sille =
    "Sille’ye hoş geldiniz. Merkeze yaklaşık sekiz kilometre. Burası taş evleri, dar sokakları ve sakin temposuyla farklı bir Konya. Aya Eleni Kilisesi en bilinen duraklardan biri. Sokaklarda yavaş yürüyün. Fotoğraf için en güzel ışık sabah veya ikindi. Küçük kafelerde kısa mola iyi gider. Yarım gün ayırmak ideal. Dönüşte isterseniz Meram yönüne sapabilirsiniz. Araçla geliyorsanız park yerini önceden planlayın. Çocukluysanız yokuşlara dikkat edin. Sille’yi acele etmeden gezmek daha keyifli. Dönüş yolunda manzara molası da yapabilirsiniz.";
  AUDIO.alaaddin =
    "Alaaddin Tepesi, eski Konya’nın kalbi gibi. Selçuklu döneminden kalan cami ve çevresi parkla birleşiyor. Tepeden şehre bakmak için birkaç dakika ayırın. Yanı sıra İnce Minareli ve Karatay medreseleri aynı güne sığdırılabilir. Öğle sıcağında gölge alanları tercih edin. Akşamüstü ışık manzara için daha yumuşak. Kısa bir yürüyüş rotası çıkarın. Tepe, cami çevresi, sonra merkeze iniş. Aileyle geliyorsanız park kısmı rahat. Toplam yarım saat ile kırk beş dakika arası yeter. Müzelerle birleştirirseniz süre uzar. Buradan çarşıya inmek de kolay.";

  function pickVoice() {
    var voices = w.speechSynthesis.getVoices() || [];
    var prefer = null;
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      var lang = (v.lang || "").toLowerCase();
      var name = (v.name || "").toLowerCase();
      if (lang.indexOf("tr") === 0) {
        if (/natural|neural|premium|enhanced|google/.test(name)) return v;
        if (!prefer) prefer = v;
      }
    }
    return prefer;
  }

  function speakHuman(text, btn) {
    if (!w.speechSynthesis) {
      alert("Bu tarayıcı sesli anlatımı desteklemiyor.");
      return;
    }
    w.speechSynthesis.cancel();
    var raw = String(text || "").replace(/\s+/g, " ").trim();
    var parts = [];
    var buf = "";
    for (var i = 0; i < raw.length; i++) {
      buf += raw.charAt(i);
      if (".!?".indexOf(raw.charAt(i)) >= 0) {
        var p = buf.trim();
        if (p) parts.push(p);
        buf = "";
      }
    }
    if (buf.trim()) parts.push(buf.trim());
    if (!parts.length) return;

    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      var old = btn.textContent;
      btn.dataset.oldLabel = old;
      btn.textContent = "Dinleniyor…";
    }

    var voice = pickVoice();
    var idx = 0;

    function done() {
      if (btn) {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
        if (btn.dataset.oldLabel) btn.textContent = btn.dataset.oldLabel;
      }
    }

    function next() {
      if (idx >= parts.length) {
        done();
        return;
      }
      var u = new SpeechSynthesisUtterance(parts[idx]);
      u.lang = "tr-TR";
      u.rate = 0.86;
      u.pitch = 1.04;
      u.volume = 1;
      if (voice) u.voice = voice;
      u.onend = function () {
        idx += 1;
        setTimeout(next, 320);
      };
      u.onerror = function () {
        done();
      };
      w.speechSynthesis.speak(u);
    }

    if (!(w.speechSynthesis.getVoices() || []).length) {
      w.speechSynthesis.onvoiceschanged = function () {
        voice = pickVoice();
        next();
      };
      setTimeout(function () {
        if (idx === 0) next();
      }, 450);
    } else {
      next();
    }
  }

  w.KonyaGoAudio = AUDIO;
  w.KonyaGoSpeak = speakHuman;
  if (w.KonyaGoFeatures) w.KonyaGoFeatures.speak = speakHuman;
  else w.KonyaGoFeatures = { speak: speakHuman };

  try {
    w.speechSynthesis.getVoices();
  } catch (e) {}
})(window);
