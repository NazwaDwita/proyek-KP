"use client";

import { useState } from "react";

type Jabatan = {
  nama: string;
  pangkat: string;
};

type Bidang = {
  nama: string;
  kepala: Jabatan;
  timList: { peran: string; nama: string; pangkat: string }[];
};

const stafAhli: Jabatan[] = [
  { nama: "Zamri, S.E.", pangkat: "Arsiparis Ahli Madya — Pembina (IV/a)" },
  {
    nama: "Irawaty, S.Kom., M.Si.",
    pangkat: "Pranata Komputer Ahli Madya — Pembina (IV/a)",
  },
  {
    nama: "Ria Indah Sari, S.Si.",
    pangkat: "Statistisi Ahli Madya — Pembina (IV/a)",
  },
];

const subbagianSekretariat: { peran: string; nama: string; pangkat: string }[] = [
  {
    peran: "Ketua Tim Perencanaan Program",
    nama: "Lusiana, S.E., M.I.P.",
    pangkat: "Penata Tk. I (III/d)",
  },
  {
    peran: "Kasubbag Keuangan, Perlengkapan & BMD",
    nama: "Novendry, S.A.P.",
    pangkat: "Penata (III/c)",
  },
  {
    peran: "Kasubbag Kepegawaian dan Umum",
    nama: "Muhammad Zarviyan, S.S.T.P., M.Si.",
    pangkat: "Penata (III/c)",
  },
];

const daftarBidang: Bidang[] = [
  {
    nama: "Bidang Informasi dan Komunikasi Publik",
    kepala: { nama: "Eriadi Fahmi, S.P., M.M.", pangkat: "Pembina (IV/a)" },
    timList: [
      {
        peran: "Ketua Tim Komunikasi Informasi",
        nama: "Kanty Amalia, S.I.Kom.",
        pangkat: "Penata (III/c)",
      },
      {
        peran: "Ketua Tim Diseminasi Informasi",
        nama: "Trisna Damayanti Z.A., S.Kpm.",
        pangkat: "Penata (III/c)",
      },
      {
        peran: "Ketua Tim Multimedia dan Dokumentasi",
        nama: "Rizan Ardianov, S.S.T.P., M.Si.",
        pangkat: "Penata Tk. I (III/d)",
      },
    ],
  },
  {
    nama: "Bidang Infrastruktur Teknologi Informasi dan Komunikasi",
    kepala: { nama: "Tommy Nanda, M.M.", pangkat: "Pembina Tk. I (IV/b)" },
    timList: [
      {
        peran: "Ketua Tim Jaringan Infrastruktur, Informasi dan Komunikasi",
        nama: "Ir. Junaidi, M.Sc.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Pemeliharaan TIK, CCTV & Command Center",
        nama: "Raja Wira Kesuma, S.Kom.",
        pangkat: "Penata Tk. I (III/d)",
      },
      {
        peran: "Ketua Tim Pengendalian Infrastruktur TIK & Data Center",
        nama: "Hardiansyah Parsamaan B., S.ST.",
        pangkat: "Penata Muda (III/a)",
      },
    ],
  },
  {
    nama: "Bidang Aplikasi & Informatika",
    kepala: {
      nama: "T. Indriany Novitalia, S.Sos., M.H.",
      pangkat: "Pembina Tk. I (IV/b)",
    },
    timList: [
      {
        peran: "Ketua Tim Standarisasi Penyelenggaraan Aplikasi & Informatika",
        nama: "Budhi Yan Putra Ali, M.Si.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Integrasi dan Interoperabilitas",
        nama: "Syarifah Zuraida Hanom, S.Sos.",
        pangkat: "Penata Tk. I (III/d)",
      },
      {
        peran: "Ketua Tim Pengelolaan dan Pengembangan Aplikasi",
        nama: "Irawaty, S.Kom., M.Si.",
        pangkat: "Pembina (IV/a)",
      },
    ],
  },
  {
    nama: "Bidang Statistik",
    kepala: { nama: "Ermila Roza, S.Sos., M.Si.", pangkat: "Pembina Tk. I (IV/b)" },
    timList: [
      {
        peran: "Ketua Tim Statistik Sosial",
        nama: "Ria Indah Sari, S.Si.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Statistik Ekonomi dan Sumber Daya Manusia",
        nama: "Dra. Darmawati Embas, M.Si.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Statistik Infrastruktur dan Kewilayahan",
        nama: "Akhyan Fajri, S.Sos.",
        pangkat: "Penata Tk. I (III/d)",
      },
    ],
  },
  {
    nama: "Bidang Persandian",
    kepala: {
      nama: "Candra Lisano Saputra, S.T.",
      pangkat: "Pembina Tk. I (IV/b)",
    },
    timList: [
      {
        peran: "Ketua Tim Tata Kelola Persandian",
        nama: "Dodi Sutejo, S.Sos., M.Si.",
        pangkat: "Penata Tk. I (III/d)",
      },
      {
        peran: "Ketua Tim Operasional Pengamanan Persandian",
        nama: "T. Nova Sukma, S.T., M.M.",
        pangkat: "Pembina (IV/a)",
      },
      {
        peran: "Ketua Tim Pengawasan dan Evaluasi Persandian",
        nama: "Tengku Afrizal Lukman, S.Kom.",
        pangkat: "Penata Tk. I (III/d)",
      },
    ],
  },
];

export default function StrukturOrganisasi() {
  const [terbuka, setTerbuka] = useState<number | null>(null);

  function toggleBidang(index: number) {
    setTerbuka((sebelumnya) => (sebelumnya === index ? null : index));
  }

  return (
    <div className="struktur-wrap">
      {/* Kepala Dinas */}
      <div className="struktur-kepala">
        <span>Kepala Dinas</span>
        <strong>Drs. Supriyadi, M.Si.</strong>
        <span>Pembina Utama Muda (IV/c)</span>
      </div>

      {/* Staf ahli & Sekretariat */}
      <div className="struktur-cabang">
        <div>
          <p className="struktur-kelompok-judul">Jabatan Fungsional Ahli</p>
          {stafAhli.map((s) => (
            <div className="struktur-mini-card" key={s.nama}>
              <strong>{s.nama}</strong>
              <span>{s.pangkat}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="struktur-kelompok-judul">Sekretariat</p>
          <div className="struktur-mini-card">
            <strong>Ridho Adriansyah, S.S.T.P.</strong>
            <span>Sekretaris — Pembina Tk. I (IV/b)</span>
          </div>
          {subbagianSekretariat.map((s) => (
            <div className="struktur-mini-card" key={s.peran}>
              <strong>{s.nama}</strong>
              <span>
                {s.peran} — {s.pangkat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bidang - accordion */}
      <p className="struktur-kelompok-judul" style={{ marginTop: "0.5rem" }}>
        Bidang
      </p>
      <div className="struktur-bidang-grid">
        {daftarBidang.map((b, index) => {
          const sedangTerbuka = terbuka === index;
          return (
            <div className="struktur-bidang-card" key={b.nama}>
              <button
                type="button"
                className="struktur-bidang-tombol"
                aria-expanded={sedangTerbuka}
                onClick={() => toggleBidang(index)}
              >
                <span>
                  <strong>{b.nama}</strong>
                  <span>
                    {b.kepala.nama} — {b.kepala.pangkat}
                  </span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {sedangTerbuka && (
                <div className="struktur-tim-list">
                  {b.timList.map((t) => (
                    <div className="struktur-tim-item" key={t.peran}>
                      <strong>{t.nama}</strong>
                      <span>
                        {t.peran} — {t.pangkat}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="struktur-catatan">Struktur per tanggal 9 Juli 2026.</p>
    </div>
  );
}