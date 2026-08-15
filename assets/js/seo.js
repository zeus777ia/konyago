/**
 * KonyaGo SEO helpers — JSON-LD Organization + OG defaults
 * No Twitter/X cards
 */
(function () {
  "use strict";
  if (window.__konyagoSeo) return;
  window.__konyagoSeo = true;

  var ORIGIN = "https://konyago.com.tr";
  var LOGO = ORIGIN + "/assets/img/IMG_0510.jpeg";
  var OG_IMG = ORIGIN + "/assets/img/Sophisticated%20KonyaGo%20Editorial%20Image.jpg";

  function ensureMeta(attr, key, value, force) {
    if (!value) return;
    var sel = attr === "property"
      ? 'meta[property="' + key + '"]'
      : 'meta[name="' + key + '"]';
    var el = document.querySelector(sel);
    if (el) {
      if (force || !el.getAttribute("content") ||
          (key.indexOf("og:image") === 0 && el.getAttribute("content").indexOf("IMG_0510") !== -1)) {
        el.setAttribute("content", value);
      }
      return;
    }
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("content", value);
    document.head.appendChild(el);
  }

  var path = location.pathname || "/";
  var pageUrl = ORIGIN + (path === "/" || path === "/index.html" ? "/" : path);

  ensureMeta("property", "og:type", "website", false);
  ensureMeta("property", "og:locale", "tr_TR", false);
  ensureMeta("property", "og:site_name", "KonyaGo", false);
  ensureMeta("property", "og:url", pageUrl, false);
  ensureMeta("property", "og:image", OG_IMG, true);
  ensureMeta("property", "og:image:secure_url", OG_IMG, true);
  ensureMeta("property", "og:image:type", "image/jpeg", true);
  ensureMeta("property", "og:image:width", "1200", true);
  ensureMeta("property", "og:image:height", "630", true);
  ensureMeta("property", "og:image:alt", "KonyaGo — Konya şehir rehberi", true);

  var t = document.title || "KonyaGo | Konya Şehir Rehberi";
  ensureMeta("property", "og:title", t, false);
  var descEl = document.querySelector('meta[name="description"]');
  if (descEl && descEl.content) ensureMeta("property", "og:description", descEl.content, false);

  // Page-specific JSON-LD for reklam / iletisim if missing
  if (path.indexOf("reklam") !== -1 && !document.querySelector('script[data-konyago-page]')) {
    var r = document.createElement("script");
    r.type = "application/ld+json";
    r.setAttribute("data-konyago-page", "1");
    r.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Reklam & Sponsorluk | KonyaGo",
      "url": ORIGIN + "/reklam.html",
      "description": "KonyaGo reklam ve sponsorluk paketleri — restoran, otel, butik ve yerel işletmeler için premium görünürlük.",
      "isPartOf": { "@type": "WebSite", "name": "KonyaGo", "url": ORIGIN + "/" }
    });
    document.head.appendChild(r);
  }
  if (path.indexOf("iletisim") !== -1 && !document.querySelector('script[data-konyago-page]')) {
    var c = document.createElement("script");
    c.type = "application/ld+json";
    c.setAttribute("data-konyago-page", "1");
    c.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "İletişim | KonyaGo",
      "url": ORIGIN + "/iletisim.html",
      "description": "KonyaGo iletişim — e-posta, WhatsApp, Instagram ve mesaj formu.",
      "isPartOf": { "@type": "WebSite", "name": "KonyaGo", "url": ORIGIN + "/" }
    });
    document.head.appendChild(c);
  }

  if (!document.querySelector('script[type="application/ld+json"][data-konyago-org]')) {
    var data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORIGIN + "/#organization",
      "name": "KonyaGo",
      "url": ORIGIN + "/",
      "logo": { "@type": "ImageObject", "url": LOGO },
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
