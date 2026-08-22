/* kgo-map-fab.js — Map FAB for /harita/ (KonyaGo pins only; random = tarih) */
(function(){
  if (window.__KGO_MAP_FAB_BOOTED) return;
  if (!document.getElementById("map") && !document.getElementById("kg-harita")) return;
  window.__KGO_MAP_FAB_BOOTED = true;

  function $(id){ return document.getElementById(id); }

  function data(){
    var D = window.KG_DATA || {};
    return {
      venues: D.venues || [],
      ilce: D.ilce || [],
      mahalle: D.mahalle || []
    };
  }

  function status(msg){
    var st = $("mapStatus");
    if (st) st.textContent = msg;
  }

  /** Sadece harita pini: sayfa yönlendirmesi yok */
  function focusPin(v){
    if (!v || v.lat == null || v.lng == null) return;
    var map = window.__KG_MAP;
    var id = v.id || "";
    if (map) {
      try { map.flyTo([v.lat, v.lng], 15, { duration: 1.0 }); } catch (e) {}
      setTimeout(function(){
        try {
          if (window.kgFocus && id) window.kgFocus(id);
        } catch (e) {}
      }, 200);
    } else if (window.kgFocus && id) {
      try { window.kgFocus(id); } catch (e) {}
    }
    status("Tarih · " + (v.name || ""));
  }

  window.kgRandom = function(){
    var list = data().venues.filter(function(v){
      return v && v.lat != null && v.lng != null && String(v.cat || "") === "tarih";
    });
    if (!list.length) {
      list = data().venues.filter(function(v){
        return v && v.lat != null && v.lng != null && v.kind !== "ilce" && v.kind !== "mahalle";
      });
    }
    if (!list.length) { status("Tarihî pin bulunamadı"); return; }
    var v = list[Math.floor(Math.random() * list.length)];
    focusPin(v);
  };

  window.kgShowIlce = function(){
    var chip = document.querySelector('#kg-harita .chip[data-cat="ilce"]');
    if (chip) chip.click();
    var ILCE = data().ilce;
    var map = window.__KG_MAP;
    if (map && window.L && ILCE.length) {
      try {
        var pts = ILCE.filter(function(x){ return x.lat != null; }).map(function(x){ return [x.lat, x.lng]; });
        if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.08));
      } catch (e) {}
    }
    status("İlçeler · " + ILCE.length);
  };

  window.kgLocate = function(){
    var map = window.__KG_MAP;
    if (!navigator.geolocation) {
      if (map) map.flyTo([37.8716, 32.5045], 14);
      status("Konum yok · Konya merkez");
      return;
    }
    status("Konum alınıyor…");
    navigator.geolocation.getCurrentPosition(function(pos){
      var lat = pos.coords.latitude, lng = pos.coords.longitude;
      if (map && window.L) {
        map.flyTo([lat, lng], 15, { duration: 0.8 });
        if (window.__KG_ME_MARKER) try { map.removeLayer(window.__KG_ME_MARKER); } catch (e) {}
        window.__KG_ME_MARKER = L.circleMarker([lat, lng], {
          radius: 9, color: "#d4a24e", weight: 2, fillColor: "#2dd4bf", fillOpacity: 0.85
        }).addTo(map).bindPopup("Konumun");
      }
      status("Konumun eklendi");
    }, function(){
      if (map) map.flyTo([37.8716, 32.5045], 14);
      status("Konum alınamadı · Konya merkez");
    }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 });
  };

  function applyDeepLink(){
    try {
      var p = new URLSearchParams(location.search);
      if (p.get("random") || p.get("v") === "random") setTimeout(function(){ window.kgRandom(); }, 1000);
      if (p.get("locate")) setTimeout(function(){ window.kgLocate(); }, 1000);
      if (p.get("cat") === "ilce" || p.get("layer") === "ilce") setTimeout(function(){ window.kgShowIlce(); }, 800);
      if (p.get("cat") === "tarih") {
        setTimeout(function(){
          var chip = document.querySelector('#kg-harita .chip[data-cat="tarih"]');
          if (chip) chip.click();
        }, 700);
      }
      if (p.get("cat") === "mahalle") {
        setTimeout(function(){
          var chip = document.querySelector('#kg-harita .chip[data-cat="mahalle"]');
          if (chip) chip.click();
        }, 700);
      }
    } catch (e) {}
  }

  function injectFab(){
    if ($("kgoMapFab")) return;
    var style = document.createElement("style");
    style.id = "kgo-map-fab-css";
    style.textContent =
      "#kgoMapFab{position:fixed;right:18px;bottom:96px;z-index:10040;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:Inter,system-ui,sans-serif}"+ 
      "#kgoMapFab .kgo-mf-actions{display:flex;flex-direction:column;align-items:flex-end;gap:8px}"+ 
      "#kgoMapFab .kgo-mf-row{display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(8px) scale(.96);transition:opacity .2s ease,transform .2s ease;pointer-events:none}"+ 
      "#kgoMapFab.open .kgo-mf-row{opacity:1;transform:none;pointer-events:auto}"+ 
      "#kgoMapFab .kgo-mf-row:nth-child(1){transition-delay:0ms}"+ 
      "#kgoMapFab .kgo-mf-row:nth-child(2){transition-delay:40ms}"+ 
      "#kgoMapFab .kgo-mf-row:nth-child(3){transition-delay:80ms}"+ 
      "#kgoMapFab .kgo-mf-label{background:rgba(14,42,61,.92);color:#f4ede0;border:1px solid rgba(212,162,78,.35);padding:7px 12px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.35)}"+ 
      "#kgoMapFab .kgo-mf-btn{width:44px;height:44px;border-radius:50%;border:1px solid rgba(212,162,78,.4);background:rgba(14,42,61,.95);color:#e8c07a;display:grid;place-items:center;cursor:pointer;font-size:18px;box-shadow:0 10px 28px rgba(0,0,0,.4)}"+ 
      "#kgoMapFab .kgo-mf-main{width:56px;height:56px;border-radius:50%;border:0;background:linear-gradient(135deg,#d4a24e,#b98434);color:#0a1f2e;font-size:26px;font-weight:700;cursor:pointer;box-shadow:0 14px 36px rgba(212,162,78,.4);display:grid;place-items:center;transition:transform .2s ease}"+ 
      "#kgoMapFab.open .kgo-mf-main{transform:rotate(45deg)}"+ 
      "@media(max-width:782px){#kgoMapFab{bottom:84px;right:14px}}";
    document.head.appendChild(style);

    var root = document.createElement("div");
    root.id = "kgoMapFab";
    root.innerHTML =
      '<div class="kgo-mf-actions">'+
        '<div class="kgo-mf-row"><span class="kgo-mf-label">Rastgele tarih</span><button type="button" class="kgo-mf-btn" data-act="random" aria-label="Rastgele tarihî mekân">🎲</button></div>'+
        '<div class="kgo-mf-row"><span class="kgo-mf-label">İlçeler</span><button type="button" class="kgo-mf-btn" data-act="ilce" aria-label="İlçeler">🗺️</button></div>'+
        '<div class="kgo-mf-row"><span class="kgo-mf-label">Konumum</span><button type="button" class="kgo-mf-btn" data-act="locate" aria-label="Konum">📍</button></div>'+
      '</div>'+
      '<button type="button" class="kgo-mf-main" aria-label="Harita eylemleri" aria-expanded="false">+</button>';
    document.body.appendChild(root);

    var main = root.querySelector(".kgo-mf-main");
    main.addEventListener("click", function(){
      var open = root.classList.toggle("open");
      main.setAttribute("aria-expanded", open ? "true" : "false");
    });
    root.querySelectorAll("[data-act]").forEach(function(btn){
      btn.addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        var act = btn.getAttribute("data-act");
        root.classList.remove("open");
        main.setAttribute("aria-expanded", "false");
        if (act === "random") window.kgRandom();
        if (act === "ilce") window.kgShowIlce();
        if (act === "locate") window.kgLocate();
      });
    });
  }

  function boot(){
    injectFab();
    applyDeepLink();
  }

  var n = 0, t = setInterval(function(){
    n++;
    if (window.__KG_LIVE_BOOTED || window.__KG_MAP || n > 80) {
      clearInterval(t);
      boot();
    }
  }, 200);
})();
