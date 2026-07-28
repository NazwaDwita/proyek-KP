"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminAkses } from "@/lib/useAdminAkses";
import AdminNav from "@/components/admin/AdminNav";

type InfoKonten = {
  id: string;
  intro: string;
  siapa_yang_bisa_mendaftar: string;
  dokumen_diperlukan: string;
  jam_kerja: string;
  jadwal_mulai_magang: string;
  ketentuan_berpakaian: string;
  alur_setelah_mendaftar: string;
  keterangan_kontak: string;
};

const FIELD_LIST: {
  key: keyof Omit<InfoKonten, "id">;
  label: string;
  keterangan: string;
  baris: number;
}[] = [
  {
    key: "intro",
    label: "Kalimat pembuka",
    keterangan: "Paragraf singkat di bagian paling atas halaman.",
    baris: 2,
  },
  {
    key: "siapa_yang_bisa_mendaftar",
    label: "Siapa yang bisa mendaftar",
    keterangan: "1 poin per baris -- setiap baris jadi 1 bullet point.",
    baris: 3,
  },
  {
    key: "dokumen_diperlukan",
    label: "Dokumen yang perlu disiapkan",
    keterangan: "1 poin per baris.",
    baris: 4,
  },
  {
    key: "jam_kerja",
    label: "Jam kerja",
    keterangan: "1 poin per baris.",
    baris: 4,
  },
  {
    key: "jadwal_mulai_magang",
    label: "Jadwal mulai magang",
    keterangan: "1 poin per baris (kalau cuma 1 baris, tampil sebagai paragraf biasa).",
    baris: 3,
  },
  {
    key: "ketentuan_berpakaian",
    label: "Ketentuan berpakaian",
    keterangan: "1 poin per baris.",
    baris: 5,
  },
  {
    key: "alur_setelah_mendaftar",
    label: "Alur setelah mendaftar",
    keterangan: "1 poin per baris.",
    baris: 4,
  },
  {
    key: "keterangan_kontak",
    label: "Kalimat penutup / kontak",
    keterangan: "Muncul paling bawah halaman, di luar kotak putih.",
    baris: 2,
  },
];

export default function AdminInfoPage() {
  const { memuat, ditolakAkses, keluar } = useAdminAkses();

  const [konten, setKonten] = useState<InfoKonten | null>(null);
  const [memuatKonten, setMemuatKonten] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  useEffect(() => {
    if (memuat || ditolakAkses) return;

    let masihTerpasang = true;

    async function muat() {
      const { data, error } = await supabase
        .from("info_konten")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!masihTerpasang) return;

      if (error || !data) {
        console.error("Gagal memuat konten info:", error);
        setPesanError("Gagal memuat konten. Coba muat ulang halaman.");
        setMemuatKonten(false);
        return;
      }

      setKonten(data as InfoKonten);
      setMemuatKonten(false);
    }

    muat();
    return () => {
      masihTerpasang = false;
    };
  }, [memuat, ditolakAkses]);

  function ubahField(field: keyof Omit<InfoKonten, "id">, nilai: string) {
    setKonten((k) => (k ? { ...k, [field]: nilai } : k));
    setPesanSukses(null);
  }

  async function simpan() {
    if (!konten) return;
    setMenyimpan(true);
    setPesanError(null);
    setPesanSukses(null);

    const { data: sesi } = await supabase.auth.getSession();

    const { error } = await supabase
      .from("info_konten")
      .update({
        intro: konten.intro,
        siapa_yang_bisa_mendaftar: konten.siapa_yang_bisa_mendaftar,
        dokumen_diperlukan: konten.dokumen_diperlukan,
        jam_kerja: konten.jam_kerja,
        jadwal_mulai_magang: konten.jadwal_mulai_magang,
        ketentuan_berpakaian: konten.ketentuan_berpakaian,
        alur_setelah_mendaftar: konten.alur_setelah_mendaftar,
        keterangan_kontak: konten.keterangan_kontak,
        diperbarui_pada: new Date().toISOString(),
        diperbarui_oleh: sesi.session?.user.id ?? null,
      })
      .eq("id", konten.id);

    setMenyimpan(false);

    if (error) {
      console.error("Gagal menyimpan konten info:", error);
      setPesanError("Gagal menyimpan perubahan. Coba lagi.");
      return;
    }

    setPesanSukses("Perubahan tersimpan dan langsung tampil di halaman publik.");
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
    <div className="halaman">
      <div className="bungkus" style={{ maxWidth: 1400 }}>
        <AdminNav onKeluar={keluar} />

        <div style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow" style={{ margin: 0 }}>
            Edit info
          </p>
          <h1 className="judul-hero" style={{ fontSize: 22, maxWidth: "none" }}>
            Konten halaman Info dan Ketentuan
          </h1>
          <p className="sub-hero" style={{ margin: "0.35rem 0 0" }}>
            Perubahan di sini langsung tampil di halaman publik &quot;Info dan
            ketentuan&quot; setelah disimpan.
          </p>
        </div>

        {memuatKonten && <p className="sub-hero">Memuat konten...</p>}
        {!konten && pesanError && (
          <div className="form-pesan-gagal" style={{ marginBottom: "1.25rem" }}>
            {pesanError}
          </div>
        )}

        {konten && (
          <div
            className="panel-glass"
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}
          >
            {FIELD_LIST.map((f) => (
              <div className="form-grup" key={f.key}>
                <label htmlFor={f.key}>{f.label}</label>
                <p className="info-teks" style={{ margin: "0 0 0.4rem", fontSize: 13 }}>
                  {f.keterangan}
                </p>
                <textarea
                  id={f.key}
                  className="form-input"
                  rows={f.baris}
                  value={konten[f.key]}
                  onChange={(e) => ubahField(f.key, e.target.value)}
                />
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <button
                type="button"
                className="tombol"
                onClick={simpan}
                disabled={menyimpan}
              >
                {menyimpan ? "Menyimpan..." : "Simpan perubahan"}
              </button>
              {pesanSukses && (
                <span style={{ color: "#2f6b46", fontSize: 14 }}>
                  ✓ {pesanSukses}
                </span>
              )}
              {pesanError && (
                <span style={{ color: "#b3392e", fontSize: 14 }}>
                  {pesanError}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}