"use client";

import { useEffect, useState } from "react";
import HeaderSticky from "@/components/HeaderSticky";
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

function DaftarAtauParagraf({ teks }: { teks: string }) {
  const baris = teks
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);

  if (baris.length <= 1) {
    return <p className="info-teks">{baris[0] ?? ""}</p>;
  }

  return (
    <ul className="info-list">
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

  return (
    <div className="halaman">
      <div className="bungkus">
        <HeaderSticky />

        <div className="panel-glass">
          <h1 className="judul-hero" style={{ fontSize: 26, maxWidth: "none" }}>
            Info dan ketentuan magang
          </h1>

          {memuat && <p className="info-teks">Memuat...</p>}
          {error && <div className="form-pesan-gagal">{error}</div>}

          {konten && (
            <>
              <p className="sub-hero" style={{ marginBottom: "2rem" }}>
                {konten.intro}
              </p>

              <div className="info-section">
                <h2>Siapa yang bisa mendaftar</h2>
                <DaftarAtauParagraf teks={konten.siapa_yang_bisa_mendaftar} />
              </div>

              <div className="info-section">
                <h2>Dokumen yang perlu disiapkan</h2>
                <DaftarAtauParagraf teks={konten.dokumen_diperlukan} />
              </div>

              <div className="info-section">
                <h2>Jam kerja</h2>
                <DaftarAtauParagraf teks={konten.jam_kerja} />
              </div>

              <div className="info-section">
                <h2>Jadwal mulai magang</h2>
                <DaftarAtauParagraf teks={konten.jadwal_mulai_magang} />
              </div>

              <div className="info-section">
                <h2>Ketentuan berpakaian</h2>
                <DaftarAtauParagraf teks={konten.ketentuan_berpakaian} />
              </div>

              <div className="info-section">
                <h2>Alur setelah mendaftar</h2>
                <DaftarAtauParagraf teks={konten.alur_setelah_mendaftar} />
              </div>
            </>
          )}
        </div>

        {konten && <p className="keterangan-halaman">{konten.keterangan_kontak}</p>}
      </div>
    </div>
  );
}