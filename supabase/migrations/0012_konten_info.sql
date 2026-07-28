create table if not exists info_konten (
  id uuid primary key default gen_random_uuid(),
  intro text not null,
  siapa_yang_bisa_mendaftar text not null,
  dokumen_diperlukan text not null,
  jam_kerja text not null,
  jadwal_mulai_magang text not null,
  ketentuan_berpakaian text not null,
  alur_setelah_mendaftar text not null,
  keterangan_kontak text not null,
  diperbarui_pada timestamptz not null default now(),
  diperbarui_oleh uuid references auth.users(id) on delete set null
);

insert into info_konten (
  intro, siapa_yang_bisa_mendaftar, dokumen_diperlukan, jam_kerja,
  jadwal_mulai_magang, ketentuan_berpakaian, alur_setelah_mendaftar,
  keterangan_kontak
)
select
  'Baca halaman ini terlebih dahulu sebelum mengisi formulir pendaftaran, supaya proses verifikasi oleh staf Bidang Aptika dapat berjalan lebih cepat.',
  E'Mahasiswa yang akan melaksanakan Kerja Praktek (KP) dari perguruan tinggi.\nSiswa SMK yang akan melaksanakan Praktik Kerja Lapangan (PKL).',
  E'Surat pengantar resmi dari kampus/sekolah, format PDF, maksimal 5MB. Dokumen ini diunggah langsung pada formulir pendaftaran.\nSurat pernyataan menjaga kerahasiaan informasi. Dokumen ini disediakan dan diproses langsung oleh staf pada saat kedatangan pertama, tidak diunggah melalui formulir pendaftaran online.',
  E'Senin\u2013Selasa: pulang pukul 16.00 WIB.\nRabu: pulang pukul 16.00 WIB.\nKamis: pulang pukul 16.30 WIB.\nJumat: WFH (bekerja dari rumah, tidak hadir ke kantor).',
  E'Tanggal mulai magang diajukan sendiri oleh pendaftar melalui formulir pendaftaran, dan akan dikonfirmasi kembali oleh staf pada saat proses verifikasi.',
  E'Senin\u2013Selasa: pakaian hitam putih.\nRabu: kemeja bebas/korsa (rapi, tidak kasual berlebihan).\nKamis: batik.\nJumat: mengikuti hari WFH, tidak ada ketentuan pakaian kantor.\nBawahan menggunakan celana panjang berbahan kain (bukan jeans) dan tidak ketat. Rok tidak diwajibkan.',
  E'Formulir dan dokumen diperiksa oleh staf Bidang Aptika.\nStatus pendaftaran dapat dipantau mandiri melalui halaman Beranda setelah login.\nApabila diterima, penempatan bidang akan dicatat dan dapat dilihat pada halaman yang sama.',
  'Ada pertanyaan lain yang belum terjawab di halaman ini? Hubungi staf Bidang Aptika melalui kontak resmi instansi.'
where not exists (select 1 from info_konten);

alter table info_konten enable row level security;

create policy "info_konten_select_publik" on info_konten
  for select using (true);

create policy "info_konten_update_admin" on info_konten
  for update using (
    exists (select 1 from admin_pengguna where id = auth.uid())
  );

grant select on info_konten to anon, authenticated;
grant update on info_konten to authenticated;