/* KonyaGo — ek yerler + görsel düzeltme */
(function () {
  "use strict";
  if (document.getElementById("gezExtraDone")) return;
  var flag = document.createElement("meta");
  flag.id = "gezExtraDone";
  document.head.appendChild(flag);

  /* Wikimedia 640px — tarayıcıda stabil thumbnail */
  var IMG = {
    mevlana: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Mevlana_M%C3%BCzesi_01.jpg/640px-Mevlana_M%C3%BCzesi_01.jpg",
    alaaddin: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Al%C3%A2eddin_Mosque%2C_Konya_02.jpg/640px-Al%C3%A2eddin_Mosque%2C_Konya_02.jpg",
    ince: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ince_Minareli_Medrese_01.jpg/640px-Ince_Minareli_Medrese_01.jpg",
    karatay: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Konya_Karatay_Ceramics_Museum_2808.jpg/640px-Konya_Karatay_Ceramics_Museum_2808.jpg",
    sahip: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Konya_Sahip_Ata_Vak%C4%B1flar_Eserleri_M%C3%BCzesi_exterior_3604.jpg/640px-Konya_Sahip_Ata_Vak%C4%B1flar_Eserleri_M%C3%BCzesi_exterior_3604.jpg",
    sircali: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Konya_Sircali_Medrese_3607.jpg/640px-Konya_Sircali_Medrese_3607.jpg",
    aziziye: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Aziziye_Mosque%2C_Konya%2C_Turkey.jpg/640px-Aziziye_Mosque%2C_Konya%2C_Turkey.jpg",
    japon: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Konya%3B_Japon_Park%C4%B1.jpg/640px-Konya%3B_Japon_Park%C4%B1.jpg",
    kelebek: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Konya_Tropical_Butterfly_Garden.jpg/640px-Konya_Tropical_Butterfly_Garden.jpg",
    panorama: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Interior_of_Konya_Panorama_Museum_152248_04.jpg/640px-Interior_of_Konya_Panorama_Museum_152248_04.jpg",
    sille: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Sille_Village%2C_Konya.jpg/640px-Sille_Village%2C_Konya.jpg",
    meram: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Sille_houses_4689.jpg/640px-Sille_houses_4689.jpg",
    catal: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_02.jpg/640px-%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_02.jpg",
    seyyid: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Muallimhane_Mosque%2C_Seydi%C5%9Fehir.JPG/640px-Muallimhane_Mosque%2C_Seydi%C5%9Fehir.JPG",
    tinaz: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/T%C4%B1naztepe_ma%C4%9Faras%C4%B1_-_panoramio.jpg/640px-T%C4%B1naztepe_ma%C4%9Faras%C4%B1_-_panoramio.jpg",
    tinaz2: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/T%C4%B1naztepe_ma%C4%9Faras%C4%B1_1.JPG/640px-T%C4%B1naztepe_ma%C4%9Faras%C4%B1_1.JPG",
    kugulu: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Seydi%C5%9Fehir_and_Taurus_Mountains_from_Il%C4%B1ca.jpg/640px-Seydi%C5%9Fehir_and_Taurus_Mountains_from_Il%C4%B1ca.jpg",
    fasillar: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Fasillar.jpg/640px-Fasillar.jpg",
    lukyanus: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/R%C3%B6mische_Reliefs_bei_Fasillar.jpg/640px-R%C3%B6mische_Reliefs_bei_Fasillar.jpg",
    beygol: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/2019-05-08_02.23.01_1_Bey%C5%9Fehir_G%C3%B6l%C3%BC%2C_Bey%C5%9Fehir._Konya.jpg/640px-2019-05-08_02.23.01_1_Bey%C5%9Fehir_G%C3%B6l%C3%BC%2C_Bey%C5%9Fehir._Konya.jpg",
    esref: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/E%C5%9Frefo%C4%9Flu_Camii%2C_Bey%C5%9Fehir%2C_April_2024_06.jpg/640px-E%C5%9Frefo%C4%9Flu_Camii%2C_Bey%C5%9Fehir%2C_April_2024_06.jpg",
    kultur: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/KONYA_K%C3%9CLT%C3%9CR_PARK_-_2025.jpg/640px-KONYA_K%C3%9CLT%C3%9CR_PARK_-_2025.jpg",
    hayvan: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Konya_hayvanat_bah%C3%A7esi_2021.jpg/640px-Konya_hayvanat_bah%C3%A7esi_2021.jpg",
    millet: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Konya_Eski_Stadyum_Yeni_Millet_Bah%C3%A7esi_49.jpg/640px-Konya_Eski_Stadyum_Yeni_Millet_Bah%C3%A7esi_49.jpg",
    bedesten: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Bedesten_%C3%A7ar%C5%9F%C4%B1s%C4%B1_Konya.jpg/640px-Bedesten_%C3%A7ar%C5%9F%C4%B1s%C4%B1_Konya.jpg",
    akyokus: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Konya_Akyoku%C5%9F_Nature_Park_Konya_Landscape.jpg/640px-Konya_Akyoku%C5%9F_Nature_Park_Konya_Landscape.jpg",
    silleDam: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sille_Dam%2C_Konya.jpg/640px-Sille_Dam%2C_Konya.jpg",
    eflatun: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Eflatunp%C4%B1nar_Hittite_Water_Monument_5.jpg/640px-Eflatunp%C4%B1nar_Hittite_Water_Monument_5.jpg"
  };

  /* Mevcut kartlarda kırık/eksik görseli düzelt */
  var FIX = [
    ["Mevlana", IMG.mevlana],
    ["Alaaddin", IMG.alaaddin],
    ["İnce Minareli", IMG.ince],
    ["Karatay Medresesi", IMG.karatay],
    ["Sahip Ata", IMG.sahip],
    ["Sırçalı", IMG.sircali],
    ["Aziziye", IMG.aziziye],
    ["Japon Park", IMG.japon],
    ["Kelebek", IMG.kelebek],
    ["Tropikal", IMG.kelebek],
    ["Panorama", IMG.panorama],
    ["Sille", IMG.sille],
    ["Meram Bağ", IMG.meram],
    ["Çatalhöyük", IMG.catal],
    ["Seyyid Harun", IMG.seyyid],
    ["Tınaztepe Mağarası", IMG.tinaz],
    ["Tınaztepe —", IMG.tinaz2],
    ["Kuğulu", IMG.kugulu],
    ["Fasıllar Hitit", IMG.fasillar],
    ["Lukyanus", IMG.lukyanus],
    ["Beyşehir Gölü", IMG.beygol],
    ["Eşrefoğlu", IMG.esref]
  ];

  function setImg(img, url) {
    if (!img || !url) return;
    img.style.display = "";
    img.removeAttribute("hidden");
    img.onerror = function () {
      this.onerror = null;
      this.style.background = "#e8f5ee";
      this.style.minHeight = "140px";
    };
    if (img.getAttribute("src") !== url) img.src = url;
  }

  document.querySelectorAll("article.place").forEach(function (art) {
    var h = art.querySelector("h2");
    if (!h) return;
    var title = (h.textContent || "").trim();
    var imgs = art.querySelectorAll("img.place-img, img.place-img-sm");
    for (var i = 0; i < FIX.length; i++) {
      if (title.indexOf(FIX[i][0]) !== -1) {
        for (var j = 0; j < imgs.length; j++) setImg(imgs[j], FIX[i][1]);
        break;
      }
    }
    /* Görsel hiç yüklenmemişse de dene */
    imgs.forEach(function (img) {
      if (!img.getAttribute("src")) {
        for (var k = 0; k < FIX.length; k++) {
          if (title.indexOf(FIX[k][0]) !== -1) {
            setImg(img, FIX[k][1]);
            break;
          }
        }
      }
    });
  });

  function card(title, img, alt, desc, tags, lat, lon) {
    var tagsHtml = tags
      .map(function (t) {
        return '<span class="tag">' + t + "</span>";
      })
      .join("");
    return (
      '<article class="place gez-extra">' +
      '<img class="place-img" src="' +
      img +
      '" alt="' +
      alt +
      '" loading="lazy" decoding="async">' +
      '<div class="place-body">' +
      "<h2>" +
      title +
      "</h2>" +
      "<p>" +
      desc +
      "</p>" +
      '<div class="tags">' +
      tagsHtml +
      "</div>" +
      '<div class="place-links"><a class="btn btn-primary btn-sm" href="https://www.google.com/maps/dir/?api=1&destination=' +
      lat +
      "," +
      lon +
      '" target="_blank" rel="noopener">Yol tarifi</a></div>' +
      "</div></article>"
    );
  }

  var modern =
    card("80 Binde Devr-i Alem Parkı", IMG.kultur, "80 Binde Devr-i Alem", "Meram’da üç konseptli tematik park: hareketli dinozorlar, Türk-İslam eser minyatürleri ve masal dünyası. Çocuklu aileler için öne çıkan durak.", ["Aile", "Ücretli", "Çocuk"], "37.8610", "32.4450") +
    card("Karatay Hayvanat Bahçesi", IMG.hayvan, "Karatay Hayvanat Bahçesi", "Karatay’daki geniş hayvanat bahçesi; aile ve çocuk rotasının klasik durağı.", ["Aile", "Doğa", "Ücretli"], "37.8920", "32.5580") +
    card("Konya Bilim Merkezi", IMG.panorama, "Konya Bilim Merkezi", "İnteraktif sergilerle bilimi eğlenceli sunan merkez. Aile ve okul grupları için iç mekân alternatifi.", ["Aile", "Eğitim", "Modern"], "37.9480", "32.5020") +
    card("Meram Millet Bahçesi", IMG.millet, "Meram Millet Bahçesi", "Eski stadyum alanındaki geniş millet bahçesi: yürüyüş ve dinlenme için şehir içi nefes alma noktası.", ["Park", "Ücretsiz", "Yürüyüş"], "37.8715", "32.4845");

  var merkez =
    card("Bedesten Çarşısı", IMG.bedesten, "Bedesten Çarşısı", "Osmanlı bedesteni; tarihi çarşı dokusunda hediyelik ve yerel ürün için merkezde pratik durak.", ["Tarih", "Alışveriş", "Merkez"], "37.8725", "32.4955") +
    card("Kapı Camii", IMG.aziziye, "Kapı Camii", "Merkezdeki tarihi Kapı Camii; çarşı çevresiyle kısa kültür molası.", ["Cami", "Tarih", "Merkez"], "37.8710", "32.4965");

  var yakin =
    card("Akyokuş Kasrı", IMG.akyokus, "Akyokuş Kasrı", "Modern sosyal tesis: kafe-restoran, seyir noktası ve etkinlik alanları. Şehir manzarası molası için.", ["Seyir", "Modern", "Kafe"], "37.8450", "32.4300") +
    card("Kızlar Kayası", IMG.akyokus, "Kızlar Kayası", "Meram Dere’de erozyonla şekillenmiş kayalar; Konya’nın peri bacaları. Kısa yürüyüş ve fotoğraf.", ["Doğa", "Fotoğraf", "Ücretsiz"], "37.8300", "32.4500") +
    card("Sille Baraj Parkı", IMG.silleDam, "Sille Baraj Parkı", "Sille yakınında baraj gölü ve park; piknik ile Sille rotasına doğal devam.", ["Park", "Doğa", "Piknik"], "37.9330", "32.4000") +
    card("Ecdat Parkı", IMG.kultur, "Ecdat Parkı", "Geniş yeşil alan; aile ve yürüyüş için sakin park.", ["Park", "Aile", "Ücretsiz"], "37.9100", "32.4800") +
    card("Kestel Göleti", IMG.silleDam, "Kestel Göleti", "Gölet ve çevresi; gün batımı ve kısa doğa molası.", ["Doğa", "Gölet", "Fotoğraf"], "37.9200", "32.4200") +
    card("Seyir Tepesi Parkı", IMG.akyokus, "Seyir Tepesi Parkı", "Yüksek kotlu park; Konya ovası manzarası için popüler nokta.", ["Seyir", "Park", "Manzara"], "37.9000", "32.4600") +
    card("Kule Site 42. Kat", IMG.kultur, "Kule Site 42. Kat", "Yüksek kattan panoramik şehir manzarası; modern seyir molası.", ["Seyir", "Modern", "Manzara"], "37.8750", "32.4850");

  var bey = card(
    "Eflatunpınar Hitit Su Anıtı",
    IMG.eflatun,
    "Eflatunpınar",
    "Beyşehir yakınında Hitit kutsal su anıtı (MÖ 13. yy). UNESCO geçici listesinde; Fasıllar rotasına tamamlayıcı.",
    ["Hitit", "UNESCO", "Tarih"],
    "37.6660",
    "31.7330"
  );

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
