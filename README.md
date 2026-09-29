# Dev Toolbox

Aplikasi webview untuk developer, dark modern UI. Berisi:

- **QR Generator** — teks/URL, WiFi (untuk menyambungkan perangkat sendiri ke WiFi, bukan mengganggu WiFi orang lain), kontak (vCard), email
- **Text & Encode** — Base64, ubah huruf, lorem ipsum, konversi timestamp
- **Color Tool** — HEX / RGB / HSL
- **Password Generator**
- **JSON Formatter** — format & minify
- **Music Player** — putar musik dari YouTube: tempel link (video/playlist) atau cari judul lagu, antrean hasil, kontrol notifikasi (Media Session)
- **Clock & Timer** — jam digital, stopwatch, countdown

> ⚠️ Catatan: fitur untuk melihat/memutus koneksi WiFi perangkat lain (deauth/jammer) **sengaja tidak dibuat**. Selain melanggar hukum tanpa izin pemilik jaringan, webview/HTML juga tidak punya akses ke hardware WiFi, jadi tidak bisa dibangun dengan pendekatan ini.

## Struktur project

```
devtoolbox-app/
├── index.html
├── manifest.json
├── css/style.css
├── js/app.js
├── icons/
└── .github/workflows/
    ├── deploy-pages.yml   # deploy situs ke GitHub Pages
    └── build-apk.yml      # bungkus jadi APK (Trusted Web Activity)
```

## 1. Coba lokal

Jalankan server statis (jangan buka `index.html` langsung via `file://`, karena pemutar YouTube menolak origin `file://` / error 153):

```bash
python3 -m http.server 8080
# buka http://localhost:8080
```

## 2. Push ke GitHub

```bash
git init
git add .
git commit -m "init dev toolbox"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

Aktifkan GitHub Pages: **Settings → Pages → Source: GitHub Actions**.
Workflow `deploy-pages.yml` otomatis jalan tiap push ke `main` dan mem-publish situs ke:
`https://<username>.github.io/<nama-repo>/`

## 3. Jadikan APK (webview app)

Repo ini pakai pendekatan **Trusted Web Activity (TWA)** lewat [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) — cara paling umum & didukung resmi Google untuk membungkus PWA jadi APK asli (bukan sekadar iframe webview), sehingga tampil full-screen tanpa address bar.

Langkah:
1. Pastikan situs sudah live di GitHub Pages (langkah 2).
2. Edit `.github/workflows/build-apk.yml`, ganti `PWA_URL` dan `PACKAGE_ID` sesuai repo kamu.
3. Buka tab **Actions** di GitHub → pilih workflow **Build Android APK** → **Run workflow**.
4. Setelah selesai, unduh APK dari bagian **Artifacts** di run tersebut.

Alternatif lain kalau ingin webview native penuh (bisa akses fitur device lebih dalam) tanpa harus deploy ke Pages dulu: gunakan [Capacitor](https://capacitorjs.com/) — `npx cap init`, `npx cap add android`, lalu build APK-nya lewat GitHub Actions dengan Android SDK + Gradle.

## Music Player (YouTube)

- **Tempel link**: `youtube.com/watch?v=…`, `youtu.be/…`, `music.youtube.com`, shorts, atau link playlist (`list=…`).
- **Cari judul**: hasil pertama otomatis diputar, sisanya jadi antrean (next/prev). Video yang dilarang embed dilewati otomatis.
- **API key (opsional)**: di bagian *Pengaturan pencarian* isi YouTube Data API v3 key untuk pencarian stabil. Tanpa key, dipakai server publik Piped/Invidious (bisa sesekali down; daftar server ada di `js/app.js`: `PIPED` / `INVIDIOUS`).
- **Latar belakang**: memakai Media Session + audio senyap agar kontrol notifikasi/lockscreen muncul, dan player mencoba lanjut otomatis bila dijeda browser saat di latar belakang. Ini *best effort* — perilaku bergantung browser/OS. Untuk jaminan pemutaran saat layar mati, bungkus dengan Capacitor + plugin background audio.

## Kustomisasi tampilan

Warna, font, dan spacing diatur lewat CSS variables di `css/style.css` (bagian `:root`), jadi gampang diganti tema tanpa menyentuh HTML/JS.
