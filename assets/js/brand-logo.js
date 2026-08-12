/* KonyaGo brand logo injector */
(function(){
  var LOGO = "assets/img/logo.jpg";
  function apply(){
    document.querySelectorAll("img.logo-mark, img.hero-eagle").forEach(function(el){
      var test = new Image();
      test.onload = function(){ el.src = LOGO; };
      test.onerror = function(){ /* keep eagle.svg fallback */ };
      test.src = LOGO;
      el.alt = el.alt || "KonyaGo";
    });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
