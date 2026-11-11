/* kgo-header.js — aggressive pharmacy override 2026-11-12 */
(function(){
  "use strict";
  var root=document.querySelector(".kgo-ticker-stack");
  if(!root)return;

  var pharmacyTrack=root.querySelector("[data-kgo-pharmacy]");
  var marketTrack=root.querySelector("[data-kgo-market]");
  var pharmacyMeta=root.querySelector("[data-kgo-pharmacy-meta]");
  var marketMeta=root.querySelector("[data-kgo-market-meta]");

  function todayLabel(){
    try{return new Intl.DateTimeFormat("tr-TR",{timeZone:"Europe/Istanbul",day:"numeric",month:"long",weekday:"long"}).format(new Date());}
    catch(e){return new Date().toLocaleDateString("tr-TR");}
  }
  function fmt(value,digits){
    var n=Number(value);if(!isFinite(n))return "—";
    return n.toLocaleString("tr-TR",{minimumFractionDigits:digits,maximumFractionDigits:digits});
  }
  function withTimeout(url,timeout,headers){
    var controller=new AbortController();
    var timer=setTimeout(function(){controller.abort();},timeout||10000);
    return fetch(url,{cache:"no-store",credentials:"omit",signal:controller.signal,headers:headers||{}}).finally(function(){clearTimeout(timer);});
  }
  function setItems(track,items,maxItems){
    if(!track)return;
    track.replaceChildren();
    var safe=Array.from(new Set(items.filter(Boolean))).slice(0,maxItems||100);
    track.style.setProperty("--kgo-duration",Math.max(32,Math.round(safe.length*2.6))+"s");
    safe.concat(safe).forEach(function(item){
      var span=document.createElement("span");
      span.className="kgo-ticker-item";
      span.textContent=item;
      track.appendChild(span);
    });
  }

  function showPharmacyRows(rows,sourceLabel){
    var items=rows.map(function(row){
      var dist=String(row[0]||"KONYA").trim().toLocaleUpperCase("tr-TR");
      var name=String(row[1]||"").trim().toLocaleUpperCase("tr-TR");
      if(!name)return null;
      var label=name+(/ECZANES[İI]$/i.test(name)?"":" ECZANESİ");
      return dist+" · "+label;
    }).filter(Boolean);
    if(items.length<5)return false;
    items.push("Kaynak: "+sourceLabel+" · yola çıkmadan önce teyit edin");
    setItems(pharmacyTrack,items,120);
    var districts=new Set(rows.map(function(r){return String(r[0]||"").toLocaleUpperCase("tr-TR");}));
    if(pharmacyMeta)pharmacyMeta.textContent=todayLabel()+" · "+rows.length+" eczane · "+districts.size+" ilçe · "+sourceLabel;
    return true;
  }

  function loadPharmacies(){
    var own="https://cdn.jsdelivr.net/gh/zeus777ia/konyago@main/assets/data/konya-nobetci.json?v="+Date.now();
    return withTimeout(own,7000,{"Accept":"application/json"}).then(function(r){
      if(!r.ok)throw new Error("own");
      return r.json();
    }).then(function(data){
      if(!data||!Array.isArray(data.pharmacies)||data.pharmacies.length<8)throw new Error("bad");
      var rows=data.pharmacies.map(function(p){return [String(p.district||"KONYA"), String(p.name||"")];}).filter(function(r){return r[1].length>1;});
      if(!showPharmacyRows(rows,"Happ / güncel"))throw new Error("show");
    }).catch(function(){
      // HTML fallbacks
      return withTimeout("https://www.happ.health/nobetci-eczane/konya",12000,{"Accept":"text/html"}).then(function(r){
        if(!r.ok)throw new Error("html");
        return r.text();
      }).then(function(html){
        var rows=[];
        var re=/([A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü\s\-]+)\s*(?:Eczanesi|ECZANESİ|ECZANESI)/gi;
        var m, seen={};
        while((m=re.exec(html))&&rows.length<50){
          var name=m[1].replace(/\s+/g," ").trim();
          if(name.length<3||seen[name])continue;
          seen[name]=1;
          rows.push(["KONYA", name]);
        }
        if(!showPharmacyRows(rows,"Happ Health"))throw new Error("empty");
      }).catch(function(){
        setItems(pharmacyTrack,["Güncel nöbetçi eczane listesi için resmî kaynakları kontrol edin","KEO ve e-Devlet bağlantılarını kullanın"],2);
        if(pharmacyMeta)pharmacyMeta.textContent=todayLabel()+" · liste alınamadı";
      });
    });
  }

  function loadRates(){
    var OZ_GRAM=31.1034768;
    return Promise.all([
      withTimeout("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR",10000).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
      withTimeout("https://open.er-api.com/v6/latest/USD",10000).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
      withTimeout("https://api.gold-api.com/price/XAU",8000).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;})
    ]).then(function(res){
      var frank=res[0], open=res[1], gold=res[2];
      var usdtry=null, eurtry=null, date="";
      if(frank&&frank.rates&&frank.rates.TRY){
        usdtry=frank.rates.TRY;
        if(frank.rates.EUR)eurtry=usdtry/frank.rates.EUR;
        date=frank.date||"";
      }else if(open&&open.rates&&open.rates.TRY){
        usdtry=open.rates.TRY;
        if(open.rates.EUR)eurtry=usdtry/open.rates.EUR;
        date=open.time_last_update_utc||"";
      }
      if(!usdtry)throw new Error("no-fx");
      var items=["USD/TRY · "+fmt(usdtry,2)+" ₺"];
      if(eurtry)items.push("EUR/TRY · "+fmt(eurtry,2)+" ₺");
      var xauUsd=gold&&(gold.price||gold.price_usd)?Number(gold.price||gold.price_usd):null;
      if(xauUsd&&usdtry){
        var ons=xauUsd*usdtry;
        var gram=ons/OZ_GRAM;
        items.unshift("Gram Altın · "+fmt(gram,0)+" ₺");
        items.unshift("Ons Altın · "+fmt(ons,0)+" ₺");
        items.unshift("Çeyrek (yaklaşık) · "+fmt(gram*1.754,0)+" ₺");
      }
      items.push("Kaynak: piyasa · "+(date||"güncel")+" · bilgilendirme");
      setItems(marketTrack,items,20);
      if(marketMeta)marketMeta.textContent="Kur + altın · "+(date||"güncel")+" · gösterge";
    }).catch(function(){
      setItems(marketTrack,["Kur ve altın verisi şu an alınamadı","Biraz sonra yenilenecek"],2);
      if(marketMeta)marketMeta.textContent="Veri bekleniyor";
    });
  }

  root.querySelectorAll(".kgo-ticker-pause").forEach(function(button){
    var labelBase=(button.getAttribute("aria-label")||"Şerit").replace(/ duraklat$/i,"");
    button.addEventListener("click",function(){
      var row=button.closest(".kgo-ticker");
      var paused=row.classList.toggle("is-paused");
      button.setAttribute("aria-pressed",String(paused));
      button.setAttribute("aria-label",labelBase+" "+(paused?"oynat":"duraklat"));
      button.textContent=paused?"Oynat":"Duraklat";
    });
  });

  function forcePharmacy(){
    var t=document.querySelector("[data-kgo-pharmacy]");
    if(!t)return;
    var txt=(t.textContent||"").toLowerCase();
    if(/güvenle doğrulanamadı|yükleniyor|doğrulanmamış|liste alınamadı/.test(txt)){
      loadPharmacies();
    }
  }

  setTimeout(function(){loadPharmacies();loadRates();},800);
  setTimeout(forcePharmacy,3000);
  setTimeout(forcePharmacy,7000);
  setTimeout(forcePharmacy,15000);
  setInterval(forcePharmacy,20000);
  setInterval(loadRates,10*60*1000);
})();
