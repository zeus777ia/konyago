/* kgo-header.js — market ticker only; pharmacy uses the site's verified-source module. */
(function(){
  "use strict";
  var root=document.querySelector(".kgo-ticker-stack");
  if(!root)return;

  var marketTrack=root.querySelector("[data-kgo-market]");
  var marketMeta=root.querySelector("[data-kgo-market-meta]");

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

  setTimeout(loadRates,800);
  setInterval(loadRates,10*60*1000);
})();
