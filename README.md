# Portofolio Fadhlan Bani

Situs portofolio Fadhlan Bani, developer dan designer dari Indonesia: proyek, kemampuan dengan demo interaktif, sertifikat, tulisan, dan kontak.

**Live:** https://fadhlanbani.vercel.app

Dibangun dengan Next.js 16 (App Router), React 19, TypeScript, dan Tailwind CSS 4. Semua halaman dibangun statis, lalu di-deploy otomatis ke Vercel setiap kali ada push ke `main`.

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
```

```bash
npm run dev
```

Buka http://localhost:3000. Perintah lain: `npm run build`, `npm run start`, dan `npm run lint`.

## Dokumentasi

[docs/DOKUMENTASI-TEKNIS.md](docs/DOKUMENTASI-TEKNIS.md) membahas:

- arsitektur, rute, dan komponen
- sistem desain
- cara kerja potret, loading, dan error handling
- keamanan dan performa
- deploy
- cara menambah sertifikat, proyek, dan tulisan

## Struktur singkat

| Folder | Isi |
|---|---|
| `src/app/` | layout, halaman, gambar share, sitemap, robots, halaman error |
| `src/components/` | bagian-bagian halaman, termasuk lima demo di `demos/` |
| `src/content/` | data sertifikat dan tulisan |
| `src/lib/` | konstanta situs dan hook bersama |
| `public/` | frame potret, scan sertifikat, screenshot, PDF |
| `scripts/` | pengecekan sebelum build: setiap path gambar atau PDF di `src/` harus ada di `public/` |
| `next.config.ts` | header keamanan, cache, aturan gambar |
