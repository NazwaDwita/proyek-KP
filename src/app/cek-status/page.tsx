"use client";

import { useState, FormEvent } from "react";
import HeaderSticky from "@/components/HeaderSticky";
import Footer from "@/components/Footer";
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
  menunggu: "Menunggu",
  diverifikasi: "Diterima",
  ditolak: "Ditolak",
};

const BADGE_KELAS: Record<HasilStatus["status"], string> = {
  menunggu: "bg-muted text-muted-foreground border border-border",
  diverifikasi: "bg-green-100 text-green-700 border border-green-200",
  ditolak: "bg-red-100 text-red-700 border border-red-200",
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
    <div className="flex min-h-screen flex-col">
      <HeaderSticky />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
          <form
            className="rounded-xl border border-border bg-card p-7 shadow-soft"
            onSubmit={cariStatus}
          >
            <p className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Cek status mandiri
            </p>
            <h1 className="mt-4 font-display text-2xl font-semibold text-foreground md:text-3xl">
              Lacak status pendaftaran magangmu
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Masukkan nomor pendaftaran dan email yang kamu daftarkan. Kedua data ini harus
              cocok persis, supaya orang lain tidak bisa mengintip status pendaftaranmu.
            </p>

            {pesanError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {pesanError}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="nomor_pendaftaran"
                  className="text-sm font-medium text-foreground"
                >
                  Nomor pendaftaran
                </label>
                <input
                  id="nomor_pendaftaran"
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  required
                  placeholder="MGG-2026-0001"
                  value={nomorPendaftaran}
                  onChange={(e) => setNomorPendaftaran(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email yang didaftarkan
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mencari}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {mencari ? "Mencari..." : "Cek status"}
            </button>
          </form>

          {sudahDicari && !mencari && (
            <div className="mt-6 rounded-xl border border-border bg-card p-7 shadow-soft">
              {hasil ? (
                <>
                  <p className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Ditemukan
                  </p>

                  <div className="mt-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${BADGE_KELAS[hasil.status]}`}
                    >
                      {LABEL_STATUS[hasil.status]}
                    </span>
                  </div>

                  <div className="mt-3 divide-y divide-border text-sm">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Nomor pendaftaran</span>
                      <span className="font-medium text-foreground">
                        {hasil.nomor_pendaftaran}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Nama</span>
                      <span className="font-medium text-foreground">{hasil.nama_lengkap}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Bidang penempatan</span>
                      <span className="font-medium text-foreground">
                        {hasil.bidang_nama ?? "Menunggu penempatan"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Tanggal daftar</span>
                      <span className="font-medium text-foreground">
                        {formatTanggal(hasil.dibuat_pada)}
                      </span>
                    </div>
                  </div>

                  {hasil.status === "ditolak" && hasil.catatan_admin && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <strong>Catatan dari staf:</strong> {hasil.catatan_admin}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Data tidak ditemukan. Pastikan nomor pendaftaran dan email yang kamu masukkan
                  sudah benar dan sesuai dengan yang digunakan saat mendaftar.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}