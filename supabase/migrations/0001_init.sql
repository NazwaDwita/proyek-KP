-- ============================================================
-- MIGRASI 0001: Skema Awal Sistem Pendaftaran Magang
-- Diskominfotik Provinsi Riau
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABEL BIDANG
-- Dipisah dari enum/hardcode supaya bisa diubah tanpa migrasi
-- ulang saat struktur bidang dari Bang Irawan sudah pasti.
-- ------------------------------------------------------------
create table if not exists bidang (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  aktif boolean not null default true,
  dibuat_pada timestamptz not null default now()
);

-- Data awal berdasarkan bagan struktur organisasi resmi Diskominfotik
-- Provinsi Riau (dikonfirmasi user, 15 Juli 2026). Hanya 5 bidang ini
-- yang membuka penempatan magang -- Sekretariat TIDAK termasuk.
insert into bidang (nama) values
  ('Bidang Informasi dan Komunikasi Publik'),
  ('Bidang Infrastruktur Teknologi Informasi dan Komunikasi'),
  ('Bidang Aplikasi & Informatika'),
  ('Bidang Statistik'),
  ('Bidang Persandian')
on conflict (nama) do nothing;

-- ------------------------------------------------------------
-- 2. ENUM STATUS PENDAFTARAN
-- ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_pendaftaran') then
    create type status_pendaftaran as enum ('menunggu', 'diverifikasi', 'ditolak');
  end if;
end $$;

-- ------------------------------------------------------------
-- 3. TABEL PENDAFTAR
-- ------------------------------------------------------------
create table if not exists pendaftar (
  id uuid primary key default gen_random_uuid(),
  nomor_pendaftaran text not null unique,

  -- Data diri
  nama_lengkap text not null,
  email text not null,
  no_hp text not null,
  asal_institusi text not null,
  jenis_institusi text not null check (jenis_institusi in ('sekolah', 'kampus')),
  jurusan_prodi text,

  -- Bidang & periode
  bidang_id uuid not null references bidang(id),
  tanggal_mulai date not null,
  tanggal_selesai date not null,

  -- Status & administrasi
  status status_pendaftaran not null default 'menunggu',
  catatan_admin text,
  diverifikasi_oleh uuid references auth.users(id),
  diverifikasi_pada timestamptz,

  dibuat_pada timestamptz not null default now(),
  diubah_pada timestamptz not null default now(),

  constraint tanggal_valid check (tanggal_selesai >= tanggal_mulai)
);

create index if not exists idx_pendaftar_status on pendaftar(status);
create index if not exists idx_pendaftar_bidang on pendaftar(bidang_id);
create index if not exists idx_pendaftar_periode on pendaftar(tanggal_mulai, tanggal_selesai);

-- ------------------------------------------------------------
-- 4. TABEL DOKUMEN PENDAFTAR
-- Dipisah dari tabel pendaftar karena bisa lebih dari satu file
-- (surat pengantar, surat akademik, dll — sesuai pengalaman
-- Diva yang menyerahkan ke 2 staf berbeda secara terpisah).
-- ------------------------------------------------------------
create table if not exists dokumen_pendaftar (
  id uuid primary key default gen_random_uuid(),
  pendaftar_id uuid not null references pendaftar(id) on delete cascade,
  jenis_dokumen text not null check (jenis_dokumen in ('surat_pengantar', 'surat_akademik', 'lainnya')),
  path_file text not null, -- path di Supabase Storage
  nama_file_asli text,
  diunggah_pada timestamptz not null default now()
);

create index if not exists idx_dokumen_pendaftar on dokumen_pendaftar(pendaftar_id);

-- ------------------------------------------------------------
-- 5. TABEL ADMIN (allowlist staf)
-- Siapa saja user Supabase Auth yang dianggap staf/admin.
-- ------------------------------------------------------------
create table if not exists admin_pengguna (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  dibuat_pada timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. TRIGGER: auto-update diubah_pada
-- ------------------------------------------------------------
create or replace function set_diubah_pada()
returns trigger as $$
begin
  new.diubah_pada = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pendaftar_diubah_pada on pendaftar;
create trigger trg_pendaftar_diubah_pada
  before update on pendaftar
  for each row execute function set_diubah_pada();
