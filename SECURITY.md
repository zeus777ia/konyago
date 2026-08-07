# KonyaGo — Güvenlik kontrol listesi

Statik GitHub Pages sitesi. Sunucu / veritabanı yok; asıl risk hesap ve sızdırılmış sırlar.

## Sen yap (hesap)

### GitHub 2FA
1. https://github.com/settings/security  
2. **Two-factor authentication** → etkinleştir (uygulama veya güvenlik anahtarı tercih et)  
3. Recovery codes’u güvenli yere kaydet  

### Domain paneli 2FA
- Alan adı aldığın firmada (Nic.tr bayi / yurtdışı registrar) hesap 2FA’sını aç  
- Domain transfer kilidi (lock) açık olsun  

### Public repoda sır yok
- [x] Admin şifre hash’i repoda **yok** (yalnızca tarayıcı localStorage)  
- [x] Gemini API key repoda **yok** (localStorage `konyago_gemini_key`)  
- [ ] Eski commit’te yanlışlıkla key vardıysa: key’i **iptal et**, yeni üret  
- [ ] GitHub → Settings → Secrets: gereksiz secret bırakma  

```bash
# Bilgisayarında (isteğe bağlı tarama)
git log -p | grep -iE 'AIza|api[_-]?key|secret' || true
```

## Cloudflare (önerilen, ücretsiz plan yeterli)

1. https://dash.cloudflare.com → site ekle → `konyago.com.tr`  
2. Domain panelinde nameserver’ları Cloudflare’inkilerle değiştir  
3. SSL/TLS → **Full (strict)**  
4. Security → Bot Fight Mode açık  
5. İsteğe bağlı: Rate limiting (form / admin yolu)  
6. Analytics aç (IP/ülke özeti için faydalı)  

GitHub Pages + Cloudflare: DNS’te proxy (turuncu bulut) kullanırken SSL moduna dikkat et.

## Form / spam (şu an mailto)

Formlar `mailto:` ile açılıyor → sunucu spam’i yok, ama ileride gerçek endpoint eklenirse:

- [ ] Cloudflare Turnstile  
- [ ] Honeypot alan  
- [ ] Rate limit  

## Google Search Console

Ayda 1 kez bak:

1. https://search.google.com/search-console  
2. **Güvenlik ve manuel işlemler**  
3. **Sayfalar** (dizine eklenmeyenler)  
4. **Site haritası** durumu  
5. Performans (ani düşüş / garip sorgular)  

Site haritası: `https://konyago.com.tr/sitemap.xml`

## Admin paneli

- URL: `/admin.html` (menüde yok, `noindex`, robots Disallow)  
- İlk girişte şifre **bu cihazda** belirlenir  
- Başka cihazda tekrar “ilk kurulum” gerekir (bilinçli tercih)  
- Bu, sunucu auth değildir; sadece meraklı gözlerden korur  

## Olay anında

1. GitHub şifresini değiştir + 2FA oturumlarını gözden geçir  
2. Domain panel şifresini değiştir  
3. Sızan API key varsa provider’da revoke  
4. Search Console’da güvenlik uyarısı var mı bak  

İletişim: info@konyago.com.tr
