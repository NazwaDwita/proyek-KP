"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { ChevronDown, Download, FileSpreadsheet, RotateCw, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminAkses } from "@/lib/useAdminAkses";
import AdminNav from "@/components/admin/AdminNav";
import { LABEL_STATUS } from "@/lib/konstanta";
import { formatTanggal, formatTanggalSingkat } from "@/lib/formatters";
import { periodeSudahSelesai } from "@/lib/periodeMagang";

type StatusPendaftaran = "menunggu" | "diverifikasi" | "ditolak";

type BarisRekap = {
  id: string;
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
  catatan_admin: string | null;
  dibuat_pada: string;
  bidang: { nama: string } | null;
};

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAFTAR_BIDANG_LENGKAP = [
  "Bidang Aplikasi & Informatika",
  "Bidang Infrastruktur Teknologi Informasi dan Komunikasi",
  "Bidang Informasi dan Komunikasi Publik",
  "Bidang Statistik",
  "Bidang Persandian",
];

function selCsv(nilai: string) {
  if (/[",\n]/.test(nilai)) {
    return `"${nilai.replace(/"/g, '""')}"`;
  }
  return nilai;
}

const HEADER_REKAP = [
  "No",
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
  "Status Pendaftaran",
  "Tanggal Pengajuan",
  "Catatan Admin",
];

function statusDeskripsi(p: BarisRekap) {
  if (p.status === "diverifikasi" && periodeSudahSelesai(p.tanggal_selesai)) {
    return "Selesai Magang";
  }
  return LABEL_STATUS[p.status] ?? p.status;
}

function namaFileExport(ekstensi: string, bulan: string, tahun: string) {
  const tgl = new Date().toISOString().slice(0, 10);
  const labelBulan = bulan !== "semua" ? NAMA_BULAN[parseInt(bulan, 10) - 1].toLowerCase() : "semua-bulan";
  const labelTahun = tahun !== "semua" ? tahun : "semua-tahun";
  return `rekap-pendaftar-magang-${labelBulan}-${labelTahun}-${tgl}.${ekstensi}`;
}

async function unduhExcelPro(daftar: BarisRekap[], labelPeriode: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Diskominfotik Provinsi Riau";
  workbook.created = new Date();

  // Sheet 1: detail pendaftar
  const sheetDetail = workbook.addWorksheet("Rekap Detail Pendaftar");

  sheetDetail.mergeCells("A1:N1");
  const cellJudul = sheetDetail.getCell("A1");
  cellJudul.value = "LAPORAN REKAPITULASI PENDAFTARAN MAGANG DISKOMINFOTIK RIAU";
  cellJudul.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  cellJudul.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF064E3B" } };
  cellJudul.alignment = { vertical: "middle", horizontal: "center" };
  sheetDetail.getRow(1).height = 35;

  sheetDetail.mergeCells("A2:N2");
  const cellSub = sheetDetail.getCell("A2");
  cellSub.value = `Periode: ${labelPeriode} | Dicetak: ${formatTanggal(new Date().toISOString())}`;
  cellSub.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF374151" } };
  cellSub.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } };
  cellSub.alignment = { vertical: "middle", horizontal: "center" };
  sheetDetail.getRow(2).height = 24;

  sheetDetail.addRow([]);

  const headerRow = sheetDetail.addRow(HEADER_REKAP);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF047857" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF064E3B" } },
      left: { style: "thin", color: { argb: "FF064E3B" } },
      bottom: { style: "medium", color: { argb: "FF064E3B" } },
      right: { style: "thin", color: { argb: "FF064E3B" } },
    };
  });

  daftar.forEach((p, idx) => {
    const rowValues = [
      idx + 1,
      p.nomor_pendaftaran,
      p.nama_lengkap,
      p.email,
      p.no_hp,
      p.asal_institusi,
      p.jenis_institusi === "kampus" ? "Kampus" : "SMK",
      p.jurusan_prodi ?? "-",
      p.bidang?.nama ?? "Belum Ditentukan",
      formatTanggal(p.tanggal_mulai),
      formatTanggal(p.tanggal_selesai),
      statusDeskripsi(p),
      formatTanggal(p.dibuat_pada),
      p.catatan_admin ?? "-",
    ];

    const row = sheetDetail.addRow(rowValues);
    row.height = 22;

    const isZebra = idx % 2 === 1;
    row.eachCell((cell, colNum) => {
      cell.font = { name: "Arial", size: 9.5 };
      cell.alignment = { vertical: "middle", horizontal: colNum === 1 || colNum === 2 || colNum === 12 ? "center" : "left" };
      if (isZebra) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  });

  sheetDetail.columns.forEach((column) => {
    let maxLen = 12;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const valStr = cell.value ? String(cell.value) : "";
      if (valStr.length > maxLen) {
        maxLen = Math.min(valStr.length, 40);
      }
    });
    column.width = maxLen + 3;
  });

  // Sheet 2: ringkasan status & bidang
  const sheetStat = workbook.addWorksheet("Ringkasan Data");
  sheetStat.addRow(["RINGKASAN REKAPITULASI MAGANG"]);
  sheetStat.getCell("A1").font = { name: "Arial", size: 12, bold: true, color: { argb: "FF064E3B" } };
  sheetStat.addRow([`Periode: ${labelPeriode}`]);
  sheetStat.addRow([]);

  sheetStat.addRow(["Indikator Status", "Jumlah Pendaftar", "Persentase"]);
  sheetStat.getRow(4).font = { bold: true };

  const total = daftar.length;
  const jmlDiterima = daftar.filter((p) => p.status === "diverifikasi" && !periodeSudahSelesai(p.tanggal_selesai)).length;
  const jmlSelesai = daftar.filter((p) => p.status === "diverifikasi" && periodeSudahSelesai(p.tanggal_selesai)).length;
  const jmlMenunggu = daftar.filter((p) => p.status === "menunggu").length;
  const jmlDitolak = daftar.filter((p) => p.status === "ditolak").length;

  const hitungPersen = (val: number) => (total > 0 ? `${((val / total) * 100).toFixed(1)}%` : "0%");

  sheetStat.addRow(["Diterima (Aktif)", jmlDiterima, hitungPersen(jmlDiterima)]);
  sheetStat.addRow(["Selesai Magang", jmlSelesai, hitungPersen(jmlSelesai)]);
  sheetStat.addRow(["Menunggu Verifikasi", jmlMenunggu, hitungPersen(jmlMenunggu)]);
  sheetStat.addRow(["Ditolak", jmlDitolak, hitungPersen(jmlDitolak)]);
  sheetStat.addRow(["TOTAL PENDAFTARAN", total, "100%"]);
  sheetStat.getRow(9).font = { bold: true };

  sheetStat.addRow([]);
  sheetStat.addRow(["PENEMPATAN PER BIDANG"]);
  sheetStat.getCell("A11").font = { name: "Arial", size: 11, bold: true, color: { argb: "FF064E3B" } };
  sheetStat.addRow(["Nama Bidang", "Jumlah Pendaftar", "Persentase"]);
  sheetStat.getRow(12).font = { bold: true };

  DAFTAR_BIDANG_LENGKAP.forEach((bNama) => {
    const count = daftar.filter((p) => p.bidang?.nama === bNama).length;
    sheetStat.addRow([bNama, count, hitungPersen(count)]);
  });

  sheetStat.columns.forEach((col) => {
    col.width = 35;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFileExport("xlsx", "semua", "semua");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function unduhCsvPro(daftar: BarisRekap[]) {
  const baris = daftar.map((p, idx) =>
    [
      idx + 1,
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
      statusDeskripsi(p),
      formatTanggal(p.dibuat_pada),
      p.catatan_admin ?? "",
    ]
      .map((k) => selCsv(String(k)))
      .join(",")
  );

  const csv = "\uFEFF" + [HEADER_REKAP.join(","), ...baris].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFileExport("csv", "semua", "semua");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminRekapPage() {
  const { memuat, ditolakAkses, keluar } = useAdminAkses();

  const [daftar, setDaftar] = useState<BarisRekap[]>([]);
  const [memuatData, setMemuatData] = useState(true);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // Filter
  const [bulanPilihan, setBulanPilihan] = useState<string>("semua");
  const [tahunPilihan, setTahunPilihan] = useState<string>("semua");
  const [statusPilihan, setStatusPilihan] = useState<string>("semua");
  const [kataKunci, setKataKunci] = useState<string>("");

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

  async function muatDataManual() {
    setMemuatData(true);
    setPesanError(null);

    const { data, error } = await supabase
      .from("pendaftar")
      .select(
        "id, nomor_pendaftaran, nama_lengkap, email, no_hp, asal_institusi, jenis_institusi, jurusan_prodi, tanggal_mulai, tanggal_selesai, status, catatan_admin, dibuat_pada, bidang:bidang_id(nama)"
      )
      .order("dibuat_pada", { ascending: false });

    if (error) {
      console.error("Gagal memuat rekap pendaftar:", error);
      setPesanError("Gagal mengambil data rekap pendaftar.");
    } else {
      setDaftar((data as unknown as BarisRekap[]) ?? []);
    }

    setMemuatData(false);
  }

  useEffect(() => {
    if (memuat || ditolakAkses) return;

    let masihTerpasang = true;
    async function muat() {
      const { data, error } = await supabase
        .from("pendaftar")
        .select(
          "id, nomor_pendaftaran, nama_lengkap, email, no_hp, asal_institusi, jenis_institusi, jurusan_prodi, tanggal_mulai, tanggal_selesai, status, catatan_admin, dibuat_pada, bidang:bidang_id(nama)"
        )
        .order("dibuat_pada", { ascending: false });

      if (!masihTerpasang) return;

      if (error) {
        console.error("Gagal memuat rekap pendaftar:", error);
        setPesanError("Gagal mengambil data rekap pendaftar.");
      } else {
        setDaftar((data as unknown as BarisRekap[]) ?? []);
      }

      setMemuatData(false);
    }

    muat();
    return () => {
      masihTerpasang = false;
    };
  }, [memuat, ditolakAkses]);

  const daftarTahun = useMemo(() => {
    const setThn = new Set<string>();
    daftar.forEach((p) => {
      if (p.dibuat_pada) {
        const thn = new Date(p.dibuat_pada).getFullYear().toString();
        setThn.add(thn);
      }
    });
    const arr = Array.from(setThn).sort().reverse();
    if (!arr.includes(new Date().getFullYear().toString())) {
      arr.unshift(new Date().getFullYear().toString());
    }
    return arr;
  }, [daftar]);

  const daftarTerfilter = useMemo(() => {
    return daftar.filter((p) => {
      const tgl = new Date(p.dibuat_pada);
      const bln = (tgl.getMonth() + 1).toString();
      const thn = tgl.getFullYear().toString();

      if (bulanPilihan !== "semua" && bln !== bulanPilihan) return false;
      if (tahunPilihan !== "semua" && thn !== tahunPilihan) return false;

      const isSelesai = p.status === "diverifikasi" && periodeSudahSelesai(p.tanggal_selesai);
      if (statusPilihan === "diverifikasi" && isSelesai) return false;
      if (statusPilihan === "selesai" && !isSelesai) return false;
      if (statusPilihan !== "semua" && statusPilihan !== "selesai" && p.status !== statusPilihan) return false;

      if (kataKunci.trim()) {
        const q = kataKunci.toLowerCase();
        const namaMatch = p.nama_lengkap.toLowerCase().includes(q);
        const noMatch = p.nomor_pendaftaran.toLowerCase().includes(q);
        const instMatch = p.asal_institusi.toLowerCase().includes(q);
        const emailMatch = p.email.toLowerCase().includes(q);
        if (!namaMatch && !noMatch && !instMatch && !emailMatch) return false;
      }

      return true;
    });
  }, [daftar, bulanPilihan, tahunPilihan, statusPilihan, kataKunci]);

  const labelPeriodeAktif = useMemo(() => {
    if (bulanPilihan === "semua" && tahunPilihan === "semua") return "Semua Periode";
    if (bulanPilihan !== "semua" && tahunPilihan !== "semua") {
      return `${NAMA_BULAN[parseInt(bulanPilihan, 10) - 1]} ${tahunPilihan}`;
    }
    if (bulanPilihan !== "semua") return `Bulan ${NAMA_BULAN[parseInt(bulanPilihan, 10) - 1]}`;
    return `Tahun ${tahunPilihan}`;
  }, [bulanPilihan, tahunPilihan]);

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
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Akses Ditolak</p>
          <h1 className="mt-2 font-display text-xl font-semibold text-foreground">
            Akun ini tidak memiliki akses admin
          </h1>
          <button
            onClick={keluar}
            className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Keluar &amp; Login Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav onKeluar={keluar} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6">
        {/* Judul & tombol ekspor */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Rekapitulasi
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-foreground md:text-3xl">
              Rekapitulasi Pendaftar Magang
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Total {daftarTerfilter.length} data pendaftaran ({labelPeriodeAktif}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={muatDataManual}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              title="Muat Ulang Data"
            >
              <RotateCw className={`size-4 ${memuatData ? "animate-spin" : ""}`} />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownTerbuka((t) => !t)}
                disabled={daftarTerfilter.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Download className="size-4" />
                Ekspor Data
                <ChevronDown className="size-4" />
              </button>

              {dropdownTerbuka && (
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-border bg-card p-1 shadow-soft">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownTerbuka(false);
                      unduhExcelPro(daftarTerfilter, labelPeriodeAktif);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary text-left"
                  >
                    <FileSpreadsheet className="size-4 text-emerald-600" />
                    Ekspor Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownTerbuka(false);
                      unduhCsvPro(daftarTerfilter);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary text-left"
                  >
                    <Download className="size-4 text-muted-foreground" />
                    Ekspor CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {pesanError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {pesanError}
          </div>
        )}

        {/* Filter pencarian, bulan, tahun, status */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama, institusi, atau nomor pendaftaran..."
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <select
              value={bulanPilihan}
              onChange={(e) => setBulanPilihan(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="semua">Semua Bulan</option>
              {NAMA_BULAN.map((bln, idx) => (
                <option key={bln} value={(idx + 1).toString()}>
                  {bln}
                </option>
              ))}
            </select>


            <select
              value={tahunPilihan}
              onChange={(e) => setTahunPilihan(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="semua">Semua Tahun</option>
              {daftarTahun.map((thn) => (
                <option key={thn} value={thn}>
                  {thn}
                </option>
              ))}
            </select>


            <select
              value={statusPilihan}
              onChange={(e) => setStatusPilihan(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diverifikasi">Diterima (Aktif)</option>
              <option value="selesai">Selesai Magang</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </section>

        {/* Tabel rekap pendaftar */}
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <div className="overflow-auto max-h-[calc(100vh-140px)] min-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-primary text-primary-foreground font-semibold uppercase tracking-wider text-xs shadow-xs">
                <tr>
                  <th className="px-4 py-3.5">No Pendaftaran</th>
                  <th className="px-4 py-3.5">Nama Lengkap</th>
                  <th className="px-4 py-3.5">Institusi</th>
                  <th className="px-4 py-3.5">Prodi / Jurusan</th>
                  <th className="px-4 py-3.5">Bidang Penempatan</th>
                  <th className="px-4 py-3.5">Periode</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {memuatData ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="h-12 px-4 bg-muted/20" />
                    </tr>
                  ))
                ) : daftarTerfilter.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Tidak ada data pendaftaran yang cocok.
                    </td>
                  </tr>
                ) : (
                  daftarTerfilter.map((p) => {
                    const isSelesai = p.status === "diverifikasi" && periodeSudahSelesai(p.tanggal_selesai);
                    const badgeKelas = isSelesai
                      ? "bg-sky-100 text-sky-800 border-sky-200"
                      : p.status === "diverifikasi"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : p.status === "menunggu"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-rose-100 text-rose-800 border-rose-200";

                    return (
                      <tr key={p.id} className="transition-colors hover:bg-secondary/40">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {p.nomor_pendaftaran}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                          {p.nama_lengkap}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.asal_institusi}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.jurusan_prodi ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">
                          {p.bidang?.nama ?? "Belum ditentukan"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatTanggalSingkat(p.tanggal_mulai)} &ndash; {formatTanggalSingkat(p.tanggal_selesai)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeKelas}`}>
                            {statusDeskripsi(p)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatTanggalSingkat(p.dibuat_pada)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
