"use client";

import { useState } from "react";
import {
  stafAhli,
  subbagianSekretariat,
  daftarBidang,
} from "@/lib/strukturOrganisasiData";

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
    </div>
  );
}