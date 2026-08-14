/* KonyaGo brand logo injector */
(function(){
  var LOGO = "assets/img/IMG_0510.jpeg";
  function apply(){
    document.querySelectorAll("img.logo-mark, img.hero-eagle").forEach(function(el){
      var test = new Image();
      test.onload = function(){ el.src = LOGO; };
      test.onerror = function(){ /* keep current fallback */ };
      test.src = LOGO;
      el.alt = el.alt || "KonyaGo";
      el.style.borderRadius = el.style.borderRadius || "10px";
      el.style.objectFit = "cover";
    });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
