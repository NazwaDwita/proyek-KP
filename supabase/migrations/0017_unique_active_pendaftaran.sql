-- Migrasi 0017: Menambahkan partial unique index untuk mencegah race condition / double-submit pendaftaran aktif
-- Memastikan 1 user_id hanya bisa memiliki maksimal 1 pendaftaran dengan status 'menunggu' atau 'diverifikasi' pada tingkat database.

create unique index if not exists idx_pendaftar_user_id_aktif
on pendaftar (user_id)
where status in ('menunggu', 'diverifikasi');
