"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Hook kecil untuk memantau status login pendaftar (bukan admin) di
// komponen client mana pun. `memuat` penting supaya UI tidak "kedip"
// (misalnya sempat menampilkan tombol "Masuk" sekilas sebelum tahu
// user sebenarnya sudah login).
export function useSesi() {
  const [sesi, setSesi] = useState<Session | null>(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let masihTerpasang = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!masihTerpasang) return;
        setSesi(data.session);
        setMemuat(false);
      })
      .catch(() => {
        if (!masihTerpasang) return;
        setMemuat(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, sesiBaru) => {
        setSesi(sesiBaru);
      }
    );

    return () => {
      masihTerpasang = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { sesi, memuat };
}
