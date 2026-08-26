"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function StrukturOrganisasi() {
  const [bukaModal, setBukaModal] = useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Gambar utama di halaman */}
      <div 
        onClick={() => setBukaModal(true)}
        className="group relative w-full overflow-hidden rounded-xl border border-border bg-card p-2 shadow-soft md:p-5 cursor-pointer transition-all hover:border-primary/40 hover:shadow-md"
      >
        <img
          src="/assets/struktur-organisasi.png"
          alt="Bagan Struktur Organisasi Diskominfotik Provinsi Riau"
          className="w-full h-auto rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.005]"
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center">
        Bagan Resmi Struktur Organisasi Dinas Komunikasi, Informatika dan Statistik Provinsi Riau &bull;{" "}
        <button type="button" onClick={() => setBukaModal(true)} className="text-primary underline font-medium">
          Klik untuk perbesar
        </button>
      </p>

      {/* Pop-up 1 Halaman Murni Gambar saat diklik */}
      {bukaModal && (
        <div 
          onClick={() => setBukaModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md cursor-zoom-out"
        >
          {/* Tombol Tutup Melayang di Kanan Atas */}
          <button
            type="button"
            onClick={() => setBukaModal(false)}
            className="fixed top-4 right-4 z-[10000] flex items-center justify-center size-10 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors backdrop-blur-md shadow-lg"
            title="Tutup gambar"
          >
            <X className="size-6" />
          </button>

          {/* Hanya 1 Gambar Penuh Layar */}
          <img
            onClick={(e) => e.stopPropagation()}
            src="/assets/struktur-organisasi.png"
            alt="Bagan Struktur Organisasi Diskominfotik Riau"
            className="max-w-[98vw] max-h-[98vh] w-auto h-auto object-contain rounded-lg shadow-2xl cursor-default"
          />
        </div>
      )}
    </div>
  );
}
