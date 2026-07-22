import Link from "next/link";
import HeaderSticky from "@/components/HeaderSticky";

export default function Beranda() {
  return (
    <div className="halaman">
      <div className="bungkus">
        <HeaderSticky />

        <div className="panel-glass">
          <p className="eyebrow">Portal magang</p>
          <h1 className="judul-hero">
            Magang di Diskominfotik Provinsi Riau
          </h1>
          <p className="sub-hero">
            Daftar kerja praktek (KP) atau praktik kerja lapangan (PKL) secara
            online. Pantau status pendaftaran kamu kapan saja setelah mengisi
            formulir.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/daftar" className="tombol">
              Daftar magang
            </Link>
            <Link href="/info" className="tombol sekunder">
              Info dan ketentuan
            </Link>
          </div>
        </div>

        <p className="keterangan-halaman">
          Sudah mendaftar sebelumnya? Cek status pendaftaran kamu melalui
          menu <strong>Cek status</strong> di atas.
        </p>
      </div>
    </div>
  );
}