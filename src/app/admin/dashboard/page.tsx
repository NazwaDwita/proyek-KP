"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Filter, RotateCw, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminAkses } from "@/lib/useAdminAkses";
import { periodeSudahSelesai } from "@/lib/periodeMagang";
import AdminNav from "@/components/admin/AdminNav";
import { LABEL_STATUS } from "@/lib/konstanta";
import { formatTanggalSingkat as formatTanggal } from "@/lib/formatters";

type StatusPendaftaran = "menunggu" | "diverifikasi" | "ditolak";

type Bidang = { id: string; nama: string };

type Dokumen = {
  id: string;
  jenis_dokumen: string;
  path_file: string;
  nama_file_asli: string | null;
};

type Riwayat = {
  id: string;
  status_lama: StatusPendaftaran | null;
  status_baru: StatusPendaftaran;
  diubah_pada: string;
};

type Pendaftar = {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  asal_institusi: string;
  jenis_institusi: string;
  jurusan_prodi: string | null;
  bidang_id: string | null;
  bidang: { nama: string } | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: StatusPendaftaran;
  catatan_admin: string | null;
  dibuat_pada: string;
};

const BADGE_STATUS: Record<StatusPendaftaran, string> = {
  menunggu: "bg-amber-100 text-amber-800 border border-amber-200",
  diverifikasi: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  ditolak: "bg-rose-100 text-rose-800 border border-rose-200",
};

export default function AdminDashboardPage() {
  const { memuat, ditolakAkses, keluar } = useAdminAkses();

  const [daftar, setDaftar] = useState<Pendaftar[]>([]);
  const [daftarBidang, setDaftarBidang] = useState<Bidang[]>([]);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<"semua" | StatusPendaftaran | "selesai">(
    "semua"
  );
  const [pencarian, setPencarian] = useState("");

  const [dipilih, setDipilih] = useState<Pendaftar | null>(null);
  const [terakhirDiperbarui, setTerakhirDiperbarui] = useState<Date | null>(null);

  async function muatUlangData() {
    setErrorMuat(null);
    const { data, error } = await supabase
      .from("pendaftar")
      .select(
        "id, nomor_pendaftaran, nama_lengkap, email, no_hp, asal_institusi, jenis_institusi, jurusan_prodi, bidang_id, tanggal_mulai, tanggal_selesai, status, catatan_admin, dibuat_pada, bidang(nama)"
      )
      .order("dibuat_pada", { ascending: false });

    if (error) {
      console.error("Gagal memuat data pendaftar:", error);
      setErrorMuat("Gagal memuat data. Coba muat ulang halaman.");
      return;
    }
    setDaftar((data as unknown as Pendaftar[]) ?? []);
    setTerakhirDiperbarui(new Date());
  }

  useEffect(() => {
    if (memuat || ditolakAkses) return;

    let masihTerpasang = true;

    async function muatDataAwal() {
      const { data: bidangData } = await supabase
        .from("bidang")
        .select("id, nama")
        .eq("aktif", true)
        .order("nama");

      if (!masihTerpasang) return;
      setDaftarBidang(bidangData ?? []);

      await muatUlangData();
    }

    muatDataAwal();
    return () => {
      masihTerpasang = false;
    };
  }, [memuat, ditolakAkses]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !ditolakAkses && !memuat) {
        muatUlangData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [ditolakAkses, memuat]);

  const daftarTersaring = useMemo(() => {
    return daftar.filter((p) => {
      if (filterStatus === "selesai") {
        if (!(p.status === "diverifikasi" && periodeSudahSelesai(p.tanggal_selesai))) {
          return false;
        }
      } else if (filterStatus !== "semua" && p.status !== filterStatus) {
        return false;
      }
      if (pencarian.trim()) {
        const q = pencarian.trim().toLowerCase();
        return (
          p.nama_lengkap.toLowerCase().includes(q) ||
          p.nomor_pendaftaran.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [daftar, filterStatus, pencarian]);

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

      <main className="w-full px-4 py-8 md:px-8 space-y-6">
        {/* Judul halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Data Pendaftar Magang
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifikasi status, tentukan bidang penempatan, dan kelola pendaftaran magang Diskominfotik Riau.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {terakhirDiperbarui && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground font-mono">
                <RotateCw className="size-3.5 animate-spin text-primary" style={{ animationDuration: '6s' }} />
                <span>Diperbarui {terakhirDiperbarui.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
              </span>
            )}
          </div>
        </div>

        {errorMuat && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMuat}
          </div>
        )}

        {/* Filter & pencarian (sticky) */}
        <div className="sticky top-[61px] z-30 bg-background/95 backdrop-blur pb-2 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Cari nama, nomor pendaftaran, atau instansi..."
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-9 pr-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <Filter className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="rounded-lg border border-border bg-card pl-8 pr-8 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs font-medium cursor-pointer"
                >
                  <option value="semua">Semua Status</option>
                  <option value="menunggu">Menunggu</option>
                  <option value="diverifikasi">Diterima</option>
                  <option value="selesai">Sudah Selesai</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel data pendaftar */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <div className="overflow-auto max-h-[calc(100vh-175px)] min-h-[500px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-20 bg-primary text-primary-foreground border-b border-border shadow-xs">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Nomor Pendaftaran
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Nama &amp; Instansi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Bidang
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {daftarTersaring.map((p) => {
                  const isSelesai = p.status === "diverifikasi" && periodeSudahSelesai(p.tanggal_selesai);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-4 py-2.5 font-mono text-xs font-medium text-foreground">
                        {p.nomor_pendaftaran}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-semibold text-foreground">{p.nama_lengkap}</p>
                        <p className="text-xs text-muted-foreground">{p.asal_institusi}</p>
                      </td>
                      <td className="px-4 py-2.5 text-foreground font-medium">
                        {p.bidang?.nama ?? <span className="text-muted-foreground italic">Belum ditentukan</span>}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-foreground">
                        {formatTanggal(p.tanggal_mulai)} &ndash; {formatTanggal(p.tanggal_selesai)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isSelesai
                                ? "bg-sky-100 text-sky-800 border border-sky-200"
                                : BADGE_STATUS[p.status]
                            }`}
                          >
                            {isSelesai ? "Selesai" : LABEL_STATUS[p.status]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => setDipilih(p)}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary"
                        >
                          <Eye className="size-3.5 text-primary" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {daftarTersaring.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Tidak ada data pendaftar yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {dipilih && (
        <ModalDetail
          pendaftar={dipilih}
          daftarBidang={daftarBidang}
          onTutup={() => setDipilih(null)}
          onSelesai={async () => {
            setDipilih(null);
            await muatUlangData();
          }}
        />
      )}
    </div>
  );
}

function ModalDetail({
  pendaftar,
  daftarBidang,
  onTutup,
  onSelesai,
}: {
  pendaftar: Pendaftar;
  daftarBidang: Bidang[];
  onTutup: () => void;
  onSelesai: () => void;
}) {
  const [catatan, setCatatan] = useState(pendaftar.catatan_admin ?? "");
  const [bidangId, setBidangId] = useState(pendaftar.bidang_id);
  const [tanggalMulai, setTanggalMulai] = useState(pendaftar.tanggal_mulai);
  const [tanggalSelesai, setTanggalSelesai] = useState(pendaftar.tanggal_selesai);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [linkDokumen, setLinkDokumen] = useState<Record<string, string>>({});
  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const [kuotaBidang, setKuotaBidang] = useState<
    { bidang_id: string; kuota: number; terisi: number }[]
  >([]);

  const periodeBerubah =
    tanggalMulai !== pendaftar.tanggal_mulai || tanggalSelesai !== pendaftar.tanggal_selesai;

  useEffect(() => {
    async function muatDokumen() {
      const { data } = await supabase
        .from("dokumen_pendaftar")
        .select("id, jenis_dokumen, path_file, nama_file_asli")
        .eq("pendaftar_id", pendaftar.id);

      const daftarDokumen = data ?? [];
      setDokumen(daftarDokumen);

      const link: Record<string, string> = {};
      for (const d of daftarDokumen) {
        const { data: signedUrl } = await supabase.storage
          .from("dokumen-magang")
          .createSignedUrl(d.path_file, 300);
        if (signedUrl) link[d.id] = signedUrl.signedUrl;
      }
      setLinkDokumen(link);
    }
    muatDokumen();
  }, [pendaftar.id]);

  useEffect(() => {
    async function muatRiwayat() {
      const { data, error } = await supabase
        .from("riwayat_status_pendaftar")
        .select("id, status_lama, status_baru, diubah_pada")
        .eq("pendaftar_id", pendaftar.id)
        .order("diubah_pada", { ascending: false });

      if (error) {
        console.error("Gagal memuat riwayat status:", error);
        return;
      }
      setRiwayat(data ?? []);
    }
    muatRiwayat();
  }, [pendaftar.id]);

  useEffect(() => {
    // Muat ulang kuota saat periode berubah (real-time)
    if (!tanggalMulai || !tanggalSelesai || tanggalSelesai < tanggalMulai) return;

    async function muatKuota() {
      const { data, error } = await supabase.rpc("kuota_bidang_untuk_periode", {
        p_tanggal_mulai: tanggalMulai,
        p_tanggal_selesai: tanggalSelesai,
        p_exclude_id: pendaftar.id,
      });
      if (error) {
        console.error("Gagal memuat kuota bidang:", error);
        return;
      }
      setKuotaBidang(
        (data ?? []).map((b: { bidang_id: string; kuota: number; terisi: number }) => ({
          bidang_id: b.bidang_id,
          kuota: b.kuota,
          terisi: b.terisi,
        }))
      );
    }
    muatKuota();
  }, [pendaftar.id, tanggalMulai, tanggalSelesai]);

  // statusBaru diisi kalau ini aksi Terima/Tolak.
  // Kalau kosong, hanya simpan perubahan periode/bidang/catatan.
  async function simpan(statusBaru?: StatusPendaftaran) {
    const statusUntukDicek = statusBaru ?? pendaftar.status;

    if (statusUntukDicek === "ditolak" && !catatan.trim()) {
      setPesanError("Catatan wajib diisi kalau menolak pendaftaran.");
      return;
    }
    if (statusUntukDicek === "diverifikasi" && !bidangId) {
      setPesanError("Pilih bidang penempatan dulu sebelum menerima pendaftaran.");
      return;
    }
    if (!tanggalMulai || !tanggalSelesai) {
      setPesanError("Tanggal mulai dan tanggal selesai wajib diisi.");
      return;
    }
    if (tanggalSelesai < tanggalMulai) {
      setPesanError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    setMenyimpan(true);
    setPesanError(null);

    const payload: {
      catatan_admin: string | null;
      bidang_id: string | null;
      tanggal_mulai: string;
      tanggal_selesai: string;
      status?: StatusPendaftaran;
      diverifikasi_oleh?: string | null;
      diverifikasi_pada?: string;
    } = {
      catatan_admin: catatan.trim() || null,
      bidang_id: bidangId,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
    };

    if (statusBaru) {
      const { data: sesi } = await supabase.auth.getSession();
      payload.status = statusBaru;
      payload.diverifikasi_oleh = sesi.session?.user.id ?? null;
      payload.diverifikasi_pada = new Date().toISOString();
    }

    const { data: baruDisimpan, error } = await supabase
      .from("pendaftar")
      .update(payload)
      .eq("id", pendaftar.id)
      .select("id");

    setMenyimpan(false);

    if (error) {
      console.error("Gagal menyimpan perubahan:", error);
      setPesanError("Gagal menyimpan perubahan. Coba lagi.");
      return;
    }

    if (!baruDisimpan || baruDisimpan.length === 0) {
      // Baris tidak berubah karena otorisasi RLS diblokir.
      console.error(
        "Update pendaftar tidak mengubah baris manapun (kemungkinan diblokir RLS/is_admin())."
      );
      setPesanError(
        "Perubahan TIDAK tersimpan -- kemungkinan akun kamu tidak lagi terdaftar sebagai admin, atau sesi login sudah kedaluwarsa. Coba logout lalu masuk lagi."
      );
      return;
    }

    onSelesai();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-5 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-7 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--emas-tua)]">
              {pendaftar.nomor_pendaftaran}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
              {pendaftar.nama_lengkap}
            </h2>
          </div>
          <button
            onClick={onTutup}
            aria-label="Tutup"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {pesanError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            {pesanError}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </span>
            <p className="mt-0.5 text-foreground">{pendaftar.email}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              No. HP
            </span>
            <p className="mt-0.5 text-foreground">{pendaftar.no_hp}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Asal institusi
            </span>
            <p className="mt-0.5 text-foreground">{pendaftar.asal_institusi}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Jurusan/prodi
            </span>
            <p className="mt-0.5 text-foreground">{pendaftar.jurusan_prodi || "-"}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Didaftarkan
            </span>
            <p className="mt-0.5 text-foreground">{formatTanggal(pendaftar.dibuat_pada)}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Periode magang
            </span>
            {pendaftar.status === "diverifikasi" && periodeSudahSelesai(tanggalSelesai) && (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-600"
                title="Periode magangnya sudah lewat dari hari ini"
              >
                <CheckCircle2 className="size-3.5 shrink-0" />
                Sudah selesai
              </span>
            )}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tanggal_mulai" className="block text-xs text-muted-foreground">
                Tanggal mulai
              </label>
              <input
                id="tanggal_mulai"
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label htmlFor="tanggal_selesai" className="block text-xs text-muted-foreground">
                Tanggal selesai
              </label>
              <input
                id="tanggal_selesai"
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          {periodeBerubah && (
            <p className="mt-2 text-xs text-amber-600">
              Periode diubah dari {formatTanggal(pendaftar.tanggal_mulai)} &ndash;{" "}
              {formatTanggal(pendaftar.tanggal_selesai)}. Pertimbangkan isi kolom catatan di
              bawah dengan alasannya (misal diperpanjang, atau berhenti lebih awal), supaya ada
              jejaknya.
            </p>
          )}
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-foreground">
            Dokumen surat pengantar
          </label>
          {dokumen.length === 0 && (
            <p className="mt-1.5 text-sm text-muted-foreground">Tidak ada dokumen ditemukan.</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {dokumen.map((d) =>
              linkDokumen[d.id] ? (
                <a
                  key={d.id}
                  href={linkDokumen[d.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Lihat {d.nama_file_asli ?? d.jenis_dokumen}
                </a>
              ) : (
                <span key={d.id} className="text-sm text-muted-foreground">
                  Memuat link dokumen...
                </span>
              )
            )}
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-foreground">Riwayat status</label>
          {riwayat.length === 0 && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              Belum ada perubahan status tercatat.
            </p>
          )}
          {riwayat.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-sm">
              {riwayat.map((r) => (
                <li key={r.id} className="flex items-baseline justify-between gap-3">
                  <span className="text-foreground">
                    {r.status_lama ? (
                      <>
                        {LABEL_STATUS[r.status_lama]} &rarr; {LABEL_STATUS[r.status_baru]}
                      </>
                    ) : (
                      <>Pendaftaran dibuat ({LABEL_STATUS[r.status_baru]})</>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(r.diubah_pada).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5">
          <label htmlFor="bidang_id" className="block text-sm font-medium text-foreground">
            Bidang penempatan
          </label>
          <select
            id="bidang_id"
            value={bidangId ?? ""}
            onChange={(e) => setBidangId(e.target.value || null)}
            className="mt-2 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="" disabled>
              Belum ditentukan
            </option>
            {daftarBidang.map((b) => {
              const kuota = kuotaBidang.find((k) => k.bidang_id === b.id);
              const keterangan = kuota
                ? ` (${kuota.terisi}/${kuota.kuota} terisi${
                    kuota.terisi >= kuota.kuota ? " -- penuh" : ""
                  })`
                : "";
              return (
                <option key={b.id} value={b.id}>
                  {b.nama}
                  {keterangan}
                </option>
              );
            })}
          </select>
          {(() => {
            const kuotaTerpilih = kuotaBidang.find((k) => k.bidang_id === bidangId);
            if (kuotaTerpilih && kuotaTerpilih.terisi >= kuotaTerpilih.kuota) {
              return (
                <div className="mt-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                  Bidang ini sudah penuh untuk periode tersebut ({kuotaTerpilih.terisi}/
                  {kuotaTerpilih.kuota}). Kamu tetap bisa memilihnya kalau memang ingin
                  melonggarkan kuota.
                </div>
              );
            }
            return null;
          })()}
        </div>

        <div className="mt-5">
          <label htmlFor="catatan_admin" className="block text-sm font-medium text-foreground">
            Catatan (wajib diisi kalau menolak)
          </label>
          <textarea
            id="catatan_admin"
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            disabled={menyimpan || pendaftar.status !== "menunggu"}
            onClick={() => simpan("diverifikasi")}
            title={
              pendaftar.status === "diverifikasi"
                ? "Sudah berstatus Diterima -- pakai tombol \"Simpan periode\" kalau cuma mau ubah tanggal/bidang/catatan"
                : pendaftar.status === "ditolak"
                  ? "Pendaftaran yang sudah ditolak tidak bisa langsung diterima. Kalau pesertanya daftar ulang, pendaftaran barunya otomatis berstatus Menunggu dan bisa diproses dari situ."
                  : undefined
            }
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {menyimpan ? "Menyimpan..." : "Terima"}
          </button>
          <button
            disabled={menyimpan || pendaftar.status === "ditolak"}
            onClick={() => simpan("ditolak")}
            title={pendaftar.status === "ditolak" ? "Sudah berstatus Ditolak" : undefined}
            className="inline-flex items-center justify-center rounded-md border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tolak
          </button>
          {pendaftar.status === "diverifikasi" && (
            <button
              disabled={menyimpan}
              onClick={() => simpan()}
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {menyimpan ? "Menyimpan..." : "Simpan periode"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}