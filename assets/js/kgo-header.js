/* kgo-header.js — live bars + intro film */
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

  var pharmacyAreas=["1. Bölge (Selçuklu)","2. Bölge (Selçuklu)","3. Bölge (Meram–Selçuklu)","4. Bölge (Meram)","5. Bölge (Karatay–Selçuklu)","6. Bölge (Meram–Selçuklu–Karatay)","7. Bölge (Karatay)","8. Bölge (Selçuklu)","9. Bölge (Selçuklu)","10. Bölge (Selçuklu)","11. Bölge (Selçuklu)","12. Bölge (Karatay–Meram)"];
  var pharmacySchedule={
    "2026-08-16":["SAĞLIK","HANDE","NEVA","HASDENİZ","SARAY","ŞİRİN","HAKAN","MUTLU","ALPER","TUĞÇE EKİCİ","NEFES","YENİ BAHAR"],
    "2026-08-17":["ULUÇINAR","BAŞKENT","BADE","SEVİNÇHAN","KEREM","GÖKMENOĞLU","ZEYNEB VATANSEV","MENEKŞE","MALAZGİRT","BAHÇEŞEHİR","ÖZTÜRK","ANADOLU"],
    "2026-08-18":["FETİH","HELÜN","ZİRVE","HÜLYA EKMEKÇİ","ALPEREN","ŞÖLEN","NANE LİMON","YENİ CİHANBEYLİ","TUBA","SİBEL","ÖZDEMİR","ÖZEKİN"],
    "2026-08-19":["ÇELİK","MARTI","MASAL","ESMA AKTÜRK","NİSAN","LALEZAR","EROĞLU","AKINCILAR","AKDENİZ","EMİN","ZEYNEP ÖZDEMİR","HUZUR"],
    "2026-08-20":["TANYELİ","BUKET","DUDU","YENİ SEZER","HÜLYA","DURMAZ","VEZİROĞLU","ÖZCAN","ELİT","PARSANA","MERAM","KORU"],
    "2026-08-21":["EVRAN","ÇAĞLAYAN","ALEMDAR","CAN","ULUKAN","EYÜP ÇINAR","NENEHATUN","BOSNA HERSEK","MÜGE","KAPTAN","SERGÜL","FATİH BOZKIR"],
    "2026-08-22":["HACETTEPE","ELİF SEVDE","ÖZTOKLU","UFUK","YAĞMUR","KOÇAKOĞLU","BEŞYOL","MEKÂN-I ŞİFA","FERDANE","EYÜP","ODABAŞI","CADDE MERAM"],
    "2026-08-23":["NİŞANTAŞI","İLKNUR","ERMENEK","YUNUS","SEDA TELLİOĞLU","TOPATAN","BEZİRCİLER","PETEK","BEYZA","ERDAL UYSAL","SAYGILI","ELİF"],
    "2026-08-24":["YAREN","PALMİYE","MUSTAFA SAVRAN","FEYYAZ","GENÇ","ALTINEKİN","HAKİMİYET","HAN","BAHA","RAZİYE ÖZEN","ARSLANGİL","BURCU ULUKAPI"],
    "2026-08-25":["TORUN","ZEYNEP YILMAZ","ENİSE","İZİ","CANAN","YENİ POÇAN","MERVE ÜNAL","NURGÜL","NESRİN","DOLUNAY","KİRAZ","APA"],
    "2026-08-26":["ŞİFA","KEKİK","TÜTÜNCÜ","YENİ EBRU","TAŞKIRAN","BURAK","KARAGÖZ","FİLİZ","ÖZTOPRAK","YAKAMOZ","AKÇA","AYDIN"],
    "2026-08-27":["NESLİHAN","EYLEM","KIYMET","CEMRE","OTOGAR","EMİNE ÖZ","ELİF ATEŞ","TÜRKMEN","YUNUS EMRE","NADİRE","SEÇKİN","UYAR"],
    "2026-08-28":["KELEBEK","DUYGU","BAYRAK","TURKUAZ MERAM","NADİR","TOPATAN","KALEM","YAPRAK","MUTLULUK","ATLAS","NEFES","AYMİLA"],
    "2026-08-29":["ALTAN","GÜLERYÜZ","SARI","SARPAY","DERYA","ŞİRİN","POYRAZ","AYDINLIK","ŞİMŞİR","ÖZLER","SAYGILI","YENİ BAHAR"],
    "2026-08-30":["ÖZKAN","ERDEM","EROL CAN","PARK","BAKIR","EMİNE ÖZ","SAMANYOLU","IHLAMUR","SAYGI","SEMA","SEÇKİN","ŞEREF YAVUZ"],
    "2026-08-31":["CANSU","CEREN","REİSOĞLU","VARLIK","KERTMEN","KAŞINHAN","HAKAN","ÖZGÜVEN","ADNAN HARMANKAYA","ZAFER","KARABULUT","ELİF"]
  };
  var allDistrictFallback={
    "2026-08-16":[
      ["AKŞEHİR","AKKAYA"],["AKŞEHİR","TEKİN"],["ALTINEKİN","ELMALI"],["BEYŞEHİR","TUĞÇE AKYÜZ"],["BOZKIR","ŞAKİROĞLU"],["CİHANBEYLİ","BÜŞRA"],["CİHANBEYLİ","YENİCEOBA"],["ÇELTİK","KAÇMAZ"],["ÇUMRA","BAĞCI"],["DOĞANHİSAR","UYSAL"],["EREĞLİ","GÜLBAHÇE"],["EREĞLİ","LOKMAN HEKİM"],["HÜYÜK","BİLİR"],["ILGIN","ALTINIŞIK"],["KADINHANI","GÜZEŞ"],["KARAPINAR","YALÇINÖZ"],
      ["1. Bölge (Selçuklu)","SAĞLIK"],["2. Bölge (Selçuklu)","HANDE"],["3. Bölge (Meram–Selçuklu)","NEVA"],["4. Bölge (Meram)","HASDENİZ"],["5. Bölge (Karatay–Selçuklu)","SARAY"],["6. Bölge (Meram–Selçuklu–Karatay)","ŞİRİN"],["7. Bölge (Karatay)","HAKAN"],["8. Bölge (Selçuklu)","MUTLU"],["9. Bölge (Selçuklu)","ALPER"],["10. Bölge (Selçuklu)","TUĞÇE EKİCİ"],["11. Bölge (Selçuklu)","NEFES"],["12. Bölge (Karatay–Meram)","YENİ BAHAR"],
      ["KULU","SIHHAT"],["SARAYÖNÜ","HÜLYA"],["SEYDİŞEHİR","TOROS"],["TUZLUKÇU","TUZLUKÇU"],["YUNAK","ÖZ SAĞLIK"]
    ],
    "2026-08-22":[
      ["SELÇUKLU","BOSNA HERSEK",6],["CİHANBEYLİ","DENİZ",2],["EREĞLİ","AYRANCI",2],["AKŞEHİR","TEPEOĞLU",1],["ALTINEKİN","DİLEK",1],["BEYŞEHİR","ŞENOL",1],["BOZKIR","YENİ SAĞLAM",1],["ÇELTİK","FİDAN",1],["ÇUMRA","MERKEZ",1],["DOĞANHİSAR","HİSAR",1],["HÜYÜK","BİLİR",1],["ILGIN","CAN",1],["KADINHANI","GANİOĞLU",1],["KARAPINAR","SERAP",1],["KARATAY","NENEHATUN",1],["KULU","ERDOĞAN",1],["MERAM","CAN",1],["SARAYÖNÜ","ÖZŞAHİN",1],["SEYDİŞEHİR","ELİF",1],["TUZLUKÇU","ELÇİN",1],["YUNAK","BİZİM",1]
    ]
  };
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
    rows.forEach(function(row){
      var label=String(row[0]||"").toLocaleUpperCase("tr-TR");
      if(/^\d+\.\s*BÖLGE/.test(label)){
        ["SELÇUKLU","MERAM","KARATAY"].forEach(function(d){if(label.indexOf(d)>-1)districtSet.add(d);});
      }else{
        districtSet.add(label.replace(/\s*·.*$/,"").trim());
      }
    });
    var total=rows.reduce(function(sum,row){return sum+(Number(row[2])||1);},0);
    if(pharmacyMeta)pharmacyMeta.textContent=todayLabel()+" · "+total+" eczane · "+districtSet.size+" ilçe · "+sourceLabel;
  }
  function parseDistrictTable(html){
    var rows=[];
    var re=/<tr[^>]*>\s*<td[^>]*>\s*(?:<a[^>]*>)?\s*([A-ZÇĞİÖŞÜa-zçğıöşüİı\s\-]+)\s*(?:<\/a>)?\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*>\s*([^<]+?)\s*<\/td>/gi;
    var m;
    while((m=re.exec(html))){
      var dist=m[1].replace(/\s+/g," ").trim();
      var cnt=parseInt(m[2],10)||1;
      var name=m[3].replace(/\s+/g," ").trim();
      if(!/eczane/i.test(name))continue;
      if(/^(ilçe|ilce|district)$/i.test(dist))continue;
      rows.push([dist.toLocaleUpperCase("tr-TR"),name.toLocaleUpperCase("tr-TR"),cnt]);
    }
    rows.sort(function(a,b){return a[0].localeCompare(b[0],"tr");});
    return rows;
  }
  function loadPharmaciesFromHtml(){
    return withTimeout("https://eczaneadresi.com/konya-nobetci-eczane",14000,{
      "Accept":"text/html,application/xhtml+xml",
      "Accept-Language":"tr-TR,tr;q=0.9"
    }).then(function(response){
      if(!response.ok)throw new Error("pharmacy-html-http");
      return response.text();
    }).then(function(html){
      var rows=parseDistrictTable(html);
      if(!rows.length||rows.length<5)throw new Error("pharmacy-html-empty");
      showPharmacyRows(rows,"Canlı · tüm ilçeler");
    });
  }
  function showPharmacyFallback(){
    var key=istanbulDateKey();
    var full=allDistrictFallback[key];
    if(Array.isArray(full)&&full.length){
      showPharmacyRows(full,"Yedek liste · tüm ilçeler");
      return;
    }
    loadPharmaciesFromHtml().catch(function(){
      var names=pharmacySchedule[key];
      if(Array.isArray(names)&&names.length===12){
        var rows=names.map(function(name,index){return [pharmacyAreas[index],name,1];});
        setItems(pharmacyTrack,rows.map(function(row){return row[0]+" · "+row[1]+" ECZANESİ";}),24);
        if(pharmacyMeta)pharmacyMeta.textContent=todayLabel()+" · merkez 12 nöbet bölgesi · Kaynak: 5. Bölge Konya Eczacı Odası";
        return;
      }
      setItems(pharmacyTrack,["Güncel nöbetçi eczane adları için kaynak bağlantılarını açın"],1);
      if(pharmacyMeta)pharmacyMeta.textContent=todayLabel()+" · doğrulanmış güncel liste bekleniyor";
    });
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
        return [
          String(p.district||"KONYA").toLocaleUpperCase("tr-TR"),
          String(p.name||"").toLocaleUpperCase("tr-TR"),
          Number(p.count)||1
        ];
      }).filter(function(r){return r[1].length>1;});
      if(rows.length<5)throw new Error("own-incomplete");
      rows.sort(function(a,b){return a[0].localeCompare(b[0],"tr");});
      showPharmacyRows(rows,"Canlı · tüm ilçeler");
    }
    function fromApi(){
      var endpoint="https://eczaneadresi.com/api/public/v1/duty-pharmacies?city=konya&limit=300";
      return withTimeout(endpoint,10000,{"Accept":"application/json"}).then(function(response){
        if(!response.ok)throw new Error("pharmacy-http");
        return response.json();
      }).then(function(data){
        if(data.date&&data.date!==today)throw new Error("pharmacy-stale");
        if(!Array.isArray(data.pharmacies)||!data.pharmacies.length)throw new Error("pharmacy-empty");
        var rows=data.pharmacies.map(function(pharmacy){
          return [
            String(pharmacy.district||"KONYA MERKEZ").toLocaleUpperCase("tr-TR"),
            String(pharmacy.name||"").toLocaleUpperCase("tr-TR"),
            1
          ];
        }).filter(function(row){return row[1].length>1;});
        if(rows.length<8)throw new Error("pharmacy-incomplete");
        rows.sort(function(a,b){return a[0].localeCompare(b[0],"tr")||a[1].localeCompare(b[1],"tr");});
        showPharmacyRows(rows,"Canlı API · tüm ilçeler");
      });
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
      return fromApi().catch(function(){
        return loadPharmaciesFromHtml().catch(function(){showPharmacyFallback();});
      });
    });
  }

  function loadRates(){
    var amp=String.fromCharCode(38);
    var endpoint="https://api.frankfurter.dev/v2/rates?base=TRY"+amp+"quotes=USD,EUR,GBP,CHF,CAD,AUD,JPY"+amp+"providers=TCMB";
    return withTimeout(endpoint,12000).then(function(r){if(!r.ok)throw new Error("tcmb-http");return r.json();}).then(function(rows){
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
      items.push("TCMB gösterge kurları · "+(date||"son resmî iş günü"));
      if(items.length<10)throw new Error("rate-parse");
      setItems(marketTrack,items,24);if(marketMeta)marketMeta.textContent="TCMB "+(date||"son resmî iş günü")+" · alış/satış değil, gösterge kuru";
    }).catch(function(){setItems(marketTrack,["Güncel kur verisi kısa süre içinde yenilenecek","Kaynak: TCMB gösterge kurları"]);if(marketMeta)marketMeta.textContent="TCMB verisi bekleniyor";});
  }

  root.querySelectorAll(".kgo-ticker-pause").forEach(function(button){var labelBase=(button.getAttribute("aria-label")||"Şerit").replace(/ duraklat$/i,"");button.addEventListener("click",function(){var row=button.closest(".kgo-ticker");var paused=row.classList.toggle("is-paused");button.setAttribute("aria-pressed",String(paused));button.setAttribute("aria-label",labelBase+" "+(paused?"oynat":"duraklat"));button.textContent=paused?"Oynat":"Duraklat";});});
  loadPharmacies();loadRates();
  setInterval(loadPharmacies,15*60*1000);
  setInterval(loadRates,30*60*1000);
})();


(function () {
  'use strict';
  var gate = document.querySelector('[data-kgo-intro-film]');
  if (!gate) return;
  if (!document.body.classList.contains('home')) {
    gate.remove();
    return;
  }

  var video = gate.querySelector('[data-kgo-intro-video]');
  var skip = gate.querySelector('[data-kgo-intro-skip]');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var hasSeen = false;
  try { hasSeen = sessionStorage.getItem('kgo-intro-seen-v1') === '1'; } catch (error) {}

  if (reduceMotion || saveData || hasSeen || !video) {
    gate.remove();
    return;
  }

  function remember() {
    try { sessionStorage.setItem('kgo-intro-seen-v1', '1'); } catch (error) {}
  }

  function closeIntro() {
    if (!gate || gate.classList.contains('is-leaving')) return;
    remember();
    gate.classList.add('is-leaving');
    if (video) video.pause();
    window.setTimeout(function () { if (gate) gate.remove(); }, 460);
  }

  gate.hidden = false;
  skip.addEventListener('click', closeIntro);
  video.addEventListener('ended', closeIntro);
  video.addEventListener('error', closeIntro);
  window.setTimeout(closeIntro, 9000);
  window.requestAnimationFrame(function () {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(closeIntro);
  });
})();
