/* kgo-header.js — live bars: pharmacy + FX + gold */
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
    var safe=Array.from(new Set(items)).slice(0,maxItems||80);
    track.style.setProperty("--kgo-duration",Math.max(32,Math.round(safe.length*3.2))+"s");
    safe.concat(safe).forEach(function(item){
      var span=document.createElement("span");
      span.className="kgo-ticker-item";
      span.textContent=item;
      track.appendChild(span);
    });
  }
  function istanbulDateKey(){
    try{
      var parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Istanbul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
      var map={};parts.forEach(function(part){map[part.type]=part.value;});
      return map.year+"-"+map.month+"-"+map.day;
    }catch(e){return "";}
  }
  function showPharmacyRows(rows,sourceLabel){
    var items=rows.map(function(row){
      var dist=String(row[0]||"KONYA").trim();
      var name=String(row[1]||"").trim();
      var extra=row[2]&&Number(row[2])>1?" (+"+(Number(row[2])-1)+")":"";
      var label=name+(/ECZANES[İI]$/i.test(name)?"":" ECZANESİ");
      return dist+" · "+label+extra;
    });
    items.push("Kaynak: Eczane Adresi · tüm ilçeler");
    setItems(pharmacyTrack,items,100);
    var districtSet=new Set();
    rows.forEach(function(row){districtSet.add(String(row[0]||"").toLocaleUpperCase("tr-TR"));});
    var total=rows.reduce(function(sum,row){return sum+(Number(row[2])||1);},0);
    if(pharmacyMeta)pharmacyMeta.textContent=todayLabel()+" · "+total+" eczane · "+districtSet.size+" ilçe · "+sourceLabel;
  }
  function loadPharmacies(){
    var today=istanbulDateKey();
    var own="https://cdn.jsdelivr.net/gh/zeus777ia/konyago@main/assets/data/konya-nobetci.json?v="+today;
    var ownFb="https://raw.githubusercontent.com/zeus777ia/konyago/main/assets/data/konya-nobetci.json?v="+today;
    function fromOwn(data){
      if(!data||data.date!==today)throw new Error("own-stale");
      var list=data.pharmacies||[];
      if(!list.length)throw new Error("own-empty");
      var rows=list.map(function(p){
        return [String(p.district||"KONYA").toLocaleUpperCase("tr-TR"),String(p.name||"").toLocaleUpperCase("tr-TR"),Number(p.count)||1];
      }).filter(function(r){return r[1].length>1;});
      if(rows.length<5)throw new Error("own-incomplete");
      rows.sort(function(a,b){return a[0].localeCompare(b[0],"tr");});
      showPharmacyRows(rows,"Canlı · tüm ilçeler");
    }
    return withTimeout(own,10000,{"Accept":"application/json"}).then(function(r){
      if(!r.ok)throw new Error("own-http");
      return r.json();
    }).then(fromOwn).catch(function(){
      return withTimeout(ownFb,10000,{"Accept":"application/json"}).then(function(r){
        if(!r.ok)throw new Error("own-fb-http");
        return r.json();
      }).then(fromOwn);
    }).catch(function(){
      setItems(pharmacyTrack,["Güncel nöbetçi eczane listesi yükleniyor…"],1);
      if(pharmacyMeta)pharmacyMeta.textContent=todayLabel()+" · liste bekleniyor";
    });
  }
  function loadRates(){
    var amp=String.fromCharCode(38);
    var fxUrl="https://api.frankfurter.dev/v2/rates?base=TRY"+amp+"quotes=USD,EUR,GBP,CHF,CAD,AUD,JPY"+amp+"providers=TCMB";
    var goldUrl="https://api.frankfurter.dev/v2/rates?base=XAU"+amp+"quotes=TRY";
    var OZ_GRAM=31.1034768;
    return Promise.all([
      withTimeout(fxUrl,12000).then(function(r){if(!r.ok)throw new Error("tcmb-http");return r.json();}),
      withTimeout(goldUrl,10000).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;})
    ]).then(function(pair){
      var rows=pair[0], goldRows=pair[1];
      if(!Array.isArray(rows)||rows.length<7)throw new Error("rate-parse");
      var items=[],byCode={},date="";
      rows.forEach(function(row){
        var rate=Number(row.rate);if(!rate)return;
        byCode[row.quote]=rate;date=row.date||date;
        if(row.quote==="JPY")items.push("100 JPY/TRY · "+fmt(100/rate,4)+" ₺");
        else items.push(row.quote+"/TRY · "+fmt(1/rate,4)+" ₺");
      });
      if(byCode.USD){if(byCode.EUR)items.push("EUR/USD · "+fmt(byCode.USD/byCode.EUR,4));if(byCode.GBP)items.push("GBP/USD · "+fmt(byCode.USD/byCode.GBP,4));}
      if(byCode.EUR){if(byCode.GBP)items.push("EUR/GBP · "+fmt(byCode.GBP/byCode.EUR,4));if(byCode.CHF)items.push("EUR/CHF · "+fmt(byCode.CHF/byCode.EUR,4));}
      var goldDate="";
      if(Array.isArray(goldRows)&&goldRows.length){
        var oz=Number(goldRows[0].rate);
        goldDate=goldRows[0].date||"";
        if(oz>0){
          var gram=oz/OZ_GRAM;
          items.unshift("Çeyrek (yaklaşık) · "+fmt(gram*1.754,0)+" ₺");
          items.unshift("Gram Altın · "+fmt(gram,2)+" ₺");
          items.unshift("Ons Altın · "+fmt(oz,0)+" ₺");
        }
      }
      items.push("TCMB + altın gösterge · "+(date||goldDate||"son resmî iş günü"));
      if(items.length<10)throw new Error("rate-parse");
      setItems(marketTrack,items,32);
      if(marketMeta) marketMeta.textContent="TCMB + altın "+(date||goldDate||"güncel")+" · gösterge (alış/satış değil)";
    }).catch(function(){
      setItems(marketTrack,["Güncel kur verisi kısa süre içinde yenilenecek","Kaynak: TCMB gösterge kurları"]);
      if(marketMeta)marketMeta.textContent="TCMB / altın verisi bekleniyor";
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
  loadPharmacies();loadRates();
  setInterval(loadPharmacies,15*60*1000);
  setInterval(loadRates,5*60*1000);
})();
