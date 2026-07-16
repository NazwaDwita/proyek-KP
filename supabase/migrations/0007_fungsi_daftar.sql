-- ============================================================
-- MIGRASI 0007: Fungsi pendaftaran aman (security definer)
--
-- Masalah yang diperbaiki: form memanggil .insert().select().single(),
-- tapi RLS pendaftar_select_admin hanya izinkan admin membaca tabel
-- pendaftar. Akibatnya proses "baca balik" otomatis setelah insert
-- gagal karena RLS, walau baris insert-nya sendiri kemungkinan besar
-- berhasil -- sehingga form salah menampilkan "gagal" padahal data
-- sudah tersimpan.
--
-- Solusi: bungkus insert dalam fungsi security definer, sama seperti
-- pola cek_status_pendaftaran(). Fungsi ini yang melakukan insert atas
-- nama sistem, lalu mengembalikan HANYA id + nomor_pendaftaran --
-- tanpa perlu membuka akses SELECT publik ke seluruh tabel.
-- ============================================================

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
begin
  if p_tanggal_selesai < p_tanggal_mulai then
    raise exception 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
  end if;

  insert into pendaftar (
    nama_lengkap, email, no_hp, jenis_institusi, asal_institusi,
    jurusan_prodi, bidang_id, tanggal_mulai, tanggal_selesai
  ) values (
    p_nama_lengkap, p_email, p_no_hp, p_jenis_institusi, p_asal_institusi,
    p_jurusan_prodi, p_bidang_id, p_tanggal_mulai, p_tanggal_selesai
  )
  returning pendaftar.id, pendaftar.nomor_pendaftaran into v_id, v_nomor;

  return query select v_id, v_nomor;
end;
$$;

-- Hanya boleh dipanggil, tidak bisa "dibaca" strukturnya sembarangan
grant execute on function daftar_magang(
  text, text, text, text, text, text, uuid, date, date
) to anon, authenticated;
