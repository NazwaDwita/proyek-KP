"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  bidang_id: string;
  bidang: { nama: string } | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: StatusPendaftaran;
  catatan_admin: string | null;
  dibuat_pada: string;
};

const LABEL_STATUS: Record<StatusPendaftaran, string> = {
  menunggu: "Menunggu",
  diverifikasi: "Diverifikasi",
  ditolak: "Ditolak",
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [memuat, setMemuat] = useState(true);
  const [ditolakAkses, setDitolakAkses] = useState(false);

  const [daftar, setDaftar] = useState<Pendaftar[]>([]);
  const [daftarBidang, setDaftarBidang] = useState<Bidang[]>([]);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<"semua" | StatusPendaftaran>(
    "semua"
  );
  const [pencarian, setPencarian] = useState("");

  const [dipilih, setDipilih] = useState<Pendaftar | null>(null);
  const [sedangMuatUlang, setSedangMuatUlang] = useState(false);
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

  async function muatUlangManual() {
    setSedangMuatUlang(true);
    await muatUlangData();
    setSedangMuatUlang(false);
  }

  useEffect(() => {
    async function cekAksesDanMuat() {
      try {
        const { data: sesi } = await supabase.auth.getSession();
        if (!sesi.session) {
          router.replace("/admin/login");
          return;
        }

        // Sesi Auth valid tidak berarti otomatis admin — cek keanggotaan
        // admin_pengguna. Kalau bukan admin, RLS akan bikin semua query
        // di bawah kembali kosong diam-diam; lebih baik ditolak eksplisit.
        const { data: dataAdmin } = await supabase
          .from("admin_pengguna")
          .select("id")
          .maybeSingle();

        if (!dataAdmin) {
          setDitolakAkses(true);
          setMemuat(false);
          return;
        }

        const { data: bidangData } = await supabase
          .from("bidang")
          .select("id, nama")
          .eq("aktif", true)
          .order("nama");
        setDaftarBidang(bidangData ?? []);

        await muatUlangData();
        setMemuat(false);
      } catch (err) {
        console.error("Gagal memeriksa akses:", err);
        router.replace("/admin/login");
      }
    }

    cekAksesDanMuat();
  }, [router]);

  // Auto-refresh berkala, supaya pendaftar baru dari sisi publik
  // ikut muncul tanpa admin harus reload manual. Sengaja bukan
  // realtime subscription (di luar scope saat ini) -- cukup polling
  // ringan tiap 30 detik, dan cuma jalan selama tab ini aktif dilihat
  // supaya tidak boros request kalau tab ditinggal di background.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !ditolakAkses && !memuat) {
        muatUlangData();
      }
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ditolakAkses, memuat]);

  const daftarTersaring = useMemo(() => {
    return daftar.filter((p) => {
      if (filterStatus !== "semua" && p.status !== filterStatus) return false;
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

  async function keluar() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

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
    <div className="halaman halaman-fit">
      <div className="bungkus bungkus-fit" style={{ maxWidth: 1400 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>
              Dashboard admin
            </p>
            <h1 className="judul-hero" style={{ fontSize: 24, maxWidth: "none" }}>
              Data pendaftar magang
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={`tombol-ikon${sedangMuatUlang ? " memuat" : ""}`}
              onClick={muatUlangManual}
              disabled={sedangMuatUlang}
              title="Muat ulang"
              aria-label="Muat ulang data"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
            </button>
            <button
              className="tombol-ikon"
              onClick={keluar}
              title="Keluar"
              aria-label="Keluar dari akun admin"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </div>
        </div>

        <div className="panel-glass panel-scroll">
          {errorMuat && <div className="form-pesan-gagal">{errorMuat}</div>}

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <input
              className="form-input"
              style={{ maxWidth: 260 }}
              placeholder="Cari nama atau nomor pendaftaran..."
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
            />
            <select
              className="form-input"
              style={{ maxWidth: 200 }}
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof filterStatus)
              }
            >
              <option value="semua">Semua status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diverifikasi">Diverifikasi</option>
              <option value="ditolak">Ditolak</option>
            </select>

            <span style={{ fontSize: 12, color: "var(--teks-muted)", marginLeft: "auto" }}>
              {terakhirDiperbarui
                ? `Diperbarui otomatis tiap 30 detik \u00b7 terakhir ${terakhirDiperbarui.toLocaleTimeString(
                    "id-ID",
                    { hour: "2-digit", minute: "2-digit" }
                  )}`
                : ""}
            </span>
          </div>

          <div className="tabel-scroll-area">
            <table className="tabel-admin">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Nama</th>
                  <th>Bidang</th>
                  <th>Periode</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {daftarTersaring.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nomor_pendaftaran}</td>
                    <td>{p.nama_lengkap}</td>
                    <td>{p.bidang?.nama ?? "-"}</td>
                    <td>
                      {formatTanggal(p.tanggal_mulai)} &ndash;{" "}
                      {formatTanggal(p.tanggal_selesai)}
                    </td>
                    <td>
                      <span className={`status-badge status-${p.status}`}>
                        {LABEL_STATUS[p.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="tombol sekunder tombol-kecil"
                        onClick={() => setDipilih(p)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {daftarTersaring.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                      Tidak ada data yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [linkDokumen, setLinkDokumen] = useState<Record<string, string>>({});

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

  async function simpan(statusBaru: StatusPendaftaran) {
    if (statusBaru === "ditolak" && !catatan.trim()) {
      setPesanError("Catatan wajib diisi kalau menolak pendaftaran.");
      return;
    }
    setMenyimpan(true);
    setPesanError(null);

    const { data: sesi } = await supabase.auth.getSession();

    const { error } = await supabase
      .from("pendaftar")
      .update({
        status: statusBaru,
        catatan_admin: catatan.trim() || null,
        bidang_id: bidangId,
        diverifikasi_oleh: sesi.session?.user.id ?? null,
        diverifikasi_pada: new Date().toISOString(),
      })
      .eq("id", pendaftar.id);

    setMenyimpan(false);

    if (error) {
      console.error("Gagal menyimpan perubahan:", error);
      setPesanError("Gagal menyimpan perubahan. Coba lagi.");
      return;
    }
    onSelesai();
  }

  return (
    <div className="modal-overlay" onClick={onTutup}>
      <div className="modal-isi" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>
              {pendaftar.nomor_pendaftaran}
            </p>
            <h2 style={{ margin: "4px 0 0", fontSize: 20 }}>
              {pendaftar.nama_lengkap}
            </h2>
          </div>
          <button className="modal-tutup" onClick={onTutup} aria-label="Tutup">
            ×
          </button>
        </div>

        {pesanError && (
          <div className="form-pesan-gagal" style={{ marginTop: 14 }}>
            {pesanError}
          </div>
        )}

        <div className="modal-grid">
          <div>
            <span className="hasil-status-label">Email</span>
            <p>{pendaftar.email}</p>
          </div>
          <div>
            <span className="hasil-status-label">No. HP</span>
            <p>{pendaftar.no_hp}</p>
          </div>
          <div>
            <span className="hasil-status-label">Asal institusi</span>
            <p>{pendaftar.asal_institusi}</p>
          </div>
          <div>
            <span className="hasil-status-label">Jurusan/prodi</span>
            <p>{pendaftar.jurusan_prodi || "-"}</p>
          </div>
          <div>
            <span className="hasil-status-label">Periode</span>
            <p>
              {formatTanggal(pendaftar.tanggal_mulai)} &ndash;{" "}
              {formatTanggal(pendaftar.tanggal_selesai)}
            </p>
          </div>
          <div>
            <span className="hasil-status-label">Didaftarkan</span>
            <p>{formatTanggal(pendaftar.dibuat_pada)}</p>
          </div>
        </div>

        <div className="form-grup" style={{ marginTop: 4 }}>
          <label>Dokumen surat pengantar</label>
          {dokumen.length === 0 && (
            <p className="sub-hero" style={{ margin: 0 }}>
              Tidak ada dokumen ditemukan.
            </p>
          )}
          {dokumen.map((d) => (
            <div key={d.id}>
              {linkDokumen[d.id] ? (
                <a
                  href={linkDokumen[d.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tombol sekunder tombol-kecil"
                >
                  Lihat {d.nama_file_asli ?? d.jenis_dokumen}
                </a>
              ) : (
                <span className="sub-hero">Memuat link dokumen...</span>
              )}
            </div>
          ))}
        </div>

        <div className="form-grup">
          <label htmlFor="bidang_id">Bidang penempatan</label>
          <select
            id="bidang_id"
            className="form-input"
            value={bidangId}
            onChange={(e) => setBidangId(e.target.value)}
          >
            {daftarBidang.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grup">
          <label htmlFor="catatan_admin">
            Catatan (wajib diisi kalau menolak)
          </label>
          <textarea
            id="catatan_admin"
            className="form-input"
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="tombol"
            disabled={menyimpan}
            onClick={() => simpan("diverifikasi")}
          >
            {menyimpan ? "Menyimpan..." : "Verifikasi"}
          </button>
          <button
            className="tombol sekunder"
            disabled={menyimpan}
            onClick={() => simpan("ditolak")}
          >
            Tolak
          </button>
        </div>
      </div>
    </div>
  );
}
