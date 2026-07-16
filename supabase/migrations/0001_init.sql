create table if not exists bidang (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  aktif boolean not null default true,
  dibuat_pada timestamptz not null default now()
);

insert into bidang (nama) values
  ('Bidang Informasi dan Komunikasi Publik'),
  ('Bidang Infrastruktur Teknologi Informasi dan Komunikasi'),
  ('Bidang Aplikasi & Informatika'),
  ('Bidang Statistik'),
  ('Bidang Persandian')
on conflict (nama) do nothing;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_pendaftaran') then
    create type status_pendaftaran as enum ('menunggu', 'diverifikasi', 'ditolak');
  end if;
end $$;

create table if not exists pendaftar (
  id uuid primary key default gen_random_uuid(),
  nomor_pendaftaran text not null unique,

  nama_lengkap text not null,
  email text not null,
  no_hp text not null,
  asal_institusi text not null,
  jenis_institusi text not null check (jenis_institusi in ('sekolah', 'kampus')),
  jurusan_prodi text,

  bidang_id uuid not null references bidang(id),
  tanggal_mulai date not null,
  tanggal_selesai date not null,

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

create table if not exists dokumen_pendaftar (
  id uuid primary key default gen_random_uuid(),
  pendaftar_id uuid not null references pendaftar(id) on delete cascade,
  jenis_dokumen text not null check (jenis_dokumen in ('surat_pengantar', 'surat_akademik', 'lainnya')),
  path_file text not null, 
  nama_file_asli text,
  diunggah_pada timestamptz not null default now()
);

create index if not exists idx_dokumen_pendaftar on dokumen_pendaftar(pendaftar_id);

create table if not exists admin_pengguna (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  dibuat_pada timestamptz not null default now()
);

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
