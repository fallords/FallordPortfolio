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
- **Halaman sebagai instrumen.** Gaya visualnya dipelajari dari referensi pilihan pemilik situs (zrk.tech, karya Qream, Awwwards SOTD 9 Nov 2026): latar hampir hitam dengan grid titik halus, satu hijau sinyal, grotesk medium yang rapat untuk judul, monospace kapital untuk semua readout, bar atas dengan strip yang terisi selama halaman dibaca, bab bernomor, dan subjek yang ditahan di layar sementara scroll mengerjakannya. Isinya tetap milik situs ini: potret yang menoleh, mesin isometrik, dan demo.
- **Ringan dan tahan gagal.** Bagian yang gagal diganti pesan di tempatnya sendiri, dan halaman tetap terbaca tanpa JavaScript.
- **Isi asli saja.** Data proyek, sertifikat, dan tulisan diambil dari dokumen aslinya, bukan teks karangan.

## 2. Teknologi

| Bagian | Pilihan | Versi |
|---|---|---|
| Framework | Next.js, App Router, Turbopack | 16.3.8 |
| UI | React, dengan React Compiler (`reactCompiler: true`) | 19.2.8 |
| Bahasa | TypeScript, mode `strict` | 5.9 |
| Styling | Tailwind CSS 4 (lewat `@tailwindcss/postcss`) dan token CSS di `globals.css` | 4.2 |
| Font | `next/font/google`, di-host sendiri: Inter (tanpa sumbu `opsz`, demi ukuran file), Geist Mono | |
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
├── scripts/make-icons.mjs        membuat apple-icon.png dan favicon.ico dari icon.svg
├── public/
│   ├── certificates/             scan sertifikat (JPEG, sisi terpanjang ±1600px)
│   ├── frames/
│   │   ├── square/001–181.jpg    potret, potongan 1:1 (HP, tablet)
│   │   ├── wide/001–181.jpg      potongan 1.4:1 (laptop)
│   │   ├── full/001–181.jpg      potongan 16:9 (layar sangat lebar)
│   │   └── still-*.jpg           frame 181 berwarna, untuk demo Design
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
│   │   └── icon.svg, apple-icon.png, favicon.ico   ikon situs: "F" putih dan titik emas di atas warna halaman. icon.svg adalah sumbernya; dua lainnya dibuat ulang dengan `node scripts/make-icons.mjs`
│   ├── components/               semua bagian halaman (lihat bagian 7)
│   │   ├── demos/                lima demo interaktif di "What I do"
│   │   ├── figures/lora/         figur isometrik interaktif di halaman tulisan LoRa
│   │   ├── figures/thumbs/       thumbnail isometrik di Work (printer, lensa) dan Writing (wearable, pintu)
│   │   └── iso/                  kit gambar isometrik (dari skill anatomy)
│   ├── content/
│   │   ├── certifications.ts     data sertifikat
│   │   ├── experience.ts         data pengalaman kerja (dari LinkedIn)
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

- **Bagian halaman:** `About`, `Certifications`, `CertificateLightbox`, `CommandPalette`, `Header`, `IntroScreen`, `PageLoading`, `Portrait`, `Reveal`, `ReadingProgress`, `LocalTime`, `CopyEmail`, `GridOverlay`, `SwipeRow`.
- **Penanganan error:** `ErrorBoundary`, `FallbackNotice`, `error.tsx`, `global-error.tsx`.
- **Demo:** kelima komponen di `demos/`.
- **Figur:** `LoraLive` di `figures/lora/live.tsx`, serta `CvLive`, `SeraLive`, `WearableLive` dan `DoorLive` di `figures/thumbs/live.tsx`. Gambar statisnya dibuat di server (`art.tsx` masing-masing) dan dikirim sebagai elemen.

## 6. Layout global

`app/layout.tsx` berisi:

- **Font:** dua keluarga. Inter 400 untuk teks dan Inter 500 yang dirapatkan (−0.035em) untuk judul dan angka besar (kelas `.display`; token `--font-display` sekarang menunjuk ke Inter juga). Geist Mono kapital untuk semua readout (kelas `.label`: navigasi, meta section, tanggal, stack, penghitung frame, tombol) dan untuk kode. Variabel CSS-nya `--font-text` dan `--font-geist-mono`. Imbue dan Albert Sans dari percobaan sebelumnya sudah dihapus.
- **Viewport:** `themeColor #050505`, `viewportFit: cover`, dan zoom tidak dikunci.
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
| In short | `brief` | `Statement.tsx` | teks di `Statement.tsx` |
| Work | `work` | `Works.tsx`, `WorkStage.tsx` | array `projects` di `Works.tsx` |
| Experience | `experience` | `Experience.tsx`, `ExperienceDrum.tsx` | `content/experience.ts` |
| What I do | `about` | `About.tsx`, `demos/*` | array `services` (termasuk `tools` per kemampuan) di `About.tsx` |
| Certificates | `certificates` | `Certifications.tsx`, `CertificateLightbox.tsx` | `content/certifications.ts` |
| Writing | `writing` | `Writing.tsx` | `content/writing.ts` (spread besar bergantian kiri-kanan: gambar kerja di satu sisi, judul dan tombol di sisi lain) |
| Contact | `contact` | `Contact.tsx`, `ContactForm.tsx`, `CopyEmail.tsx` | `lib/site.ts` |
| Footer | | `Footer.tsx` | |

**Kerangka section (`Section.tsx`).** Semua section di bawah hero memakai komponen ini dengan props `id`, `index`, `title`, `intro`, `meta`, `wide`, `className`, `introClassName`, dan `padding`. Section dibuka sebagai bab: nomornya (`index`, "01" sampai "06") sangat besar dan nyaris tak terlihat (`.chapter-num`, warna `--fg-faint`), di sebelahnya `meta` sebagai readout mono di atas judul dalam `.display`, lalu satu garis tipis menutup kepala bab. Di grid 12 kolom, kolom 1–3 adalah margin (pada section `wide`: daftar tab, screenshot, cover, atau index) dan kolom 4–12 adalah konten. Padding vertikal bawaan 80px, menjadi 128px dari 1024px.

**Header.** Bar atas menempel (48px di HP, 56px di laptop, token `--bar-h`). Isinya: kotak hijau dan nama, readout "Indonesia, jam WIB" di atas link mono, strip bar halus yang terisi hijau sejauh halaman sudah dibaca (`.strip`, nilai `--read` 0–1 ditulis langsung oleh `Header` tiap frame scroll) dengan angka persennya, dan tombol Contact (≥768px; di HP Contact tetap link keempat). Di HP strip menjadi garis 2px di tepi bawah bar. Di atas hero bar tidak punya latar. Link section yang sedang dibaca berwarna hijau (`aria-current="location"`): section aktif adalah yang bagian atasnya sudah melewati sepertiga layar, Experience ikut menandai Work, dan Certificates ikut menandai About.

**Hero (`Hero.tsx`, `HeroVoxel.tsx`, `hero.css`).** Satu layar, tanpa hold scroll, disusun seperti hero fojcikdominik.com: kepala pemilik sebagai voxel 3D di dalam bingkai seperti jendela kamera, di depan grid wireframe yang melengkung (CRT). Nama besar di kiri dengan `// Portfolio ©2026`; di kanan deskripsi mono, status open to work dengan jam WIB, dan dua tombol. Di HP kepala di atas dan teks di bawahnya. Lihat bagian 9 untuk cara kerja kepala voxel.

**Experience.** Riwayat kerja, terbaru di atas, sebagai log bergaris. Mulai 768px tanggal, jenis (Contract, Internship, Freelance) dan tempat bertumpuk di kolom margin 1–3; jabatan, instansi (dengan keterangan dalam kurung, misalnya nama Inggrisnya), satu kalimat, dan proyeknya sebagai baris bergaris seperti fitur di Work, mulai kolom 4. Di HP fakta-fakta itu satu baris mono di atas jabatan. Posisi yang masih berjalan (tanpa `end`) diberi titik hijau seperti proyek Live di Work; posisi yang mulai dan selesai di bulan yang sama hanya menampilkan bulan itu sekali. Data, termasuk tanggal, diambil dari LinkedIn; jabatan, nama instansi, jenis dan tanggal ditulis persis, deskripsinya diringkas.

**Work (`Works.tsx`, `WorkStage.tsx`, `work-stage.css`).** Tiga proyek (CV Maker, S.E.R.A., Fall Alert Wearable). Di layar ≥1024px dan ≥600px tingginya, dengan motion diizinkan, panggung ditahan satu layar per proyek sebagai adegan HUD: kata-kata di kiri (judul besar, deskripsi, stack, tombol), dan di kanan mesin isometrik melayang di gelap di dalam cincin pindai yang berputar, dengan nomor proyek besar di belakangnya dan readout "Fig 0n" serta tahun/jenis/Live di sudut. Mesin yang tampil terurai jadi bagiannya dan mesin berikutnya merakit diri. Fitur proyek (`features` di `StageItem`, dirender sekali) menjadi callout di empat sudut sekitar cincin mulai 1280px, masing-masing dengan garis penunjuk hijau dan muncul setelah mesin terakit; di 1024–1279px fitur jadi baris ringkas di bawah kata-kata. Proyek yang tampil ditandai `data-active` di `<article>`-nya. Di tablet mesin dan teks berdampingan; di HP ketiganya baris yang digeser, satu proyek per layar.

Di HP, satu proyek per layar (kartu 88% lebar, snap) yang digeser lewat `SwipeRow`.

**What I do.** Sebuah "bench": kelima kemampuan tampil sekaligus, masing-masing dengan demonya yang sedang berjalan.
- **Desktop (mulai 1024px):** grid berukuran tidak sama. Code (7 kolom) dan Design (5 kolom) di baris atas, lalu Systems, AI, dan Hardware (masing-masing 4 kolom) di baris bawah.
- **Tablet:** dua per baris, dengan Code selebar dua kolom.
- **HP:** satu demo per layar (88% lebar, snap) yang digeser lewat `SwipeRow`.

| Kartu | Demo | Isi |
|---|---|---|
| Code | `CodeDemo` | Mengetik `loadOrder` milik potret, lalu menjalankan fungsi aslinya (diimpor dari `Portrait.tsx`) dan menyalakan 181 kotak sesuai urutan muat |
| Design | `WireframeDemo` | Wireframe hero dan desain jadinya, dengan slider di antara keduanya. Bentuk panel memilih versi lebar atau HP lewat container query |
| Systems | `TraceDemo` | Trace request `POST /api/analyze`, diputar 2,5× lebih lambat |
| AI | `StreamDemo` | Jawaban chat yang mengalir per token. Jawabannya sudah ditulis, tidak ada API |
| Hardware | `SensorDemo` | Sinyal akselerometer dengan ambang jatuh 23.1 m/s², lalu jalur MPU6050 → ESP32 → LoRa → Receiver → HTTP POST → MySQL. Berhenti saat panel tidak terlihat |

Cara kerjanya:
- **Isi kartu:** nama dan petunjuk "coba ini" (berdenyut emas sampai demonya dipakai, lalu berganti keterangan seperti "Portrait.tsx, code from this site"), panel demo, satu kalimat deskripsi, dan tools-nya.
- **Satu bingkai saja:** hanya panel demo yang berbingkai, supaya tidak ada kartu di dalam kartu.
- **Demo mulai saat terlihat:** demo di-mount saat kartunya pertama kali terlihat (IntersectionObserver, 35%), jadi demo yang berjalan sekali seperti kode mengetik, trace, dan jawaban chat diputar saat ada yang melihat. Di HP, kartu yang belum digeser masuk belum menjalankan apa pun.
- **Tinggi panel:** mulai 768px tingginya tetap, yaitu 440px untuk Code dan Design, dan 440px di tablet atau 400px di desktop untuk tiga demo lainnya. Di HP setinggi isinya, dengan ruang 20rem yang dijaga sampai demonya muncul.
- **Tools:** tidak ada lagi daftar "Tools I use" terpisah. Ke-16 tools ada di kartu kemampuan masing-masing.
- **Error:** setiap demo dibungkus `ErrorBoundary` dengan tombol "Try again".

**Certificates.** Sertifikat dikelompokkan berdasarkan `field` ke dalam `GROUPS` (Cloud & AI, Computer science, Earth observation, Psychology & society, lalu Other untuk bidang yang tidak terdaftar). Ringkasan jumlah sertifikat, institusi, dan rentang tahun dihitung otomatis. Viewer berganti sendiri setiap 5 detik lewat animasi bar progres, dan berhenti saat:

- tombol Pause ditekan
- fokus keyboard ada di dalam section (hanya `:focus-visible`, jadi klik mouse pada panah tidak menghentikannya)
- section tidak terlihat di layar
- lightbox terbuka
- pengunjung memakai reduced motion

Di HP ada strip thumbnail yang bisa digeser dan swipe di viewer. Di laptop, index ada di margin. Lightbox (`CertificateLightbox`) dirender lewat portal dan tetap terpasang saat tertutup (disembunyikan dengan `visibility`). Lightbox mendukung panah, Esc, swipe kiri dan kanan, tarik ke bawah untuk menutup, serta fokus yang pindah ke tombol Close dan kembali ke tombol pembuka. Nama sertifikat hanya dibacakan screen reader (`aria-live`) saat slideshow tidak berjalan sendiri.

**Writing.** Sebuah indeks bergaris, seperti tabel revisi di datasheet, bukan rak sampul. Tiap tulisan satu baris dengan garis tipis di bawahnya.
- **Mulai 768px:** thumbnail di kolom margin 1–3; mulai kolom 4 satu baris fakta mono (tahun, bidang, lama baca), judul, dan satu kalimat `summary`; lalu `Read →` dan `PDF ↗` rata kanan di kolom 11–12.
- **HP:** thumbnail selebar 34% di samping fakta dan judul, lalu ringkasan dan kedua link selebar penuh di bawahnya. Fakta patah hanya di antara fakta, dan titik pemisahnya ikut turun bersama fakta sesudahnya.
- **Thumbnail (`figures/thumbs/`, daftar `thumbs` per slug di `Writing.tsx`):** gambar isometrik kecil yang bergerak pelan selama terlihat di layar, berbeda dari Fig 1 di halaman tulisan.
  - **LoRa:** wearable-nya saja, di atas cutting mat. Cangkang terangkat dari clip, empat baut naik dari boss-nya, dan tutup depan (tombol merah, LED) melompat ke mat di sampingnya, sehingga isinya terlihat: ESP32-C3, MPU6050 (bagian yang menyala), RFM95W dengan coax ke antena, LiPo, TP4056, dan kabelnya. Lalu semuanya merapat lagi. Komponen dan bentuknya dari skripsi (bab 3.3.8); ukurannya kira-kira, tidak diukur.
  - **Privacy:** pintu panel di kusennya menutup ke arah pembaca, lalu gerendelnya (bagian yang menyala) masuk ke keeper, ditahan, ditarik lagi, dan pintu terbuka. Pintu digambar ulang tiap frame (`door-view.ts`); kusen kanan, kepala kusen, dan keeper dirender dua kali dan ditukar, di belakang pintu saat terbuka dan di depannya saat tertutup.
  - **Reduced motion:** wearable diam dalam keadaan terbongkar, pintu diam tertutup dan terkunci.
  - **Link:** thumbnail juga membuka tulisan, tapi `tabIndex={-1}` dan `aria-hidden`, karena judulnya sudah link yang sama. Dibungkus `ErrorBoundary`; kalau gagal, kartunya tetap kosong di tempatnya.
  - **Bobot:** keempat thumbnail (Work dan Writing) ikut di HTML dan payload RSC, jadi HTML beranda naik dari sekitar 120 KB (17 KB gzip) ke sekitar 485 KB (76 KB gzip).
- **Sampul (`Cover`, diekspor dari `Writing.tsx`):** tidak dipakai di beranda lagi; hanya halaman tulisan yang menampilkannya. Bergaya halaman preprint cetak, dengan ukuran huruf dalam `cqw` mengikuti lebar sampul. Di bawah 12rem, subjudul dan ORCID disembunyikan.
- **Yang tidak di beranda:** abstrak dan kata kunci hanya ada di halaman tulisan.

**Halaman tulisan (`/writing/[slug]`)**, satu kolom selebar 68ch:
- Di atas: "← All writing".
- Header: sampul (mulai 640px) di samping meta satu baris, judul, subjudul, dan tombol PDF.
- Satu baris status publikasi dan ORCID.
- Ringkasan: abstract, atau paragraf pembuka untuk studi kasus.
- Khusus tulisan LoRa: figur interaktif, lebih lebar dari teks (maksimal 56rem).
- Kata kunci sebagai satu baris mono, tiap frasa tidak dipatah.
- Link Newer (kiri) dan Older (kanan) tanpa kotak, dan tanpa ruang kosong kalau salah satunya tidak ada.

Teks lengkap ada di PDF.

**Figur LoRa (`components/figures/lora/`).** Sistem dari skripsi digambar sebagai satu meja kerja isometrik: wearable di drop stand, meter yang membaca magnitudo, receiver dengan tutup dibuka, dan HP staf di dudukannya.
- **Interaksi:** klik atau tap wearable (atau tombol D/Enter) untuk menjatuhkannya; tombol merahnya (atau B/Spasi) mengirim paket tombol darurat. Tanpa input, ada tur otomatis. Animasi berhenti saat figur di luar layar. Dengan `prefers-reduced-motion`, tidak ada tur dan setiap kejadian langsung lompat ke keadaan akhirnya.
- **Angka:** semuanya dari skripsi dan ada di `model.ts`: ambang 23,1 m/s², diam 9,82, puncak jatuh 58,25, tombol 10,28, RSSI −52 dBm (Dekat), alarm jatuh 30 detik bunyi ganda, tombol satu bunyi panjang, paket `1,JATUH,58.25`. Ritme bunyi dan lama perjalanan paket tidak ada di skripsi, jadi dibuat masuk akal dan singkat.
- **File:**
  - `view.ts`: tata letak dan kamera.
  - `geometry.ts`: semua path statis, dihitung sekali saat build.
  - `frame.ts`: yang digambar ulang tiap frame (jarum, kabel meter, gelombang radio, layar HP). Dipisah supaya `lathe.mjs` tidak ikut ke browser.
  - `art.tsx`: komponen server yang merakit gambar.
  - `live.tsx`: komponen client yang menggerakkannya, menulis atribut lewat ref, tanpa re-render per frame.
  - `figure.tsx`: kartu, legenda, dan caption.
  - `lora.css`: token kit dipetakan ke palet situs.
- **Kit (`components/iso/`):** disalin dari skill anatomy. Satu perubahan: `useLoop` di `react/live.tsx` memperbarui ref-nya di `useLayoutEffect` dan `useEased` dihapus, karena aturan lint `react-hooks/refs`.
- **HP:** di bawah 640px gambar diperbesar 124% dan tepinya dipotong, dan hint di sudut kartu boleh turun ke baris kedua.

**Gerak (`components/motion/`).** Kosakata gerak halaman, semuanya dalam keadaan selesai bila motion dimatikan, tanpa dukungan scroll-driven animations, atau tanpa script:
- `Split.tsx` (server): `Chars` dan `Words` memotong teks menjadi potongan bermasker yang naik satu per satu (salinan utuh ada di `sr-only`), `Roll` membuat digit yang bergulir ke nilainya, `Fill` membuat pernyataan yang terisi tinta per kata. Potongan diberi `--i` untuk jeda bertahap.
- `Decode.tsx` (client): label mono pendek yang "mendekode" dirinya sekali saat terlihat, sekitar 0,5 detik.
- `motion.css`: elemen `[data-reveal]` menamai view timeline `--reveal`; potongan di dalamnya naik terkait scroll (`--step` mengatur jeda, `data-reveal="entry"` untuk blok di ujung halaman). Juga `.fill-w` (isi tinta mulai 45%), `.open-frame` (bingkai terbuka dari atas), `.rule-sweep` (garis hijau menyapu garis kepala bab).
- Dipakai di: kepala setiap bab (nomor bergulir, huruf judul naik, meta decode, garis menyapu), judul hero (kata naik saat muat, 45ms per kata), judul jabatan dan tulisan, alamat email di Contact (per huruf), dan wordmark footer (per huruf saat halaman berakhir).

**In short (`Statement.tsx`).** Satu pernyataan antara hero dan Work yang terisi tinta per kata saat naik melewati layar; label "_In short" dan "Developer · Designer" (decode) di kolom margin.

**Experience sebagai drum (`ExperienceDrum.tsx`, `experience.css` bagian bawah).** Scene "In numbers" dihapus (angkanya kurang berguna) dan konsepnya, adegan angka besar di referensi, dipakai untuk Experience. Di laptop (≥1024px lebar, ≥720px tinggi, tanpa reduced motion) track ditahan satu layar plus 70svh per peran: drum tanggal mulai tiap peran (`09 2026`, `03 2026`, `08 2025`, `05 2024`, dicap seperti stempel footer) berputar di dalam reticle, tanggal di band hijau dan ter-decode; panel kanan menampilkan peran itu (fakta, jabatan berkedip sebagai sinyal, instansi, ringkasan dan proyek teracak lalu rapi); indeks nama peran di kiri; hitungan "01 / 04" dan Skip ke What I do di kanan atas. Tidak ada peran yang tampil sampai panggung naik ke tengah layar. Semua teks peran tetap ada di DOM untuk pembaca layar. Di layar lebih kecil atau dengan reduced motion: log biasa di bawah.

**Experience (log).** Tiap peran adalah bab: nomornya besar di kolom margin bersama tanggal, jenis, dan tempat, dan blok itu menempel (sticky) di samping perannya sampai peran berikutnya mendorongnya. Peran yang melewati tengah layar tampil penuh dan nomornya hijau; lainnya 45% (`experience.css`, terkait scroll).

**What I do (`About.tsx`, `about.css`).** Panel sistem: lima kemampuan sebagai tab list (vertikal mulai 1024px, baris yang digeser di HP), demo yang dipilih di viewport besar dengan label "Fig 0n / …" dan petunjuk, deskripsinya di bawah. Tab memakai roving tabindex (panah kedua arah, Home, End) dan seleksi mengikuti fokus. Panel lain `hidden="until-found"` dengan `beforematch`, jadi find-in-page tetap menemukannya. Demo yang dipilih digambar ke viewport dari atas di belakang garis pindai hijau.

**Certificates (`Certifications.tsx`, `certifications.css`).** Slideshow bab foto seperti `card-st` di referensi, tidak menahan scroll: satu panggung kira-kira setinggi layar, satu sertifikat tampil per giliran. Kiri (di HP: di bawah scan): nomor bab sangat besar dan samar, nama (berkedip sebagai sinyal), "bidang · penerbit · tahun" (ter-decode), View full size dan Verify. Kanan: scan abu-abu dengan lapisan hijau (`multiply`) dan pola tanda silang, caption bergaya referensi (`// C-01 / 2026 MICROSOFT };`), turun menutup scan sebelumnya seperti rana. Berganti sendiri tiap 5 detik (`SLIDE_MS`): garis hijau tergambar di kaki scan selama waktu itu (`cc-timer`, CSS), dan saat animasinya selesai slide berikutnya masuk. Berhenti saat pointer atau keyboard ada di atasnya, saat di luar layar, saat lightbox terbuka, dan dengan tombol Pause (WCAG 2.2.2). Panah ← → dan deret nomor 01–11 (≥640px) untuk pindah manual; rail di tepi kanan menandai posisi. Pola carousel APG: `aria-roledescription`, slide tidak aktif `visibility: hidden`, `aria-live` hanya saat berhenti. Dengan reduced motion tidak pernah berganti sendiri (Pause dan garis waktu disembunyikan).

**Contact dan footer.** Contact (bab 06, meta "Open to work"), mengikuti "Request access" di referensi: di latar gelap, alamat email terbesar di halaman dalam hijau, naik per huruf; di sampingnya `ContactForm` menyusun email (nama jadi subjek, pesan jadi isi) lalu membukanya di aplikasi email pengunjung. Tidak ada yang dikirim dari halaman dan tidak ada server. Footer adalah bidang hijau penuh (`footer.css` menukar token warna, jadi tintanya hitam): tiga kolom dengan kepala berkurung siku seperti referensi ("[ Contact ]", "[ Social ]", "[ Site ]"; item kontak berhuruf "a:" dan "b:"; tiap link sebaris dengan panahnya di ujung kanan di atas garis tipis), stempel tanggal dan jam Indonesia ("© 12 11 2026  09 38  UTC +7", `LocalStamp` di `LocalTime.tsx`) di belakang tiga kotak kecil yang meneruskan sinyal (opacity 1, 0,4, 0,2 bergilir tiap 1,2 detik, hanya ≥768px), dan di bawahnya nama selebar baris dalam hitam, naik per huruf di akhir halaman (`calc(100cqw / 5.8)`: lebar baris dibagi rasio lebar-terhadap-ukuran nama itu dalam Inter 500, 5,72).

**Bingkai HUD (`HudFrame.tsx`, `hud-frame.css`).** Hanya di beranda dan mulai 1024px: tanda sudut di keempat sudut layar, penggaris di tepi kiri yang ikut bergerak saat scroll (`--sy`), rail bab 01–06 di tepi kanan (link, yang sedang dibaca hijau), readout sektor di kiri bawah ("Sector 03 / What I do", teracak lalu terbentuk saat berganti), dan jam WIB dengan detik di kanan bawah. Menyingkir (opacity 0) selama panggung hero masih tertahan. Tidak menangkap pointer kecuali rail.

**Decode (`motion/DecodeAll.tsx`).** Elemen bertanda `data-decode` teracak lalu terbentuk sekali saat pertama terlihat (sekitar 0,56 detik). Hanya nilai text node yang diubah, bukan node-nya, jadi aman untuk teks yang dirender React; pakai hanya untuk readout mono pendek yang teksnya tidak berubah setelah dirender. Dipakai di: fakta Experience, fakta dan label Fig di Writing, kode sertifikat, readout Fig dan catatan di Work, baris readout footer.

**Detail HUD lain.** Strip header berupa spektrum 160 bar dengan tinggi tidak rata (path dibuat deterministik di `Header.tsx`, jadi server dan browser menggambar bar yang sama), terisi hijau sejauh halaman dibaca. Grain film: tile noise 128×128 (`public/noise.png`, dibuat dengan `node scripts/make-noise.mjs`) di atas seluruh layar dengan opacity 4,5%, bergeser lima kali per 0,9 detik (diam dengan reduced motion). Tombol `.action` diberi empat sudut target yang merapat saat disorot atau difokus. Di Work, kotak lock-on (SVG empat sudut, label "Lock / Fig 0n") menutup ke mesin dan berkedip dua kali saat proyek aktif; mesin kini utuh selama 40% pertama layarnya, terurai tepat sebelum teks berganti di tengah, dan mesin berikutnya utuh di 80%. Di Experience (drum), pita bergaris dengan ujung hijau menandai tanggal yang aktif.

**Intro (`IntroScreen.tsx`).** Layar pembuka sekali per sesi, sesederhana preloader referensi: empat sudut samar, nama di atas, satu garis di tengah tempat kotak hijau bergerak dari "Loading" ke alamat situs sesuai progres, dan "( 064% )" di bawah. Logika waktunya tidak berubah (maksimal 1,5 detik). Saat terangkat (`leaving`, 1100ms, `INTRO_FADE_MS`) caranya seperti preloader referensi: kedua kata bergeser ke tepi layar, blok hijau terbuka dari tengah, lalu seluruh lembar ditarik ke atas. Entrance hero dan readout-nya menunggu 650ms (`--intro-wait`, `AFTER_INTRO_MS`) supaya datang saat lembar lewat.

**Crosshair (`Crosshair.tsx`).** Seperti referensi, panah sistem diganti crosshair (mode `difference`, jadi terlihat di terang maupun gelap) yang mengikuti pointer tanpa jeda, berputar seperempat putaran dan membesar 1,2× di atas apa pun yang bisa ditekan, dan 1,35× selama tombol mouse ditekan (`data-down`), dengan transisi 150ms seperti referensi. Koordinat X dan Y pointer dibaca di sudut bawah bingkai HUD. Hanya untuk mouse/trackpad; di atas kolom teks kursor caret sistem kembali; tersembunyi saat pointer keluar jendela.

**In short (`Statement.tsx`, `statement.css`).** Adegan zoom-through seperti "main security threat" di referensi: panggung ditahan dua layar; pernyataan "I design and build for the web, AI ⊕ and hardware" naik dari 35% ke tinta penuh, lalu kamera terbang ke reticle hijau di antara kata-katanya sampai reticle lebih besar dari layar (`DEPTH` 18). Satu transform per frame pada satu elemen; tanpa `will-change` supaya teks digambar ulang tajam. Kalimat lengkap tentang karya ada kecil di sudut kanan bawah. Dengan reduced motion: pernyataan biasa tanpa hold.

**Hero, telemetri.** Blok telemetri lama sudah dihapus bersama hero lama; status open to work kini satu baris di kolom kanan hero.

**What I do (`About.tsx`, `about.css`).** Mengikuti bagian spesifikasi (`info-v`) referensi: daftar berhuruf A.–E. (huruf hijau) di kiri, demo besar di viewport kanan. Di laptop (≥1024×720, tanpa reduced motion) section ditahan satu layar plus 70svh per kemampuan dan scroll memindahkan pilihan: yang aktif membuka deskripsi dan tools-nya, lainnya 60%, dan garis hijau di tepinya terisi mengikuti scroll (`--fill`). Klik/keyboard pada daftar melompat ke bagiannya. Di HP/tablet atau reduced motion: daftar dan viewport diam, klik memilih. Tetap tab list dengan roving tabindex dan panel `hidden="until-found"`. Panel yang tersembunyi begitu tetap punya kotak dan bertumpuk di atas panel aktif, jadi diberi `pointer-events: none` (tanpa itu demo tidak bisa diklik). Demo: AI punya strip token yang menyala per token dan readout besar (status, kata pertama, token, waktu); Hardware punya grafik yang mengisi tinggi viewport dengan skala dan label ambang, hop bernomor yang menyala satu per satu, dan readout event/puncak/sinyal; baris timeline Systems direnggangkan.

**Pointer (`Crosshair.tsx`, `DotField.tsx`, `motion/DecodeAll.tsx`).** Satu listener pointer mengatur semuanya, hanya untuk mouse/trackpad: crosshair; kata kecil di sampingnya yang bilang apa yang terjadi kalau ditekan (`data-cursor="View"`, "Read", "Write", "Run", nama bab di rail); tombol `.action` yang condong ke pointer dan lepas saat ditinggal; panel `data-tilt` (viewport Work, bingkai sertifikat, gambar Writing) yang berputar beberapa derajat menghadap pointer. `DotField`: satu canvas tetap di bawah isi halaman yang menyalakan titik-titik grid hijau di sekitar pointer dengan jejak pendek, dan klik mengirim cincin melewati titik (lihat juga "Latar titik yang selalu hidup"). Link header, link Skip, dan semua `.action` teracak lalu terbentuk lagi tiap pointer datang (`data-scramble`). Tarikan dan tilt dimatikan dengan reduced motion.

**Scope malam di hero.** Dihapus bersama `HeroLight.tsx` (cahaya, scope, reticle) saat hero diganti kepala voxel.

**Adegan yang ditahan.** Tiap adegan (In short, Work, Experience) punya link "Skip ↓" ke bagian berikutnya. Pernyataan In short juga dihaluskan menuju posisi scroll.

**Kecepatan scroll.** `HudFrame` menghitung kecepatan scroll (dihaluskan, dibatasi, kembali ke 0 saat berhenti) dan menulisnya sebagai `--vel` ke elemen `data-vel`: nama footer condong, nomor bab tertinggal sedikit.

**Teks masuk seperti referensi (`motion/textfx.ts`, `motion/DecodeAll.tsx`, `motion.css`).** Diambil dari skrip dan CSS zrk.tech sendiri:
- *Sinyal* (`data-flicker`): tiap huruf judul mulai gelap, berkedip hijau beberapa kali, lalu menetap di tintanya (`signal-in`, 320ms, jeda 28ms per huruf). `"view"`: judul section dan judul hero, menyala saat naik ke layar dan padam lagi kalau keluar lewat bawah, jadi muncul lagi saat di-scroll kembali. `"active"`: judul proyek di Work, tiap kali proyek itu dibawa ke panggung. `--i` kini ada di mask `.split-m`, dipakai bersama naik-dari-mask.
- *Acak huruf* (`data-shuffle`): huruf tiap kata teracak lalu menemukan tempatnya secara acak dalam 750ms; panjang kata tidak berubah jadi baris tidak bergeser. Dipakai pada deskripsi proyek dan deskripsi fiturnya di Work, tiap kali proyek masuk.
- *Decode* (`data-decode`): seperti sebelumnya; beberapa yang terlihat bersamaan kini berurutan 60ms, dan semuanya menunggu intro terangkat. Readout Work (Fig, catatan, "Project n of 3", daftar tools) ter-decode lagi tiap proyek masuk.
- Nilai `"active"` menyerahkan elemen ke adegannya sendiri (`WorkStage` memanggil `shuffle`/`decode`), DecodeAll tidak menyentuhnya. Di Work, tidak ada proyek yang aktif sampai panggung naik ke tengah layar, jadi proyek pertama juga masuk dengan efek ini.

**Flicker link.** Link (`.link`, `data-flick`: nav header, rail bab, baris footer) berkedip sekali saat disorot (`flicker`, 450ms), seperti `link-hover` referensi.

**Tirai batang (`Statement.tsx`, `statement.css`).** Seperti `line-wrap` referensi: sepuluh kolom gelap setinggi satu layar berdiri di tepi atas In short, di atas layar terakhir hero. Saat section naik, kolom-kolom itu tumbuh dari bawah dengan urutan teracak (`BARS`, tetap) sampai potret tertutup. Scroll-driven, hanya transform; tanpa dukungan atau dengan reduced motion kolomnya rata dan tidak menutupi apa pun.

**Tag.** `.tag` mengikuti nama section referensi: kata di atas garis tipis yang naik di ujung kiri, nilainya di chip solid di sebelahnya (`_Portfolio` `2026` di hero).

**Footer tirai.** Di beranda, halaman (`.page-main`, buram, satu lapis di atas) adalah lembaran di atas footer; footer menempel di bawah layar dan terbuka dari bawah saat halaman habis, dengan garis hijau di tepi lembaran. Hanya bila layar cukup tinggi (≥680px). Huruf nama footer naik di 24rem terakhir scroll dokumen.

**Latar titik yang selalu hidup (`DotField.tsx`).** Atas permintaan pemilik, grid titik kini punya animasi yang terus berjalan: gelombang sinyal samar yang bergerak bersama halaman, sapuan yang turun di layar tiap 11 detik dengan ekor memudar, dan "kontak" acak (satu titik berkedip lalu cincin kecil terbuka). Jejak pointer dan cincin klik tetap (hanya mouse/trackpad). Hanya titik yang menyala yang digambar, maksimal sekitar 30 frame/detik saat pointer diam, berhenti saat tab tersembunyi, mati dengan reduced motion. Diukur headless: 60fps stabil, tanpa long task.

**Ringan.** Potret memuat setiap frame kedua di laptop (91 frame) dan setiap frame keempat di HP (46 frame); frame terdekat menggantikan yang tidak dimuat. Cahaya hero hanya bekerja saat digerakkan (pointer, scroll, atau cahaya menuju posisinya) dan berhenti saat diam; berkas cahayanya tidak lagi berputar. Grain diam. Inter dimuat tanpa sumbu opsz. Thumbnail sertifikat lazy. Ukuran yang ditransfer saat halaman dibuka: sekitar 1,1 MB di laptop dan 0,58 MB di HP.

**Scroll.** Scroll native saja. Lenis sempat dipakai lalu dihapus supaya halaman lebih ringan: tanpa loop rAF yang terus berjalan, dan scroll langsung mengikuti tangan.

**Command palette (`CommandPalette.tsx`).** Dibuka dengan Ctrl/⌘ K atau `/` (tombolnya di header sudah dihapus karena tidak ada di referensi; grid layout juga hanya lewat tombol G atau palette), berupa combobox dengan `aria-activedescendant`. Isinya: lompat ke section, salin dan kirim email, buka profil sosial, tampilkan grid, dan kembali ke atas. Daftar section di dalamnya ditulis manual, jadi harus disesuaikan kalau section ditambah, dihapus, atau diganti namanya.

## 8. Sistem desain

Semua token ada di `:root` dalam `src/app/globals.css`.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--surface` / `--surface-card` / `--surface-raised` | `#050505` / `#0b0b0b` / `#161616` | latar (dengan grid titik 20px di `body`), panel, chip |
| `--fg` / `--fg-soft` / `--fg-muted` / `--fg-dim` / `--fg-faint` | `#dddddd` / `#c2c2c2` / `#9a9a9a` / `#808080` / `#262626` | judul, teks panjang, pendukung, label, nomor bab dan wordmark footer |
| `--rule` / `--rule-strong` | putih 10% / 20% | garis rambut, bar strip yang kosong |
| `--green` / `--accent` / `--accent-ink` | `#19a352` / `var(--green)` / `#050505` | satu-satunya warna (hijau sinyal yang dalam, pilihan pemilik; sekitar 6,2:1 sebagai teks di latar gelap dan untuk tinta hitam di atasnya; di footer tinta transparan dinaikkan ke 0,8–0,92 supaya tetap ≥4,5:1): tombol, yang aktif dan ditunjuk, strip, reticle, titik Live, footer |
| `--accent-wash` / `--accent-line` | hijau 6% / 30% | latar dan garis tombol `.action` yang tidak penuh |
| `--gold`, `--live`, `--accent-text` | menunjuk ke `--accent` | nama lama, dipertahankan supaya komponen lama ikut |
| `--paper` / `--ink` | `#dddddd` / `#050505` | cover tulisan |
| `--syntax-string` / `--syntax-type` / `--syntax-number` | `#c9c9c9` / `#a3a3a3` / hijau | warna kode di demo Code |
| `--bar-h` | 3rem / 3.5rem dari 768px | tinggi bar atas; panggung yang ditahan duduk di bawahnya |

Tidak ada warna yang ditulis langsung di komponen. Warna baru ditambahkan sebagai token di sini dulu. Satu-satunya pengecualian adalah `opengraph-image.tsx`, karena gambar share dirender di server tanpa CSS.

- **Komponen** (di `@layer components`, jadi utilitas Tailwind di elemen yang sama tetap menang): `.display`, `.label`, `.tag`, `.action` (tombol hijau; `data-solid` untuk yang penuh), `.viewport` (bingkai dengan sudut hijau), `.chapter-num`, `.strip`.
- **Grid:** `.shell` (selebar layar, padding 20px, menjadi 28px dari 768px, ditambah safe area) dan `.grid-12` (4 kolom dengan jarak 16px, menjadi 12 kolom dengan jarak 24px dari 768px).
- **Ukuran dasar:** di bawah 380px, `font-size` root menjadi 93.75% (15px), sehingga semua ukuran ikut mengecil.
- **Kelas utilitas:** `.link`, `.reveal`, `.rise`, `.fade-in`, `.draw`, `.scroll-fade`, `.pulse-dot`, `.nudge-x`, `.caret`, `.intro*`, `.page-loading`, `.loading-bar`, `.wf-wide`, dan `.wf-tall`.
- **Reduced motion:** semua animasi selesai seketika, dan bar loading diam.

Rincian tipografi, skala, dan catatan desain ada di halaman "Catatan Desain Fadhlan Bani" (artifact privat).

## 9. Potret di hero

`components/HeroVoxel.tsx` menggambar kepala pemilik sebagai voxel 3D dengan Three.js (`three`, dimuat dinamis hanya di komponen ini, setelah halaman tampil).

- **Data (`public/hero/`, ±1,3 MB).** Dibuat sekali di luar repo dari video 8,6 detik pemilik menoleh: 129 frame (15 fps), tiap frame dipotong dari latar dengan model RMBG-1.4 dan diperkirakan kedalamannya dengan Depth Anything V2 Small, lalu semua dipotong dengan crop yang sama. `voxel-data.png`: satu kanal per sel (0 = bukan orang, 1..255 = kedalaman), grid 120×150 per frame, 16 frame per baris atlas. `voxel-photo.jpg`: frame abu-abu yang sudah dipotong (200×250 per frame) untuk kecerahan dan detail muka voxel. `voxel.json`: ukuran grid, jumlah frame, fps. `voxel-still.png`: siluet diam untuk fallback. Foto, video, model AI dan skrip pembuatnya tidak ada di repo.
- **Gambar.** Satu `InstancedBufferGeometry` kotak per sel yang pernah berisi orang; posisi, kedalaman (ekstrusi), kecerahan dan tepi siluet dihitung di shader dari atlas. Antar frame tiap sel dimorf halus (kedalaman, kecerahan, kehadiran dibaurkan).
- **Gerak.** Video diputar apa adanya di 55% kecepatan asli (`SPEED`), maju lalu mundur (ping-pong) supaya tidak melompat. Tidak ada lirikan atau jeda buatan.
- **Boot (setelah intro terangkat).** Grid dan bingkai muncul, voxel melayang masuk sebagai garis tepi, kilatan hijau + glitch, lalu video mulai.
- **Tampilan.** Kepala dirender di lapisan sendiri (render target) lalu di-blur lebar dan detail mukanya diratakan sehingga hanya siluet berkabut yang terbaca; grid, bingkai dan jejak partikel tetap tajam. Pass layar: distorsi barrel, scanline, kedip, pita glitch sesekali, vignette.
- **Bingkai.** Kotak dengan sudut terang di bidang muka (`FRAME_Z`); voxel di bawah dada (`ROWS_SHOWN`) tidak digambar. Jarak kamera dihitung di `fit()` supaya kotak selalu utuh: maks. 76% tinggi dan 40% lebar di layar lebar, 86% lebar di HP.
- **Interaksi.** Voxel di sekitar kursor terdorong menjauh dan menyala, lalu kembali pelan; jejak partikel mengikuti pointer (atau berputar di sekitar kepala). Hanya mouse/pen.
- **Hemat.** Render berhenti saat hero di luar layar (IntersectionObserver) atau tab tersembunyi. DPR maks. 1,6 (HP 1,4).
- **Fallback.** Reduced motion atau WebGL gagal: `voxel-still.png` buram sebagai siluet dengan bingkai. Selain itu tidak ada gambar apa pun sebelum boot, dan gambar diam tidak diunduh.
- **Progres ke intro.** `reportPortraitProgress(1)` dikirim begitu data termuat (atau gagal), lewat `lib/portraitProgress.ts`.
- **`Portrait.tsx` dan `public/frames/`** tidak lagi dipakai hero; masih dipakai demo Code (konstanta urutan muat) dan Design (gambar wireframe → desain).

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
  - **Palette:** Ctrl/⌘ K atau `/`, lalu ↑ ↓ ↵ Esc.
  - **Overlay grid:** tombol `G`.
  - **Lightbox:** ← → Esc.
- **Fokus:** outline emas 1px dengan jarak 3px (`:focus-visible`). Selama lightbox atau palette terbuka, elemen lain di `<body>` dibuat `inert` (`lib/inertOthers.ts`), jadi Tab tidak bisa keluar ke halaman di belakangnya. Fokus dikembalikan ke pembuka setelah dialog ditutup.
- **Sentuh:**
  - **Swipe:** `useSwipe` memakai pointer event (bukan mouse), dengan ambang 40px, `touch-action` `pan-y` atau `pinch-zoom`, dan pengecekan `visualViewport.scale` supaya swipe tidak terpicu saat layar di-zoom.
  - **Baris geser:** baris yang bisa digeser memakai `useScrollFade` (atribut `data-more-left` dan `data-more-right`) dan `SwipeHint`.
- **Target sentuh:** tombol (panah dan Pause sertifikat, dan di layar sentuh semua tombol demo: Run again, Send again, chip pertanyaan, Stop, Simulate an impact) 44px, ditulis dalam px supaya tidak ikut mengecil di layar di bawah 380px. Tautan teks minimal 24px, dan sekitar 40px di perangkat sentuh (`.link` mendapat padding tambahan di `pointer: coarse`).
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

- **Image optimizer:** hanya `/frames/**` dan `/certificates/**`. Permintaan lain dijawab 400.
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
2. Thumbnail-nya adalah gambar isometrik di `components/figures/thumbs/` (lihat `cv-view.ts`, `cv.ts` dan `CvThumb` di `art.tsx` sebagai contoh), dipasang di field `thumb`. Pakai viewBox 160×252 supaya cocok dengan bingkai 625:985.

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
- [ ] Di emulasi HP, `innerWidth` sama dengan lebar layar setelah semua baris geser digeser sampai ujung. `overflow-x: clip` di `html` menyembunyikan luapan dari pengecekan biasa, tapi browser HP tetap melebarkan halaman untuk elemen `absolute` yang lolos dari scroller. Karena itu `SwipeRow` memakai `relative`.
- [ ] Console bersih: tidak ada error, permintaan 4xx/5xx, atau pelanggaran CSP.
- [ ] Intro tampil sekali per sesi, dan potret berputar.
- [ ] Kelima demo What I do: jalan saat terlihat, di HP muncul saat digeser masuk, tidak ada panel yang terpotong di 768px, dan keyboard berfungsi di dalam demo.
- [ ] Sertifikat: maju dan mundur, pause, swipe di HP, lightbox (panah, Esc, fokus).
- [ ] Ctrl/⌘ K, tombol G (keduanya hanya dari keyboard), Back to top.
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
| Judul memakai Geist 700, bukan serif | Gabungan gelap, emas, dan serif display terbaca sebagai template "portofolio premium". Satu file font juga jadi tidak perlu diunduh |
| Header section bergaya datasheet | Judul raksasa satu kata yang sama di tiap section adalah pola template. Header kecil membuat tiap section dibuka oleh isinya |
| Tanpa angka hiasan (01–04, angka berawalan nol) | Angka yang tidak menghitung apa pun adalah ciri template. Angka yang tersisa adalah jumlah atau posisi yang nyata |
| Tanpa analytics | Tidak ada pihak ketiga, dan CSP tetap ketat |

## 19. Masalah yang diketahui

- Tanpa JavaScript, potret kosong (kotak hijau dengan keterangan "Frame 001 / 181").
- Di desktop, What I do setinggi sekitar 1370px, karena kelima demo tampil sekaligus. Di HP muat satu layar (811px di 390px).
- `Reveal.tsx` dan kelas `.reveal` tidak dipakai lagi sejak judul section dan panel demo tidak lagi muncul dengan animasi. Keduanya bisa dihapus.
- Index sertifikat di laptop memakai nama lengkap, jadi beberapa baris turun ke dua baris. Ini disengaja: memotong nama akan menyembunyikan informasi.
- Bentuk header masih bar standar (nama di kiri, empat tautan dan tombol Contact di kanan; command palette hanya dari keyboard). Untuk empat tautan ini pilihan yang paling mudah dipakai.
- Skrip pembuat frame potret tidak ada di repo.
- Di luar repo ini: API key Gemini proyek S.E.R.A. pernah ter-commit di riwayat git repo S.E.R.A. dan perlu diganti.
