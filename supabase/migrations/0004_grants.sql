grant usage on schema public to anon, authenticated;

grant select on bidang to anon, authenticated;
grant all on bidang to authenticated; 

grant insert on pendaftar to anon, authenticated;
grant select, update, delete on pendaftar to authenticated;

grant insert on dokumen_pendaftar to anon, authenticated;
grant select, delete on dokumen_pendaftar to authenticated;

grant select on admin_pengguna to authenticated;

grant usage on sequence nomor_pendaftaran_seq to anon, authenticated;
