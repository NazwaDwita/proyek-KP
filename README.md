# Portal Magang & PKL Diskominfotik Provinsi Riau

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)

Platform web terpadu untuk pendaftaran, seleksi, verifikasi, penempatan bidang, dan pencetakan surat keterangan magang/Kerja Praktik (PKL) di **Dinas Komunikasi, Informatika, dan Statistik (Diskominfotik) Provinsi Riau**.

---

## Fitur Utama

### Untuk Peserta (Siswa / Mahasiswa)
- **Autentikasi & Akun**: Pendaftaran dan login akun peserta magang.
- **Formulir Pendaftaran Online**: Pengajuan pendaftaran magang mandiri dengan pilihan periode magang (2–4 bulan) dan pengunggahan berkas persyaratan.
- **Cek Status Mandiri**: Pelacakan status pendaftaran (Menunggu, Diverifikasi/Diterima, Ditolak) secara publik menggunakan Nomor Pendaftaran dan Email.
- **Dashboard Peserta**: Pemantauan status pendaftaran, perincian bidang penempatan, serta catatan langsung dari staf administrator.
- **Informasi Slot & Kuota**: Visualisasi ketersediaan slot magang aktif per bidang secara real-time.
- **Cetak Surat Keterangan**: Generasi dan pencetakan digital **Surat Keterangan Diterima** dan **Surat Keterangan Selesai Magang** ber-format resmi.
- **Informasi Instansi**: Profil Dinas, Visi Misi, Alur Pendaftaran, serta Bagan Struktur Organisasi Diskominfotik Riau.

### Untuk Staf & Administrator (Diskominfotik)
- **Dashboard Manajemen Pendaftar**: Kelola seluruh permohonan magang masuk secara terpusat.
- **Verifikasi & Penempatan Bidang**: Staf menentukan dan mengalokasikan bidang penempatan resmi (Aplikasi & Informatika, ITIK, IKP, Statistik, Persandian).
- **Catatan & Penolakan Berkas**: Pemberian umpan balik/catatan kepada pendaftar jika ada berkas yang perlu diperbaiki.
- **Export Data Excel**: Fitur ekspor data pendaftar dan peserta magang aktif ke format spreadsheet Excel (`.xlsx`).
- **Row Level Security (RLS)**: Proteksi data sensitif pendaftar berbasis hak akses database Supabase dan validasi daftar staf di tabel `admin_pengguna`.

---

## Teknologi & Stack

- **Frontend Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikon UI**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL 16, Supabase Auth, Row Level Security, Custom RPC Functions)
- **Ekspor Data**: [ExcelJS](https://github.com/exceljs/exceljs)

---

## Struktur Direktori

```text
portal-magang/
├── public/                 # Asset statis (logo, gambar hero, favicon)
├── src/
│   ├── app/                # App Router Pages & API Routes
│   │   ├── admin/          # Dashboard Admin & Manajemen Pendaftar
│   │   ├── akun/           # Pengaturan Profil User / Admin
│   │   ├── auth/           # Halaman Login & Registrasi
│   │   ├── cek-status/     # Fitur Cek Status Pendaftaran Publik
│   │   ├── daftar/         # Formulir Pendaftaran Magang
│   │   ├── info/           # Informasi & Alur Pendaftaran
│   │   ├── profil-dinas/   # Profil Diskominfotik Riau
│   │   ├── statistik/      # Statistik Kuota & Slot Per Bidang
│   │   ├── surat-keterangan/ # Halaman Cetak Surat Keterangan
│   │   ├── globals.css     # Styling Utama & Custom CSS
│   │   └── page.tsx        # Landing Page Utama
│   ├── components/         # Komponen UI Reusable (Header, Footer, Modal, AdminNav, dll)
│   └── lib/                # Client Supabase, Context, Helper Format, & Konstanta
├── supabase/               # File Skrip Migrasi SQL & Dokumen Setup DB
│   ├── migrations/         # Skrip 0001_init.sql s/d 0004_grants.sql
│   └── README.md           # Panduan Lengkap Setup Supabase
├── .env.local.example      # Template Environment Variables
├── package.json            # Dependensi & Skrip Proyek
└── README.md               # Dokumentasi Proyek
```

---

## Panduan Instalasi & Pengoperasian Lokal

### 1. Prasyarat
Pastikan komputer Anda sudah terinstal:
- **Node.js** (v18.x atau versi LTS terbaru)
- **npm**, **yarn**, **pnpm**, atau **bun**

### 2. Clone Repositori & Instal Dependensi
```bash
# Clone repositori ini
git clone https://github.com/NazwaDwita/proyek-KP.git
cd portal-magang

# Instal dependensi
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.local.example` menjadi `.env.local`:
```bash
cp .env.local.example .env.local
```
Buka file `.env.local` dan isi URL serta Anon Key dari project Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Setup Database Supabase
1. Buat project baru di [Supabase](https://supabase.com/).
2. Buka **SQL Editor** pada dashboard Supabase Anda.
3. Jalankan skrip SQL yang ada di direktori `supabase/migrations/` secara berurutan:
   - `0001_init.sql` (Tabel dasar & data bidang)
   - `0002_rls.sql` (Aturan keamanan RLS)
   - `0003_fungsi_publik.sql` (Fungsi penomoran & statistik)
   - `0004_grants.sql` (Hak akses role `anon` & `authenticated`)
4. Untuk menambahkan akun Admin pertama, daftarkan UID pengguna Supabase Auth ke tabel `admin_pengguna`.
   Detail panduan lengkap dapat dilihat di [supabase/README.md](./supabase/README.md).

### 5. Jalankan Server Pengembang
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser untuk mengakses aplikasi.

---

## Skrip yang Tersedia

- `npm run dev` — Menjalankan server pengembang Next.js (Local Development).
- `npm run build` — Melakukan pembentukan build produksi.
- `npm run start` — Menjalankan server produksi yang telah di-build.
- `npm run lint` — Memeriksa kesalahan kode menggunakan ESLint.

---

## Penempatan Bidang Magang

Berdasarkan Struktur Organisasi Diskominfotik Provinsi Riau, penempatan magang dibuka untuk 5 bidang utama:
1. **Bidang Aplikasi & Informatika (APTIKA)**
2. **Bidang Infrastruktur Teknologi Informasi dan Komunikasi (ITIK)**
3. **Bidang Informasi dan Komunikasi Publik (IKP)**
4. **Bidang Statistik**
5. **Bidang Persandian**

---

## Lisensi & Hak Cipta

Hak Cipta © 2026 **Dinas Komunikasi, Informatika, dan Statistik Provinsi Riau**. Seluruh hak cipta dilindungi undang-undang.
