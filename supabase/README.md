# Panduan Setup Supabase — Portal Magang Diskominfotik Riau

## 1. Buat Project Supabase
1. Buka [supabase.com](https://supabase.com), buat project baru (pilih region Singapore biar latensi rendah dari Riau)
2. Simpan **Database Password** yang diminta saat pembuatan — Anda perlu ini nanti
3. Setelah project selesai dibuat, buka **Project Settings > API** — catat:
   - `Project URL`
   - `anon public` key

## 2. Jalankan Migrasi SQL
Buka **SQL Editor** di dashboard Supabase, lalu jalankan **berurutan sesuai nomor**:
1. `migrations/0001_init.sql` — buat tabel `bidang`, `pendaftar`, `dokumen_pendaftar`, `admin_pengguna`
2. `migrations/0002_rls.sql` — aktifkan Row Level Security + kebijakan akses
3. `migrations/0003_fungsi_publik.sql` — fungsi generate nomor pendaftaran, cek status, statistik
4. `migrations/0004_grants.sql` — hak akses eksplisit untuk role publik (anon) dan staf (authenticated)

**Semua file ini sudah saya uji jalan di PostgreSQL 16 lokal** (bukan cuma ditulis lalu diasumsikan benar) — termasuk simulasi insert sebagai pengguna publik, cek status dengan email benar/salah, dan perbandingan akses admin vs user biasa.

## 3. Buat Akun Admin Pertama (Bang Irawan / staf)
Supabase Auth tidak otomatis menjadikan user sebagai admin sistem ini — harus didaftarkan manual ke tabel `admin_pengguna`.

1. Di dashboard Supabase, buka **Authentication > Users > Add user**, buat akun dengan email + password staf
2. Salin **User UID** yang muncul
3. Di **SQL Editor**, jalankan:
   ```sql
   insert into admin_pengguna (id, nama) values
     ('tempel-UID-di-sini', 'Nama Staf');
   ```

## 4. Setup Environment Variables di Project Next.js
1. Salin `.env.local.example` di root project jadi `.env.local`
2. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari Langkah 1
3. **Jangan pernah** commit `.env.local` ke Git (sudah ada di `.gitignore`)

## 5. Status Konfirmasi dari Bang Irawan

- **Nama-nama bidang** — ✅ **Sudah dikonfirmasi** (15 Juli 2026) berdasarkan bagan struktur organisasi resmi Diskominfotik Riau. Hanya **5 bidang** yang membuka penempatan magang: Bidang Aplikasi & Informatika, Bidang Infrastruktur Teknologi Informasi dan Komunikasi, Bidang Informasi dan Komunikasi Publik, Bidang Statistik, Bidang Persandian. **Sekretariat tidak termasuk.** Data ini sudah diperbarui di `0001_init.sql`.
- **Format nomor pendaftaran** — ⏳ Masih placeholder sementara (`MGG-2026-0001`). Kalau instansi punya format baku sendiri, ubah di fungsi `generate_nomor_pendaftaran()` pada `0003_fungsi_publik.sql`.
- **Siapa saja yang butuh akun admin** — ⏳ Belum dikonfirmasi.

## Ringkasan Keamanan (Kenapa Didesain Begini)
| Siapa | Boleh Apa | Tidak Boleh |
|---|---|---|
| Publik (belum login) | Insert form pendaftaran, insert dokumen, cek status (harus tahu nomor pendaftaran + email persis), lihat statistik agregat | Tidak bisa SELECT tabel `pendaftar`/`dokumen_pendaftar` langsung — jadi tidak bisa "mengintip" data pendaftar lain |
| Staf/Admin (login, terdaftar di `admin_pengguna`) | Lihat semua pendaftar, ubah status, catat penempatan bidang, kelola data `bidang` | — |
| Staf yang login tapi TIDAK terdaftar di `admin_pengguna` | Hampir tidak bisa apa-apa ke tabel `pendaftar` | Ini sengaja — supaya sekadar punya akun Supabase Auth tidak otomatis jadi admin |

## Yang Belum Ditangani di Migrasi Ini (Perlu Ditambahkan Nanti)
- Perlindungan spam/bot di form publik (captcha atau rate-limiting) — RLS tidak mencegah orang mengirim ribuan submission otomatis
- Supabase Storage bucket + kebijakannya untuk upload dokumen (baru tabel metadatanya yang sudah dibuat di sini, bucket fisiknya menyusul di Tahap 2)
