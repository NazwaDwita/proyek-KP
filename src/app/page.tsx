"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderSticky from "@/components/HeaderSticky";
import { useSesi } from "@/lib/useSesi";
import { supabase } from "@/lib/supabase";

const KUOTA_PER_BIDANG = 10;

const LABEL_STATUS: Record<string, string> = {
  menunggu: "Menunggu diverifikasi",
  diverifikasi: "Diverifikasi",
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

  return (
    <>
      <div className="panel-glass">
        <p className="eyebrow">Portal magang</p>
        <h1 className="judul-hero">Magang di Diskominfotik Provinsi Riau</h1>
        <p className="sub-hero">
          Daftar kerja praktek (KP) atau praktik kerja lapangan (PKL) secara
          online. Masuk dengan email untuk mendaftar dan memantau status
          pendaftaranmu.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/daftar" className="tombol">
            Daftar magang
          </Link>
          <Link href="/info" className="tombol sekunder">
            Info dan ketentuan
          </Link>
        </div>
      </div>

      <div className="panel-glass" style={{ marginTop: "1.5rem" }}>
        <p className="eyebrow">Data per hari ini</p>
        <h2 className="judul-hero" style={{ fontSize: 22, maxWidth: "none", marginBottom: "0.5rem" }}>
          Peserta magang aktif &amp; sisa kuota per bidang
        </h2>
        <p className="sub-hero" style={{ marginBottom: "1rem" }}>
          Setiap bidang menerima maksimal {KUOTA_PER_BIDANG} peserta magang aktif dalam satu periode.
        </p>

        {memuatStatistik ? (
          <p className="info-teks">Memuat data...</p>
        ) : (
          <div className="grid-statistik">
            {statistik.map((item) => {
              const sisa = Math.max(KUOTA_PER_BIDANG - item.jumlah_aktif, 0);
              return (
                <div className="item-statistik" key={item.bidang_nama}>
                  <div className="angka-statistik">{sisa}</div>
                  <div className="label-statistik">
                    slot tersisa &middot; {item.bidang_nama}
                    <br />
                    ({item.jumlah_aktif} dari {KUOTA_PER_BIDANG} aktif)
                  </div>
                </div>
              );
            })}
          </div>
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
        <p className="eyebrow">Akun kamu</p>
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
                <span className="hasil-status-label">Bidang diminati</span>
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
