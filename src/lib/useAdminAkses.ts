"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Hook verifikasi autentikasi dan otorisasi admin.
export function useAdminAkses() {
  const router = useRouter();
  const [memuat, setMemuat] = useState(true);
  const [ditolakAkses, setDitolakAkses] = useState(false);

  useEffect(() => {
    let masihTerpasang = true;

    async function cekAkses() {
      try {
        const { data: sesi } = await supabase.auth.getSession();
        if (!sesi.session) {
          router.replace("/admin/login");
          return;
        }

        const { data: dataAdmin } = await supabase
          .from("admin_pengguna")
          .select("id")
          .maybeSingle();

        if (!masihTerpasang) return;

        if (!dataAdmin) {
          setDitolakAkses(true);
          setMemuat(false);
          return;
        }

        setMemuat(false);
      } catch (err) {
        console.error("Gagal memeriksa akses admin:", err);
        router.replace("/admin/login");
      }
    }

    cekAkses();
    return () => {
      masihTerpasang = false;
    };
  }, [router]);

  async function keluar() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return { memuat, ditolakAkses, keluar };
}