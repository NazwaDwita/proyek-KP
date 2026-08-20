"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminAkses } from "@/lib/useAdminAkses";
import AdminNav from "@/components/admin/AdminNav";

type StatusPendaftaran = "menunggu" | "diverifikasi" | "ditolak";

type BarisRekap = {
  nomor_pendaftaran: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  asal_institusi: string;
  jenis_institusi: string;
  jurusan_prodi: string | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: StatusPendaftaran;
  dibuat_pada: string;
  bidang: { nama: string } | null;
};

const LABEL_STATUS: Record<StatusPendaftaran, string> = {
  menunggu: "Menunggu",
  diverifikasi: "Diterima",
  ditolak: "Ditolak",
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Bikin 1 sel CSV aman -- bungkus tanda kutip kalau isinya ada koma,
// tanda kutip, atau baris baru, sesuai standar format CSV (RFC 4180).
function selCsv(nilai: string) {
  if (/[",\n]/.test(nilai)) {
    return `"${nilai.replace(/"/g, '""')}"`;
  }
  return nilai;
}

const HEADER_REKAP = [
  "Nomor Pendaftaran",
  "Nama Lengkap",
  "Email",
  "No HP",
  "Asal Institusi",
  "Jenis Institusi",
  "Jurusan/Prodi",
  "Bidang Penempatan",
  "Periode Mulai",
  "Periode Selesai",
  "Status",
  "Tanggal Daftar",
];

// Dipakai bareng oleh unduhCsv() dan unduhExcel() supaya susunan
// kolomnya selalu konsisten di kedua format -- kalau nanti ada kolom
// baru, cukup ubah di sini, bukan di dua tempat terpisah.
function barisRekapKeArray(daftar: BarisRekap[]): string[][] {
  return daftar.map((p) => [
    p.nomor_pendaftaran,
    p.nama_lengkap,
    p.email,
    p.no_hp,
    p.asal_institusi,
    p.jenis_institusi === "kampus" ? "Kampus" : "SMK",
    p.jurusan_prodi ?? "",
    p.bidang?.nama ?? "Belum ditentukan",
    formatTanggal(p.tanggal_mulai),
    formatTanggal(p.tanggal_selesai),
    LABEL_STATUS[p.status],
    formatTanggal(p.dibuat_pada),
  ]);
}

function namaFile(ekstensi: string) {
  const tanggalFile = new Date().toISOString().slice(0, 10);
  return `rekap-pendaftar-magang-${tanggalFile}.${ekstensi}`;
}

function unduhCsv(daftar: BarisRekap[]) {
  const baris = barisRekapKeArray(daftar).map((kolom) => kolom.map(selCsv).join(","));

  // \uFEFF (BOM) di depan supaya Excel otomatis kebaca UTF-8 dengan
  // benar (tanpa ini, karakter seperti "&ndash;" atau nama dengan
  // huruf non-ASCII bisa muncul rusak kalau dibuka di Excel Windows).
  const csv = "\uFEFF" + [HEADER_REKAP.join(","), ...baris].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFile("csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function unduhExcel(daftar: BarisRekap[]) {
  const data = [HEADER_REKAP, ...barisRekapKeArray(daftar)];
  const sheet = XLSX.utils.aoa_to_sheet(data);

  // Lebar kolom otomatis, biar nggak semua kepotong pas dibuka.
  sheet["!cols"] = HEADER_REKAP.map((h, i) => ({
    wch: Math.max(h.length, ...data.slice(1).map((baris) => (baris[i] ?? "").length)) + 2,
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Rekap Pendaftar");
  XLSX.writeFile(workbook, namaFile("xlsx"));
}

export default function AdminRekapPage() {
  const { memuat, ditolakAkses, keluar } = useAdminAkses();

  const [daftar, setDaftar] = useState<BarisRekap[]>([]);
  const [memuatData, setMemuatData] = useState(true);
  const [dropdownTerbuka, setDropdownTerbuka] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function tutupKalauKlikLuar(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownTerbuka(false);
      }
    }
    document.addEventListener("mousedown", tutupKalauKlikLuar);
    return () => document.removeEventListener("mousedown", tutupKalauKlikLuar);
  }, []);
  const [pesanError, setPesanError] = useState<string | null>(null);

  useEffect(() => {
    if (memuat || ditolakAkses) return;

    let masihTerpasang = true;

    async function muat() {
      const { data, error } = await supabase
        .from("pendaftar")
        .select(
          "nomor_pendaftaran, nama_lengkap, email, no_hp, asal_institusi, jenis_institusi, jurusan_prodi, tanggal_mulai, tanggal_selesai, status, dibuat_pada, bidang:bidang_id(nama)"
        )
        .order("dibuat_pada", { ascending: false });

      if (!masihTerpasang) return;

      if (error) {
        console.error("Gagal memuat data rekap:", error);
        setPesanError("Gagal memuat data. Coba muat ulang halaman.");
        setMemuatData(false);
        return;
      }

      setDaftar((data as unknown as BarisRekap[]) ?? []);
      setMemuatData(false);
    }

    muat();
    return () => {
      masihTerpasang = false;
    };
  }, [memuat, ditolakAkses]);

  const ringkasanStatus = useMemo(() => {
    const hitung = { menunggu: 0, diverifikasi: 0, ditolak: 0 };
    for (const p of daftar) hitung[p.status] += 1;
    return hitung;
  }, [daftar]);

  const ringkasanInstitusi = useMemo(() => {
    const hitung = { kampus: 0, smk: 0 };
    for (const p of daftar) {
      if (p.jenis_institusi === "kampus") hitung.kampus += 1;
      else hitung.smk += 1;
    }
    return hitung;
  }, [daftar]);

  const rekapBidang = useMemo(() => {
    const peta = new Map<string, { total: number; aktif: number }>();
    for (const p of daftar) {
      const nama = p.bidang?.nama ?? "Belum ditentukan";
      const entri = peta.get(nama) ?? { total: 0, aktif: 0 };
      entri.total += 1;
      if (p.status === "menunggu" || p.status === "diverifikasi") entri.aktif += 1;
      peta.set(nama, entri);
    }
    return Array.from(peta.entries())
      .map(([nama, v]) => ({ nama, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [daftar]);

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
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--emas-tua)]">
              Rekap data
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-foreground md:text-3xl">
              Rekap pendaftar magang
            </h1>
          </div>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownTerbuka((t) => !t)}
              disabled={memuatData || daftar.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Unduh
              <ChevronDown className="size-4" />
            </button>
            {dropdownTerbuka && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-10 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-soft">
                <button
                  type="button"
                  onClick={() => {
                    unduhCsv(daftar);
                    setDropdownTerbuka(false);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  CSV (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    unduhExcel(daftar);
                    setDropdownTerbuka(false);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  Excel (.xlsx)
                </button>
              </div>
            )}
          </div>
        </div>

        {pesanError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {pesanError}
          </div>
        )}
        {memuatData && <p className="text-sm text-muted-foreground">Memuat data...</p>}

        {!memuatData && !pesanError && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <KartuAngka label="Total pendaftar" nilai={daftar.length} tebal />
              <KartuAngka label="Menunggu" nilai={ringkasanStatus.menunggu} />
              <KartuAngka label="Diterima" nilai={ringkasanStatus.diverifikasi} />
              <KartuAngka label="Ditolak" nilai={ringkasanStatus.ditolak} />
              <KartuAngka label="Dari kampus" nilai={ringkasanInstitusi.kampus} />
              <KartuAngka label="Dari SMK" nilai={ringkasanInstitusi.smk} />
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft md:p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--emas-tua)]">
                Per bidang
              </p>
              <h2 className="mt-1 mb-4 font-display text-lg font-semibold text-foreground">
                Sebaran pendaftar per bidang
              </h2>

              {rekapBidang.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data pendaftar.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                          Bidang
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                          Total pendaftar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                          Sedang aktif
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rekapBidang.map((b) => (
                        <tr key={b.nama} className="transition-colors hover:bg-secondary/40">
                          <td className="px-4 py-3 text-foreground">{b.nama}</td>
                          <td className="px-4 py-3 text-foreground">{b.total}</td>
                          <td className="px-4 py-3 text-foreground">{b.aktif}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function KartuAngka({
  label,
  nilai,
  tebal,
}: {
  label: string;
  nilai: number;
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
      <p className="mt-1 font-display text-3xl font-semibold text-primary">{nilai}</p>
    </div>
  );
}
