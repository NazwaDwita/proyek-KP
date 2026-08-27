"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import HeaderSticky from "@/components/HeaderSticky";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { KUOTA_PER_BIDANG } from "@/lib/konstanta";

type Baris = {
  bidang_nama: string;
  jumlah_aktif: number;
};

type StatBidang = {
  nama: string;
  aktif: number;
  kuota: number;
};

export default function StatistikPage() {
  const [data, setData] = useState<StatBidang[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let batal = false;

    async function muat() {
      const { data: rows, error } = await supabase.rpc("statistik_peserta_aktif");
      if (batal) return;

      if (error) {
        setError(error.message);
        return;
      }

      const hasil = (rows as Baris[] | null) ?? [];
      setData(
        hasil.map((r) => ({
          nama: r.bidang_nama,
          aktif: Number(r.jumlah_aktif ?? 0),
          kuota: KUOTA_PER_BIDANG,
        }))
      );
    }

    muat();
    return () => {
      batal = true;
    };
  }, []);

  const total = data?.reduce((acc, s) => acc + s.aktif, 0) ?? 0;
  const kuotaTotal = (data?.length ?? 0) * KUOTA_PER_BIDANG;

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSticky />

      <main className="flex-1">
        <section className="border-y border-border bg-hero-gradient text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <p className="inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-widest">
              Data per hari ini
            </p>
            <h1 className="mt-5 max-w-2xl font-display text-3xl font-semibold leading-tight md:text-4xl">
              Statistik Peserta Magang Aktif Hari Ini
            </h1>
            <p className="mt-3 max-w-xl text-primary-foreground/85">
              Jumlah peserta magang yang sedang aktif bertugas di setiap bidang Diskominfotik Provinsi
              Riau, dihitung otomatis dari tanggal periode magang yang berjalan hari ini.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-14">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Gagal memuat data statistik: {error}
            </div>
          )}

          {!data && !error && (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl border border-border bg-card" />
              ))}
            </div>
          )}

          {data && (
            <>
              <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Users className="size-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total peserta magang aktif bertugas hari ini</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {total}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      dari {kuotaTotal} total kapasitas
                    </span>
                  </p>
                </div>
                <span
                  className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
                    total >= kuotaTotal ? "bg-red-100 text-red-700" : "bg-accent/15"
                  }`}
                  style={total >= kuotaTotal ? undefined : { color: "var(--emas-tua)" }}
                >
                  {kuotaTotal - total} slot tersisa hari ini
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {data.map((s) => {
                  const sisa = s.kuota - s.aktif;
                  const persen = Math.min(100, (s.aktif / s.kuota) * 100);
                  const penuh = sisa <= 0;

                  return (
                    <div key={s.nama} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-base font-semibold leading-snug text-foreground">
                          {s.nama}
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

                      <div className="mt-4 space-y-1.5">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${
                              penuh ? "bg-red-500" : "bg-primary"
                            }`}
                            style={{ width: `${persen}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {s.aktif} / {s.kuota} peserta aktif
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-6 text-xs text-muted-foreground italic">
                * Catatan: Data ketersediaan di atas mencerminkan peserta yang sedang bertugas hari ini. Kepastian ketersediaan slot untuk periode bulan mendatang akan diverifikasi oleh Staf Diskominfotik Riau saat berkas diproses.
              </p>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
