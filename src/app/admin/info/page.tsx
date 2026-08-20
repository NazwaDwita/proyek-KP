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
    baris: 3,
  },
  {
    key: "siapa_yang_bisa_mendaftar",
    label: "Siapa yang bisa mendaftar",
    keterangan: "1 poin per baris -- setiap baris jadi 1 bullet point.",
    baris: 4,
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
    baris: 3,
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
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--emas-tua)]">
            Edit info
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground md:text-3xl">
            Konten halaman Info dan Ketentuan
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Perubahan di sini langsung tampil di halaman publik &quot;Info dan
            ketentuan&quot; setelah disimpan.
          </p>
        </div>

        {memuatKonten && <p className="text-sm text-muted-foreground">Memuat konten...</p>}
        {!konten && pesanError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {pesanError}
          </div>
        )}

        {konten && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft md:p-8">
            <div className="grid gap-6 lg:grid-cols-2">
              {FIELD_LIST.map((f) => (
                <div key={f.key} className={f.key === "keterangan_kontak" ? "lg:col-span-2" : ""}>
                  <label htmlFor={f.key} className="block text-sm font-medium text-foreground">
                    {f.label}
                  </label>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.keterangan}</p>
                  <textarea
                    id={f.key}
                    rows={f.baris}
                    value={konten[f.key]}
                    onChange={(e) => ubahField(f.key, e.target.value)}
                    className="mt-2 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-border pt-6">
              <button
                type="button"
                onClick={simpan}
                disabled={menyimpan}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {menyimpan ? "Menyimpan..." : "Simpan perubahan"}
              </button>
              {pesanSukses && (
                <span className="text-sm text-green-700">&#10003; {pesanSukses}</span>
              )}
              {pesanError && <span className="text-sm text-red-700">{pesanError}</span>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
