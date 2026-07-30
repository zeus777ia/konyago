# KonyaGo

Konya şehir rehberi — tarihçe, gezilecek yerler, ulaşım ve pratik bilgi.

**Domain:** konyago.com.tr  
**Repo:** https://github.com/zeus777ia/konyago  
**Canlı (Pages açılınca):** https://zeus777ia.github.io/konyago/

## GitHub Pages — bir kerelik ayar (zorunlu)

Linklerin açılması için Pages’i açman lazım:

1. Repo sayfası: https://github.com/zeus777ia/konyago
2. **Settings** → sol menü **Pages**
3. **Build and deployment → Source:** `GitHub Actions` seç
4. Kaydet / bekle (1–2 dk)
5. Actions sekmesinde yeşil tik gelince site açılır:
   - https://zeus777ia.github.io/konyago/

### Domain bağlama (konyago.com.tr hazır olunca)
Settings → Pages → **Custom domain** → `konyago.com.tr`  
DNS (registrar):
- `A` kayıtları GitHub Pages IP’leri, veya
- Cloudflare kullanıyorsan CNAME / proxy ayarı (cnrtech ile aynı mantık)

## Sayfalar
- index.html — ana
- tarihce.html
- gezilecek.html
- ulasim.html
- pratik.html
- PWA: manifest.json + sw.js

## Not
Sefer saatleri resmi kaynaklara yönlendirilir; uydurma saat yok.
