/**
 * KonyaGo SEO helpers — JSON-LD Organization + OG defaults
 * No Twitter/X cards (user request: x hesabı hariç)
 */
(function () {
  "use strict";
  if (window.__konyagoSeo) return;
  window.__konyagoSeo = true;

  var ORIGIN = "https://konyago.com.tr";
  var LOGO = ORIGIN + "/assets/img/IMG_0510.jpeg";
  // Canva OG cover (uploaded as Sophisticated KonyaGo Editorial Image.jpg)
  var OG_IMG = ORIGIN + "/assets/img/Sophisticated%20KonyaGo%20Editorial%20Image.jpg";

  function ensureMeta(attr, key, value) {
    if (!value) return;
    var sel = attr === "property"
      ? 'meta[property="' + key + '"]'
      : 'meta[name="' + key + '"]';
    var el = document.querySelector(sel);
    if (el) {
      // Force update og:image to cover if it still points to logo
      if (key === "og:image" || key === "og:image:secure_url") {
        el.setAttribute("content", value);
        return;
      }
      if (!el.getAttribute("content")) el.setAttribute("content", value);
      return;
    }
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("content", value);
    document.head.appendChild(el);
  }

  var path = location.pathname || "/";
  var pageUrl = ORIGIN + (path === "/" || path === "/index.html" ? "/" : path);

  // Core OG (no twitter:*)
  ensureMeta("property", "og:type", "website");
  ensureMeta("property", "og:locale", "tr_TR");
  ensureMeta("property", "og:site_name", "KonyaGo");
  ensureMeta("property", "og:url", pageUrl);
  ensureMeta("property", "og:image", OG_IMG);
  ensureMeta("property", "og:image:secure_url", OG_IMG);
  ensureMeta("property", "og:image:type", "image/jpeg");
  ensureMeta("property", "og:image:width", "1200");
  ensureMeta("property", "og:image:height", "630");
  ensureMeta("property", "og:image:alt", "KonyaGo — Konya şehir rehberi");

  var t = document.title || "KonyaGo | Konya Şehir Rehberi";
  ensureMeta("property", "og:title", t);
  var descEl = document.querySelector('meta[name="description"]');
  if (descEl && descEl.content) {
    ensureMeta("property", "og:description", descEl.content);
  }

  if (!document.querySelector('script[type="application/ld+json"][data-konyago-org]')) {
    var data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORIGIN + "/#organization",
      "name": "KonyaGo",
      "url": ORIGIN + "/",
      "logo": {
        "@type": "ImageObject",
        "url": LOGO
      },
      "email": "info@konyago.com.tr",
      "telephone": "+90-533-259-50-42",
      "sameAs": [
        "https://instagram.com/mehmet_ali_caner_",
        "https://t.me/+mgwLM224L7A0Mzdk"
      ],
      "description": "Konya için bağımsız, ücretsiz premium şehir rehberi."
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-konyago-org", "1");
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }
})();
