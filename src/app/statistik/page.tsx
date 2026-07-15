import Brand from "@/components/Brand";
import NavPill from "@/components/NavPill";

const dataStatistik = [
  { angka: 12, label: "Aplikasi Informatika (Aptika)" },
  { angka: 8, label: "Informasi dan Komunikasi Publik" },
  { angka: 5, label: "Statistik dan Persandian" },
  { angka: 10, label: "Sekretariat" },
];

export default function StatistikPage() {
  return (
    <div className="halaman">
      <div className="bungkus">
        <Brand />
        <NavPill />

        <div className="panel-glass">
          <p className="eyebrow">Data per hari ini</p>
          <h1 className="judul-hero" style={{ fontSize: 26, maxWidth: "none" }}>
            Jumlah peserta magang aktif per bidang
          </h1>
          <p className="sub-hero" style={{ marginBottom: 0 }}>
            Angka dihitung otomatis dari peserta yang periode magangnya
            sedang berjalan pada tanggal hari ini.
          </p>

          <div className="grid-statistik">
            {dataStatistik.map((item) => (
              <div className="item-statistik" key={item.label}>
                <div className="angka-statistik">{item.angka}</div>
                <div className="label-statistik">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="keterangan-halaman">
          Angka pada halaman ini adalah data contoh untuk keperluan
          prototipe tampilan.
        </p>
      </div>
    </div>
  );
}
