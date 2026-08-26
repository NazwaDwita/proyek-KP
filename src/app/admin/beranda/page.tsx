"use client";

import { useEffect, useState } from "react";
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
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Memeriksa akses...</p>
      </div>
    );
  }

  if (ditolakAkses) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
            Akses ditolak
          </p>
          <h1 className="mt-2 font-display text-xl font-semibold text-foreground">
            Akun ini tidak memiliki akses admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hubungi staf lain yang sudah terdaftar untuk ditambahkan sebagai admin.
          </p>
          <button
            onClick={keluar}
            className="mt-5 inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Kembali ke login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav onKeluar={keluar} />

      <main className="w-full px-4 py-8 md:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--emas-tua)]">
            Dashboard admin
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground md:text-3xl">
            Ringkasan pendaftaran magang
          </h1>
        </div>

        {errorRingkasan && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorRingkasan}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KartuRingkasan label="Menunggu" nilai={ringkasan?.menunggu} />
          <KartuRingkasan label="Diterima" nilai={ringkasan?.diverifikasi} />
          <KartuRingkasan label="Ditolak" nilai={ringkasan?.ditolak} />
          <KartuRingkasan label="Total pendaftar" nilai={ringkasan?.total} tebal />
        </div>
      </main>
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
      className={`rounded-xl border bg-card p-5 shadow-soft ${
        tebal ? "border-accent" : "border-border"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--emas-tua)]">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold text-primary">
        {nilai ?? "–"}
      </p>
    </div>
  );
}
