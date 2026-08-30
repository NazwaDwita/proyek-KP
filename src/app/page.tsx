"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck,
  LayoutGrid,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import HeaderSticky from "@/components/HeaderSticky";
import Footer from "@/components/Footer";
import { useSesi } from "@/lib/useSesi";
import { supabase } from "@/lib/supabase";
import { periodeSudahSelesai } from "@/lib/periodeMagang";
import { KUOTA_PER_BIDANG, DESKRIPSI_BIDANG } from "@/lib/konstanta";
import { formatTanggal } from "@/lib/formatters";

type StatistikBidang = {
  bidang_nama: string;
  jumlah_aktif: number;
};

type PendaftaranSaya = {
  nomor_pendaftaran: string;
  status: "menunggu" | "diverifikasi" | "ditolak";
  catatan_admin: string | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  dibuat_pada: string;
  bidang: { nama: string } | null;
};

export default function Beranda() {
  const { sesi, memuat } = useSesi();

  if (memuat) {
    return (
      <div className="flex min-h-screen flex-col">
        <HeaderSticky />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSticky />
      <main className="flex-1">
        {sesi ? (
          <BerandaSudahLogin
            userId={sesi.user.id}
            nama={(sesi.user.user_metadata?.nama as string) || sesi.user.email || ""}
          />
        ) : (
          <BerandaBelumLogin />
        )}
      </main>
      <Footer />
    </div>
  );
}

const langkah = [
  { icon: ShieldCheck, judul: "Buat akun", teks: "Registrasi menggunakan email aktif." },
  {
    icon: CalendarClock,
    judul: "Ajukan periode",
    teks: "Lengkapi data diri dan pilih periode magang 2 sampai 4 bulan.",
  },
  {
    icon: ClipboardCheck,
    judul: "Diperiksa admin",
    teks: "Pengajuanmu masuk ke sistem admin. Staf Diskominfotik yang memeriksa dan menentukan pengajuan diterima atau ditolak.",
  },
  {
    icon: LayoutGrid,
    judul: "Penempatan bidang",
    teks: "Kalau diterima, bidang penempatan ditentukan oleh admin, bukan dipilih sendiri saat mendaftar.",
  },
];

function BerandaBelumLogin() {
  const [statistik, setStatistik] = useState<StatistikBidang[]>([]);
  const [memuatStatistik, setMemuatStatistik] = useState(true);

  useEffect(() => {
    let masihTerpasang = true;

    async function muatStatistik() {
      const { data, error } = await supabase.rpc("statistik_peserta_aktif");
      if (!masihTerpasang) return;
      if (error) {
        console.error("Gagal memuat statistik:", error);
      } else {
        setStatistik(data ?? []);
      }
      setMemuatStatistik(false);
    }

    muatStatistik();
    return () => {
      masihTerpasang = false;
    };
  }, []);

  const totalKuota = statistik.length > 0 ? statistik.length * KUOTA_PER_BIDANG : 5 * KUOTA_PER_BIDANG;
  const totalAktif = statistik.reduce((jumlah, item) => jumlah + item.jumlah_aktif, 0);
  const totalSisa = Math.max(totalKuota - totalAktif, 0);

  return (
    <>
      <section className="relative overflow-hidden">
        <img
          src="/assets/hero-kominfotik.jpg"
          alt="Kantor Diskominfotik Provinsi Riau"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center text-primary-foreground md:py-28">
          <p className="inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest">
            Diskominfotik Provinsi Riau
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl">
            Pendaftaran Magang &amp; PKL Dinas Kominfotik Provinsi Riau
          </h1>
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/85 md:text-lg">
            Terbuka untuk siswa dan mahasiswa dari mana saja. Ajukan periode magang, dan
            pantau status pendaftaranmu secara online.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold text-foreground">Alur pendaftaran</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {langkah.map((l, i) => (
            <div key={l.judul} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <l.icon className="size-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Langkah {i + 1}
              </p>
              <h3 className="mt-1 font-display text-base font-semibold text-foreground">
                {l.judul}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{l.teks}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ketersediaan-slot" className="border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Kapasitas &amp; Peserta Magang Aktif Hari Ini
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Data real-time peserta magang yang sedang bertugas hari ini di Diskominfotik Riau.
            </p>
          </div>

          <div className="mt-8">
            {memuatStatistik ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-card" />
                ))}
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total peserta magang yang sedang aktif bertugas hari ini
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {totalAktif}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        dari {totalKuota} total kapasitas
                      </span>
                    </p>
                  </div>
                  <span className="ml-auto rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-foreground/90" style={{ color: "var(--emas-tua)" }}>
                    {totalSisa} slot tersedia hari ini
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {statistik.map((item) => {
                    const sisa = Math.max(KUOTA_PER_BIDANG - item.jumlah_aktif, 0);
                    const persen = Math.min((item.jumlah_aktif / KUOTA_PER_BIDANG) * 100, 100);
                    const penuh = sisa <= 0;
                    return (
                      <div
                        key={item.bidang_nama}
                        className="rounded-xl border border-border bg-card p-5 shadow-soft"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            {item.bidang_nama}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                              penuh
                                ? "bg-red-100 text-red-700"
                                : "border border-border text-muted-foreground"
                            }`}
                          >
                            {penuh ? "Penuh" : `${sisa} slot`}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {DESKRIPSI_BIDANG[item.bidang_nama] ?? "Penempatan magang pada bidang ini."}
                        </p>
                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${penuh ? "bg-red-500" : "bg-primary"}`}
                            style={{ width: `${persen}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {item.jumlah_aktif} / {KUOTA_PER_BIDANG} peserta aktif
                        </p>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs text-muted-foreground italic">
                  * Catatan: Data ketersediaan di atas mencerminkan peserta yang sedang bertugas hari ini. Kepastian ketersediaan slot untuk periode bulan mendatang akan diverifikasi oleh Staf Diskominfotik Riau saat berkas diproses.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function BerandaSudahLogin({ userId, nama }: { userId: string; nama: string }) {
  const [daftarPendaftaran, setDaftarPendaftaran] = useState<PendaftaranSaya[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [pesanError, setPesanError] = useState<string | null>(null);

  useEffect(() => {
    let masihTerpasang = true;

    async function muatPendaftaranSaya() {
      const { data, error } = await supabase
        .from("pendaftar")
        .select(
          "nomor_pendaftaran, status, catatan_admin, tanggal_mulai, tanggal_selesai, dibuat_pada, bidang:bidang_id(nama)"
        )
        .eq("user_id", userId)
        .order("dibuat_pada", { ascending: false });

      if (!masihTerpasang) return;

      if (error) {
        console.error("Gagal memuat pendaftaran:", error);
        setPesanError("Gagal memuat data pendaftaran. Coba muat ulang halaman.");
      } else {
        setDaftarPendaftaran((data as unknown as PendaftaranSaya[]) ?? []);
      }
      setMemuat(false);
    }

    muatPendaftaranSaya();

    return () => {
      masihTerpasang = false;
    };
  }, [userId]);

  return (
    <>
      {/* Hero peserta */}
      <section className="relative overflow-hidden bg-hero-gradient bg-[#064E3B] py-16 text-primary-foreground md:py-24">
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
          <p className="inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary-foreground">
            Portal Peserta Magang &bull; Diskominfotik Riau
          </p>
          <h1 className="mt-6 font-display text-3xl font-semibold leading-tight text-primary-foreground md:text-5xl capitalize">
            Selamat Datang, {nama}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/85 md:text-lg">
            Pantau perkembangan status pengajuan magang dan kelengkapan dokumenmu secara langsung di portal ini.
          </p>
        </div>
      </section>

      {/* Daftar status pendaftaran */}
      <section className="border-b border-border bg-background py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
              Status Pendaftaran
            </h2>
            {daftarPendaftaran.length > 0 && (
              <span className="shrink-0 rounded-full bg-accent/15 px-3.5 py-1 text-xs font-semibold whitespace-nowrap text-amber-800 dark:text-amber-400">
                {daftarPendaftaran.length} Pengajuan
              </span>
            )}
          </div>

          <div className="mt-6 space-y-6">
            {memuat && (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Memuat data pendaftaran...
              </div>
            )}

            {pesanError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {pesanError}
              </div>
            )}

            {!memuat && !pesanError && daftarPendaftaran.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-base font-semibold text-foreground">
                  Kamu belum pernah mendaftar magang
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Silakan ajukan pendaftaran magang dengan mengisi formulir pendaftaran online.
                </p>
                <Link
                  href="/daftar"
                  className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Daftar magang sekarang
                </Link>
              </div>
            )}

            {!memuat &&
              daftarPendaftaran.map((p) => {
                const magangSelesai =
                  p.status === "diverifikasi" && periodeSudahSelesai(p.tanggal_selesai);

                const statusConfig = magangSelesai
                  ? { badge: "bg-sky-50 text-sky-700 border-sky-200", icon: CheckCircle2, text: "Selesai Magang" }
                  : p.status === "diverifikasi"
                  ? { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, text: "Diterima / Diverifikasi" }
                  : p.status === "menunggu"
                  ? { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, text: "Menunggu Verifikasi" }
                  : { badge: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle, text: "Ditolak" };

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={p.nomor_pendaftaran}
                    className="rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:border-border/80"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusConfig.badge}`}>
                        <StatusIcon className="size-3.5" />
                        {statusConfig.text}
                      </span>

                      <span className="text-xs font-mono font-medium text-muted-foreground">
                        No. Registrasi: <strong className="text-foreground">{p.nomor_pendaftaran}</strong>
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Bidang Penempatan
                        </p>
                        <p className="mt-1 font-display text-lg font-semibold text-foreground">
                          {p.bidang?.nama ?? "Belum Ditentukan (diisi saat verifikasi)"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span>Periode: <strong className="text-foreground font-medium">{formatTanggal(p.tanggal_mulai)} &ndash; {formatTanggal(p.tanggal_selesai)}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock className="size-4 text-muted-foreground" />
                          <span>Mendaftar: <strong className="text-foreground font-medium">{formatTanggal(p.dibuat_pada)}</strong></span>
                        </div>
                      </div>
                    </div>

                    {p.status === "ditolak" && p.catatan_admin && (
                      <div className="mt-4 rounded-lg border border-rose-200/80 bg-rose-50/50 p-3.5 text-sm text-rose-900">
                        <p className="font-semibold text-xs uppercase tracking-wider text-rose-700">Catatan dari Staf:</p>
                        <p className="mt-1 font-medium">{p.catatan_admin}</p>
                      </div>
                    )}

                    {p.status === "diverifikasi" && (
                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          Surat keterangan resmi dari Diskominfotik Riau sudah siap dicetak.
                        </p>
                        <Link
                          href={`/surat-keterangan/${p.nomor_pendaftaran}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                        >
                          <FileCheck className="size-4" />
                          {periodeSudahSelesai(p.tanggal_selesai)
                            ? "Cetak Surat Selesai Magang"
                            : "Cetak Surat Keterangan Diterima"}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </>
  );
}