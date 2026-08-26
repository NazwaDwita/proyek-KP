"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Pencil,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminAkses } from "@/lib/useAdminAkses";
import AdminNav from "@/components/admin/AdminNav";

type Ringkasan = {
  menunggu: number;
  diverifikasi: number;
  ditolak: number;
  total: number;
};

type PendaftarTerbaru = {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  asal_institusi: string;
  status: "menunggu" | "diverifikasi" | "ditolak";
  dibuat_pada: string;
  bidang: { nama: string } | null;
};

type StatistikBidang = {
  bidang_id: string;
  bidang_nama: string;
  jumlah_aktif: number;
};

const KUOTA_PER_BIDANG = 10;

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminBerandaPage() {
  const { memuat, ditolakAkses, keluar } = useAdminAkses();
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null);
  const [pendaftarTerbaru, setPendaftarTerbaru] = useState<PendaftarTerbaru[]>([]);
  const [statistikBidang, setStatistikBidang] = useState<StatistikBidang[]>([]);
  const [errorRingkasan, setErrorRingkasan] = useState<string | null>(null);
  const [memuatData, setMemuatData] = useState(true);

  useEffect(() => {
    if (memuat || ditolakAkses) return;

    let masihTerpasang = true;

    async function muatSemuaData() {
      setMemuatData(true);

      // 1. Fetch Ringkasan Status
      const { data: dataRingkasan, error: errRingkasan } = await supabase
        .from("pendaftar")
        .select("status");

      // 2. Fetch Pendaftar Terbaru (5 Terakhir)
      const { data: dataTerbaru, error: errTerbaru } = await supabase
        .from("pendaftar")
        .select("id, nomor_pendaftaran, nama_lengkap, asal_institusi, status, dibuat_pada, bidang:bidang_id(nama)")
        .order("dibuat_pada", { ascending: false })
        .limit(5);

      // 3. Fetch Kuota Bidang via RPC
      const { data: dataStatistik, error: errStatistik } = await supabase.rpc("statistik_peserta_aktif");

      if (!masihTerpasang) return;

      if (errRingkasan) {
        console.error("Gagal memuat ringkasan pendaftar:", errRingkasan);
        setErrorRingkasan("Gagal memuat ringkasan data. Coba muat ulang halaman.");
      } else {
        const hitung = { menunggu: 0, diverifikasi: 0, ditolak: 0, total: 0 };
        for (const baris of dataRingkasan ?? []) {
          hitung.total += 1;
          if (baris.status === "menunggu") hitung.menunggu += 1;
          else if (baris.status === "diverifikasi") hitung.diverifikasi += 1;
          else if (baris.status === "ditolak") hitung.ditolak += 1;
        }
        setRingkasan(hitung);
      }

      if (!errTerbaru) {
        setPendaftarTerbaru((dataTerbaru as unknown as PendaftarTerbaru[]) ?? []);
      }

      if (!errStatistik) {
        setStatistikBidang(dataStatistik ?? []);
      }

      setMemuatData(false);
    }

    muatSemuaData();

    return () => {
      masihTerpasang = false;
    };
  }, [memuat, ditolakAkses]);

  if (memuat) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Memeriksa akses admin...</p>
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

      <main className="w-full px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-8">
        {/* Banner Hero Pengelolaan Admin */}
        <section className="relative overflow-hidden rounded-2xl bg-hero-gradient bg-[#064E3B] p-8 md:p-12 text-primary-foreground shadow-md text-center">
          <div className="relative z-10 flex flex-col items-center mx-auto max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              <ShieldCheck className="size-3.5 text-accent" />
              Panel Admin SIMAKRI
            </span>
            <h1 className="font-display text-2xl font-bold md:text-4xl text-primary-foreground">
              Pengelolaan Pendaftaran Magang
            </h1>
            <p className="text-sm md:text-base text-primary-foreground/85 max-w-xl">
              Diskominfotik Provinsi Riau &bull; Pantau statistik pengajuan, verifikasi pendaftar, dan kelola dokumen jawaban secara terpusat.
            </p>
          </div>
        </section>

        {errorRingkasan && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorRingkasan}
          </div>
        )}

        {/* 4 Cards Key Performance Indicators (KPI) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-soft transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Menunggu Verifikasi
              </p>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock className="size-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-amber-900">
              {memuatData ? "–" : ringkasan?.menunggu ?? 0}
            </p>
            <p className="mt-1 text-xs text-amber-700 font-medium">
              Membutuhkan tindakan verifikasi staf
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-soft transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Diterima / Diverifikasi
              </p>
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-emerald-900">
              {memuatData ? "–" : ringkasan?.diverifikasi ?? 0}
            </p>
            <p className="mt-1 text-xs text-emerald-700 font-medium">
              Peserta aktif & telah diverifikasi
            </p>
          </div>

          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-5 shadow-soft transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Pengajuan Ditolak
              </p>
              <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <XCircle className="size-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-rose-900">
              {memuatData ? "–" : ringkasan?.ditolak ?? 0}
            </p>
            <p className="mt-1 text-xs text-rose-700 font-medium">
              Pengajuan yang tidak memenuhi kriteria
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Pendaftar
              </p>
              <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Users className="size-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-foreground">
              {memuatData ? "–" : ringkasan?.total ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-medium">
              Total pendaftaran masuk di portal
            </p>
          </div>
        </section>

        {/* Section Fitur & Akses Cepat + Pendaftar Terbaru (Grid 2 Kolom) */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column (2/3): Pendaftar Terbaru */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Pengajuan Pendaftar Terbaru
                </h2>
                <p className="text-xs text-muted-foreground">
                  5 pendaftaran magang terakhir yang masuk ke portal
                </p>
              </div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Lihat semua
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {memuatData ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />
                ))}
              </div>
            ) : pendaftarTerbaru.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Belum ada data pendaftaran terbaru.
              </div>
            ) : (
              <div className="space-y-3">
                {pendaftarTerbaru.map((p) => {
                  const badgeKelas =
                    p.status === "diverifikasi"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : p.status === "menunggu"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-rose-100 text-rose-800 border-rose-200";

                  const labelStatus =
                    p.status === "diverifikasi"
                      ? "Diterima"
                      : p.status === "menunggu"
                      ? "Menunggu"
                      : "Ditolak";

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-muted-foreground/30"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeKelas}`}>
                            {labelStatus}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {p.nomor_pendaftaran}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-foreground">
                          {p.nama_lengkap}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {p.asal_institusi} &bull; <span className="text-foreground font-medium">{p.bidang?.nama ?? "Belum ditentukan"}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                        <span className="text-xs text-muted-foreground">
                          {formatTanggal(p.dibuat_pada)}
                        </span>
                        <Link
                          href="/admin/dashboard"
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          Kelola
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Column (1/3): Quick Links & Slot Monitor */}
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Navigasi Cepat Admin
              </h2>
              <p className="text-xs text-muted-foreground">
                Fitur pengelolaan utama Diskominfotik Riau
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/admin/dashboard"
                className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Verifikasi Pendaftar
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Verifikasi status, tentukan bidang, dan kirim catatan admin.
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/rekap"
                className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Rekap & Ekspor Data
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Lihat rekapitulasi lengkap pendaftar dan ekspor file CSV.
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/info"
                className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Pencil className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Edit Info & Ketentuan
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Perbarui pengumuman, panduan, dan kontak dinas.
                  </p>
                </div>
              </Link>
            </div>

            {/* Monitoring Slot Kuota Magang */}
            {statistikBidang.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Monitor Slot Per Bidang
                  </h3>
                  <span className="text-xs text-muted-foreground">Maks 10/bidang</span>
                </div>

                <div className="space-y-3">
                  {statistikBidang.map((b) => {
                    const sisa = Math.max(KUOTA_PER_BIDANG - b.jumlah_aktif, 0);
                    const persen = Math.min((b.jumlah_aktif / KUOTA_PER_BIDANG) * 100, 100);
                    return (
                      <div key={b.bidang_id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground truncate max-w-[180px]">
                            {b.bidang_nama.replace("Bidang ", "")}
                          </span>
                          <span className="font-semibold text-muted-foreground shrink-0">
                            {b.jumlah_aktif}/10
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${sisa <= 0 ? "bg-red-500" : "bg-primary"}`}
                            style={{ width: `${persen}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
