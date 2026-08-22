/* kg-harita-app.js — shim: load last known-good build + map FAB */
(function(){
  if (window.__KG_APP_SHIM) return;
  window.__KG_APP_SHIM = true;
  function load(src){
    return new Promise(function(res,rej){
      var s=document.createElement("script");
      s.src=src; s.async=true;
      s.onload=function(){res();}; s.onerror=function(){rej(new Error(src));};
      document.head.appendChild(s);
    });
  }
  var GOOD="https://cdn.jsdelivr.net/gh/zeus777ia/konyago@00746944d5e82213c073caea6551951ad3dcf000/assets/js/kg-harita-app.js";
  var FAB="https://cdn.jsdelivr.net/gh/zeus777ia/konyago@main/assets/js/kgo-map-fab.js?v=20260823b";
  load(GOOD).then(function(){ return load(FAB); }).catch(function(){
    load("https://raw.githubusercontent.com/zeus777ia/konyago/00746944d5e82213c073caea6551951ad3dcf000/assets/js/kg-harita-app.js")
      .then(function(){ return load(FAB); });
  });
})();
