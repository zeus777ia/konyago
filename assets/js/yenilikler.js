/* KonyaGo yenilikler — konsepti bozmadan ek özellikler */
(function (w, d) {
  "use strict";
  if (d.getElementById("kgYenilikDone")) return;
  var meta = d.createElement("meta");
  meta.id = "kgYenilikDone";
  d.head.appendChild(meta);

  function dayIndex() {
    var t = new Date();
    var start = new Date(t.getFullYear(), 0, 0);
    return Math.floor((t - start) / 86400000);
  }

  var PLACES = [
    { name: "Mevlana Müzesi", tip: "Ücretsiz · genelde 17:00’e kadar", href: "gezilecek.html" },
    { name: "Sille", tip: "Taş sokaklar · Aya Eleni", href: "sille.html" },
    { name: "Alaaddin Tepesi", tip: "Şehir manzarası + kısa yürüyüş", href: "gezilecek.html" },
    { name: "Japon Parkı", tip: "Aile · gölet · dinlenme", href: "gezilecek.html" },
    { name: "Fasıllar Hitit Anıtı", tip: "Beyşehir günübirlik", href: "gezilecek.html#fasillar" },
    { name: "Meram Bağları", tip: "Akşam serinliği · yürüyüş", href: "gezilecek.html" },
    { name: "Çatalhöyük", tip: "UNESCO · araçlı rota", href: "gezilecek.html" }
  ];
  var FOODS = [
    { name: "Etli ekmek", href: "etli-ekmek.html" },
    { name: "Fırın kebabı", href: "mutfak.html" },
    { name: "Bamya çorbası", href: "mutfak.html" },
    { name: "Tirit", href: "mutfak.html" },
    { name: "Cezerye molası", href: "hediyelik.html" }
  ];

  var ROUTES = {
    30: {
      title: "30 dakika",
      items: ["Mevlana Müzesi (dış cephe + avlu)", "Kısa çarşı yürüyüşü", "Çay molası"]
    },
    60: {
      title: "60 dakika",
      items: ["Mevlana Müzesi", "Alaaddin Tepesi manzarası", "Merkezde etli ekmek"]
    },
    120: {
      title: "2 saat",
      items: ["Mevlana + İnce Minare / Karatay", "Çarşı", "Sille’ye geçiş hazırlığı"]
    }
  };

  var BADGES = [
    { id: "mevlana", ico: "🕌", title: "Mevlana", desc: "Müzeyi gezdim" },
    { id: "sille", ico: "🏘️", title: "Sille", desc: "Köyü dolaştım" },
    { id: "etli", ico: "🫓", title: "Etli ekmek", desc: "Tattım" },
    { id: "fasillar", ico: "🗿", title: "Fasıllar", desc: "Hitit anıtını gördüm" },
    { id: "meram", ico: "🌿", title: "Meram", desc: "Bağlarda yürüdüm" }
  ];

  var SPOTS = [
    { name: "Mevlana yeşil kubbe", tip: "Batıdan akşam ışığı", q: "Mevlana Müzesi Konya" },
    { name: "Sille taş sokak", tip: "Dar sokak perspektif", q: "Sille Konya" },
    { name: "Alaaddin manzara", tip: "Tepeden şehir", q: "Alaaddin Tepesi Konya" },
    { name: "Fasıllar anıtı", tip: "Anıtın tam cephesi", q: "Fasıllar Hitit Anıtı" }
  ];

  var AUDIO = w.KonyaGoAudio || {};

  function $(sel, root) {
    return (root || d).querySelector(sel);
  }

  function el(html) {
    var t = d.createElement("div");
    t.innerHTML = html.trim();
    return t.firstChild;
  }

  function enhanceToday() {
    var box = $("#todayPlan");
    if (!box) return;
    var i = dayIndex();
    var p = PLACES[i % PLACES.length];
    var f = FOODS[i % FOODS.length];
    var extra = el(
      '<div class="kg-daily" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border,rgba(13,122,79,.15))">' +
        '<div class="row"><span class="pill">Günün mekanı</span><div><strong>' +
        p.name +
        "</strong><br><span style=\"font-size:.85rem;color:var(--muted)\">" +
        p.tip +
        ' · <a href="' +
        p.href +
        '">Detay</a></span></div></div>' +
        '<div class="row"><span class="pill">Günün lezzeti</span><div><strong>' +
        f.name +
        '</strong> · <a href="' +
        f.href +
        '">Mutfak</a></div></div>' +
        '<div class="row" style="margin-top:6px"><a class="btn btn-ghost btn-sm" href="rotalar.html">Rota seç</a> <a class="btn btn-ghost btn-sm" href="ai.html">AI ile planla</a></div>' +
        "</div>"
    );
    box.appendChild(extra);
  }

  function injectRoutes() {
    var anchor = $("#todayPlan") || $(".feat-grid");
    if (!anchor || $("#kgRoutes")) return;
    var html =
      '<div class="kg-block" id="kgRoutes">' +
      "<h3>Kısa rotalar</h3>" +
      "<p>Zamanına göre seç — aynı günde birleştirebilirsin.</p>" +
      '<div class="kg-grid3">';
    [30, 60, 120].forEach(function (k) {
      var r = ROUTES[k];
      html +=
        '<a class="kg-route" href="rotalar.html">' +
        "<strong>" +
        r.title +
        "</strong>" +
        "<span>Pratik şehir içi</span><ul>";
      r.items.forEach(function (it) {
        html += "<li>" + it + "</li>";
      });
      html += "</ul></a>";
    });
    html += "</div></div>";
    anchor.parentNode.insertBefore(el(html), anchor.nextSibling);
  }

  function injectBadges() {
    var after = $("#kgRoutes") || $("#todayPlan");
    if (!after || $("#kgBadges")) return;
    var key = "konyago_badges_v1";
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(key) || "{}") || {};
    } catch (e) {}
    var wrap = el(
      '<div class="kg-block" id="kgBadges"><h3>Yerel gibi gez</h3><p>Gezdiğin yerleri işaretle — sadece sende saklanır.</p><div class="kg-badge-row"></div></div>'
    );
    var row = wrap.querySelector(".kg-badge-row");
    BADGES.forEach(function (b) {
      var node = el(
        '<div class="kg-badge' +
          (saved[b.id] ? " done" : "") +
          '" data-id="' +
          b.id +
          '"><span class="ico">' +
          b.ico +
          "</span><strong>" +
          b.title +
          "</strong><small>" +
          b.desc +
          "</small></div>"
      );
      node.addEventListener("click", function () {
        saved[b.id] = !saved[b.id];
        try {
          localStorage.setItem(key, JSON.stringify(saved));
        } catch (e) {}
        node.classList.toggle("done", !!saved[b.id]);
      });
      row.appendChild(node);
    });
    after.parentNode.insertBefore(wrap, after.nextSibling);
  }

  function injectSpots() {
    var after = $("#kgBadges") || $("#kgRoutes");
    if (!after || $("#kgSpots")) return;
    var html =
      '<div class="kg-block" id="kgSpots"><h3>Fotoğraf noktaları</h3><p>Instagram için net açı önerileri.</p><div class="kg-spot">';
    SPOTS.forEach(function (s) {
      html +=
        '<a href="https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(s.q) +
        '" target="_blank" rel="noopener"><span><strong>' +
        s.name +
        "</strong><br><small>" +
        s.tip +
        "</small></span><span>Harita →</span></a>";
    });
    html += "</div></div>";
    after.parentNode.insertBefore(el(html), after.nextSibling);
  }

  function injectRain() {
    var after = $("#kgSpots") || $("#kgBadges");
    if (!after || $("#kgRain")) return;
    var node = el(
      '<div class="kg-block kg-rain" id="kgRain">' +
        "<h3>Yağmur yağarsa</h3>" +
        "<p>Kapalı plan: Mevlana Müzesi → Karatay / İnce Minareli medreseler → Bedesten çarşısı → sıcak çorba veya etli ekmek.</p>" +
        '<div class="link-row">' +
        '<a class="btn btn-primary btn-sm" href="gezilecek.html">Kapalı mekanlar</a>' +
        '<a class="btn btn-ghost btn-sm" href="mutfak.html">Mutfak</a>' +
        '<a class="btn btn-ghost btn-sm" href="ai.html">AI’ya sor</a></div></div>'
    );
    after.parentNode.insertBefore(node, after.nextSibling);

    try {
      fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=37.87&longitude=32.49&current=weather_code&timezone=Europe%2FIstanbul"
      )
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          var code = (data.current && data.current.weather_code) || 0;
          if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].indexOf(code) >= 0) {
            node.style.order = "-1";
            node.style.boxShadow = "0 0 0 2px #4a90d9";
            var h = node.querySelector("h3");
            if (h) h.textContent = "Şu an yağmurlu — kapalı rota";
          }
        })
        .catch(function () {});
    } catch (e) {}
  }

  function injectQuiz() {
    var after = $("#kgRain") || $("#kgSpots");
    if (!after || $("#kgQuiz")) return;
    var node = el(
      '<div class="kg-block kg-quiz-box" id="kgQuiz">' +
        "<h3>Sen hangi Konya tipisin?</h3>" +
        "<p>5 kısa soru — sana özel rota önerisi.</p>" +
        '<a class="btn btn-sm" href="quiz.html">Quiz’e başla</a></div>'
    );
    after.parentNode.insertBefore(node, after.nextSibling);
  }

  function injectAudioHints() {
    var map = [
      { match: "Mevlana", key: "mevlana" },
      { match: "Sille", key: "sille" },
      { match: "Alaaddin", key: "alaaddin" }
    ];
    d.querySelectorAll(".feat-card, article.place").forEach(function (card) {
      var title = (card.textContent || "").trim();
      map.forEach(function (m) {
        if (title.indexOf(m.match) === -1) return;
        if (card.querySelector(".kg-audio-btn")) return;
        var btn = d.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-ghost btn-sm kg-audio-btn";
        btn.textContent = "🎧 60 sn dinle";
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var text = (w.KonyaGoAudio && w.KonyaGoAudio[m.key]) || AUDIO[m.key];
          if (w.KonyaGoSpeak) w.KonyaGoSpeak(text, btn);
          else if (w.KonyaGoFeatures && w.KonyaGoFeatures.speak) w.KonyaGoFeatures.speak(text, btn);
        });
        var body = card.querySelector(".feat-overlay, .place-body") || card;
        body.appendChild(btn);
      });
    });
  }

  function boot() {
    try {
      if (w.speechSynthesis) w.speechSynthesis.getVoices();
    } catch (e) {}
    enhanceToday();
    injectRoutes();
    injectBadges();
    injectSpots();
    injectRain();
    injectQuiz();
    injectAudioHints();
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 50);
})(window, document);
