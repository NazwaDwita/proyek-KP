import HeaderSticky from "@/components/HeaderSticky";

export default function InfoPage() {
  return (
    <div className="halaman">
      <div className="bungkus">
        <HeaderSticky />

        <div className="panel-glass">
          <p className="eyebrow">Sebelum mendaftar</p>
          <h1 className="judul-hero" style={{ fontSize: 26, maxWidth: "none" }}>
            Info dan ketentuan magang
          </h1>
          <p className="sub-hero" style={{ marginBottom: "2rem" }}>
            Baca halaman ini terlebih dahulu sebelum mengisi formulir pendaftaran,
            supaya proses verifikasi oleh staf Bidang Aptika dapat berjalan lebih cepat.
          </p>

          <div className="info-section">
            <h2>Siapa yang bisa mendaftar</h2>
            <ul className="info-list">
              <li>Mahasiswa yang akan melaksanakan Kerja Praktek (KP) dari perguruan tinggi.</li>
              <li>Siswa SMK yang akan melaksanakan Praktik Kerja Lapangan (PKL).</li>
            </ul>
          </div>

          <div className="info-section">
            <h2>Dokumen yang perlu disiapkan</h2>
            <ul className="info-list">
              <li>
                Surat pengantar resmi dari kampus/sekolah, format PDF, maksimal 5MB.
                Dokumen ini diunggah langsung pada formulir pendaftaran.
              </li>
              <li>
                Surat pernyataan menjaga kerahasiaan informasi. Dokumen ini disediakan
                dan diproses langsung oleh staf pada saat kedatangan pertama, tidak
                diunggah melalui formulir pendaftaran online.
              </li>
            </ul>
          </div>

          <div className="info-section">
            <h2>Jam kerja</h2>
            <ul className="info-list">
              <li>Senin&ndash;Selasa: pulang pukul 16.00 WIB.</li>
              <li>Rabu: pulang pukul 16.00 WIB.</li>
              <li>Kamis: pulang pukul 16.30 WIB.</li>
              <li>Jumat: WFH (bekerja dari rumah, tidak hadir ke kantor).</li>
            </ul>
          </div>

          <div className="info-section">
            <h2>Jadwal mulai magang</h2>
            <p className="info-teks">
              Tanggal mulai magang diajukan sendiri oleh pendaftar melalui formulir
              pendaftaran, dan akan dikonfirmasi kembali oleh staf pada saat proses
              verifikasi.
            </p>
            <div className="info-placeholder">
              Catatan internal: bagian ini masih menunggu konfirmasi resmi dari
              pembimbing lapangan mengenai ada/tidaknya periode mulai magang yang
              tetap. Perbarui setelah dikonfirmasi.
            </div>
          </div>

          <div className="info-section">
            <h2>Ketentuan berpakaian</h2>
            <ul className="info-list">
              <li>Senin&ndash;Selasa: pakaian hitam putih.</li>
              <li>Rabu: kemeja bebas/korsa (rapi, tidak kasual berlebihan).</li>
              <li>Kamis: batik.</li>
              <li>Jumat: mengikuti hari WFH, tidak ada ketentuan pakaian kantor.</li>
            </ul>
            <p className="info-teks" style={{ marginTop: "0.75rem" }}>
              Bawahan menggunakan celana panjang berbahan kain (bukan jeans)
              dan tidak ketat. Rok tidak diwajibkan.
            </p>
          </div>

          <div className="info-section">
            <h2>Alur setelah mendaftar</h2>
            <ul className="info-list">
              <li>Formulir dan dokumen diperiksa oleh staf Bidang Aptika.</li>
              <li>
                Status pendaftaran dapat dipantau mandiri melalui halaman{" "}
                <strong>Cek status</strong>, menggunakan nomor pendaftaran dan
                email yang didaftarkan.
              </li>
              <li>
                Apabila diverifikasi, penempatan bidang akan dicatat dan dapat
                dilihat pada halaman yang sama.
              </li>
            </ul>
          </div>
        </div>

        <p className="keterangan-halaman">
          Ada pertanyaan lain yang belum terjawab di halaman ini? Hubungi staf
          Bidang Aptika melalui kontak resmi instansi.
        </p>
      </div>
    </div>
  );
}
