"use client";

import { useEffect, useState } from "react";
import { Clock, FileText, HelpCircle, Mail, MapPin, Phone } from "lucide-react";
import HeaderSticky from "@/components/HeaderSticky";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type InfoKonten = {
  intro: string;
  siapa_yang_bisa_mendaftar: string;
  dokumen_diperlukan: string;
  jam_kerja: string;
  jadwal_mulai_magang: string;
  ketentuan_berpakaian: string;
  alur_setelah_mendaftar: string;
  keterangan_kontak: string;
};

type Section = { icon: typeof Clock; judul: string; teks: string };

function toBaris(teks: string) {
  return teks
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
}

function IsiSection({ teks }: { teks: string }) {
  const baris = toBaris(teks);
  if (baris.length <= 1) {
    return <p className="mt-2 text-sm text-muted-foreground">{baris[0] ?? ""}</p>;
  }
  return (
    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
      {baris.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

export default function InfoPage() {
  const [konten, setKonten] = useState<InfoKonten | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let masihTerpasang = true;

    async function muatKonten() {
      const { data, error } = await supabase
        .from("info_konten")
        .select(
          "intro, siapa_yang_bisa_mendaftar, dokumen_diperlukan, jam_kerja, jadwal_mulai_magang, ketentuan_berpakaian, alur_setelah_mendaftar, keterangan_kontak"
        )
        .limit(1)
        .maybeSingle();

      if (!masihTerpasang) return;

      if (error || !data) {
        console.error("Gagal memuat konten info:", error);
        setError("Gagal memuat halaman ini. Coba muat ulang.");
        setMemuat(false);
        return;
      }

      setKonten(data as InfoKonten);
      setMemuat(false);
    }

    muatKonten();
    return () => {
      masihTerpasang = false;
    };
  }, []);

  const ringkasan: Section[] = konten
    ? [
        { icon: Clock, judul: "Jam kerja", teks: konten.jam_kerja },
        { icon: FileText, judul: "Dokumen diperlukan", teks: konten.dokumen_diperlukan },
        { icon: MapPin, judul: "Siapa yang bisa mendaftar", teks: konten.siapa_yang_bisa_mendaftar },
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSticky />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              Info Magang
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {konten?.intro ??
                "Hal-hal yang perlu kamu ketahui sebelum dan selama menjalani magang di Diskominfotik Provinsi Riau."}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-14">
          {memuat && <p className="text-sm text-muted-foreground">Memuat...</p>}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {konten && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {ringkasan.map((s) => (
                  <div key={s.judul} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <s.icon className="size-5" />
                    </div>
                    <h2 className="mt-4 font-display text-base font-semibold text-foreground">
                      {s.judul}
                    </h2>
                    <IsiSection teks={s.teks} />
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Jadwal mulai magang
                  </h2>
                  <IsiSection teks={konten.jadwal_mulai_magang} />
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Ketentuan berpakaian
                  </h2>
                  <IsiSection teks={konten.ketentuan_berpakaian} />
                </div>
              </div>

              <div className="mt-10 rounded-xl border border-border bg-card p-6">
                <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                  <HelpCircle className="size-4 text-primary" />
                  Alur setelah mendaftar
                </p>
                <IsiSection teks={konten.alur_setelah_mendaftar} />
              </div>

              <div className="mt-10 rounded-xl border border-border bg-secondary/40 p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Butuh bantuan?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{konten.keterangan_kontak}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Phone className="size-4 text-primary" /> (0761) 45505
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail className="size-4 text-primary" /> diskominfotik@riau.go.id
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
