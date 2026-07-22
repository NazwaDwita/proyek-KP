-- Menghubungkan setiap pendaftaran ke akun yang login, supaya
-- pendaftaran wajib login dan pendaftar bisa melihat status
-- pendaftarannya sendiri langsung dari Beranda.

alter table pendaftar add column if not exists user_id uuid references auth.users(id);

create index if not exists idx_pendaftar_user on pendaftar(user_id);

-- Ganti kebijakan insert: dulu siapa saja (anon) boleh insert,
-- sekarang wajib login dan user_id harus sesuai akun yang login.
drop policy if exists "pendaftar_insert_publik" on pendaftar;

create policy "pendaftar_insert_pemilik" on pendaftar
  for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and status = 'menunggu'
    and diverifikasi_oleh is null
  );

-- Pendaftar boleh lihat baris miliknya sendiri (selain admin yang
-- sudah bisa lihat semua lewat kebijakan pendaftar_select_admin).
create policy "pendaftar_select_pemilik" on pendaftar
  for select using (auth.uid() = user_id);

-- Dokumen: batasi upload hanya untuk pendaftaran milik sendiri
-- (sebelumnya "with check (true)" terlalu longgar).
drop policy if exists "dokumen_insert_publik" on dokumen_pendaftar;

create policy "dokumen_insert_pemilik" on dokumen_pendaftar
  for insert
  with check (
    exists (
      select 1 from pendaftar p
      where p.id = dokumen_pendaftar.pendaftar_id
        and p.user_id = auth.uid()
    )
  );

-- Fungsi daftar_magang: sekarang mewajibkan auth.uid() dan otomatis
-- mengisi user_id dari sesi yang login (bukan dari input client).
create or replace function daftar_magang(
  p_nama_lengkap text,
  p_email text,
  p_no_hp text,
  p_jenis_institusi text,
  p_asal_institusi text,
  p_jurusan_prodi text,
  p_bidang_id uuid,
  p_tanggal_mulai date,
  p_tanggal_selesai date
)
returns table (id uuid, nomor_pendaftaran text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_nomor text;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Anda harus masuk terlebih dahulu untuk mendaftar.';
  end if;

  if p_tanggal_selesai < p_tanggal_mulai then
    raise exception 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
  end if;

  insert into pendaftar (
    user_id, nama_lengkap, email, no_hp, jenis_institusi, asal_institusi,
    jurusan_prodi, bidang_id, tanggal_mulai, tanggal_selesai
  ) values (
    v_user_id, p_nama_lengkap, p_email, p_no_hp, p_jenis_institusi, p_asal_institusi,
    p_jurusan_prodi, p_bidang_id, p_tanggal_mulai, p_tanggal_selesai
  )
  returning pendaftar.id, pendaftar.nomor_pendaftaran into v_id, v_nomor;

  return query select v_id, v_nomor;
end;
$$;
