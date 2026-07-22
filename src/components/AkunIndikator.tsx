"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSesi } from "@/lib/useSesi";
import { supabase } from "@/lib/supabase";

export default function AkunIndikator() {
  const { sesi, memuat } = useSesi();
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
      <Link href="/akun/masuk" className="akun-indikator">
        Masuk / Buat akun
      </Link>
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
