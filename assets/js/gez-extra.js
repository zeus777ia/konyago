/* KonyaGo — ek gezilecek yerler (mevcut listeye ek) */
(function () {
  "use strict";
  if (document.getElementById("gezExtraDone")) return;
  var flag = document.createElement("meta");
  flag.id = "gezExtraDone";
  document.head.appendChild(flag);

  function card(title, img, alt, desc, tags, lat, lon) {
    var tagsHtml = tags.map(function (t) {
      return '<span class="tag">' + t + "</span>";
    }).join("");
    return (
      '<article class="place gez-extra">' +
      '<img class="place-img" src="' + img + '" alt="' + alt + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">' +
      '<div class="place-body">' +
      "<h2>" + title + "</h2>" +
      "<p>" + desc + "</p>" +
      '<div class="tags">' + tagsHtml + "</div>" +
      '<div class="place-links"><a class="btn btn-primary btn-sm" href="https://www.google.com/maps/dir/?api=1&destination=' +
      lat + "," + lon + '" target="_blank" rel="noopener">Yol tarifi</a></div>' +
      "</div></article>"
    );
  }

  var modern =
    card("80 Binde Devr-i Alem Parkı", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/KONYA_K%C3%9CLT%C3%9CR_PARK_-_2025.jpg/800px-KONYA_K%C3%9CLT%C3%9CR_PARK_-_2025.jpg", "80 Binde", "Meram’da üç konseptli tematik park: hareketli dinozorlar, Türk-İslam eser minyatürleri ve masal dünyası. Çocuklu aileler için öne çıkan durak.", ["Aile", "Ücretli", "Çocuk"], "37.8610", "32.4450") +
    card("Karatay Hayvanat Bahçesi", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Konya_hayvanat_bah%C3%A7esi_2021.jpg/800px-Konya_hayvanat_bah%C3%A7esi_2021.jpg", "Hayvanat Bahçesi", "Karatay’daki geniş hayvanat bahçesi; aile ve çocuk rotasının klasik durağı.", ["Aile", "Doğa", "Ücretli"], "37.8920", "32.5580") +
    card("Konya Bilim Merkezi", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Interior_of_Konya_Panorama_Museum_152248_04.jpg/800px-Interior_of_Konya_Panorama_Museum_152248_04.jpg", "Bilim Merkezi", "İnteraktif sergilerle bilimi eğlenceli sunan merkez. Aile ve okul grupları için iç mekân alternatifi.", ["Aile", "Eğitim", "Modern"], "37.9480", "32.5020") +
    card("Meram Millet Bahçesi", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Konya_Eski_Stadyum_Yeni_Millet_Bah%C3%A7esi_49.jpg/800px-Konya_Eski_Stadyum_Yeni_Millet_Bah%C3%A7esi_49.jpg", "Millet Bahçesi", "Eski stadyum alanındaki geniş millet bahçesi: yürüyüş ve dinlenme için şehir içi nefes alma noktası.", ["Park", "Ücretsiz", "Yürüyüş"], "37.8715", "32.4845");

  var merkez =
    card("Bedesten Çarşısı", "https://upload.wikimedia.org/wikipedia/commons/1/1b/Bedesten_%C3%A7ar%C5%9F%C4%B1s%C4%B1_Konya.jpg", "Bedesten", "Osmanlı bedesteni; tarihi çarşı dokusunda hediyelik ve yerel ürün için merkezde pratik durak.", ["Tarih", "Alışveriş", "Merkez"], "37.8725", "32.4955") +
    card("Kapı Camii", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Al%C3%A2eddin_Mosque%2C_Konya_02.jpg/800px-Al%C3%A2eddin_Mosque%2C_Konya_02.jpg", "Kapı Camii", "Merkezdeki tarihi Kapı Camii; çarşı çevresiyle kısa kültür molası.", ["Cami", "Tarih", "Merkez"], "37.8710", "32.4965");

  var yakin =
    card("Akyokuş Kasrı", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Konya_Akyoku%C5%9F_Nature_Park_Konya_Landscape.jpg/800px-Konya_Akyoku%C5%9F_Nature_Park_Konya_Landscape.jpg", "Akyokuş Kasrı", "Modern sosyal tesis: kafe-restoran, seyir noktası ve etkinlik alanları. Şehir manzarası molası için.", ["Seyir", "Modern", "Kafe"], "37.8450", "32.4300") +
    card("Kızlar Kayası", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Konya_Akyoku%C5%9F_Nature_Park_Konya_Landscape.jpg/800px-Konya_Akyoku%C5%9F_Nature_Park_Konya_Landscape.jpg", "Kızlar Kayası", "Meram Dere’de erozyonla şekillenmiş kayalar; Konya’nın peri bacaları. Kısa yürüyüş ve fotoğraf.", ["Doğa", "Fotoğraf", "Ücretsiz"], "37.8300", "32.4500") +
    card("Sille Baraj Parkı", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sille_Dam%2C_Konya.jpg/800px-Sille_Dam%2C_Konya.jpg", "Sille Baraj Parkı", "Sille yakınında baraj gölü ve park; piknik ile Sille rotasına doğal devam.", ["Park", "Doğa", "Piknik"], "37.9330", "32.4000") +
    card("Ecdat Parkı", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/KONYA_K%C3%9CLT%C3%9CR_PARK_-_2025.jpg/800px-KONYA_K%C3%9CLT%C3%9CR_PARK_-_2025.jpg", "Ecdat Parkı", "Geniş yeşil alan; aile ve yürüyüş için sakin park.", ["Park", "Aile", "Ücretsiz"], "37.9100", "32.4800") +
    card("Kestel Göleti", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sille_Dam%2C_Konya.jpg/800px-Sille_Dam%2C_Konya.jpg", "Kestel Göleti", "Gölet ve çevresi; gün batımı ve kısa doğa molası.", ["Doğa", "Gölet", "Fotoğraf"], "37.9200", "32.4200") +
    card("Seyir Tepesi Parkı", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Konya_Akyoku%C5%9F_Nature_Park_Konya_Landscape.jpg/800px-Konya_Akyoku%C5%9F_Nature_Park_Konya_Landscape.jpg", "Seyir Tepesi", "Yüksek kotlu park; Konya ovası manzarası için popüler nokta.", ["Seyir", "Park", "Manzara"], "37.9000", "32.4600") +
    card("Kule Site 42. Kat", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/KONYA_K%C3%9CLT%C3%9CR_PARK_-_2025.jpg/800px-KONYA_K%C3%9CLT%C3%9CR_PARK_-_2025.jpg", "Kule Site", "Yüksek kattan panoramik şehir manzarası; modern seyir molası.", ["Seyir", "Modern", "Manzara"], "37.8750", "32.4850");

  var bey =
    card("Eflatunpınar Hitit Su Anıtı", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Eflatunpinar_-_Close_up.jpg/800px-Eflatunpinar_-_Close_up.jpg", "Eflatunpınar", "Beyşehir yakınında Hitit kutsal su anıtı (MÖ 13. yy). UNESCO geçici listesinde; Fasıllar rotasına tamamlayıcı.", ["Hitit", "UNESCO", "Tarih"], "37.6660", "31.7330");

  function injectAfterSection(titlePart, htmlCards) {
    var titles = document.querySelectorAll("h2.section-title, h2");
    var target = null;
    for (var i = 0; i < titles.length; i++) {
      if ((titles[i].textContent || "").indexOf(titlePart) !== -1) {
        target = titles[i];
        break;
      }
    }
    if (!target) return;
    var grid = target.nextElementSibling;
    while (grid && !(grid.classList && grid.classList.contains("grid"))) {
      grid = grid.nextElementSibling;
    }
    if (grid) grid.insertAdjacentHTML("beforeend", htmlCards);
  }

  injectAfterSection("tarihi yerler", merkez);
  injectAfterSection("aile", modern);
  injectAfterSection("çevre", yakin);

  var grids = document.querySelectorAll("main .grid.grid-2");
  if (grids.length) grids[grids.length - 1].insertAdjacentHTML("afterbegin", bey);
})();
