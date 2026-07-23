"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAdminAkses } from "@/lib/useAdminAkses";
import AdminNav from "@/components/admin/AdminNav";

type Ringkasan = {
  menunggu: number;
  diverifikasi: number;
  ditolak: number;
  total: number;
};

export default function AdminBerandaPage() {
  const { memuat, ditolakAkses, keluar } = useAdminAkses();
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null);
  const [errorRingkasan, setErrorRingkasan] = useState<string | null>(null);

  useEffect(() => {
    if (memuat || ditolakAkses) return;

    let masihTerpasang = true;

    async function muatRingkasan() {
      const { data, error } = await supabase.from("pendaftar").select("status");

      if (!masihTerpasang) return;

      if (error) {
        console.error("Gagal memuat ringkasan pendaftar:", error);
        setErrorRingkasan("Gagal memuat ringkasan data. Coba muat ulang halaman.");
        return;
      }

      const hitung = { menunggu: 0, diverifikasi: 0, ditolak: 0, total: 0 };
      for (const baris of data ?? []) {
        hitung.total += 1;
        if (baris.status === "menunggu") hitung.menunggu += 1;
        else if (baris.status === "diverifikasi") hitung.diverifikasi += 1;
        else if (baris.status === "ditolak") hitung.ditolak += 1;
      }
      setRingkasan(hitung);
    }

    muatRingkasan();
    return () => {
      masihTerpasang = false;
    };
  }, [memuat, ditolakAkses]);

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
    <div className="halaman">
      <div className="bungkus" style={{ maxWidth: 1400 }}>
        <AdminNav onKeluar={keluar} />

        <div style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow" style={{ margin: 0 }}>
            Dashboard admin
          </p>
          <h1 className="judul-hero" style={{ fontSize: 24, maxWidth: "none" }}>
            Ringkasan pendaftaran magang
          </h1>
          <p className="sub-hero" style={{ margin: "0.35rem 0 0" }}>
            Pantauan singkat status pendaftar sebelum masuk ke data lengkap.
          </p>
        </div>

        {errorRingkasan && (
          <div className="form-pesan-gagal" style={{ marginBottom: "1.25rem" }}>
            {errorRingkasan}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: "1.75rem",
          }}
        >
          <KartuRingkasan label="Menunggu" nilai={ringkasan?.menunggu} />
          <KartuRingkasan label="Diterima" nilai={ringkasan?.diverifikasi} />
          <KartuRingkasan label="Ditolak" nilai={ringkasan?.ditolak} />
          <KartuRingkasan label="Total pendaftar" nilai={ringkasan?.total} tebal />
        </div>

        <div className="panel-glass">
          <p className="eyebrow" style={{ margin: 0 }}>
            Langkah berikutnya
          </p>
          <h2 className="judul-hero" style={{ fontSize: 18, maxWidth: "none", marginBottom: "0.75rem" }}>
            Kelola pendaftar yang masuk
          </h2>
          <p className="sub-hero" style={{ marginBottom: "1.25rem" }}>
            Terima, tolak, atau tetapkan bidang penempatan untuk pendaftar
            yang statusnya masih menunggu.
          </p>
          <Link href="/admin/dashboard" className="tombol">
            Buka data pendaftar
          </Link>
        </div>
      </div>
    </div>
  );
}

function KartuRingkasan({
  label,
  nilai,
  tebal,
}: {
  label: string;
  nilai: number | undefined;
  tebal?: boolean;
}) {
  return (
    <div
      className="panel-glass"
      style={{
        padding: "1.1rem 1.25rem",
        borderColor: tebal ? "var(--emas)" : undefined,
      }}
    >
      <p className="eyebrow" style={{ margin: 0 }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-judul)",
          fontSize: 30,
          margin: "0.2rem 0 0",
          color: "var(--navy)",
        }}
      >
        {nilai ?? "–"}
      </p>
    </div>
  );
}