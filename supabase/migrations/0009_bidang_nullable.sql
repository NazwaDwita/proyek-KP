-- Bidang penempatan sekarang ditentukan oleh admin saat verifikasi,
-- bukan dipilih sendiri oleh pendaftar saat mengisi formulir.
alter table pendaftar alter column bidang_id drop not null;
