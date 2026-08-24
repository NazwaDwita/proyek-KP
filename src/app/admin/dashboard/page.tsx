"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminAkses } from "@/lib/useAdminAkses";
import { periodeSudahSelesai } from "@/lib/periodeMagang";
import AdminNav from "@/components/admin/AdminNav";

type StatusPendaftaran = "menunggu" | "diverifikasi" | "ditolak";

type Bidang = { id: string; nama: string };

type Dokumen = {
  id: string;
  jenis_dokumen: string;
  path_file: string;
  nama_file_asli: string | null;
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

const LABEL_STATUS: Record<StatusPendaftaran, string> = {
  menunggu: "Menunggu",
  diverifikasi: "Diterima",
  ditolak: "Ditolak",
};

const BADGE_STATUS: Record<StatusPendaftaran, string> = {
  menunggu: "bg-muted text-muted-foreground border border-border",
  diverifikasi: "bg-green-100 text-green-700 border border-green-200",
  ditolak: "bg-red-100 text-red-700 border border-red-200",
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

      <main className="w-full px-4 py-8 md:px-8">
        <h1 className="mb-5 font-display text-2xl font-semibold text-foreground md:text-3xl">
          Data pendaftar magang
        </h1>

        {errorMuat && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMuat}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            placeholder="Cari nama atau nomor pendaftaran..."
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            className="w-full max-w-xs rounded-md border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-md border border-border bg-card px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="semua">Semua status</option>
            <option value="menunggu">Menunggu</option>
            <option value="diverifikasi">Diterima</option>
            <option value="selesai">Sudah selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>

          <span className="ml-auto text-xs text-muted-foreground">
            {terakhirDiperbarui
              ? `Diperbarui otomatis tiap 30 detik \u00b7 terakhir ${terakhirDiperbarui.toLocaleTimeString(
                  "id-ID",
                  { hour: "2-digit", minute: "2-digit" }
                )}`
              : ""}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
          <div className="max-h-[65vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-[1] bg-primary text-primary-foreground">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Nomor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Bidang
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Periode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {daftarTersaring.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-4 py-3 text-foreground">{p.nomor_pendaftaran}</td>
                    <td className="px-4 py-3 text-foreground">{p.nama_lengkap}</td>
                    <td className="px-4 py-3 text-foreground">{p.bidang?.nama ?? "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground">
                      {formatTanggal(p.tanggal_mulai)} &ndash; {formatTanggal(p.tanggal_selesai)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${BADGE_STATUS[p.status]}`}
                        >
                          {LABEL_STATUS[p.status]}
                        </span>
                        {p.status === "diverifikasi" && periodeSudahSelesai(p.tanggal_selesai) && (
                          <span title="Periode magangnya sudah lewat dari hari ini">
                            <CheckCircle2 className="size-4 shrink-0 text-sky-600" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDipilih(p)}
                        className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {daftarTersaring.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Tidak ada data yang cocok.
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
    // Sengaja pakai tanggalMulai/tanggalSelesai (state yang sedang diedit
    // admin), bukan pendaftar.tanggal_mulai/tanggal_selesai (nilai asli) --
    // supaya kalau admin lagi mengetik periode baru, info kuota yang
    // ditampilkan langsung menyesuaikan periode barunya, bukan periode lama.
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

  // statusBaru diisi cuma kalau ini aksi Terima/Tolak. Kalau kosong,
  // artinya admin cuma menyimpan perubahan periode/bidang/catatan tanpa
  // mengubah keputusan -- makanya status, diverifikasi_oleh, dan
  // diverifikasi_pada sengaja TIDAK ikut ditimpa, biar jejak kapan
  // pendaftaran ini pertama kali diputuskan tetap utuh.
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
      // Tidak ada error, tapi juga tidak ada baris yang benar-benar
      // berubah -- biasanya tanda RLS (is_admin()) diam-diam menolak
      // update ini. Daripada pura-pura berhasil, tampilkan errornya.
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
            disabled={menyimpan || pendaftar.status === "diverifikasi"}
            onClick={() => simpan("diverifikasi")}
            title={
              pendaftar.status === "diverifikasi"
                ? "Sudah berstatus Diterima -- pakai tombol \"Simpan periode\" kalau cuma mau ubah tanggal/bidang/catatan"
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