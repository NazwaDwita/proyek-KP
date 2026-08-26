create table if not exists riwayat_status_pendaftar (
  id uuid primary key default gen_random_uuid(),
  pendaftar_id uuid not null references pendaftar(id) on delete cascade,
  status_lama status_pendaftaran,
  status_baru status_pendaftaran not null,
  diubah_oleh uuid references auth.users(id),
  diubah_pada timestamptz not null default now()
);

create index if not exists idx_riwayat_status_pendaftar
  on riwayat_status_pendaftar(pendaftar_id, diubah_pada);

alter table riwayat_status_pendaftar enable row level security;
create policy "riwayat_status_select_admin" on riwayat_status_pendaftar
  for select using (is_admin());
grant select on riwayat_status_pendaftar to authenticated;

create or replace function catat_riwayat_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    insert into riwayat_status_pendaftar (pendaftar_id, status_lama, status_baru, diubah_oleh)
    values (new.id, null, new.status, new.diverifikasi_oleh);
    return new;
  end if;

  if (TG_OP = 'UPDATE') and (new.status is distinct from old.status) then
    insert into riwayat_status_pendaftar (pendaftar_id, status_lama, status_baru, diubah_oleh)
    values (new.id, old.status, new.status, new.diverifikasi_oleh);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_catat_riwayat_status on pendaftar;
create trigger trg_catat_riwayat_status
  after insert or update on pendaftar
  for each row execute function catat_riwayat_status();