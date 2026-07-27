alter table pendaftar
  drop constraint if exists pendaftar_user_id_fkey;
alter table pendaftar
  add constraint pendaftar_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

alter table pendaftar
  drop constraint if exists pendaftar_diverifikasi_oleh_fkey;
alter table pendaftar
  add constraint pendaftar_diverifikasi_oleh_fkey
  foreign key (diverifikasi_oleh) references auth.users(id) on delete set null;