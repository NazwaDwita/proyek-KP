alter table bidang add column if not exists kuota int not null default 10;
create or replace function kuota_bidang_untuk_periode(
  p_tanggal_mulai date,
  p_tanggal_selesai date,
  p_exclude_id uuid default null
)
returns table (
  bidang_id uuid,
  bidang_nama text,
  kuota int,
  terisi bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admin_pengguna where id = auth.uid()) then
    raise exception 'Hanya admin yang boleh mengakses data kuota.';
  end if;

  return query
  select
    b.id,
    b.nama,
    b.kuota,
    count(p.id) filter (
      where p.status in ('menunggu', 'diverifikasi')
        and (p_exclude_id is null or p.id != p_exclude_id)
        and p.tanggal_mulai <= p_tanggal_selesai
        and p.tanggal_selesai >= p_tanggal_mulai
    )
  from bidang b
  left join pendaftar p on p.bidang_id = b.id
  where b.aktif = true
  group by b.id, b.nama, b.kuota
  order by b.nama;
end;
$$;

grant execute on function kuota_bidang_untuk_periode(date, date, uuid) to authenticated;