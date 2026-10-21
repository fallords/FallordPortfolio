# Dokumentasi Teknis: Portofolio Fadhlan Bani

| | |
|---|---|
| Situs | https://fadhlanbani.vercel.app |
| Repo | https://github.com/fallords/FallordPortfolio (publik) |
| Hosting | Vercel, proyek `fallord-portfolio` (paket Hobby) |
| Domain lama | https://fallord-portfolio.vercel.app, dialihkan permanen (308) ke domain di atas |
| Diperbarui | Oktober 2026, sampai commit `a8f31cf` |

Dokumen ini menjelaskan cara kerja proyek dari sisi kode: teknologi, struktur, alur halaman, data, keamanan, performa, deploy, dan resep untuk perubahan yang sering dilakukan. Untuk penjelasan yang lebih sederhana tanpa istilah teknis, lihat panduan terpisah "Memahami Portofolio Anda".

## Daftar isi

1. [Ringkasan](#1-ringkasan)
2. [Teknologi](#2-teknologi)
3. [Menjalankan proyek](#3-menjalankan-proyek)
4. [Struktur folder](#4-struktur-folder)
5. [Rute dan rendering](#5-rute-dan-rendering)
6. [Layout global](#6-layout-global)
7. [Beranda, section per section](#7-beranda-section-per-section)
8. [Sistem desain](#8-sistem-desain)
9. [Potret di hero](#9-potret-di-hero)
10. [Loading, error, dan ketahanan](#10-loading-error-dan-ketahanan)
11. [Interaksi dan aksesibilitas](#11-interaksi-dan-aksesibilitas)
12. [Performa](#12-performa)
13. [Keamanan](#13-keamanan)
14. [SEO dan metadata](#14-seo-dan-metadata)
15. [Deploy dan alur kerja git](#15-deploy-dan-alur-kerja-git)
16. [Resep perubahan](#16-resep-perubahan)
17. [Pengujian dan QA](#17-pengujian-dan-qa)
18. [Keputusan dan kompromi](#18-keputusan-dan-kompromi)
19. [Masalah yang diketahui](#19-masalah-yang-diketahui)

---

## 1. Ringkasan

Situs portofolio satu halaman (beranda) ditambah halaman per tulisan. Semua halaman dibangun menjadi HTML statis saat build dan dilayani dari CDN Vercel. Tidak ada database, API route, form, login, atau layanan pihak ketiga yang dipanggil dari browser.

Prinsip yang dipegang di seluruh kode:

- **HP dulu.** Setiap section dirancang muat kira-kira satu layar HP. Yang bisa digeser atau terpotong selalu diberi petunjuk.
- **Tiga material warna.** Iron (permukaan dan teks), Cloak (hijau tua: potret, Contact, footer), Gold (yang sedang ditunjuk dan penomoran).
- **Ringan dan tahan gagal.** Bagian yang gagal diganti pesan di tempatnya sendiri, dan halaman tetap terbaca tanpa JavaScript.
- **Isi asli saja.** Data proyek, sertifikat, dan tulisan diambil dari dokumen aslinya, bukan teks karangan.

## 2. Teknologi

| Bagian | Pilihan | Versi |
|---|---|---|
| Framework | Next.js, App Router, Turbopack | 16.3.8 |
| UI | React, dengan React Compiler (`reactCompiler: true`) | 19.2.8 |
| Bahasa | TypeScript, mode `strict` | 5.9 |
| Styling | Tailwind CSS 4 (lewat `@tailwindcss/postcss`) dan token CSS di `globals.css` | 4.2 |
| Font | `next/font/google`, di-host sendiri: Cormorant Garamond, Geist, Geist Mono | |
| Gambar | `next/image`, format AVIF lalu WebP | |
| Gambar share | `next/og` (`ImageResponse`), dibuat saat build | |
| Lint | ESLint 9 dengan `eslint-config-next` (core-web-vitals dan typescript) | 9.39 |
| Hosting | Vercel | |

Dependency runtime hanya `next`, `react`, dan `react-dom`. Tidak ada library UI, animasi, atau ikon. Animasi dibuat dengan CSS, dan spring di `ReadingProgress` ditulis sendiri.

## 3. Menjalankan proyek

Butuh Node.js 20 atau lebih baru (dikembangkan dengan Node 24) dan npm.

```bash
npm install
```

```bash
npm run dev
```

Server pengembangan di http://localhost:3000. CSP tidak dikirim di mode ini karena hot reload butuh `eval` dan websocket.

```bash
npm run build
```

```bash
npm run start -- -p 3300
```

Server produksi lokal. Konfigurasi `portfolio-prod` di `.claude/launch.json` memakai port 3300.

```bash
npm run lint
```

```bash
npx tsc --noEmit
```

Catatan:

- File baru di `public/` baru dilayani `next start` setelah server di-restart.
- Perubahan `next.config.ts` (header, gambar) baru berlaku setelah build ulang dan restart.

## 4. Struktur folder

```
.
├── docs/                         dokumen ini
├── scripts/check-assets.mjs      dijalankan sebelum build: path gambar/PDF harus ada
├── public/
│   ├── certificates/             scan sertifikat (JPEG, sisi terpanjang ±1600px)
│   ├── frames/
│   │   ├── square/001–181.jpg    potret, potongan 1:1 (HP, tablet)
│   │   ├── wide/001–181.jpg      potongan 1.4:1 (laptop)
│   │   ├── full/001–181.jpg      potongan 16:9 (layar sangat lebar)
│   │   └── still-*.jpg           frame 181 berwarna, untuk demo Design
│   ├── sera-phone.png, cv-maker-phone.png   screenshot proyek di bagian Work
│   └── *.pdf                     teks lengkap tulisan
├── src/
│   ├── app/
│   │   ├── layout.tsx            HTML dasar, font, metadata, boot script
│   │   ├── page.tsx              beranda: urutan section
│   │   ├── writing/[slug]/page.tsx  halaman tiap tulisan
│   │   ├── globals.css           token warna, grid, kelas animasi
│   │   ├── opengraph-image.tsx   gambar share 1200×630
│   │   ├── sitemap.ts, robots.ts
│   │   ├── not-found.tsx, error.tsx, global-error.tsx
│   │   └── favicon.ico
│   ├── components/               semua bagian halaman (lihat bagian 7)
│   │   └── demos/                lima demo interaktif di "What I do"
│   ├── content/
│   │   ├── certifications.ts     data sertifikat
│   │   └── writing.ts            data tulisan
│   └── lib/
│       ├── site.ts               domain, email, tautan sosial
│       ├── intro.ts              boot script dan konstanta intro
│       ├── portraitProgress.ts   progres potret untuk layar intro
│       ├── inertOthers.ts        mengunci halaman di belakang dialog
│       ├── useScrollFade.ts      tepi memudar di baris yang digeser
│       └── useSwipe.ts           swipe sentuh
├── next.config.ts                header keamanan, cache, aturan gambar
├── eslint.config.mjs, postcss.config.mjs, tsconfig.json
└── package.json
```

Alias impor: `@/` mengarah ke `src/` (lihat `tsconfig.json`).

## 5. Rute dan rendering

| Rute | File | Jenis | Catatan |
|---|---|---|---|
| `/` | `app/page.tsx` | Statis | Beranda |
| `/writing/[slug]` | `app/writing/[slug]/page.tsx` | SSG | `generateStaticParams` dari `writing.ts`, `dynamicParams = false` (slug lain menjadi 404) |
| 404 | `app/not-found.tsx` | Statis | Judul "Page not found", `noindex` |
| `/opengraph-image` | `app/opengraph-image.tsx` | Statis | PNG 1200×630, dibuat saat build |
| `/sitemap.xml` | `app/sitemap.ts` | Statis | Beranda dan semua tulisan |
| `/robots.txt` | `app/robots.ts` | Statis | Izinkan semua, tautkan sitemap |

Error di dalam halaman ditangani `app/error.tsx`. Error di root layout ditangani `app/global-error.tsx`, yang membawa `<html>` dan font cadangannya sendiri.

**Komponen server dan client.** Komponen tanpa `"use client"` dirender saat build saja: `layout`, `page`, `Hero`, `Works`, `Writing`, `Contact`, `Footer`, `Section`, `SwipeHint`, dan halaman tulisan. Komponen dengan `"use client"` ikut dijalankan di browser:

- **Bagian halaman:** `About`, `Certifications`, `CertificateLightbox`, `CommandPalette`, `Header`, `IntroScreen`, `PageLoading`, `Portrait`, `Reveal`, `ReadingProgress`, `LocalTime`, `CopyEmail`, `GridOverlay`, `GridToggle`, `SwipeRow`.
- **Penanganan error:** `ErrorBoundary`, `FallbackNotice`, `error.tsx`, `global-error.tsx`.
- **Demo:** kelima komponen di `demos/`.

## 6. Layout global

`app/layout.tsx` berisi:

- **Font:** Geist (teks, antarmuka, label, dan petunjuk), Geist Mono (hanya data dan kode: tahun, penghitung, kode, ID model, tombol keyboard), dan Cormorant Garamond 500/600 (judul, selalu tegak, tanpa italic). Semua di-host sendiri oleh `next/font` dan dipasang sebagai variabel CSS `--font-geist`, `--font-geist-mono`, dan `--font-cormorant`.
- **Viewport:** `themeColor #0d1011`, `viewportFit: cover`, dan zoom tidak dikunci.
- **Metadata:** judul "Fadhlan Bani · Developer & designer", deskripsi, canonical `/`, Open Graph, Twitter card, dan `robots: index, follow`.
- **Boot script** (`BOOT_SCRIPT` dari `lib/intro.ts`) sebagai `<script>` inline di `<head>`. Lihat bagian 10.
- **Isi `<body>`:**
  - `IntroScreen` (layar pembuka)
  - `Header`
  - `PageLoading` di dalam `ErrorBoundary`
  - isi halaman
  - `GridOverlay` dan `CommandPalette`, masing-masing di dalam `ErrorBoundary` sendiri

## 7. Beranda, section per section

Urutan diatur di `app/page.tsx`.

| Section | `id` | Komponen | Sumber data |
|---|---|---|---|
| Hero | | `Hero.tsx`, `Portrait.tsx`, `LocalTime.tsx` | teks di `Hero.tsx`, email di `site.ts` |
| Work | `work` | `Works.tsx`, `SwipeRow.tsx` | array `projects` di `Works.tsx` |
| What I do | `about` | `About.tsx`, `demos/*` | array `services` dan `tools` di `About.tsx` |
| Certificates | `certificates` | `Certifications.tsx`, `CertificateLightbox.tsx` | `content/certifications.ts` |
| Writing | `writing` | `Writing.tsx` | `content/writing.ts` |
| Contact | `contact` | `Contact.tsx`, `CopyEmail.tsx` | `lib/site.ts` |
| Footer | | `Footer.tsx`, `GridToggle.tsx` | |

**Kerangka section (`Section.tsx`).** Semua section di bawah hero memakai komponen ini dengan props `id`, `title`, `intro`, `count` (superscript jumlah, tampil kalau lebih dari 1), `wide`, `className`, `introClassName`, dan `padding`. Section tidak bernomor: penomoran 01–05 di margin sudah dihapus karena urutannya bukan langkah yang harus diikuti. Di grid 12 kolom, kolom 1–3 adalah margin (pada section `wide`: daftar tab, screenshot, cover, atau index) dan kolom 4–12 adalah konten. Padding vertikal bawaan 64px, menjadi 80px dari 1024px. Contact memakai `padding="py-16"` supaya ritme halaman tidak seragam.

**Header.** Header menempel di atas (48px di HP, 56px di laptop). Link menuju `/#id`. Di beranda, link section yang sedang dibaca ditandai garis bawah emas (`aria-current="location"`): section aktif adalah yang bagian atasnya sudah melewati sepertiga layar, dan Certificates ikut menandai About. Di layar ≥768px ada tombol Ctrl/⌘ K.

**Hero.** Di HP, potret ditaruh di atas (46svh) dan teks naik 112px menimpa bagian bawahnya yang memudar. Di laptop, potret menempel ke tepi kanan (62%), nama diletakkan melintasi sambungan, dan ada tiga fakta (Based in dengan jam WIB, Focus, Stack). Kalau potret gagal, kotaknya tetap ada dengan warna cloak.

**Work.** Setiap proyek punya meta (tahun, jenis, titik Live), judul, subjudul, deskripsi, screenshot dalam bingkai garis tipis (tanpa tiruan bar browser), kartu fitur, stack, dan tombol "Open the app". Di HP, kartu fitur menjadi baris yang digeser (84% lebar, snap).

**What I do.** Lima tab ARIA (Code, Design, Systems, AI, Hardware), masing-masing dengan demo:

| Tab | Demo | Isi |
|---|---|---|
| Code | `CodeDemo` | Mengetik `loadOrder` milik potret, lalu menjalankan fungsi aslinya (diimpor dari `Portrait.tsx`) dan menyalakan 181 kotak sesuai urutan muat |
| Design | `WireframeDemo` | Wireframe hero dan desain jadinya, dengan slider di antara keduanya. Bentuk panel memilih versi lebar atau HP lewat container query |
| Systems | `TraceDemo` | Trace request `POST /api/analyze`, diputar 2,5× lebih lambat |
| AI | `StreamDemo` | Jawaban chat yang mengalir per token. Jawabannya sudah ditulis, tidak ada API |
| Hardware | `SensorDemo` | Sinyal akselerometer dengan ambang jatuh 23.1 m/s², lalu jalur MPU6050 → ESP32 → LoRa → Receiver → HTTP POST → MySQL. Berhenti saat panel tidak terlihat |

Tab dipilih dengan klik atau keyboard (panah, Home, End), tidak dengan hover, supaya demo tidak berganti saat kursor lewat. Demo di-*key* pada tab, jadi selalu mulai dari awal. Setiap demo dibungkus `ErrorBoundary` dengan tombol "Try again". Panel demo setinggi 480px tetap mulai 768px. Daftar "Tools I use" bisa dilipat di HP.

**Certificates.** Sertifikat dikelompokkan berdasarkan `field` ke dalam `GROUPS` (Cloud & AI, Computer science, Earth observation, Psychology & society, lalu Other untuk bidang yang tidak terdaftar). Ringkasan jumlah sertifikat, institusi, dan rentang tahun dihitung otomatis. Viewer berganti sendiri setiap 5 detik lewat animasi bar progres, dan berhenti saat:

- tombol Pause ditekan
- fokus keyboard ada di dalam section (hanya `:focus-visible`, jadi klik mouse pada panah tidak menghentikannya)
- section tidak terlihat di layar
- lightbox terbuka
- pengunjung memakai reduced motion

Di HP ada strip thumbnail yang bisa digeser dan swipe di viewer. Di laptop, index ada di margin. Lightbox (`CertificateLightbox`) dirender lewat portal dan tetap terpasang saat tertutup (disembunyikan dengan `visibility`). Lightbox mendukung panah, Esc, swipe kiri dan kanan, tarik ke bawah untuk menutup, serta fokus yang pindah ke tombol Close dan kembali ke tombol pembuka. Nama sertifikat hanya dibacakan screen reader (`aria-live`) saat slideshow tidak berjalan sendiri.

**Writing.** Cover bergaya halaman cetak, dengan ukuran huruf dalam satuan `cqw` (mengikuti lebar cover). Di laptop, ringkasan dan kata kunci ikut tampil. Di HP, tulisan ditampilkan sebagai daftar ringkas. Halaman tulisan (`/writing/[slug]`) hanya memuat ringkasan (abstract, atau paragraf pembuka untuk studi kasus), tombol PDF di bawah judul, kata kunci, dan tautan Newer/Older. Teks lengkap ada di PDF.

**Contact dan footer.** Contact memuat email besar dengan font serif (dipecah dengan `<wbr>` setelah "@"), tombol "Copy address", serta LinkedIn dan Instagram. Footer memuat nama besar dengan warna satu tingkat dari latar, tombol "Show grid", dan "Back to top".

**Command palette (`CommandPalette.tsx`).** Dibuka dengan Ctrl/⌘ K atau `/`, berupa combobox dengan `aria-activedescendant`. Isinya: lompat ke section, salin dan kirim email, buka profil sosial, tampilkan grid, dan kembali ke atas. Daftar section di dalamnya ditulis manual, jadi harus disesuaikan kalau section ditambah, dihapus, atau diganti namanya.

## 8. Sistem desain

Semua token ada di `:root` dalam `src/app/globals.css`.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--surface` / `--surface-card` / `--surface-raised` | `#0d1011` / `#13171a` / `#1a1f22` | latar, panel, kotak gambar |
| `--fg` / `--fg-soft` / `--fg-muted` / `--fg-dim` / `--fg-faint` | `#e7ebed` / `#c2c9cc` / `#8f999d` / `#78838a` / `#3f474b` | judul, teks panjang, pendukung, label, dekorasi |
| `--rule` / `--rule-strong` | putih kebiruan 9% / 18% | garis rambut |
| `--cloak` / `--cloak-bright` | `#14261c` / `#2f5a44` | Contact, footer, seleksi teks |
| `--gold` | `#bf9d5f` | hover, fokus, menu aktif, garis progres, petunjuk, nomor daftar |
| `--live` / `--wordmark` | `#5fbf8a` / `#1c3426` | titik Live, nama besar di footer |
| `--paper` / `--ink` | `#ebe6da` / `#1c1d1e` | cover tulisan |
| `--syntax-string` / `--syntax-type` / `--syntax-number` | `#8fbf9f` / `#9fb6c6` / `#c9a3c9` | warna kode di demo Code |

Tidak ada warna yang ditulis langsung di komponen. Warna baru ditambahkan sebagai token di sini dulu. Satu-satunya pengecualian adalah `opengraph-image.tsx`, karena gambar share dirender di server tanpa CSS.

- **Grid:** `.shell` (lebar maksimum 1280px, padding 20px, menjadi 40px dari 768px, ditambah safe area) dan `.grid-12` (4 kolom dengan jarak 16px, menjadi 12 kolom dengan jarak 24px dari 768px).
- **Ukuran dasar:** di bawah 380px, `font-size` root menjadi 93.75% (15px), sehingga semua ukuran ikut mengecil.
- **Kelas utilitas:** `.link`, `.reveal`, `.rise`, `.fade-in`, `.draw`, `.scroll-fade`, `.pulse-dot`, `.nudge-x`, `.caret`, `.intro*`, `.page-loading`, `.loading-bar`, `.wf-wide`, dan `.wf-tall`.
- **Reduced motion:** semua animasi selesai seketika, dan bar loading diam.

Rincian tipografi, skala, dan catatan desain ada di halaman "Catatan Desain Fadhlan Bani" (artifact privat).

## 9. Potret di hero

`components/Portrait.tsx` menggambar putaran kepala 181 frame ke `<canvas>`.

- **Data.** `public/frames/{square,wide,full}/001.jpg` sampai `181.jpg` sudah hitam putih (bobot Rec.709, sama dengan filter `grayscale(1)` di CSS) dan sudah dipotong di sekitar wajah. Kotak potret memilih potongan tersempit yang masih menutup kotaknya: rasio ≤1 memakai `square`, ≤1.4 memakai `wide`, dan selebihnya `full`. Pilihan ini dihitung ulang setiap kali ukuran berubah.
- **Pemuatan.** Frame diambil lewat optimizer (`/_next/image?url=…&w=…&q=75`) dengan lebar sesuai ukuran kotak × DPR (maksimum 2). Kalau gagal, frame diambil sebagai JPEG asli. Urutannya kasar ke halus: kedua ujung, lalu setiap frame ke-32, ke-16, dan seterusnya sampai setiap frame, dengan 6 permintaan sekaligus.
- **Animasi.** Putaran mulai setelah 24 frame masuk (setiap frame ke-8) atau setelah 2,5 detik. Posisi frame adalah fungsi murni dari waktu: 7 detik putar, 1,6 detik diam, dengan kurva sinus. Animasi berhenti saat potret tidak terlihat (IntersectionObserver).
- **Mode diam.** Saat reduced motion, Save-Data, atau koneksi 2G, hanya frame 181 yang dimuat.
- **Warna.** Filter `grayscale(1) contrast(1.1)`, ditambah lapisan `--cloak-bright` dengan `mix-blend-color` 60%.
- **Progres ke intro.** `reportPortraitProgress(loaded / 24)` dikirim lewat `lib/portraitProgress.ts`.

File sumber video dan skrip pembuat frame tidak ada di repo. Untuk mengganti potret, siapkan 181 frame baru dengan tiga potongan dan nama file yang sama.

## 10. Loading, error, dan ketahanan

**Boot script (`lib/intro.ts`, berjalan di `<head>` sebelum halaman tampil):**

- Memasang `data-js` di `<html>`. Elemen `.reveal` hanya disembunyikan selama tanda ini ada. Kalau aplikasi belum hidup dalam 3 detik (belum ada `data-hydrated`), tanda dicabut dan semua langsung tampil.
- Mengatur `data-intro` dengan nilai `show`, `skip`, `leaving`, atau `done`. Intro hanya tampil sekali per sesi (`sessionStorage["intro-seen"]`). Intro dilewati saat reduced motion atau kalau HTML baru tiba setelah 1000ms, dan paling lama 1500ms sejak halaman mulai dimuat.

**Layar intro (`IntroScreen.tsx`).** Progresnya terdiri dari font (25%) dan potret (75%, hanya di beranda). Intro terangkat begitu keduanya siap, minimal 500ms. Selama aplikasi belum hidup, garis "creep" dari CSS tetap bergerak.

**Loading antar halaman (`PageLoading.tsx`):**

- **Mulai:** saat link internal ke halaman lain diklik (listener capture di `document`). Layar baru tampil setelah 150ms.
- **Berakhir:** saat alamat berubah, saat `popstate`, saat `pageshow` dari bfcache, atau paling lambat 10 detik. Komponen ini sengaja dipakai sebagai pengganti `loading.tsx`, yang membuat halaman kosong tanpa JavaScript.

**Batas error:**

| Bagian | Kalau gagal |
|---|---|
| What I do, Certificates | diganti `Section` berisi `FallbackNotice` |
| Satu demo | pesan dan "Try again" di panelnya saja |
| Potret | kotak cloak dengan fade yang sama |
| `PageLoading`, `GridOverlay`, `CommandPalette` | hilang tanpa mengganggu halaman |
| Error lain di halaman | `app/error.tsx` (Try again dan Home) |
| Error di root layout | `app/global-error.tsx` |

**Tanpa JavaScript.** Semua teks dan gambar statis tetap tampil. Potret menjadi kotak hijau kosong, dan jam menampilkan `--:--`.

## 11. Interaksi dan aksesibilitas

- **Keyboard:**
  - **Tab What I do:** panah, Home, dan End, dan hanya tab terpilih yang masuk urutan Tab.
  - **Palette:** Ctrl/⌘ K atau `/`, lalu ↑ ↓ ↵ Esc.
  - **Overlay grid:** tombol `G`.
  - **Lightbox:** ← → Esc.
- **Fokus:** outline emas 1px dengan jarak 3px (`:focus-visible`). Selama lightbox atau palette terbuka, elemen lain di `<body>` dibuat `inert` (`lib/inertOthers.ts`), jadi Tab tidak bisa keluar ke halaman di belakangnya. Fokus dikembalikan ke pembuka setelah dialog ditutup.
- **Sentuh:**
  - **Swipe:** `useSwipe` memakai pointer event (bukan mouse), dengan ambang 40px, `touch-action` `pan-y` atau `pinch-zoom`, dan pengecekan `visualViewport.scale` supaya swipe tidak terpicu saat layar di-zoom.
  - **Baris geser:** baris yang bisa digeser memakai `useScrollFade` (atribut `data-more-left` dan `data-more-right`) dan `SwipeHint`.
- **Target sentuh:** tombol (chip tab, panah dan Pause sertifikat, toggle Tools, dan di layar sentuh semua tombol demo: Run again, Send again, chip pertanyaan, Stop, Simulate an impact) 44px, ditulis dalam px supaya tidak ikut mengecil di layar di bawah 380px. Tautan teks minimal 24px, dan sekitar 40px di perangkat sentuh (`.link` mendapat padding tambahan di `pointer: coarse`).
- **Ukuran huruf:** tidak ada teks di bawah 12px (`text-xs`), termasuk di dalam demo.
- **Gerak:** `prefers-reduced-motion` membuat animasi selesai seketika, potret diam, slideshow berhenti, dan scroll tidak halus (termasuk dari palette, yang tidak menulis `behavior` sendiri dan mengikuti CSS).
- **Semantik:** landmark `header`/`main`/`nav`/`footer`, `aria-current` di menu, `role="dialog"` dengan `aria-modal` di lightbox dan palette, serta `role="status"` di loading.

## 12. Performa

- Semua halaman statis dan dilayani dari CDN.
- Gambar lewat `next/image` dalam format AVIF atau WebP. Hanya folder yang terdaftar di `images.localPatterns` yang boleh dioptimasi.
- **Cache:**
  - `/frames/*` disajikan dengan `Cache-Control: public, max-age=31536000, immutable`, karena frame tidak pernah berubah.
  - File lain di `public` (scan sertifikat, screenshot) memakai default Vercel dan dicek ulang, jadi file yang diganti dengan nama sama langsung terlihat. Font ada di `/_next/static` dan sudah di-cache permanen oleh Next.
  - Header dan palette tidak mengimpor `content/writing.ts`, supaya isi tulisan tidak ikut terkirim di JavaScript setiap halaman.
  - HTML memakai `max-age=0, must-revalidate`.
- **Font:** di-host sendiri dan di-preload.
- **JavaScript:** sekitar 184 KB (terkompresi) untuk beranda.
- **Ukuran aset:** frame sekitar 9,6 MB di repo, tapi yang diunduh pengunjung jauh lebih kecil karena ukurannya disesuaikan dengan layar. Sertifikat 1,5 MB. PDF studi kasus 1,9 MB (foto di dalamnya dikompres ulang dari 4,6 MB).
- **Ukuran terakhir (September 2026, cache kosong):**

  | Kondisi | FCP | LCP | CLS |
  |---|---|---|---|
  | HP di 4G lambat | 1,8 s | 2,1 s | 0 |
  | Laptop | | 0,6 s | |

## 13. Keamanan

Header diatur di `next.config.ts`:

| Header | Nilai | Berlaku di |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | semua |
| `X-Frame-Options` | `DENY` | semua |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | semua |
| `Permissions-Policy` | kamera, mikrofon, lokasi, pembayaran, USB, dan browsing-topics dimatikan | semua |
| `Cross-Origin-Opener-Policy` | `same-origin` | semua |
| `Cross-Origin-Resource-Policy` | `same-origin` | semua kecuali `/opengraph-image` (agar preview link tetap bisa diambil) |
| `Content-Security-Policy` | lihat di bawah | produksi, semua kecuali `*.pdf` |
| `Strict-Transport-Security` | dari Vercel: 2 tahun, `includeSubDomains`, `preload` | semua |

CSP:

```
default-src 'none'; script-src 'self' 'unsafe-inline'; script-src-attr 'none';
style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self';
connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none';
frame-ancestors 'none'; upgrade-insecure-requests
```

- `'unsafe-inline'` untuk script tetap ada karena halaman statis membawa script inline (boot script dan data halaman dari Next.js). Nonce mengharuskan render per permintaan. Situs ini tidak menerima input pengunjung, jadi tidak ada yang bisa disuntikkan.
- `script-src-attr 'none'` memblokir event handler inline di HTML (`onclick="…"`).
- **Penting:** menambah layanan luar (analytics, embed video, font atau CDN lain, form ke server lain) akan diblokir CSP sampai domainnya ditambahkan ke direktif yang sesuai.

Lainnya:

- **Image optimizer:** hanya `/frames/**`, `/certificates/**`, `/sera-phone.png`, dan `/cv-maker-phone.png`. Permintaan lain dijawab 400.
- **Dependency:** dicek dengan `npm audit`, yang melaporkan 0 kerentanan per Oktober 2026. Perbarui Next.js setiap ada patch keamanan.
- **Rahasia:** tidak ada kunci atau token di repo. `.env*` dan `.claude/` diabaikan git.
- `poweredByHeader: false`.

## 14. SEO dan metadata

- **Metadata halaman:** judul, deskripsi, canonical, Open Graph, dan Twitter card per halaman. Halaman tulisan mengatur ulang semuanya, termasuk gambar share.
- **Gambar share:** dibuat saat build dengan font Google yang di-subset ke huruf yang dipakai saja. Kalau salah satu font gagal diambil, keduanya diganti font bawaan supaya hurufnya tidak campur.
- **Sitemap:** beranda dan semua tulisan, otomatis dari `writing.ts`. Domainnya dari `lib/site.ts`.
- **404:** memakai `noindex` dan judul tersendiri.

## 15. Deploy dan alur kerja git

- **Produksi:** setiap push ke `main` di GitHub memicu build dan deploy di Vercel, yang tayang sekitar 40–60 detik kemudian. Branch lain menjadi preview deployment.
- **Domain:** `lib/site.ts` memakai `VERCEL_PROJECT_PRODUCTION_URL` kalau nilainya domain sendiri (bukan `.vercel.app`). Selain itu dipakai `fadhlanbani.vercel.app`. Kalau nanti memakai domain sendiri, sitemap, OG, dan canonical ikut berganti otomatis.
- **Alur yang dipakai:**

  ```bash
  git switch -c nama-perubahan
  git add <file>
  git commit -m "Pesan yang menjelaskan perubahan"
  git switch main
  git merge --ff-only nama-perubahan
  git push origin main
  git branch -d nama-perubahan
  ```

  Setelah push, cek situs live: halaman terbuka, header terkirim, dan tidak ada error di console.

## 16. Resep perubahan

**Menambah sertifikat:**

1. Simpan scan ke `public/certificates/nama-baru.jpg`, JPEG dengan sisi terpanjang sekitar 1600px.
2. Tambahkan entri di `src/content/certifications.ts`. Urutan array adalah urutan tampil. Isi `name` dan `issuer` persis seperti di sertifikat, lalu `year`, `field`, `image`, dan `url` (hanya untuk halaman verifikasi resmi).
3. Kalau `field` baru, tambahkan ke salah satu grup di `GROUPS` (`components/Certifications.tsx`). Kalau tidak, sertifikat masuk grup "Other".
4. `npm run build` menjalankan `scripts/check-assets.mjs` lebih dulu: build gagal kalau path gambar atau PDF di `src/` tidak ada di `public/`, jadi salah ketik ketahuan sebelum tayang.

**Menambah atau mengubah proyek di Work:**

1. Ubah array `projects` di `components/Works.tsx`.
2. Simpan screenshot di `public/`. Mengganti file dengan nama yang sama juga boleh, karena gambar di luar `/frames` dicek ulang oleh browser.
3. Tambahkan path screenshot ke `images.localPatterns` di `next.config.ts`. Kalau tidak, optimizer menjawab 400.

**Menambah tulisan:**

1. Simpan PDF ke `public/`.
2. Tambahkan entri di `yourEssays` (`src/content/writing.ts`): `slug`, `title`, `year`, `field`, `summary`, `readingTime`, dan `body`. Kalau `body` memuat `"## Abstract"`, paragraf di bawahnya menjadi ringkasan. Kalau tidak, paragraf pembukanya yang dipakai. Hanya bagian itu yang tampil, jadi teks lengkap cukup ada di PDF (studi kasus LoRa hanya menyimpan paragraf pembukanya).
3. Halaman, sitemap, dan daftar di beranda dibuat otomatis.

**Mengubah teks:**

| Yang diubah | File |
|---|---|
| Hero (eyebrow, kalimat, fakta) | `Hero.tsx` |
| Kategori dan tools | `services` dan `tools` di `About.tsx` |
| Judul tab, deskripsi meta | `app/layout.tsx` |
| Email, LinkedIn, Instagram | `lib/site.ts` |
| Teks gambar share | `app/opengraph-image.tsx` |
| Replika hero di demo Design | `WireframeDemo.tsx` |

**Mengubah urutan section:** ubah `page.tsx`, lalu sesuaikan daftar di `CommandPalette.tsx` dan `OWNER` di `Header.tsx` kalau perlu.

## 17. Pengujian dan QA

Wajib lolos sebelum commit:

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

```bash
npm run build
```

Checklist manual (dengan `npm run start` atau situs live):

- [ ] Lebar 320, 360, 390, 412, 768, 1024, 1440, dan 1920: tidak ada scroll ke samping, dan tidak ada teks yang terpotong.
- [ ] Console bersih: tidak ada error, permintaan 4xx/5xx, atau pelanggaran CSP.
- [ ] Intro tampil sekali per sesi, dan potret berputar.
- [ ] Kelima tab What I do: demo jalan, dan keyboard berfungsi.
- [ ] Sertifikat: maju dan mundur, pause, swipe di HP, lightbox (panah, Esc, fokus).
- [ ] Ctrl/⌘ K, tombol G, Back to top.
- [ ] Buka halaman tulisan, lalu kembali: layar loading tidak tertinggal.
- [ ] PDF terbuka di penampil browser.
- [ ] Reduced motion dan tanpa JavaScript: semua teks tampil.
- [ ] HP dengan jaringan lambat: konten utama tampil dalam waktu wajar.

Selama pengembangan, pemeriksaan ini dijalankan otomatis dengan Chrome headless lewat CDP (skrip sementara, tidak disimpan di repo).

## 18. Keputusan dan kompromi

| Keputusan | Alasan |
|---|---|
| `PageLoading` sebagai pengganti `loading.tsx` | `loading.tsx` (Suspense) membuat halaman kosong tanpa JavaScript |
| Frame potret sudah hitam putih dan dipotong | Data warna dan area di luar layar tidak ikut diunduh. Gambar tetap identik |
| CSP dengan `'unsafe-inline'` untuk script | Halaman statis. Nonce mengharuskan render per permintaan |
| PDF tanpa CSP | CSP ditulis untuk halaman HTML. PDF dibuka di penampil bawaan browser |
| Halaman tulisan hanya ringkasan | Teks lengkap ada di PDF, sehingga halaman tetap ringan |
| Satu tema gelap | Identitas visual. Semua warna lewat token, jadi tema terang cukup dengan mendefinisikan ulang token |
| Section tanpa nomor | Penomoran 01–05 di margin adalah pola template editorial, dan urutannya bukan langkah |
| Judul selalu tegak, Cormorant italic tidak dimuat | Judul italic adalah ciri tulisan AI, dan satu file font jadi tidak perlu diunduh |
| Tanpa analytics | Tidak ada pihak ketiga, dan CSP tetap ketat |

## 19. Masalah yang diketahui

- Tanpa JavaScript, potret kosong (kotak hijau dengan keterangan "Frame 001 / 181").
- Di lebar 360px, section What I do sedikit lebih dari satu layar (chip 44px dan teks demo 12px menambah tingginya).
- Catatan desain: masih ada serif di bawah 32px (subjudul artikel, judul tulisan di HP, Newer/Older).
- Index sertifikat di laptop memakai nama lengkap, jadi beberapa baris turun ke dua baris. Ini disengaja: memotong nama akan menyembunyikan informasi.
- Bentuk header masih bar standar (nama di kiri, empat tautan dan tombol Ctrl K di kanan). Untuk empat tautan ini pilihan yang paling mudah dipakai.
- Skrip pembuat frame potret tidak ada di repo.
- Di luar repo ini: API key Gemini proyek S.E.R.A. pernah ter-commit di riwayat git repo S.E.R.A. dan perlu diganti.
