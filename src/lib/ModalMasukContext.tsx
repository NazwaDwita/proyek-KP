"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import ModalMasuk from "@/components/ModalMasuk";

type ModalMasukContextValue = {
  bukaModalMasuk: () => void;
};

const ModalMasukContext = createContext<ModalMasukContextValue | null>(null);

// Provider global supaya modal login/register bisa dipanggil dari
// komponen mana pun (navbar, halaman Daftar, dll) tanpa pindah halaman.
export function ModalMasukProvider({ children }: { children: ReactNode }) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <ModalMasukContext.Provider value={{ bukaModalMasuk: () => setTerbuka(true) }}>
      {children}
      <ModalMasuk terbuka={terbuka} tutup={() => setTerbuka(false)} />
    </ModalMasukContext.Provider>
  );
}

export function useModalMasuk() {
  const ctx = useContext(ModalMasukContext);
  if (!ctx) {
    throw new Error("useModalMasuk harus dipakai di dalam <ModalMasukProvider>");
  }
  return ctx;
}
