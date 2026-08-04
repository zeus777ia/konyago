/* KonyaGo — ek yerler + görsel düzeltme (Special:FilePath) */
(function () {
  "use strict";
  if (document.getElementById("gezExtraDone")) return;
  var flag = document.createElement("meta");
  flag.id = "gezExtraDone";
  document.head.appendChild(flag);

  /* Wikimedia Special:FilePath — tarayıcıda stabil çalışır */
  function wiki(file) {
    return (
      "https://commons.wikimedia.org/wiki/Special:FilePath/" +
      encodeURIComponent(file).replace(/%2F/g, "/") +
      "?width=800"
    );
  }

  var IMG = {
    mevlana: wiki("Mevlana_Müzesi_01.jpg"),
    alaaddin: wiki("Alâeddin_Mosque,_Konya_02.jpg"),
    ince: wiki("Ince_Minareli_Medrese_01.jpg"),
    karatay: wiki("Konya_Karatay_Ceramics_Museum_2808.jpg"),
    sahip: wiki("Konya_Sahip_Ata_Vakıflar_Eserleri_Müzesi_exterior_3604.jpg"),
    sircali: wiki("Konya_Sircali_Medrese_3607.jpg"),
    aziziye: wiki("Aziziye_Mosque,_Konya,_Turkey.jpg"),
    japon: wiki("Konya;_Japon_Parkı.jpg"),
    kelebek: wiki("Konya_Tropical_Butterfly_Garden.jpg"),
    panorama: wiki("Interior_of_Konya_Panorama_Museum_152248_04.jpg"),
    sille: wiki("Sille_Village,_Konya.jpg"),
    meram: wiki("Sille_houses_4689.jpg"),
    catal: wiki("Çatalhöyük,_7400_BC,_Konya,_Turkey_-_UNESCO_World_Heritage_Site,_02.jpg"),
    seyyid: wiki("Muallimhane_Mosque,_Seydişehir.JPG"),
    tinaz: wiki("Tınaztepe_mağarası_-_panoramio.jpg"),
    tinaz2: wiki("Tınaztepe_mağarası_1.JPG"),
    kugulu: wiki("Seydişehir_and_Taurus_Mountains_from_Ilıca.jpg"),
    fasillar: wiki("Fasillar.jpg"),
    lukyanus: wiki("Römische_Reliefs_bei_Fasillar.jpg"),
    beygol: wiki("2019-05-08_02.23.01_1_Beyşehir_Gölü,_Beyşehir._Konya.jpg"),
    esref: wiki("Eşrefoğlu_Camii,_Beyşehir,_April_2024_06.jpg"),
    kultur: wiki("KONYA_KÜLTÜR_PARK_-_2025.jpg"),
    hayvan: wiki("Konya_hayvanat_bahçesi_2021.jpg"),
    millet: wiki("Konya_Eski_Stadyum_Yeni_Millet_Bahçesi_49.jpg"),
    bedesten: wiki("Bedesten_çarşısı_Konya.jpg"),
    akyokus: wiki("Konya_Akyokuş_Nature_Park_Konya_Landscape.jpg"),
    silleDam: wiki("Sille_Dam,_Konya.jpg"),
    eflatun: wiki("Eflatunpınar_Hittite_Water_Monument_5.jpg")
  };

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
    img.onerror = function () {
      this.onerror = null;
      /* son çare: gizleme, soluk placeholder */
      this.style.background = "linear-gradient(135deg,#e8f5ee,#d4ebe0)";
      this.style.minHeight = "150px";
      this.style.objectFit = "cover";
    };
    img.style.display = "block";
    img.removeAttribute("hidden");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = url;
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
