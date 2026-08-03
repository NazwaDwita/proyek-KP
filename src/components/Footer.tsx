export default function Footer() {
  return (
    <footer className="footer-dinas">
      <div className="footer-dinas-isi">
        <div className="footer-kolom">
          <h3>Profil</h3>
          <p>Alamat: Jalan Diponegoro Nomor 24 A, Pekanbaru</p>
          <p>Email: diskominfotik@riau.go.id</p>
          <p>Telepon: (0761) 45505</p>
        </div>

        <div className="footer-kolom">
          <h3>Lokasi</h3>
          <div className="footer-peta">
            <iframe
              title="Lokasi Diskominfotik Provinsi Riau"
              src="https://www.google.com/maps?q=Dinas+Komunikasi+Informatika+dan+Statistik+Provinsi+Riau+Jalan+Diponegoro+No+24A+Pekanbaru&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="footer-kolom">
          <h3>Link Terkait</h3>
          <a
            href="https://diskominfotik.riau.go.id"
            target="_blank"
            rel="noopener noreferrer"
          >
            Website Diskominfotik Provinsi Riau
          </a>
          <a href="https://riau.go.id" target="_blank" rel="noopener noreferrer">
            Portal Pemerintah Provinsi Riau
          </a>
        </div>
      </div>

      <div className="footer-motif" />

      <div className="footer-bawah">Pemerintah Provinsi Riau &copy; {new Date().getFullYear()}</div>
    </footer>
  );
}