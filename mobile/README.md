# KonyaGo Mobil Uygulama

Capacitor ile **App Store** ve **Google Play** yayını için hazır iskelet.

Uygulama canlı siteyi açar: **https://konyago.com.tr**  
Site güncellenince uygulama da güncellenir (yeni mağaza sürümü şart değil).

---

## Gereksinimler

| Platform | Gereken |
|----------|---------|
| Android | Node 18+, Android Studio, JDK 17 |
| iOS | Mac + Xcode 15+, Apple Developer hesabı |

---

## Kurulum (tek sefer)

```bash
cd mobile
npm install
npx cap add android
npx cap add ios    # sadece Mac
npx cap sync
```

---

## Android (Google Play)

```bash
npx cap open android
```

Android Studio’da:

1. `Build > Generate Signed Bundle / APK` → **Android App Bundle (.aab)**
2. Keystore oluştur / kullan
3. [Google Play Console](https://play.google.com/console) → uygulama oluştur
4. Paket adı: `tr.com.konyago.app`
5. AAB yükle, mağaza listesi (açıklama, ekran görüntüleri, ikon) doldur
6. İçerik derecelendirme + gizlilik politikası: https://konyago.com.tr/gizlilik.html

### İkon / splash
`android/app/src/main/res/` altına adaptive icon koy.  
Kaynak: `../assets/img/eagle.svg` veya `../icon.svg`

---

## iOS (App Store)

```bash
npx cap open ios
```

Xcode’da:

1. Signing & Capabilities → Team seç
2. Bundle ID: `tr.com.konyago.app`
3. Archive → Distribute App → App Store Connect
4. [App Store Connect](https://appstoreconnect.apple.com) meta verileri doldur

**Önemli (Apple):** Sadece web sitesi saran uygulamalar reddedilebilir.  
Kabul şansını artırmak için:
- Push / konum / çevrimdışı gibi native özellik ekle
- Mağaza açıklamasında “Konya rehberi uygulaması” vurgula
- Gizlilik politikası ve destek URL’si ekle

---

## Mağaza metinleri (hazır)

**Kısa açıklama (80 karakter):**  
`Konya şehir rehberi — Mevlana, rotalar, mutfak, harita ve ulaşım.`

**Uzun açıklama:**  
`KonyaGo ile Konya’yı keşfedin. Mevlana Müzesi, Sille, Çatalhöyük ve daha fazlası. 1–2 günlük gezi rotaları, etli ekmek ve yöresel lezzetler, interaktif harita, ATUS ulaşım bilgileri ve pratik acil numaralar. Ücretsiz, sade ve hızlı.`

**Anahtar kelimeler:**  
`Konya, Mevlana, gezi, rehber, etli ekmek, Sille, harita, turizm`

**Destek e-posta:** cnrtech@outlook.com.tr  
**Gizlilik:** https://konyago.com.tr/gizlilik.html  
**Site:** https://konyago.com.tr

---

## Güncelleme

Site (GitHub Pages) değişince uygulama içeriği de değişir.  
Sadece native ayar / ikon değişirse:

```bash
npx cap sync
# sonra yeni AAB / IPA yükle
```

---

## Alternatif: PWA (mağaza olmadan)

Kullanıcılar tarayıcıdan **Ana ekrana ekle** ile uygulamayı kurabilir.  
Site zaten `manifest.json` + service worker içerir.

Android için ayrıca **TWA (Trusted Web Activity)** ile Play’e PWA yüklenebilir (Bubblewrap / PWABuilder).
