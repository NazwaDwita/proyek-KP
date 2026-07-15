import Link from "next/link";
import Brand from "@/components/Brand";
import NavPill from "@/components/NavPill";

export default function BerandaPage() {
  return (
    <div className="halaman">
      <div className="bungkus">
        <Brand />
        <NavPill />

        <div className="panel-glass">
          <p className="eyebrow">Bidang Aplikasi Informatika (Aptika)</p>
          <h1 className="judul-hero">
            Pendaftaran magang dan Kerja Praktek, lebih ringkas dari
            sebelumnya
          </h1>
          <p className="sub-hero">
            Daftar secara daring, unggah surat pengantar, dan pantau status
            pendaftaranmu tanpa perlu bolak-balik ke kantor atau menghubungi
            staf secara personal.
          </p>
          <Link href="/daftar" className="tombol">
            Mulai daftar
          </Link>
          <Link
            href="/statistik"
            className="tombol sekunder"
            style={{ marginLeft: 10 }}
          >
            Lihat statistik peserta
          </Link>
        </div>

        <p className="keterangan-halaman">
          Prototipe tampilan &mdash; konten dan data pada halaman ini masih
          contoh sementara.
        </p>
      </div>
    </div>
  );
}
