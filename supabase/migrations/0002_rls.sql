-- ============================================================
-- MIGRASI 0002: Row Level Security
-- ============================================================

alter table bidang enable row level security;
alter table pendaftar enable row level security;
alter table dokumen_pendaftar enable row level security;
alter table admin_pengguna enable row level security;

-- ------------------------------------------------------------
-- Helper: cek apakah user yang sedang login adalah admin
-- ------------------------------------------------------------
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_pengguna where id = auth.uid()
  );
$$ language sql stable security definer;

-- ------------------------------------------------------------
-- BIDANG: publik boleh baca (untuk dropdown form + statistik),
-- hanya admin yang boleh ubah.
-- ------------------------------------------------------------
create policy "bidang_select_publik" on bidang
  for select using (true);

create policy "bidang_write_admin" on bidang
  for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- PENDAFTAR: publik boleh INSERT (submit form), TIDAK boleh
-- SELECT langsung (supaya tidak bisa list semua data pendaftar
-- lewat API). Baca hanya untuk admin.
-- ------------------------------------------------------------
create policy "pendaftar_insert_publik" on pendaftar
  for insert
  with check (
    status = 'menunggu'   -- publik tidak boleh set status lain saat daftar
    and diverifikasi_oleh is null
  );

create policy "pendaftar_select_admin" on pendaftar
  for select using (is_admin());

create policy "pendaftar_update_admin" on pendaftar
  for update using (is_admin()) with check (is_admin());

create policy "pendaftar_delete_admin" on pendaftar
  for delete using (is_admin());

-- ------------------------------------------------------------
-- DOKUMEN_PENDAFTAR: publik boleh insert (upload saat daftar),
-- baca hanya admin.
-- ------------------------------------------------------------
create policy "dokumen_insert_publik" on dokumen_pendaftar
  for insert with check (true);

create policy "dokumen_select_admin" on dokumen_pendaftar
  for select using (is_admin());

create policy "dokumen_delete_admin" on dokumen_pendaftar
  for delete using (is_admin());

-- ------------------------------------------------------------
-- ADMIN_PENGGUNA: hanya admin yang bisa lihat daftar admin lain.
-- ------------------------------------------------------------
create policy "admin_pengguna_select_admin" on admin_pengguna
  for select using (is_admin());
