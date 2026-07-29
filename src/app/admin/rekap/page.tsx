"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
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
    wch: Math.max(
      h.length,
      ...data.slice(1).map((baris) => (baris[i] ?? "").length)
    ) + 2,
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>
              Rekap data
            </p>
            <h1 className="judul-hero" style={{ fontSize: 22, maxWidth: "none" }}>
              Rekap pendaftar magang
            </h1>
          </div>
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              className="tombol"
              onClick={() => setDropdownTerbuka((t) => !t)}
              disabled={memuatData || daftar.length === 0}
            >
              Unduh &#9662;
            </button>
            {dropdownTerbuka && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "#fff",
                  border: "1px solid rgba(15, 42, 74, 0.12)",
                  borderRadius: 10,
                  boxShadow: "0 10px 30px rgba(15, 42, 74, 0.15)",
                  overflow: "hidden",
                  zIndex: 10,
                  minWidth: 180,
                }}
              >
                <button
                  type="button"
                  className="tombol-dropdown-item"
                  onClick={() => {
                    unduhCsv(daftar);
                    setDropdownTerbuka(false);
                  }}
                >
                  CSV (.csv)
                </button>
                <button
                  type="button"
                  className="tombol-dropdown-item"
                  onClick={() => {
                    unduhExcel(daftar);
                    setDropdownTerbuka(false);
                  }}
                >
                  Excel (.xlsx)
                </button>
              </div>
            )}
          </div>
        </div>

        {pesanError && (
          <div className="form-pesan-gagal" style={{ marginBottom: "1.25rem" }}>
            {pesanError}
          </div>
        )}
        {memuatData && <p className="sub-hero">Memuat data...</p>}

        {!memuatData && !pesanError && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                marginBottom: "1.75rem",
              }}
            >
              <KartuAngka label="Total pendaftar" nilai={daftar.length} tebal />
              <KartuAngka label="Menunggu" nilai={ringkasanStatus.menunggu} />
              <KartuAngka label="Diterima" nilai={ringkasanStatus.diverifikasi} />
              <KartuAngka label="Ditolak" nilai={ringkasanStatus.ditolak} />
              <KartuAngka label="Dari kampus" nilai={ringkasanInstitusi.kampus} />
              <KartuAngka label="Dari SMK" nilai={ringkasanInstitusi.smk} />
            </div>

            <div className="panel-glass">
              <p className="eyebrow" style={{ margin: 0 }}>
                Per bidang
              </p>
              <h2
                className="judul-hero"
                style={{ fontSize: 18, maxWidth: "none", marginBottom: "1rem" }}
              >
                Sebaran pendaftar per bidang
              </h2>

              {rekapBidang.length === 0 ? (
                <p className="info-teks">Belum ada data pendaftar.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="tabel-admin">
                    <thead>
                      <tr>
                        <th>Bidang</th>
                        <th>Total pendaftar</th>
                        <th>Sedang aktif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rekapBidang.map((b) => (
                        <tr key={b.nama}>
                          <td>{b.nama}</td>
                          <td>{b.total}</td>
                          <td>{b.aktif}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
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
        {nilai}
      </p>
    </div>
  );
}