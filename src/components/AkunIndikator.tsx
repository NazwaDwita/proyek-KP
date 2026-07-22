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

  return (
    <div className="akun-indikator">
      <span className="akun-indikator-email">{sesi.user.email}</span>
      <button type="button" onClick={keluar} className="akun-indikator-keluar">
        Keluar
      </button>
    </div>
  );
}
