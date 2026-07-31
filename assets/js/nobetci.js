/* KonyaGo — nöbetçi eczane (bilgilendirme; günlük güncellenmeli)
   Kaynak örneği: konyanobetcieczaneleri.com / eczacı odası / e-Devlet
*/
window.KONYAGO_NOBETCI = {
  date: "2026-07-31",
  label: "31 Temmuz 2026",
  sourceNote: "Üçüncü taraf listeden derlenmiştir. Nihai teyit: e-Devlet TİTCK veya Konya Eczacı Odası.",
  items: [
    { name: "Sezer Eczanesi", ilce: "Selçuklu" },
    { name: "Tuncel Eczanesi", ilce: "Selçuklu" },
    { name: "Ertürk Eczanesi", ilce: "Selçuklu / Meram" },
    { name: "Park Eczanesi", ilce: "Meram" },
    { name: "Genç Eczanesi", ilce: "Karatay" },
    { name: "Ulucan Eczanesi", ilce: "Meram" },
    { name: "Nehir Eczanesi", ilce: "Karatay" },
    { name: "Hira Eczanesi", ilce: "Selçuklu" },
    { name: "Ünlü Eczanesi", ilce: "Selçuklu" },
    { name: "Akif Duman Eczanesi", ilce: "Selçuklu" },
    { name: "Küçüksarı Eczanesi", ilce: "Selçuklu" },
    { name: "Sima Eczanesi", ilce: "Meram" },
    { name: "Erdem Eczanesi", ilce: "Akşehir" },
    { name: "Elmalı Eczanesi", ilce: "Altınekin" },
    { name: "Vereseli Gökmenoğlu Eczanesi", ilce: "Beyşehir" },
    { name: "Üzümağı Eczanesi", ilce: "Bozkır" },
    { name: "Demirbaş Eczanesi", ilce: "Cihanbeyli" },
    { name: "Yeniceoba Eczanesi", ilce: "Cihanbeyli" },
    { name: "Fidan Eczanesi", ilce: "Çeltik" },
    { name: "Bağcı Eczanesi", ilce: "Çumra" },
    { name: "Uysal Eczanesi", ilce: "Doğanhisar" },
    { name: "Karataş Eczanesi", ilce: "Ereğli" },
    { name: "Onur Eczanesi", ilce: "Ereğli" },
    { name: "Hüyük Eczanesi", ilce: "Hüyük" },
    { name: "Sevgi Eczanesi", ilce: "Ilgın" },
    { name: "Çınar Eczanesi", ilce: "Kadınhanı" },
    { name: "Serap Eczanesi", ilce: "Karapınar" },
    { name: "Taşkıran Eczanesi", ilce: "Kulu" },
    { name: "Yönet Eczanesi", ilce: "Sarayönü" },
    { name: "Özkaynak Eczanesi", ilce: "Seydişehir" },
    { name: "Tuzlukçu Eczanesi", ilce: "Tuzlukçu" },
    { name: "Taşkın Eczanesi", ilce: "Yunak" }
  ]
};

(function () {
  "use strict";
  try {
    var D = window.KONYAGO_NOBETCI;
    if (!D || !D.items || !D.items.length) return;
    if (document.querySelector(".eczane-ticker")) return;

    var parts = [];
    for (var i = 0; i < D.items.length; i++) {
      var it = D.items[i];
      parts.push(
        '<span class="eczane-ticker-item">' +
        '<span class="eczane-ticker-dot" aria-hidden="true"></span>' +
        "💊 " + it.name + " · " + it.ilce +
        "</span>"
      );
    }
    var trackHtml = parts.join("") + parts.join("");

    var bar = document.createElement("div");
    bar.className = "eczane-ticker";
    bar.setAttribute("role", "complementary");
    bar.setAttribute("aria-label", "Nöbetçi eczaneler kayan liste");
    bar.innerHTML =
      '<div class="eczane-ticker-label"><a href="nobetci-eczane.html">Nöbetçi</a> · ' + (D.label || "") + "</div>" +
      '<div class="eczane-ticker-viewport"><div class="eczane-ticker-track">' + trackHtml + "</div></div>";

    // Reklam şeridinin hemen altına, yoksa body başına
    var ad = document.querySelector(".ad-ticker");
    if (ad && ad.parentNode) {
      ad.parentNode.insertBefore(bar, ad.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  } catch (e) {}
})();
