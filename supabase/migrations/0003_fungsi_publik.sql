-- ============================================================
-- MIGRASI 0003: Fungsi untuk akses publik yang aman
-- (cek status mandiri + statistik agregat)
-- ============================================================

-- ------------------------------------------------------------
-- GENERATE NOMOR PENDAFTARAN OTOMATIS
-- Format SEMENTARA: MGG-2026-0001 (tahun + urutan).
-- BELUM DIKONFIRMASI ke Bang Irawan — mudah diganti di sini saja
-- kalau formatnya ternyata harus beda.
-- ------------------------------------------------------------
create sequence if not exists nomor_pendaftaran_seq start 1;

create or replace function generate_nomor_pendaftaran()
returns trigger as $$
begin
  if new.nomor_pendaftaran is null then
    new.nomor_pendaftaran := 'MGG-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('nomor_pendaftaran_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_generate_nomor on pendaftar;
create trigger trg_generate_nomor
  before insert on pendaftar
  for each row execute function generate_nomor_pendaftaran();

-- ------------------------------------------------------------
-- CEK STATUS MANDIRI
-- Wajib cocokkan nomor_pendaftaran DAN email, supaya orang lain
-- tidak bisa menebak-nebak nomor pendaftaran urut (MGG-2026-0001,
-- 0002, dst mudah ditebak) untuk mengintip status orang lain.
-- SECURITY DEFINER supaya bisa baca tabel meski RLS membatasi
-- SELECT publik, tapi hanya kolom yang di-return di sini yang
-- terekspos — bukan seluruh baris.
-- ------------------------------------------------------------
create or replace function cek_status_pendaftaran(
  p_nomor_pendaftaran text,
  p_email text
)
returns table (
  nomor_pendaftaran text,
  nama_lengkap text,
  status status_pendaftaran,
  catatan_admin text,
  bidang_nama text,
  dibuat_pada timestamptz
) as $$
  select
    p.nomor_pendaftaran,
    p.nama_lengkap,
    p.status,
    p.catatan_admin,
    b.nama,
    p.dibuat_pada
  from pendaftar p
  join bidang b on b.id = p.bidang_id
  where p.nomor_pendaftaran = p_nomor_pendaftaran
    and lower(p.email) = lower(p_email);
$$ language sql stable security definer;

-- Batasi siapa yang boleh panggil fungsi ini (anon + authenticated)
grant execute on function cek_status_pendaftaran(text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- STATISTIK PUBLIK: hitung peserta AKTIF per bidang
-- Aktif = status diverifikasi DAN hari ini ada di antara
-- tanggal_mulai dan tanggal_selesai.
-- Hanya angka agregat yang diexpose, bukan baris individu.
-- ------------------------------------------------------------
create or replace function statistik_peserta_aktif()
returns table (
  bidang_nama text,
  jumlah_aktif bigint
) as $$
  select
    b.nama,
    count(p.id) filter (
      where p.status = 'diverifikasi'
        and current_date between p.tanggal_mulai and p.tanggal_selesai
    )
  from bidang b
  left join pendaftar p on p.bidang_id = b.id
  where b.aktif = true
  group by b.nama
  order by b.nama;
$$ language sql stable security definer;

grant execute on function statistik_peserta_aktif() to anon, authenticated;
