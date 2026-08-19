(function(){
  if (window.__KG_LIVE_BOOTED) return;
  function ready(){
    var DATA = window.KG_DATA || {venues:[], ilce:[]};
    var VENUES = DATA.venues || [];
    var ILCE = DATA.ilce || [];
    if (!window.L || !document.getElementById("map")) return;
    window.__KG_LIVE_BOOTED = true;
    var CATNAMES = {tarih:"Tarih & Kültür", yeme:"Yeme–İçme", doga:"Doğa", semt:"Semt", ilce:"İlçe"};
    var PHARMACIES = [
      {name:"ÇELİK ECZANESİ", region:"1. Bölge · Selçuklu", lat:37.9180, lng:32.4920},
      {name:"MARTI ECZANESİ", region:"2. Bölge · Selçuklu", lat:37.9550, lng:32.5120},
      {name:"MASAL ECZANESİ", region:"3. Bölge · Meram–Selçuklu", lat:37.8820, lng:32.4560},
      {name:"ESMA AKTÜRK ECZANESİ", region:"4. Bölge · Meram", lat:37.8450, lng:32.4280},
      {name:"NİSAN ECZANESİ", region:"5. Bölge · Karatay–Selçuklu", lat:37.8890, lng:32.5210},
      {name:"LALEZAR ECZANESİ", region:"6. Bölge", lat:37.8660, lng:32.4700},
      {name:"EROĞLU ECZANESİ", region:"7. Bölge · Karatay", lat:37.8590, lng:32.5350},
      {name:"AKINCILAR ECZANESİ", region:"8. Bölge · Selçuklu", lat:37.9060, lng:32.4680},
      {name:"AKDENİZ ECZANESİ", region:"9. Bölge · Selçuklu", lat:37.9330, lng:32.5450}
    ];
    var ROUTES = {klasik:["mevlana","inceminare","alaeddin","meram"],tarih:["karatay","sahipata","carsi"],sille:["sille","sille-ayaelenia"],doga:["beysehir","esrefoglu"],aile:["kelebek","japonparki","alaeddin"]};
    var markers={}, routeLine=null, myRoute=[], pharmLayer=null, map, mekanCluster, ilceCluster;
    var favs=new Set(JSON.parse(localStorage.getItem("kg_favs")||"[]"));
    function $(id){return document.getElementById(id);}
    function findAny(id){return VENUES.find(function(x){return x.id===id;})||ILCE.find(function(x){return x.id===id;});}
    function pinIcon(){return L.divIcon({className:"",iconSize:[26,26],iconAnchor:[13,24],popupAnchor:[0,-22],html:'<div class="gold-pin"><div class="pulse"></div><div class="pin-core"><span>✦</span></div></div>'});}
    function pharmIcon(){return L.divIcon({className:"",iconSize:[22,22],iconAnchor:[11,20],popupAnchor:[0,-18],html:'<div class="pharm-pin"><div class="pin-core"><span>✚</span></div></div>'});}
    function ilceIcon(){return L.divIcon({className:"",iconSize:[28,28],iconAnchor:[14,14],popupAnchor:[0,-14],html:'<div class="ilce-pin"><div class="pin-core">İ</div></div>'});}
    function clusterGroup(kind){
      if(typeof L.markerClusterGroup!=="function") return L.layerGroup();
      return L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:kind==="ilce"?36:48,spiderfyOnMaxZoom:true,disableClusteringAtZoom:kind==="ilce"?10:16,
        iconCreateFunction:function(c){var n=c.getChildCount(),size=n>80?48:n>20?40:32;return L.divIcon({html:'<div class="kg-cluster '+kind+'" style="width:'+size+'px;height:'+size+'px"><span>'+n+'</span></div>',className:"",iconSize:[size,size]});}});
    }
    function popupHTML(v){
      if(v.kind==="ilce"){return '<div class="pop-body"><h4>'+v.name+'</h4><div class="pop-tags"><span>İlçe</span><span>'+(v.kids||0)+' mahalle</span></div><p style="font-size:.75rem;color:var(--muted);margin:0 0 12px;line-height:1.5">'+(v.desc||"")+'</p><div class="pop-actions"><button class="pop-btn" onclick="window.kgFocus(\''+v.id+'\')">Haritada aç</button><button class="pop-btn ghost" onclick="window.kgModal(\''+v.id+'\')">Detay</button></div></div>';}
      var img=v.img?'<img src="'+v.img+'" alt="">':(v.icon||"");
      var tags=(v.tags||[]).map(function(t){return "<span>"+t+"</span>";}).join("");
      return '<div class="pop-img">'+img+'</div><div class="pop-body"><h4>'+v.name+'</h4><div class="pop-tags">'+tags+'</div><div class="pop-meta">'+(v.rating?'<span>★ '+v.rating+'</span>':'')+'<span>📍 '+(v.dist||"")+'</span></div><p style="font-size:.75rem;color:var(--muted);margin:0 0 12px;line-height:1.5">'+(v.desc||"")+'</p><div class="pop-actions"><button class="pop-btn" id="add-'+v.id+'" onclick="window.kgAdd(\''+v.id+'\')">+ Rotaya Ekle</button><button class="pop-btn ghost" onclick="window.kgModal(\''+v.id+'\')">Detay</button></div></div>';
    }
    function addVenueMarker(v){if(v.lat==null||markers[v.id])return;var m=L.marker([v.lat,v.lng],{icon:pinIcon()}).bindPopup(popupHTML(v),{className:"map-card",closeButton:true});markers[v.id]=m;mekanCluster.addLayer(m);}
    function addIlceMarker(v){if(v.lat==null||markers[v.id])return;var m=L.marker([v.lat,v.lng],{icon:ilceIcon(),zIndexOffset:400}).bindPopup(popupHTML(v),{className:"map-card",closeButton:true});markers[v.id]=m;ilceCluster.addLayer(m);}
    function updateCounts(){var cm=$("cntMekan"),st=$("mapStatus"),sp=$("statPins");if(cm)cm.textContent=VENUES.length;if(sp)sp.textContent=(VENUES.length+ILCE.length).toLocaleString("tr-TR");if(st)st.textContent=VENUES.length+" mekân · "+ILCE.length+" ilçe";}
    function renderList(filter,q){
      var list=$("venueList"); if(!list)return; list.innerHTML="";
      var qq=(q||"").toLowerCase();
      var match=function(v){return !qq||(v.name||"").toLowerCase().indexOf(qq)>-1||(v.dist||"").toLowerCase().indexOf(qq)>-1;};
      var items;
      if(filter==="fav") items=VENUES.filter(function(v){return favs.has(v.id)&&match(v);});
      else if(filter==="ilce") items=ILCE.filter(match);
      else if(filter&&filter!=="all") items=VENUES.filter(function(v){return v.cat===filter&&match(v);});
      else if(qq) items=VENUES.concat(ILCE).filter(match);
      else items=VENUES.filter(match);
      if(!items.length){list.innerHTML='<p style="color:var(--muted);font-size:.8rem;padding:12px">Sonuç bulunamadı.</p>';return;}
      items.slice(0,160).forEach(function(v){
        var el=document.createElement("div"); el.className="venue-card"; el.id="vc-"+v.id;
        var thumb=v.img?'<img src="'+v.img+'" alt="">':(v.icon||"📍");
        var catLabel=CATNAMES[v.cat]||v.kind||"";
        var meta=v.kind==="ilce"?((v.kids||0)+" mahalle"):(catLabel+(v.rating?" · ★ "+v.rating:""));
        el.innerHTML='<div class="venue-thumb">'+thumb+'</div><div><h4>'+v.name+'</h4><div class="meta">'+meta+'</div></div><span class="dist">'+(v.dist||"")+'</span>'+(v.kind==="ilce"?"":'<button class="fav-heart '+(favs.has(v.id)?"on":"")+'" data-id="'+v.id+'">♥</button>');
        el.onclick=function(e){if(e.target.classList.contains("fav-heart")){window.kgFav(v.id,e);return;}window.kgFocus(v.id);};
        list.appendChild(el);
      });
    }
    function saveFavs(){localStorage.setItem("kg_favs",JSON.stringify(Array.from(favs)));}
    window.kgFav=function(id,ev){if(ev)ev.stopPropagation();if(favs.has(id))favs.delete(id);else favs.add(id);saveFavs();document.querySelectorAll('.fav-heart[data-id="'+id+'"]').forEach(function(h){h.classList.toggle("on",favs.has(id));});};
    window.kgFocus=function(id){var v=findAny(id);if(!v||v.lat==null)return;$("kesfet").scrollIntoView({behavior:"smooth"});var z=v.kind==="ilce"?10:(id==="beysehir"||id==="catalhoyuk"?11:15);setTimeout(function(){map.flyTo([v.lat,v.lng],z,{duration:1.2});setTimeout(function(){if(markers[id])markers[id].openPopup();},1200);},280);};
    function drawRoute(){if(routeLine)map.removeLayer(routeLine);if(myRoute.length<2)return;var pts=myRoute.map(function(id){var v=VENUES.find(function(x){return x.id===id;});return v?[v.lat,v.lng]:null;}).filter(Boolean);routeLine=L.polyline(pts,{color:"#d4a24e",weight:3,opacity:.9,dashArray:"1 8"}).addTo(map);}
    function updateMyRouteUI(){
      var fab=$("myrouteFab"); if(!fab)return; fab.style.display=myRoute.length?"flex":"none";
      $("myrouteCount").textContent=myRoute.length;
      var body=$("myrouteBody"); body.innerHTML="";
      myRoute.forEach(function(id,i){var v=VENUES.find(function(x){return x.id===id;});if(!v)return;body.insertAdjacentHTML("beforeend",'<div class="route-stop"><span class="num">'+(i+1)+'</span><div><b>'+v.name+'</b><small>'+(CATNAMES[v.cat]||"")+' · '+(v.dist||"")+'</small></div><button class="rm" onclick="window.kgRemove(\''+id+'\')">×</button></div>');});
      var km=0;for(var i=1;i<myRoute.length;i++){var a=VENUES.find(function(x){return x.id===myRoute[i-1];}),b=VENUES.find(function(x){return x.id===myRoute[i];});if(a&&b){var R=6371,dLa=(b.lat-a.lat)*Math.PI/180,dLo=(b.lng-a.lng)*Math.PI/180;var h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLo/2)*Math.sin(dLo/2);km+=2*R*Math.asin(Math.sqrt(h));}}
      $("myrouteSummary").textContent=myRoute.length?(myRoute.length+" durak · sırayla gez"):"Henüz durak eklemedin";
      $("myrouteInfo").innerHTML=myRoute.length>1?("≈ <b>"+km.toFixed(1)+" km</b>"):"Durak ekledikçe mesafe hesaplanır";
    }
    window.kgAdd=function(id){var v=VENUES.find(function(x){return x.id===id;});if(!v)return;if(myRoute.indexOf(id)<0)myRoute.push(id);var btn=$("add-"+id);if(btn){btn.textContent="✓ Rotada";btn.classList.add("added");}drawRoute();updateMyRouteUI();var toast=$("routeToast");$("routeCount").textContent=myRoute.length;toast.style.display="flex";setTimeout(function(){toast.style.display="none";},2800);};
    window.kgRemove=function(id){myRoute=myRoute.filter(function(x){return x!==id;});drawRoute();updateMyRouteUI();};
    window.kgClear=function(){myRoute=[];drawRoute();updateMyRouteUI();};
    window.kgToggleRoute=function(force){var p=$("myroutePanel");var open=force!==undefined?force:!p.classList.contains("open");p.classList.toggle("open",open);};
    window.kgLoadRoute=function(key){myRoute=(ROUTES[key]||[]).slice();drawRoute();updateMyRouteUI();$("kesfet").scrollIntoView({behavior:"smooth"});var pts=myRoute.map(function(id){var v=VENUES.find(function(x){return x.id===id;});return v?[v.lat,v.lng]:null;}).filter(Boolean);setTimeout(function(){if(pts.length>1)map.flyToBounds(L.latLngBounds(pts).pad(0.25),{duration:1.2});else if(pts[0])map.flyTo(pts[0],13,{duration:1.2});},400);};
    window.kgPharm=function(){var btn=$("pharmBtn");if(pharmLayer){map.removeLayer(pharmLayer);pharmLayer=null;btn.classList.remove("on");return;}pharmLayer=L.layerGroup();PHARMACIES.forEach(function(p){L.marker([p.lat,p.lng],{icon:pharmIcon()}).addTo(pharmLayer).bindPopup('<div class="pop-body"><h4>💊 '+p.name+'</h4><div class="pop-tags"><span>'+p.region+'</span></div><p style="font-size:.72rem;color:var(--muted)">Kaynak: 5. Bölge Konya Eczacı Odası</p></div>',{className:"map-card"});});pharmLayer.addTo(map);btn.classList.add("on");};
    window.kgLayer=function(key){var btn=$(key==="mekan"?"layerMekan":"layerIlce");var layer=key==="mekan"?mekanCluster:ilceCluster;if(map.hasLayer(layer)){map.removeLayer(layer);btn.classList.remove("on");}else{layer.addTo(map);btn.classList.add("on");}};
    window.kgModal=function(id){
      var v=findAny(id);if(!v)return;
      var isPlace=!v.kind||v.kind==="mekan";
      var img=v.img?'<img src="'+v.img+'" alt="">':"";
      var catLabel=CATNAMES[v.cat]||(v.kind==="ilce"?"İlçe":"");
      $("modalContent").innerHTML='<div class="modal-hero">'+img+'<span class="icon">'+(v.img?"":(v.icon||""))+'</span><button class="modal-close" onclick="window.kgClose()">×</button></div><div class="modal-body"><h3>'+v.name+'</h3><div class="modal-tags">'+[catLabel].concat(v.tags||[]).filter(Boolean).map(function(t){return "<span>"+t+"</span>";}).join("")+'</div><div class="modal-meta">'+(v.rating?"<span>★ <b>"+v.rating+"</b></span>":"")+'<span>📍 <b>'+(v.dist||"Konya")+'</b></span>'+(v.hours?"<span>🕐 <b>"+v.hours+"</b></span>":"")+'</div><div class="modal-cols"><div><h5>Hakkında</h5><p>'+(v.d||v.long||v.desc||"")+'</p></div><div class="modal-side">'+(v.hours?'<div class="row"><span>Çalışma saati</span><b>'+v.hours+'</b></div>':'')+(v.fee?'<div class="row"><span>Giriş</span><b>'+v.fee+'</b></div>':'')+'<div class="row"><span>Kategori</span><b>'+catLabel+'</b></div><div class="row"><span>Konum</span><b>'+(v.dist||"Konya")+'</b></div></div></div><div class="modal-actions">'+(isPlace?'<button class="pop-btn" onclick="window.kgAdd(\''+id+'\');window.kgClose()">+ Rotaya Ekle</button>':'')+'<button class="pop-btn ghost" onclick="window.kgClose();window.kgFocus(\''+id+'\')">Haritada Göster</button></div></div>';
      $("venueModal").classList.add("open");
    };
    window.kgClose=function(){$("venueModal").classList.remove("open");};
    window.kgToggleAI=function(force){var p=$("aiPanel");var open=force!==undefined?force:!p.classList.contains("open");p.classList.toggle("open",open);if(open){var i=$("aiInput");if(i)i.focus();}};
    function addMsg(html,kind){var body=$("aiBody");var d=document.createElement("div");d.className="msg "+kind;if(kind==="user")d.textContent=html;else d.innerHTML=html;body.appendChild(d);body.scrollTop=body.scrollHeight;return d;}
    function localAnswer(q){
      var ql=q.toLowerCase();
      if(/rota|1 gün|günlük|tarih rotası/.test(ql)) return 'Sabah <a onclick="window.kgFocus(\'mevlana\')">Mevlâna Müzesi</a>, öğle etli ekmek, öğleden sonra <a onclick="window.kgFocus(\'inceminare\')">İnce Minare</a> ve Alaeddin. <a onclick="window.kgLoadRoute(\'klasik\')">Klasik rotayı yükle →</a>';
      if(/sille/.test(ql)) return '<a onclick="window.kgFocus(\'sille\')">Sille</a> merkeze 8 km. Aya Elenia ve taş sokaklar — yarım günlük sakin keşif.';
      if(/etli|yemek|lezzet/.test(ql)) return 'Etli ekmek Konya\'nın imzası. <a onclick="window.kgFocus(\'etliekmek\')">Lezzet pinlerini aç →</a>';
      if(/çatal|catal/.test(ql)) return '<a onclick="window.kgFocus(\'catalhoyuk\')">Çatalhöyük</a> UNESCO, merkeze ~45 km.';
      if(/beyşehir|göl|doğa|doga/.test(ql)) return '<a onclick="window.kgFocus(\'beysehir\')">Beyşehir Gölü</a> tam günlük rota.';
      if(/eczane|nöbetçi|nobetci/.test(ql)) return 'Nöbetçi eczaneler turkuaz pin. <a onclick="window.kgPharm()">Haritada aç →</a>';
      if(/müze|muze/.test(ql)) return 'Öne çıkanlar: <a onclick="window.kgFocus(\'mevlana\')">Mevlâna</a>, <a onclick="window.kgFocus(\'karatay\')">Karatay</a>, <a onclick="window.kgFocus(\'inceminare\')">İnce Minare</a>.';
      return null;
    }
    function getNonce(){if(window.kgoAi&&window.kgoAi.nonce)return {nonce:window.kgoAi.nonce,endpoint:window.kgoAi.endpoint||"/wp-admin/admin-ajax.php"};if(window.kgo_ai&&window.kgo_ai.nonce)return {nonce:window.kgo_ai.nonce,endpoint:window.kgo_ai.endpoint||"/wp-admin/admin-ajax.php"};return {nonce:"",endpoint:"/wp-admin/admin-ajax.php"};}
    window.kgAsk=function(preset){
      var input=$("aiInput"); var q=(preset||(input&&input.value)||"").trim(); if(!q)return;
      addMsg(q,"user"); if(input)input.value="";
      var wait=addMsg("Yanıt hazırlanıyor…","bot");
      function finish(html){wait.remove();addMsg(html,"bot");}
      function fallback(){var loc=localAnswer(q);finish((loc||"Daha spesifik sor — ilçe, lezzet, eczane veya rota.")+'<br><br><a href="https://konyago.com.tr/konyago-ai/">Tam sayfa KonyaGo AI →</a>');}
      var cfg=getNonce();
      if(!cfg.nonce){setTimeout(fallback,350);return;}
      fetch(cfg.endpoint,{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:new URLSearchParams({action:"kgo_ai_ask",nonce:cfg.nonce,question:q}).toString()})
        .then(function(r){return r.json();})
        .then(function(p){if(!p||!p.success)throw new Error();var ans=(p.data&&p.data.answer)||"";var srcs=(p.data&&p.data.sources)||[];var extra="";if(srcs.length)extra="<br><br><b>Kaynaklar</b><br>"+srcs.slice(0,5).map(function(s){return s&&s.url?('<a href="'+s.url+'">'+(s.title||"Kaynak")+"</a>"):"";}).join("<br>");finish((ans||"Yanıt alınamadı.")+extra);})
        .catch(fallback);
    };
    if(window.__KG_MAP){try{window.__KG_MAP.remove();}catch(e){}}
    $("map").innerHTML="";
    map=L.map("map",{zoomControl:true,scrollWheelZoom:true}).setView([37.87,32.49],9);
    window.__KG_MAP=map;
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{attribution:"© OpenStreetMap · CARTO",maxZoom:19}).addTo(map);
    mekanCluster=clusterGroup("mekan"); ilceCluster=clusterGroup("ilce");
    VENUES.forEach(addVenueMarker); ILCE.forEach(addIlceMarker);
    mekanCluster.addTo(map); ilceCluster.addTo(map);
    try{map.fitBounds(L.latLngBounds(VENUES.concat(ILCE).filter(function(x){return x.lat!=null;}).map(function(x){return [x.lat,x.lng];})).pad(0.08),{animate:false});}catch(e){}
    updateCounts(); renderList("all","");
    setTimeout(function(){try{map.invalidateSize();}catch(e){}},350);
    var chips=$("chips"); if(chips) chips.addEventListener("click",function(e){if(!e.target.classList.contains("chip"))return;document.querySelectorAll("#kg-harita .chip").forEach(function(c){c.classList.remove("active");});e.target.classList.add("active");renderList(e.target.getAttribute("data-cat"),$("searchInput").value);});
    var si=$("searchInput"); if(si) si.addEventListener("input",function(e){var a=document.querySelector("#kg-harita .chip.active");renderList(a?a.getAttribute("data-cat"):"all",e.target.value);});
    document.addEventListener("keydown",function(e){if(e.key==="Escape")window.kgClose();});
  }
  if(window.KG_DATA && window.L) ready();
  else {
    var n=0, t=setInterval(function(){ n++; if((window.KG_DATA&&window.L)||n>80){ clearInterval(t); ready(); } },150);
  }
})();
