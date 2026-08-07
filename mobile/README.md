# KonyaGo Mobil Uygulama

**Capacitor 6** iskeleti — Google Play ve App Store yayını için.

| | |
|--|--|
| **Paket / Bundle ID** | `tr.com.konyago.app` |
| **Uygulama adı** | KonyaGo |
| **İçerik kaynağı** | Canlı site: https://konyago.com.tr |
| **Gizlilik** | https://konyago.com.tr/gizlilik.html |
| **Destek** | info@konyago.com.tr |

Site (GitHub Pages) güncellenince uygulama içeriği de güncellenir; her içerik değişiminde mağaza sürümü şart değildir.

---

## Mimari

```
mobile/
├── capacitor.config.json   # appId, splash, status bar, izinli domainler
├── package.json            # Capacitor 6 + eklentiler
├── www/                    # Yerel kabuk (splash / çevrimdışı fallback)
│   └── index.html
├── android/                # npm run add:android sonrası (gitignore)
└── ios/                    # npm run add:ios sonrası — yalnızca Mac (gitignore)
```

Uygulama **WebView** içinde `https://konyago.com.tr` yükler. Harita, Instagram, WhatsApp gibi dış linkler `allowNavigation` listesinde tanımlıdır.

---

## Gereksinimler

| Platform | Gereken |
|----------|---------|
| Ortak | **Node.js 18+**, npm |
| Android | Android Studio (Ladybug+), JDK 17, Android SDK |
| iOS | macOS, **Xcode 15+**, CocoaPods, Apple Developer hesabı |

---

## Kurulum (ilk sefer)

```bash
cd mobile
npm install

# Platform ekle
npm run add:android
npm run add:ios          # sadece Mac

# Yapılandırmayı native projelere işle
npm run sync
```

Kontrol:

```bash
npm run doctor
```

---

## Geliştirme

```bash
# Android Studio
npm run android

# Xcode
npm run ios

# Cihazda / emülatörde çalıştır
npm run run:android
npm run run:ios
```

Config veya `www/` değişince:

```bash
npm run sync
```

---

## Android → Google Play

1. `npm run android` ile Android Studio’yu aç  
2. **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**  
3. Keystore oluştur (yedekle; kaybedersen güncelleme yapamazsın)  
4. [Play Console](https://play.google.com/console) → uygulama oluştur  
5. Paket adı: **`tr.com.konyago.app`**  
6. AAB yükle, mağaza listesi + ekran görüntüleri + ikon  
7. Gizlilik politikası: `https://konyago.com.tr/gizlilik.html`  
8. İçerik derecelendirme anketini doldur  

### İkon / splash

- Adaptive icon: `android/app/src/main/res/mipmap-*`  
- Splash: `android/app/src/main/res/drawable` (config: `androidSplashResourceName: splash`)  
- Kaynak logo: repo kökü `assets/img/eagle.svg` / `icon.svg`  

Önerilen araç: [Capacitor Assets](https://github.com/ionic-team/capacitor-assets) veya Android Studio Image Asset Studio.

---

## iOS → App Store

1. `npm run ios` → Xcode  
2. **Signing & Capabilities** → Team seç  
3. Bundle ID: **`tr.com.konyago.app`**  
4. **Product → Archive → Distribute App → App Store Connect**  
5. [App Store Connect](https://appstoreconnect.apple.com) meta verileri doldur  

### Apple inceleme notu

Sadece web sitesi saran (thin WebView) uygulamalar reddedilebilir. Riski azaltmak için:

- Mağaza metninde “Konya şehir rehberi uygulaması” vurgula  
- Destek URL + gizlilik politikası ekle  
- Mümkünse native katkı ekle (paylaşım, çevrimdışı kabuk, durum çubuğu — iskelette hazır)  
- Ekran görüntülerinde gezi / mutfak / AI ekranlarını göster  

---

## Mağaza metinleri (hazır kopyala)

**Kısa açıklama (≤80 karakter)**  
`Konya şehir rehberi — Mevlana, rotalar, mutfak, harita ve AI asistan.`

**Uzun açıklama**  
`KonyaGo ile Konya’yı keşfedin. Mevlana Müzesi, Sille, Selçuklu mirası ve ilçe rehberleri. 1–2 günlük gezi rotaları, etli ekmek ve yöresel lezzetler, harita, nöbetçi eczane, hava durumu ve KonyaGo AI asistanı. Ücretsiz, sade ve mobil uyumlu.`

**Anahtar kelimeler**  
`Konya, Mevlana, gezi, rehber, etli ekmek, Sille, harita, turizm, eczane`

**Kategori**  
Seyahat / Travel  

**İletişim**  
- Destek: info@konyago.com.tr  
- Site: https://konyago.com.tr  
- Gizlilik: https://konyago.com.tr/gizlilik.html  

---

## Eklentiler (yüklü)

| Paket | Amaç |
|-------|------|
| `@capacitor/app` | Geri tuşu, app state |
| `@capacitor/browser` | Harici tarayıcı |
| `@capacitor/network` | Online / offline |
| `@capacitor/splash-screen` | Açılış ekranı |
| `@capacitor/status-bar` | Durum çubuğu rengi |
| `@capacitor/keyboard` | Klavye / form |
| `@capacitor/share` | Sistem paylaşımı |

---

## Sürüm numarası

- **package.json** `version` → örn. `1.1.0`  
- Android: `android/app/build.gradle` → `versionName` / `versionCode`  
- iOS: Xcode → General → Version / Build  

Mağazaya her native değişiklik için **versionCode / Build** artırılmalıdır.

---

## Alternatif: mağaza olmadan

Kullanıcı tarayıcıdan **Ana ekrana ekle** (PWA) ile kurabilir. Site `manifest.json` + service worker içerir.

Android’de **TWA (Trusted Web Activity)** ile PWA’yı Play’e sarmak için: [PWABuilder](https://www.pwabuilder.com/) / Bubblewrap.

---

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| `cap sync` hata | `rm -rf node_modules && npm install` sonra tekrar sync |
| Beyaz ekran | Cihaz internetini kontrol et; `server.url` = konyago.com.tr |
| SSL / mixed content | Yalnızca HTTPS; `cleartext: false` |
| iOS pod hata | `cd ios/App && pod install --repo-update` |
| Android build | JDK 17 seçili mi kontrol et |

```bash
npm run doctor
```
