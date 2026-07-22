"use client";

import { useState, FormEvent } from "react";
import HeaderSticky from "@/components/HeaderSticky";
import { supabase } from "@/lib/supabase";

type HasilStatus = {
  nomor_pendaftaran: string;
  nama_lengkap: string;
  status: "menunggu" | "diverifikasi" | "ditolak";
  catatan_admin: string | null;
  bidang_nama: string | null;
  dibuat_pada: string;
};

const LABEL_STATUS: Record<HasilStatus["status"], string> = {
  menunggu: "Menunggu diverifikasi",
  diverifikasi: "Diverifikasi",
  ditolak: "Ditolak",
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CekStatusPage() {
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");
  const [email, setEmail] = useState("");
  const [mencari, setMencari] = useState(false);
  const [sudahDicari, setSudahDicari] = useState(false);
  const [hasil, setHasil] = useState<HasilStatus | null>(null);
  const [pesanError, setPesanError] = useState<string | null>(null);

  async function cariStatus(e: FormEvent) {
    e.preventDefault();
    setMencari(true);
    setPesanError(null);
    setHasil(null);

    try {
      const { data, error } = await supabase.rpc("cek_status_pendaftaran", {
        p_nomor_pendaftaran: nomorPendaftaran.trim(),
        p_email: email.trim(),
      });

      if (error) {
        console.error("Gagal cek status:", error);
        setPesanError(
          "Terjadi kesalahan saat menghubungi server. Silakan coba lagi beberapa saat lagi."
        );
        return;
      }

      const baris = data?.[0] ?? null;
      setHasil(baris);
    } catch (err) {
      console.error("Exception saat cek status:", err);
      setPesanError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
    } finally {
      setMencari(false);
      setSudahDicari(true);
    }
  }

  return (
    <div className="halaman">
      <div className="bungkus">
        <HeaderSticky />

        <form className="panel-glass" onSubmit={cariStatus}>
          <p className="eyebrow">Cek status mandiri</p>
          <h1 className="judul-hero" style={{ fontSize: 26, maxWidth: "none" }}>
            Lacak status pendaftaran magangmu
          </h1>
          <p className="sub-hero" style={{ marginBottom: "1.75rem" }}>
            Masukkan nomor pendaftaran dan email yang kamu daftarkan. Kedua
            data ini harus cocok persis, supaya orang lain tidak bisa
            mengintip status pendaftaranmu.
          </p>

          {pesanError && <div className="form-pesan-gagal">{pesanError}</div>}

          <div className="form-baris">
            <div className="form-grup">
              <label htmlFor="nomor_pendaftaran">Nomor pendaftaran</label>
              <input
                id="nomor_pendaftaran"
                className="form-input"
                required
                placeholder="MGG-2026-0001"
                value={nomorPendaftaran}
                onChange={(e) => setNomorPendaftaran(e.target.value)}
              />
            </div>
            <div className="form-grup">
              <label htmlFor="email">Email yang didaftarkan</label>
              <input
                id="email"
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="tombol" disabled={mencari}>
            {mencari ? "Mencari..." : "Cek status"}
          </button>
        </form>

        {sudahDicari && !mencari && (
          <div className="panel-glass" style={{ marginTop: "1.5rem" }}>
            {hasil ? (
              <>
                <p className="eyebrow">Ditemukan</p>
                <div style={{ marginBottom: "1rem" }}>
                  <span
                    className={`status-badge status-${hasil.status}`}
                  >
                    {LABEL_STATUS[hasil.status]}
                  </span>
                </div>

                <div className="hasil-status-baris">
                  <span className="hasil-status-label">
                    Nomor pendaftaran
                  </span>
                  <strong>{hasil.nomor_pendaftaran}</strong>
                </div>
                <div className="hasil-status-baris">
                  <span className="hasil-status-label">Nama</span>
                  <span>{hasil.nama_lengkap}</span>
                </div>
                <div className="hasil-status-baris">
                  <span className="hasil-status-label">Bidang penempatan</span>
                  <span>{hasil.bidang_nama ?? "Menunggu penempatan"}</span>
                </div>
                <div className="hasil-status-baris">
                  <span className="hasil-status-label">Tanggal daftar</span>
                  <span>{formatTanggal(hasil.dibuat_pada)}</span>
                </div>

                {hasil.status === "ditolak" && hasil.catatan_admin && (
                  <div
                    className="form-pesan-gagal"
                    style={{ marginTop: "1.25rem", marginBottom: 0 }}
                  >
                    <strong>Catatan dari staf:</strong> {hasil.catatan_admin}
                  </div>
                )}
              </>
            ) : (
              <p className="sub-hero" style={{ margin: 0 }}>
                Data tidak ditemukan. Pastikan nomor pendaftaran dan email
                yang kamu masukkan sudah benar dan sesuai dengan yang
                digunakan saat mendaftar.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}