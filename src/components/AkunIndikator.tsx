"use client";

import { useRouter } from "next/navigation";
import { useSesi } from "@/lib/useSesi";
import { useModalMasuk } from "@/lib/ModalMasukContext";
import { supabase } from "@/lib/supabase";

export default function AkunIndikator() {
  const { sesi, memuat } = useSesi();
  const { bukaModalMasuk } = useModalMasuk();
  const router = useRouter();

  async function keluar() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (memuat) {
    // Sengaja tidak render apa pun dulu selagi belum tahu status
    // login, supaya tidak "kedip" antara tombol Masuk <-> Keluar.
    return <div className="akun-indikator-placeholder" />;
  }

  if (!sesi) {
    return (
      <button type="button" className="akun-indikator" onClick={bukaModalMasuk}>
        Masuk / Buat akun
      </button>
    );
  }

  const nama = (sesi.user.user_metadata?.nama as string) || sesi.user.email;

  return (
    <div className="akun-indikator">
      <svg
        className="akun-indikator-ikon-user"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
      <span className="akun-indikator-email">{nama}</span>
      <button
        type="button"
        onClick={keluar}
        className="tombol-ikon"
        title="Keluar"
        aria-label="Keluar dari akun"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}