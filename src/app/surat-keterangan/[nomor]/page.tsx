"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSesi } from "@/lib/useSesi";
import { periodeSudahSelesai } from "@/lib/periodeMagang";

type DetailSurat = {
  nomor_pendaftaran: string;
  nama_lengkap: string;
  asal_institusi: string;
  jenis_institusi: "kampus" | "sekolah";
  jurusan_prodi: string | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: "menunggu" | "diverifikasi" | "ditolak";
  bidang: { nama: string } | null;
};

function formatTanggalPanjang(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SuratKeteranganPage() {
  const params = useParams<{ nomor: string }>();
  const router = useRouter();
  const { sesi, memuat: memuatSesi } = useSesi();

  const [detail, setDetail] = useState<DetailSurat | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memuatSesi) return;

    if (!sesi) {
      router.replace("/");
      return;
    }

    let masihTerpasang = true;

    async function muat() {
      const { data, error } = await supabase
        .from("pendaftar")
        .select(
          "nomor_pendaftaran, nama_lengkap, asal_institusi, jenis_institusi, jurusan_prodi, tanggal_mulai, tanggal_selesai, status, bidang:bidang_id(nama)"
        )
        .eq("nomor_pendaftaran", params.nomor)
        .maybeSingle();

      if (!masihTerpasang) return;

      if (error || !data) {
        console.error("Gagal memuat data surat:", error);
        setError("Data pendaftaran tidak ditemukan.");
        setMemuat(false);
        return;
      }

      const hasil = data as unknown as DetailSurat;

      if (hasil.status !== "diverifikasi") {
        setError(
          "Surat keterangan cuma tersedia untuk pendaftaran yang sudah berstatus Diterima."
        );
        setMemuat(false);
        return;
      }

      setDetail(hasil);
      setMemuat(false);
    }

    muat();
    return () => {
      masihTerpasang = false;
    };
  }, [memuatSesi, sesi, params.nomor, router]);

  if (memuatSesi || memuat) {
    return (
      <div className="halaman-surat">
        <p>Memuat...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="halaman-surat">
        <div className="tombol-baris-surat tanpa-cetak">
          <button type="button" className="tombol sekunder" onClick={() => router.push("/")}>
            &larr; Kembali ke Beranda
          </button>
        </div>
        <p style={{ color: "#b3392e" }}>{error ?? "Data tidak ditemukan."}</p>
      </div>
    );
  }

  const jenisProgram = detail.jenis_institusi === "kampus" ? "Kerja Praktek (KP)" : "Praktik Kerja Lapangan (PKL)";
  const sebutanInstitusi = detail.jenis_institusi === "kampus" ? "Perguruan Tinggi" : "Sekolah";
  const sudahSelesai = periodeSudahSelesai(detail.tanggal_selesai);

  return (
    <div className="halaman-surat">
      <div className="tombol-baris-surat tanpa-cetak">
        <button type="button" className="tombol sekunder" onClick={() => router.push("/")}>
          &larr; Kembali ke Beranda
        </button>
        <button type="button" className="tombol" onClick={() => window.print()}>
          Cetak / Simpan sebagai PDF
        </button>
      </div>

      <div className="kertas-surat">
        <div className="kop-surat">
          <div className="kop-surat-lambang">SI</div>
          <div className="kop-surat-teks">
            <strong>DINAS KOMUNIKASI, INFORMATIKA DAN STATISTIK</strong>
            <span>PROVINSI RIAU</span>
            <span className="kop-surat-alamat">
              Sistem Magang Diskominfotik Riau &mdash; SIMAKRI
            </span>
          </div>
        </div>
        <hr className="kop-surat-garis" />

        <h1 className="judul-surat">
          {sudahSelesai ? "SURAT KETERANGAN SELESAI MAGANG" : "SURAT KETERANGAN"}
        </h1>
        <p className="nomor-surat">Nomor: {detail.nomor_pendaftaran}</p>

        <p className="isi-surat">
          Yang bertanda tangan di bawah ini menerangkan bahwa:
        </p>

        <table className="tabel-surat">
          <tbody>
            <tr>
              <td>Nama</td>
              <td>:</td>
              <td>{detail.nama_lengkap}</td>
            </tr>
            <tr>
              <td>Asal {sebutanInstitusi}</td>
              <td>:</td>
              <td>{detail.asal_institusi}</td>
            </tr>
            {detail.jurusan_prodi && (
              <tr>
                <td>Jurusan / Program Studi</td>
                <td>:</td>
                <td>{detail.jurusan_prodi}</td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="isi-surat">
          {sudahSelesai ? (
            <>
              Benar telah <strong>MELAKSANAKAN</strong> dan{" "}
              <strong>MENYELESAIKAN</strong> {jenisProgram} di Dinas Komunikasi,
              Informatika dan Statistik Provinsi Riau, terhitung sejak tanggal
              diterima sampai dengan selesainya periode pelaksanaan, pada:
            </>
          ) : (
            <>
              Benar telah <strong>DITERIMA</strong> untuk melaksanakan {jenisProgram}{" "}
              di Dinas Komunikasi, Informatika dan Statistik Provinsi Riau, pada:
            </>
          )}
        </p>

        <table className="tabel-surat">
          <tbody>
            <tr>
              <td>Bidang penempatan</td>
              <td>:</td>
              <td>{detail.bidang?.nama ?? "Akan ditentukan kemudian"}</td>
            </tr>
            <tr>
              <td>Periode pelaksanaan</td>
              <td>:</td>
              <td>
                {formatTanggalPanjang(detail.tanggal_mulai)} s.d.{" "}
                {formatTanggalPanjang(detail.tanggal_selesai)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="isi-surat">
          Demikian surat keterangan ini dibuat untuk dapat dipergunakan
          sebagaimana mestinya.
        </p>

        <div className="tanda-tangan-surat">
          <p>Pekanbaru, {formatTanggalPanjang(new Date().toISOString())}</p>
          <p>Kepala Bidang Aplikasi Informatika,</p>
          <div className="tanda-tangan-ruang" />
          <p>
            <strong>(.......................................)</strong>
          </p>
        </div>
      </div>
    </div>
  );
}