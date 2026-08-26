"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Hook untuk memantau sesi login pendaftar.
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
