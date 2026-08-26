create or replace function daftar_magang(
  p_nama_lengkap text,
  p_email text,
  p_no_hp text,
  p_jenis_institusi text,
  p_asal_institusi text,
  p_jurusan_prodi text,
  p_tanggal_mulai date,
  p_tanggal_selesai date
)
returns table (
  id uuid,
  nomor_pendaftaran text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_nomor text;
  v_user_id uuid := auth.uid();

  -- Menggunakan tanggal lokal Indonesia Barat (WIB),
  -- sesuai lokasi operasional sistem.
  v_hari_ini date := (
    now() at time zone 'Asia/Jakarta'
  )::date;
begin
  if v_user_id is null then
    raise exception
      'Anda harus masuk terlebih dahulu untuk mendaftar.';
  end if;

  if p_tanggal_mulai is null then
    raise exception
      'Tanggal mulai magang wajib diisi.';
  end if;

  if p_tanggal_selesai is null then
    raise exception
      'Tanggal selesai magang wajib diisi.';
  end if;

  if p_tanggal_mulai < v_hari_ini then
    raise exception
      'Tanggal mulai magang tidak boleh sebelum hari ini.';
  end if;

  if p_tanggal_selesai < p_tanggal_mulai then
    raise exception
      'Tanggal selesai tidak boleh sebelum tanggal mulai.';
  end if;

  if exists (
    select 1
    from pendaftar
    where user_id = v_user_id
      and status in ('menunggu', 'diverifikasi')
  ) then
    raise exception
      'Kamu masih punya pendaftaran yang sedang aktif. Cek statusnya di Beranda.';
  end if;

  insert into pendaftar (
    user_id,
    nama_lengkap,
    email,
    no_hp,
    jenis_institusi,
    asal_institusi,
    jurusan_prodi,
    tanggal_mulai,
    tanggal_selesai
  )
  values (
    v_user_id,
    p_nama_lengkap,
    p_email,
    p_no_hp,
    p_jenis_institusi,
    p_asal_institusi,
    p_jurusan_prodi,
    p_tanggal_mulai,
    p_tanggal_selesai
  )
  returning
    pendaftar.id,
    pendaftar.nomor_pendaftaran
  into
    v_id,
    v_nomor;

  return query
  select
    v_id,
    v_nomor;
end;
$$;

grant execute on function daftar_magang(
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  date
) to authenticated;