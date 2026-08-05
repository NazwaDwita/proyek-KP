"use client";

import Image from "next/image";
import {
  stafAhli,
  subbagianSekretariat,
  daftarBidang,
} from "@/lib/strukturOrganisasiData";

function NodeKartu({
  judul,
  nama,
  pangkat,
  kecil = false,
}: {
  judul: string;
  nama: string;
  pangkat: string;
  kecil?: boolean;
}) {
  return (
    <div className={`oc-node${kecil ? " oc-node-kecil" : ""}`}>
      <div className="oc-node-judul">{judul}</div>
      <div className="oc-node-isi">
        <strong>{nama}</strong>
        <span>{pangkat}</span>
      </div>
    </div>
  );
}

export default function StrukturOrganisasi() {
  return (
    <div className="oc-wrap">
      {/* Kepala Dinas */}
      <div className="oc-center">
        <div className="oc-node oc-node-kepala">
          <div className="oc-foto-kepala">
            <Image
              src="/assets/kepala-dinas.png"
              alt="Foto Kepala Dinas"
              width={72}
              height={90}
              className="oc-foto-kepala-img"
            />
          </div>
          <div className="oc-node-judul">Kepala Dinas</div>
          <div className="oc-node-isi">
            <strong>Drs. Supriyadi, M.Si.</strong>
            <span>Pembina Utama Muda (IV/c)</span>
          </div>
        </div>
      </div>

      <div className="oc-trunk" />

      {/* Cabang 1: Staf Ahli & Sekretaris */}
      <div className="oc-branch oc-branch-2">
        <div className="oc-col">
          <div className="oc-stack">
            {stafAhli.map((s) => {
              const [jabatan, golongan] = s.pangkat.split(" — ");
              return (
                <NodeKartu
                  key={s.nama}
                  judul={jabatan ?? s.pangkat}
                  nama={s.nama}
                  pangkat={golongan ?? ""}
                  kecil
                />
              );
            })}
          </div>
        </div>

        <div className="oc-col">
          <NodeKartu
            judul="Sekretaris"
            nama="Ridho Adriansyah, S.S.T.P."
            pangkat="Pembina Tk. I (IV/b)"
          />
          <div className="oc-trunk oc-trunk-pendek" />
          <div className="oc-branch oc-branch-3 oc-branch-dalam">
            {subbagianSekretariat.map((s) => (
              <div className="oc-col" key={s.peran}>
                <NodeKartu judul={s.peran} nama={s.nama} pangkat={s.pangkat} kecil />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="oc-trunk oc-trunk-panjang" />

      {/* Cabang 2: 5 Bidang */}
      <div className="oc-branch oc-branch-5">
        {daftarBidang.map((b) => (
          <div className="oc-col" key={b.nama}>
            <NodeKartu
              judul={b.nama}
              nama={b.kepala.nama}
              pangkat={b.kepala.pangkat}
            />
            <div className="oc-trunk oc-trunk-pendek" />
            <div className="oc-stack oc-stack-tim">
              {b.timList.map((t) => (
                <NodeKartu key={t.peran} judul={t.peran} nama={t.nama} pangkat={t.pangkat} kecil />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="oc-catatan">Catatan: struktur mengikuti bagan resmi per 9 Juli 2026</p>
    </div>
  );
}
