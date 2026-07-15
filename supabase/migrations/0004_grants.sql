-- ============================================================
-- MIGRASI 0004: Hak akses eksplisit (GRANT) untuk role anon
-- dan authenticated. RLS mengatur BARIS mana yang boleh diakses,
-- tapi GRANT ini mengatur AKSI apa (select/insert/dst) yang
-- boleh dicoba sama sekali di tabel tersebut. Keduanya wajib
-- ada bersamaan.
-- ============================================================

grant usage on schema public to anon, authenticated;

-- Bidang: publik & staf boleh baca (untuk dropdown + statistik)
grant select on bidang to anon, authenticated;
grant all on bidang to authenticated; -- dibatasi lebih lanjut oleh RLS is_admin()

-- Pendaftar: publik hanya boleh insert (submit form),
-- baca/ubah/hapus hanya untuk authenticated (dibatasi RLS is_admin())
grant insert on pendaftar to anon, authenticated;
grant select, update, delete on pendaftar to authenticated;

-- Dokumen pendaftar: publik boleh insert (upload dokumen),
-- baca/hapus hanya authenticated (dibatasi RLS is_admin())
grant insert on dokumen_pendaftar to anon, authenticated;
grant select, delete on dokumen_pendaftar to authenticated;

-- Admin pengguna: hanya authenticated yang boleh coba baca
-- (dibatasi lebih lanjut oleh RLS is_admin())
grant select on admin_pengguna to authenticated;

-- Sequence nomor pendaftaran: anon perlu bisa memakainya lewat
-- trigger saat insert, meski tidak pernah membacanya langsung.
grant usage on sequence nomor_pendaftaran_seq to anon, authenticated;
