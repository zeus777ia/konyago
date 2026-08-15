/* KonyaGo — nöbetçi eczane
   Tarih: her zaman bugün (Europe/Istanbul)
   Liste: canlı çekim (konyanobetcieczaneleri.com) + yedek statik
*/
(function (w) {
  "use strict";

  var MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var DAYS = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

  function todayTR() {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul",
        year: "numeric", month: "2-digit", day: "2-digit",
        weekday: "short"
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var y = map.year, m = map.month, d = map.day;
      var dt = new Date(y + "-" + m + "-" + d + "T12:00:00+03:00");
      var label = parseInt(d, 10) + " " + MONTHS[parseInt(m, 10) - 1] + " " + y + " " + DAYS[dt.getUTCDay()];
      // getUTCDay wrong for +3 noon - use formatter for weekday in TR
      var wd = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", weekday: "long" }).format(new Date());
      label = parseInt(d, 10) + " " + MONTHS[parseInt(m, 10) - 1] + " " + y + " " + wd;
      return { date: y + "-" + m + "-" + d, label: label };
    } catch (e) {
      var n = new Date();
      return { date: n.toISOString().slice(0, 10), label: n.toLocaleDateString("tr-TR") };
    }
  }

  // Yedek (son bilinen gün — canlı çekim başarısız olursa)
  var FALLBACK = [
    { name: "Bizim Eczanesi", ilce: "Selçuklu" },
    { name: "Murat Eczanesi", ilce: "Selçuklu" },
    { name: "Akşemsettin Eczanesi", ilce: "Selçuklu / Meram" },
    { name: "Burak Akbuğa Eczanesi", ilce: "Meram" },
    { name: "Larende Eczanesi", ilce: "Karatay" },
    { name: "Özen Eczanesi", ilce: "Meram" },
    { name: "Zeynep Sena Eczanesi", ilce: "Karatay" },
    { name: "Gürsoy Eczanesi", ilce: "Selçuklu" },
    { name: "Aysel Eczanesi", ilce: "Selçuklu" },
    { name: "Simya Eczanesi", ilce: "Selçuklu" },
    { name: "Selçuk Tıp Eczanesi", ilce: "Selçuklu" },
    { name: "Önder Eczanesi", ilce: "Meram" },
    { name: "Sercan Eczanesi", ilce: "Akşehir" },
    { name: "Dilek Eczanesi", ilce: "Altınekin" },
    { name: "Ünal Eczanesi", ilce: "Beyşehir" },
    { name: "Güven Eczanesi", ilce: "Bozkır" },
    { name: "Hayat Eczanesi", ilce: "Cihanbeyli" },
    { name: "Diydem Eczanesi", ilce: "Cihanbeyli" },
    { name: "Kaçmaz Eczanesi", ilce: "Çeltik" },
    { name: "Hayat Eczanesi", ilce: "Çumra" },
    { name: "Hisar Eczanesi", ilce: "Doğanhisar" },
    { name: "Yücelen Eczanesi", ilce: "Ereğli" },
    { name: "Hakan Eczanesi", ilce: "Ereğli" },
    { name: "Lokman Hekim Eczanesi", ilce: "Ereğli" },
    { name: "Bilge Melek Şen Eczanesi", ilce: "Ereğli" },
    { name: "Bilir Eczanesi", ilce: "Hüyük" },
    { name: "Gürbüz Eczanesi", ilce: "Ilgın" },
    { name: "Ganioğlu Eczanesi", ilce: "Kadınhanı" },
    { name: "Güngör Eczanesi", ilce: "Karapınar" },
    { name: "Erdoğan Eczanesi", ilce: "Kulu" },
    { name: "Ayşe Çınar Eczanesi", ilce: "Sarayönü" },
    { name: "Yıldız Eczanesi", ilce: "Seydişehir" },
    { name: "Tuzlukçu Eczanesi", ilce: "Tuzlukçu" },
    { name: "Yunak Eczanesi", ilce: "Yunak" }
  ];

  function stripTags(s) {
    return String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function parseList(html) {
    var cells = [];
    var re = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    var m;
    while ((m = re.exec(html))) {
      var t = stripTags(m[1]);
      if (t) cells.push(t);
    }
    var items = [];
    var i = 0;
    // Merkez: "N. BÖLGE (ILCE)" + NAME + adres + tel
    while (i < cells.length) {
      var c = cells[i];
      var bm = c.match(/^\d+\.\s*BÖLGE\s*\(([^)]+)\)/i);
      if (bm && i + 1 < cells.length) {
        var ilce = bm[1].split("-")[0].trim();
        // normalize first district word
        ilce = ilce.replace(/\s+/g, " ");
        var name = cells[i + 1];
        if (name && !/^Bölge$/i.test(name) && !/Eczane/i.test(name) && name.length < 60) {
          items.push({ name: name + ( /eczane/i.test(name) ? "" : " Eczanesi"), ilce: ilce });
        }
        i += 4;
        continue;
      }
      // İlçe bloğu: ILCE + NAME + adres + tel (ilçe adı tek başına)
      var districts = /^(AKŞEHİR|ALTINEKİN|BEYŞEHİR|BOZKIR|CİHANBEYLİ|ÇELTİK|ÇUMRA|DOĞANHİSAR|EREĞLİ|GÜNEYSINIR|HADİM|HALKAPINAR|HÜYÜK|ILGIN|KADINHANI|KARAPINAR|KULU|SARAYÖNÜ|SEYDİŞEHİR|TAŞKENT|TUZLUKÇU|YALIHÜYÜK|YUNAK|AHIRLI|DERBENT|DEREBUCAK|EMİRGAZİ|HÜYÜK)$/i;
      if (districts.test(c) && i + 1 < cells.length) {
        var nm = cells[i + 1];
        if (nm && nm.length < 50 && !districts.test(nm)) {
          items.push({ name: nm + (/eczane/i.test(nm) ? "" : " Eczanesi"), ilce: c.charAt(0) + c.slice(1).toLowerCase().replace(/i/g, "ı").replace(/^./, function(x){return c[0];}) });
          // keep proper Turkish casing from original
          items[items.length - 1].ilce = c;
        }
        i += 4;
        continue;
      }
      i++;
    }
    // dedupe
    var seen = {};
    return items.filter(function (it) {
      var k = it.name + "|" + it.ilce;
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
  }

  function setData(items, live) {
    var t = todayTR();
    w.KONYAGO_NOBETCI = {
      date: t.date,
      label: t.label,
      live: !!live,
      sourceNote: live
        ? "Liste canlı çekildi (konyanobetcieczaneleri.com). Nihai teyit: e-Devlet TİTCK / Konya Eczacı Odası."
        : "Yedek liste gösteriliyor; canlı kaynak yanıt vermedi. Nihai teyit: e-Devlet TİTCK / Konya Eczacı Odası.",
      items: items && items.length ? items : FALLBACK
    };
    renderTicker();
    renderPage();
    w.dispatchEvent(new CustomEvent("konyago:nobetci", { detail: w.KONYAGO_NOBETCI }));
  }

  function renderTicker() {
    var D = w.KONYAGO_NOBETCI;
    if (!D || !D.items || !D.items.length) return;
    var existing = document.querySelector(".eczane-ticker");
    if (existing) existing.remove();

    var parts = D.items.map(function (it) {
      return '<span class="eczane-ticker-item"><span class="eczane-ticker-dot" aria-hidden="true"></span>💊 ' +
        escapeHtml(it.name) + " · " + escapeHtml(it.ilce) + "</span>";
    });
    var trackHtml = parts.join("") + parts.join("");
    var bar = document.createElement("div");
    bar.className = "eczane-ticker";
    bar.setAttribute("role", "complementary");
    bar.setAttribute("aria-label", "Nöbetçi eczaneler");
    bar.innerHTML =
      '<div class="eczane-ticker-label"><a href="nobetci-eczane.html">Nöbetçi</a> · ' + escapeHtml(D.label || "") +
      (D.live ? " · canlı" : "") + "</div>" +
      '<div class="eczane-ticker-viewport"><div class="eczane-ticker-track">' + trackHtml + "</div></div>";
    var ad = document.querySelector(".ad-ticker");
    if (ad && ad.parentNode) ad.parentNode.insertBefore(bar, ad.nextSibling);
    else if (document.body) document.body.insertBefore(bar, document.body.firstChild);
  }

  function renderPage() {
    var D = w.KONYAGO_NOBETCI;
    var box = document.getElementById("nobetciList");
    var dateEl = document.getElementById("nobetciDate");
    if (!D) return;
    if (dateEl) dateEl.textContent = (D.label || D.date) + (D.live ? " · canlı liste" : " · yedek liste") + " · ilçe ilçe";
    if (!box) return;
    var by = {};
    (D.items || []).forEach(function (it) {
      var k = it.ilce || "Diğer";
      if (!by[k]) by[k] = [];
      by[k].push(it.name);
    });
    var keys = Object.keys(by).sort(function (a, b) { return a.localeCompare(b, "tr"); });
    var html = "<h2>Bugünkü liste (" + escapeHtml(D.label || "") + ")</h2>";
    if (!D.live) {
      html += '<p style="font-size:.85rem;color:var(--muted)">Canlı kaynak şu an yanıt vermedi; yedek liste. Mutlaka resmî kaynaktan teyit edin.</p>';
    }
    keys.forEach(function (k) {
      html += '<p style="margin-top:10px"><strong style="color:var(--green-deep)">' + escapeHtml(k) + "</strong><br>";
      html += by[k].map(function (n) { return "💊 " + escapeHtml(n); }).join("<br>");
      html += "</p>";
    });
    html += '<p style="margin-top:12px;font-size:.8rem">' + escapeHtml(D.sourceNote || "") + "</p>";
    box.innerHTML = html;
  }

  function fetchLive() {
    var target = "https://www.konyanobetcieczaneleri.com/";
    var proxies = [
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(target),
      "https://corsproxy.io/?" + encodeURIComponent(target)
    ];
    var tried = 0;
    function tryNext() {
      if (tried >= proxies.length) {
        setData(FALLBACK, false);
        return;
      }
      var url = proxies[tried++];
      fetch(url, { credentials: "omit", cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("http " + r.status);
          return r.text();
        })
        .then(function (html) {
          var items = parseList(html);
          if (!items || items.length < 5) throw new Error("parse");
          setData(items, true);
        })
        .catch(function () { tryNext(); });
    }
    tryNext();
  }

  // İlk boyama: bugünün tarihi + yedek, sonra canlı
  setData(FALLBACK, false);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchLive);
  } else {
    fetchLive();
  }
})(window);
