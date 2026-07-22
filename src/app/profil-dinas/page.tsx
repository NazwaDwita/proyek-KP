import HeaderSticky from "@/components/HeaderSticky";

export default function ProfilDinasPage() {
  return (
    <div className="halaman">
      <div className="bungkus">
        <HeaderSticky />

        <div className="panel-glass">
          <p className="eyebrow">Tentang instansi</p>
          <h1 className="judul-hero" style={{ fontSize: 26, maxWidth: "none" }}>
            Profil Diskominfotik Provinsi Riau
          </h1>
          <p className="sub-hero" style={{ marginBottom: "1.75rem" }}>
            Dinas Komunikasi, Informatika dan Statistik Provinsi Riau.
          </p>

          <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ color: "var(--emas-terang)", fontSize: 16, marginBottom: 8 }}>
              Visi
            </h2>
            <p className="sub-hero" style={{ margin: 0 }}>
              Mewujudkan Masyarakat Riau yang Informatif dan Kreatif.
            </p>
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ color: "var(--emas-terang)", fontSize: 16, marginBottom: 8 }}>
              Bidang di Diskominfotik Provinsi Riau
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--teks-muted)", lineHeight: 1.8 }}>
              <li>Bidang Aplikasi &amp; Informatika</li>
              <li>Bidang Infrastruktur Teknologi Informasi dan Komunikasi</li>
              <li>Bidang Informasi dan Komunikasi Publik</li>
              <li>Bidang Statistik</li>
              <li>Bidang Persandian</li>
            </ul>
          </div>

          <div>
            <h2 style={{ color: "var(--emas-terang)", fontSize: 16, marginBottom: 8 }}>
              Kontak
            </h2>
            <p className="sub-hero" style={{ margin: 0 }}>
              Untuk pertanyaan seputar magang/Kerja Praktek, hubungi staf
              Bidang Aplikasi &amp; Informatika melalui kontak resmi
              Diskominfotik Provinsi Riau.
            </p>
          </div>
        </div>

        <p className="keterangan-halaman">
          Halaman ini masih berisi konten sementara &mdash; perlu dilengkapi
          dengan info resmi (alamat, nomor telepon, struktur organisasi
          lengkap) sebelum dipakai untuk publik.
        </p>
      </div>
    </div>
  );
}
