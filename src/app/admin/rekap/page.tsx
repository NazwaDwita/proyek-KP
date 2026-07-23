"use client";

import { useAdminAkses } from "@/lib/useAdminAkses";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminRekapPage() {
  const { memuat, ditolakAkses, keluar } = useAdminAkses();

  if (memuat) {
    return (
      <div className="halaman">
        <div className="bungkus">
          <p className="sub-hero">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (ditolakAkses) {
    return (
      <div className="halaman">
        <div className="bungkus">
          <div className="panel-glass">
            <p className="eyebrow">Akses ditolak</p>
            <h1 className="judul-hero" style={{ fontSize: 22, maxWidth: "none" }}>
              Akun ini tidak memiliki akses admin
            </h1>
            <p className="sub-hero">
              Hubungi staf lain yang sudah terdaftar untuk ditambahkan sebagai
              admin.
            </p>
            <button className="tombol sekunder" onClick={keluar}>
              Kembali ke login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="halaman halaman-fit">
      <div className="bungkus bungkus-fit" style={{ maxWidth: 1400 }}>
        <AdminNav onKeluar={keluar} />

        <div className="panel-glass">
          <p className="eyebrow" style={{ margin: 0 }}>
            Rekap data
          </p>
          <h1 className="judul-hero" style={{ fontSize: 22, maxWidth: "none" }}>
            Segera hadir
          </h1>
          <p className="sub-hero">
            Rekap &amp; ekspor data pendaftar (mis. per periode atau per
            status) untuk laporan. Belum tersedia — akan dibangun di tahap
            berikutnya.
          </p>
        </div>
      </div>
    </div>
  );
}