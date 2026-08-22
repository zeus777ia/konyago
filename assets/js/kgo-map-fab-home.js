/* kgo-map-fab-home.js — Map FAB above AI FAB on homepage */
(function(){
  if (window.__KGO_HOME_MAP_FAB) return;
  window.__KGO_HOME_MAP_FAB = true;
  if (!document.getElementById("kgo-live-ai") && !(document.body && document.body.classList.contains("home"))) return;

  var css = document.createElement("style");
  css.id = "kgo-home-map-fab-css";
  css.textContent =
    "#kgoHomeMapFab{position:fixed;right:22px;bottom:92px;z-index:10055;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:Inter,system-ui,sans-serif}"+ 
    "#kgoHomeMapFab .row{display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(8px) scale(.96);transition:opacity .2s ease,transform .2s ease;pointer-events:none}"+ 
    "#kgoHomeMapFab.open .row{opacity:1;transform:none;pointer-events:auto}"+ 
    "#kgoHomeMapFab .row:nth-child(1){transition-delay:0ms}"+ 
    "#kgoHomeMapFab .row:nth-child(2){transition-delay:40ms}"+ 
    "#kgoHomeMapFab .row:nth-child(3){transition-delay:80ms}"+ 
    "#kgoHomeMapFab .lbl{background:rgba(10,31,46,.92);color:#f4ede0;border:1px solid rgba(212,162,78,.35);padding:7px 12px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.35)}"+ 
    "#kgoHomeMapFab .btn{width:44px;height:44px;border-radius:50%;border:1px solid rgba(212,162,78,.4);background:rgba(14,42,61,.95);color:#e8c07a;display:grid;place-items:center;cursor:pointer;font-size:17px;box-shadow:0 10px 28px rgba(0,0,0,.4)}"+ 
    "#kgoHomeMapFab .main{width:52px;height:52px;border-radius:50%;border:0;background:linear-gradient(135deg,#2dd4bf,#0d9488);color:#042f2e;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 14px 36px rgba(45,212,191,.35);display:grid;place-items:center;transition:transform .2s ease}"+ 
    "#kgoHomeMapFab.open .main{transform:rotate(45deg);font-size:22px}"+ 
    "@media(max-width:782px){#kgoHomeMapFab{right:14px;bottom:148px}#kgoHomeMapFab .main{width:48px;height:48px}}";
  document.head.appendChild(css);

  var root = document.createElement("div");
  root.id = "kgoHomeMapFab";
  root.innerHTML =
    '<div class="row"><span class="lbl">Rastgele mekân</span><button type="button" class="btn" data-go="/harita/?random=1" aria-label="Rastgele mekân">🎲</button></div>'+
    '<div class="row"><span class="lbl">İlçeler</span><button type="button" class="btn" data-go="/harita/?cat=ilce" aria-label="İlçeler">🗺️</button></div>'+
    '<div class="row"><span class="lbl">Haritayı aç</span><button type="button" class="btn" data-go="/harita/" aria-label="Harita">✦</button></div>'+
    '<button type="button" class="main" aria-label="Harita menüsü" aria-expanded="false">MAP</button>';
  document.body.appendChild(root);

  var main = root.querySelector(".main");
  main.addEventListener("click", function(){
    var open = root.classList.toggle("open");
    main.setAttribute("aria-expanded", open ? "true" : "false");
    main.textContent = open ? "+" : "MAP";
  });
  root.querySelectorAll("[data-go]").forEach(function(btn){
    btn.addEventListener("click", function(){
      location.href = btn.getAttribute("data-go");
    });
  });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") {
      root.classList.remove("open");
      main.setAttribute("aria-expanded", "false");
      main.textContent = "MAP";
    }
  });
})();
