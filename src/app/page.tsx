"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderSticky from "@/components/HeaderSticky";
import { useSesi } from "@/lib/useSesi";
import { supabase } from "@/lib/supabase";

const KUOTA_PER_BIDANG = 10;

const DESKRIPSI_BIDANG: Record<string, string> = {
  "Bidang Aplikasi & Informatika":
    "Pengembangan aplikasi, sistem informasi, dan layanan digital pemerintah.",
  "Bidang Infrastruktur Teknologi Informasi dan Komunikasi":
    "Infrastruktur jaringan, keamanan sistem, dan dukungan teknis TIK.",
  "Bidang Informasi dan Komunikasi Publik":
    "Produksi konten, kehumasan, pengelolaan media sosial, dan layanan informasi publik.",
  "Bidang Statistik":
    "Pengolahan data sektoral dan penyediaan data statistik daerah (Satu Data Riau).",
  "Bidang Persandian":
    "Keamanan informasi, persandian, dan pengelolaan komunikasi rahasia pemerintah.",
};

const LABEL_STATUS: Record<string, string> = {
  menunggu: "Menunggu",
  diverifikasi: "Diterima",
  ditolak: "Ditolak",
};

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

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Beranda() {
  const { sesi, memuat } = useSesi();

  if (memuat) {
    return (
      <div className="halaman">
        <div className="bungkus">
          <HeaderSticky />
        </div>
      </div>
    );
  }

  return (
    <div className="halaman">
      <div className="bungkus">
        <HeaderSticky />
        {sesi ? (
          <BerandaSudahLogin
            userId={sesi.user.id}
            nama={(sesi.user.user_metadata?.nama as string) || sesi.user.email || ""}
          />
        ) : (
          <BerandaBelumLogin />
        )}
      </div>
    </div>
  );
}

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
      <div className="hero-magang">
        <span className="hero-badge">Diskominfotik Provinsi Riau</span>
        <h1>Pendaftaran Magang &amp; PKL Dinas Diskominfotik Provinsi Riau</h1>
        <p>
          Terbuka untuk siswa dan mahasiswa dari mana saja. Pilih bidang,
          tentukan periode magang, dan pantau status pendaftaranmu secara
          online.
        </p>
        <div className="hero-tombol-grup">
          <Link href="/daftar" className="tombol-hero">
            Daftar Sekarang
          </Link>
          <a href="#ketersediaan-slot" className="tombol-hero-sekunder">
            Lihat Ketersediaan Slot
          </a>
        </div>
      </div>

      <div id="ketersediaan-slot" style={{ marginTop: "1.5rem" }}>
        {memuatStatistik ? (
          <div className="panel-glass">
            <p className="info-teks" style={{ margin: 0 }}>Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="ringkasan-slot">
              <div className="ringkasan-slot-kiri">
                <div className="ringkasan-slot-ikon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="ringkasan-slot-label">Total peserta magang aktif saat ini</div>
                  <div className="ringkasan-slot-angka">
                    {totalAktif} <span>dari {totalKuota} slot</span>
                  </div>
                </div>
              </div>
              <span className="pil-slot-tersisa">{totalSisa} slot tersedia</span>
            </div>

            <div className="grid-kartu-bidang">
              {statistik.map((item) => {
                const sisa = Math.max(KUOTA_PER_BIDANG - item.jumlah_aktif, 0);
                const persen = Math.min((item.jumlah_aktif / KUOTA_PER_BIDANG) * 100, 100);
                return (
                  <div className="kartu-bidang" key={item.bidang_nama}>
                    <div className="kartu-bidang-atas">
                      <h3 className="kartu-bidang-judul">{item.bidang_nama}</h3>
                      <span className="kartu-bidang-badge">{sisa} slot</span>
                    </div>
                    <p className="kartu-bidang-deskripsi">
                      {DESKRIPSI_BIDANG[item.bidang_nama] ?? "Penempatan magang pada bidang ini."}
                    </p>
                    <div className="progress-bar">
                      <div className="progress-bar-isi" style={{ width: `${persen}%` }} />
                    </div>
                    <div className="kartu-bidang-footer">
                      {item.jumlah_aktif} / {KUOTA_PER_BIDANG} peserta aktif
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
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
      <div className="panel-glass">
        <h1 className="judul-hero" style={{ fontSize: 24, maxWidth: "none" }}>
          Selamat datang, {nama}
        </h1>
        <p className="sub-hero" style={{ marginBottom: 0 }}>
          Status pendaftaran magangmu ditampilkan otomatis di bawah ini.
        </p>
      </div>

      <div className="panel-glass" style={{ marginTop: "1.5rem" }}>
        <p className="eyebrow">Status pendaftaran</p>

        {memuat && <p className="info-teks">Memuat data...</p>}
        {pesanError && <div className="form-pesan-gagal">{pesanError}</div>}

        {!memuat && !pesanError && daftarPendaftaran.length === 0 && (
          <>
            <p className="sub-hero" style={{ marginBottom: "1.25rem" }}>
              Kamu belum pernah mendaftar magang menggunakan akun ini.
            </p>
            <Link href="/daftar" className="tombol">
              Daftar magang sekarang
            </Link>
          </>
        )}

        {!memuat &&
          daftarPendaftaran.map((p) => (
            <div key={p.nomor_pendaftaran} style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "0.75rem" }}>
                <span className={`status-badge status-${p.status}`}>
                  {LABEL_STATUS[p.status]}
                </span>
              </div>

              <div className="hasil-status-baris">
                <span className="hasil-status-label">Nomor pendaftaran</span>
                <strong>{p.nomor_pendaftaran}</strong>
              </div>
              <div className="hasil-status-baris">
                <span className="hasil-status-label">Bidang penempatan</span>
                <span>{p.bidang?.nama ?? "-"}</span>
              </div>
              <div className="hasil-status-baris">
                <span className="hasil-status-label">Periode magang</span>
                <span>
                  {formatTanggal(p.tanggal_mulai)} &ndash; {formatTanggal(p.tanggal_selesai)}
                </span>
              </div>
              <div className="hasil-status-baris">
                <span className="hasil-status-label">Tanggal daftar</span>
                <span>{formatTanggal(p.dibuat_pada)}</span>
              </div>

              {p.status === "diverifikasi" && (
                <Link
                  href={`/surat-keterangan/${p.nomor_pendaftaran}`}
                  className="tombol"
                  style={{ marginTop: "1rem", display: "inline-block" }}
                >
                  Cetak surat keterangan diterima
                </Link>
              )}

              {p.status === "ditolak" && p.catatan_admin && (
                <div className="form-pesan-gagal" style={{ marginTop: "1rem", marginBottom: 0 }}>
                  <strong>Catatan dari staf:</strong> {p.catatan_admin}
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
}